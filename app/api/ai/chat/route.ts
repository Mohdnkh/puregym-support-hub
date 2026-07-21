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

function isAiTooLargeError(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error || "");
  return /request too large|tokens per minute|TPM|please reduce your message size|context_length|maximum context/i.test(raw);
}

function friendlyAiError(error: unknown, language: "AR" | "EN") {
  const raw = error instanceof Error ? error.message : String(error || "");
  const isTooLarge = isAiTooLargeError(error);
  const isMissingKey = /api key is missing/i.test(raw);
  const isRateLimit = /rate limit|too many requests/i.test(raw);

  if (language === "AR") {
    if (isTooLarge) {
      return "الطلب كان كبير على مزود الذكاء الحالي، فخففت حجم المعرفة المرسلة. جرّب ترسل سؤالك مرة ثانية، وإذا كان السؤال كبير قسمه لنقطتين.";
    }
    if (isMissingKey) return "إعدادات الذكاء الاصطناعي ناقصة. أضف مفتاح Groq/Gemini في Vercel أو ملف البيئة.";
    if (isRateLimit) return "وصلنا للحد المؤقت للذكاء الاصطناعي. انتظر دقيقة وجرب مرة ثانية.";
    return "صار خطأ مؤقت في الذكاء الاصطناعي. جرّب مرة ثانية بعد لحظات.";
  }

  if (isTooLarge) {
    return "The request was too large for the current AI provider. I reduced the context sent to the model; please try again, or split the question into smaller parts.";
  }
  if (isMissingKey) return "AI configuration is missing. Add a Groq/Gemini key in Vercel or the environment file.";
  if (isRateLimit) return "The AI provider hit a temporary rate limit. Please wait a minute and try again.";
  return "The AI service hit a temporary error. Please try again shortly.";
}

function compactStyleInstruction(country: "KSA" | "UAE" | null, language: "AR" | "EN") {
  const countryText = country ? `Country: ${country}.` : "Country: infer from the question; if unclear and policy differs, ask one short clarification.";
  const languageText = language === "AR" ? "Answer in natural Arabic." : "Answer in natural English.";

  return [
    "You are PureGym Arabia Assistant for internal support agents.",
    languageText,
    countryText,
    "Be concise, accurate, and process-driven.",
    "For freeze, cancellation, payments, app/login, QR/PIN, offers, branches, and membership cases: ask only the next missing operational detail; if enough details are present, give the decision, reason, next action, and a ready customer reply.",
    "Do not invent prices, dates, remaining allowances, billing impact, links, or guarantees. If exact member data is missing, tell the agent what to verify in the member system.",
    "Freeze rule: do not say freeze stops fees or deductions unless the provided policy and dates prove it.",
    "Keep answers short enough for a live agent to use."
  ].join(" ");
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
  let responseLanguage: "AR" | "EN" = "AR";

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
  responseLanguage = signals.language === "EN" ? "EN" : "AR";

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
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { role: true, content: true }
    });

    const memory = await prisma.userAiMemory.findUnique({
      where: { userId_country_language: { userId: user.id, country: detectedCountry, language: detectedLanguage } }
    });

    const globalMemory = await getAiGlobalMemoryText();
    const knowledgeBase = await getKnowledgeBaseText(knowledgeCountry, detectedLanguage, message);
    const historyForAI = storedHistory
      .reverse()
      .filter((entry: { role: string; content: string }) => entry.role === "user" || entry.role === "assistant")
      .slice(0, -1)
      .map((entry: { role: string; content: string }) => ({ role: entry.role as "user" | "assistant", content: entry.content.slice(0, 700) }));

    const fallbackHistory = (messages || []).slice(-3).map((entry) => ({
      role: entry.role,
      content: entry.content.slice(0, 700)
    }));
    const finalHistory = historyForAI.length ? historyForAI : fallbackHistory;

    const countryInstruction = countryIsExplicit
      ? `The user's country context appears to be ${detectedCountry}. Answer for this country unless the user explicitly asks for a comparison.`
      : "The user did not clearly specify KSA or UAE, so the knowledge base includes both countries. Be smart: if the answer is the same for both countries, answer once and say it applies to both; if it differs, give a short KSA answer and a short UAE answer; ask for clarification only when the user needs one exact country-specific action, branch, price, link, or policy.";

    const userPrompt = image?.dataUrl
      ? `${message}\n\nThe user attached an image. Analyze the image together with the request.`
      : message;
    const systemPrompt = `${styleInstruction(countryIsExplicit ? detectedCountry : null, detectedLanguage)} ${countryInstruction}${buildMemoryInstruction(memory?.summary, globalMemory)}\n\nKnowledge base:\n${knowledgeBase}`;

    let answer: string;
    try {
      answer = await callOpenAIMultimodal({
        system: systemPrompt,
        user: userPrompt,
        imageDataUrl: image?.dataUrl || null,
        messages: finalHistory,
        maxOutputTokens: 650
      });
    } catch (error) {
      if (!isAiTooLargeError(error)) throw error;

      const compactHistory = finalHistory.slice(-2).map((entry) => ({
        role: entry.role,
        content: entry.content.slice(0, 450)
      }));
      const compactMemory = buildMemoryInstruction(
        memory?.summary?.slice(0, 450),
        globalMemory.slice(0, 600)
      );
      const compactCountry = countryIsExplicit && detectedCountry !== "ALL" ? detectedCountry : null;
      const compactSystem = `${compactStyleInstruction(compactCountry, sessionLanguage)} ${countryInstruction}${compactMemory}\n\nCompact knowledge base:\n${knowledgeBase.slice(0, 1800)}`;

      answer = await callOpenAIMultimodal({
        system: compactSystem,
        user: userPrompt.slice(0, image?.dataUrl ? 1200 : 1600),
        imageDataUrl: image?.dataUrl || null,
        messages: compactHistory,
        temperature: 0.15,
        maxOutputTokens: 450
      });
    }

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
    return NextResponse.json({ error: friendlyAiError(err, responseLanguage) }, { status: 400 });
  }
}
