import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildMemoryInstruction, callOpenAIMultimodal, detectAiSignals, getAiGlobalMemoryText, getKnowledgeBaseText, styleInstruction, summarizeAiMemory, summarizeAiGlobalMemory } from "@/lib/ai";
import { runAfterResponse } from "@/lib/after";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const imageSchema = z.object({
  dataUrl: z.string().max(4_500_000).refine((value) => value.startsWith("data:image/"), "Only image data URLs are allowed"),
  name: z.string().max(180).optional()
}).optional().nullable();

const schema = z.object({
  message: z.string().trim().min(1).max(6000),
  country: z.enum(["KSA", "UAE"]).optional().nullable(),
  language: z.enum(["AR", "EN"]).optional().nullable(),
  sessionId: z.string().optional().nullable(),
  image: imageSchema,
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).optional()
});

function makeTitle(message: string) {
  const clean = message.replace(/\s+/g, " ").trim();
  if (!clean) return "New chat";
  return clean.length > 55 ? clean.slice(0, 55) + "..." : clean;
}

async function getOrCreateSession(params: { userId: string; sessionId?: string | null; country: "KSA" | "UAE"; language: "AR" | "EN"; message: string }) {
  if (params.sessionId) {
    const existing = await prisma.chatSession.findFirst({ where: { id: params.sessionId, userId: params.userId } });

    if (existing) {
      return prisma.chatSession.update({ where: { id: existing.id }, data: { country: params.country, language: params.language } });
    }
  }

  return prisma.chatSession.create({
    data: {
      userId: params.userId,
      title: makeTitle(params.message),
      country: params.country,
      language: params.language
    }
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized. Please log in again." }, { status: 401 });

  // Protect AI quota/spend: cap each user to 20 chat requests per minute.
  const limit = rateLimit(`ai-chat:${user.id}`, 20, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  try {
  const {
    message,
    country: countryFromClient,
    language: languageFromClient,
    sessionId,
    image,
    messages
  } = schema.parse(await req.json());

  const signals = detectAiSignals(message);

  const previousSession = sessionId
    ? await prisma.chatSession.findFirst({
        where: { id: sessionId, userId: user.id },
        select: { country: true, language: true }
      })
    : null;

  const detectedLanguage =
    signals.language ||
    languageFromClient ||
    previousSession?.language ||
    "AR";

  const detectedCountry =
    signals.country ||
    countryFromClient ||
    previousSession?.country ||
    "KSA";

  const countryIsExplicit = Boolean(signals.country || countryFromClient);
  const knowledgeCountry = countryIsExplicit ? detectedCountry : null;

  // DB/session can support ALL/BOTH, but the AI helper expects specific KSA/UAE + AR/EN.
  const sessionCountry =
    detectedCountry === "ALL" ? "KSA" : detectedCountry;

  const sessionLanguage =
    detectedLanguage === "BOTH" ? "AR" : detectedLanguage;

  const session = await getOrCreateSession({
    userId: user.id,
    sessionId,
    country: sessionCountry,
    language: sessionLanguage,
    message
  });

    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        userId: user.id,
        role: "user",
        content: message,
        imageData: image?.dataUrl || null,
        imageName: image?.name || null
      }
    });

    const storedHistory = await prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: "asc" },
      take: 16,
      select: { role: true, content: true }
    });

    const memory = await prisma.userAiMemory.findUnique({
      where: { userId_country_language: { userId: user.id, country: detectedCountry, language: detectedLanguage } }
    });

    const globalMemory = await getAiGlobalMemoryText();
    const knowledgeBase = await getKnowledgeBaseText(knowledgeCountry, detectedLanguage);
    const historyForAI = storedHistory
      .filter((entry: { role: string; content: string }) => entry.role === "user" || entry.role === "assistant")
      .slice(0, -1)
      .map((entry: { role: string; content: string }) => ({ role: entry.role as "user" | "assistant", content: entry.content }));

    const fallbackHistory = (messages || []).slice(-8);
    const finalHistory = historyForAI.length ? historyForAI : fallbackHistory;

    const countryInstruction = countryIsExplicit
      ? `The user's country context appears to be ${detectedCountry}. Answer for this country unless the user explicitly asks for a comparison.`
      : "The user did not clearly specify KSA or UAE, so the knowledge base includes both countries. Be smart: if the answer is the same for both countries, answer once and say it applies to both; if it differs, give a short KSA answer and a short UAE answer; ask for clarification only when the user needs one exact country-specific action, branch, price, link, or policy.";

    const answer = await callOpenAIMultimodal({
      system: `${styleInstruction(countryIsExplicit ? detectedCountry : null, detectedLanguage)} ${countryInstruction}${buildMemoryInstruction(memory?.summary, globalMemory)}\n\nKnowledge base:\n${knowledgeBase}`,
      user: image?.dataUrl ? `${message}\n\nThe user attached an image. Analyze the image together with the request.` : message,
      imageDataUrl: image?.dataUrl || null,
      messages: finalHistory
    });

    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        userId: user.id,
        role: "assistant",
        content: answer
      }
    });

    await prisma.chatSession.update({ where: { id: session.id }, data: { updatedAt: new Date() } });

    // Memory summarization runs after the response is sent. On Vercel the
    // instance can freeze once the response returns, so we hand these promises
    // to waitUntil (via runAfterResponse) to make sure they actually finish.
    runAfterResponse(
      prisma.chatMessage.count({ where: { sessionId: session.id, role: "assistant" } })
        .then(async (assistantCount: number) => {
          if (assistantCount % 3 !== 0) return;
          const updatedSummary = await summarizeAiMemory({
            existingSummary: memory?.summary,
            userMessage: message,
            assistantAnswer: answer,
            country: detectedCountry,
            language: detectedLanguage
          });
          await prisma.userAiMemory.upsert({
            where: { userId_country_language: { userId: user.id, country: detectedCountry, language: detectedLanguage } },
            create: { userId: user.id, country: detectedCountry, language: detectedLanguage, summary: updatedSummary },
            update: { summary: updatedSummary }
          });
        })
    );

    runAfterResponse(
      prisma.aiGlobalMemory.findUnique({ where: { key: "global" } })
        .then(async (existing: { summary: string | null } | null) => {
          const updatedGlobal = await summarizeAiGlobalMemory({ existingSummary: existing?.summary, userMessage: message, assistantAnswer: answer });
          await prisma.aiGlobalMemory.upsert({
            where: { key: "global" },
            create: { key: "global", summary: updatedGlobal },
            update: { summary: updatedGlobal }
          });
        })
    );

    return NextResponse.json({ answer, sessionId: session.id, inferred: { country: countryIsExplicit ? detectedCountry : null, language: detectedLanguage } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
