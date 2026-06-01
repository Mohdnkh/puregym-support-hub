import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildMemoryInstruction, callOpenAIMultimodal, getKnowledgeBaseText, styleInstruction, summarizeAiMemory } from "@/lib/ai";

export const runtime = "nodejs";

const imageSchema = z.object({
  dataUrl: z.string().max(4_500_000).refine((value) => value.startsWith("data:image/"), "Only image data URLs are allowed"),
  name: z.string().max(180).optional()
}).optional().nullable();

const schema = z.object({
  message: z.string().trim().min(1).max(6000),
  country: z.enum(["KSA", "UAE"]),
  language: z.enum(["AR", "EN"]),
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
    const existing = await prisma.chatSession.findFirst({
      where: { id: params.sessionId, userId: params.userId }
    });

    if (existing) {
      return prisma.chatSession.update({
        where: { id: existing.id },
        data: { country: params.country, language: params.language }
      });
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

  try {
    const { message, country, language, sessionId, image, messages } = schema.parse(await req.json());

    const session = await getOrCreateSession({ userId: user.id, sessionId, country, language, message });

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
      where: { userId_country_language: { userId: user.id, country, language } }
    });

    const knowledgeBase = await getKnowledgeBaseText(country, language);
    const historyForAI = storedHistory
      .filter((entry) => entry.role === "user" || entry.role === "assistant")
      .slice(0, -1)
      .map((entry) => ({ role: entry.role as "user" | "assistant", content: entry.content }));

    const fallbackHistory = (messages || []).slice(-8);
    const finalHistory = historyForAI.length ? historyForAI : fallbackHistory;

    const answer = await callOpenAIMultimodal({
      system: `${styleInstruction(country, language)}${buildMemoryInstruction(memory?.summary)}\n\nKnowledge base:\n${knowledgeBase}`,
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

    await prisma.chatSession.update({
      where: { id: session.id },
      data: { updatedAt: new Date() }
    });

    // Lightweight self-improving memory. If summarization fails, the answer still returns normally.
    prisma.chatMessage.count({ where: { sessionId: session.id, role: "assistant" } })
      .then(async (assistantCount) => {
        if (assistantCount % 3 !== 0) return;
        const updatedSummary = await summarizeAiMemory({
          existingSummary: memory?.summary,
          userMessage: message,
          assistantAnswer: answer,
          country,
          language
        });
        await prisma.userAiMemory.upsert({
          where: { userId_country_language: { userId: user.id, country, language } },
          create: { userId: user.id, country, language, summary: updatedSummary },
          update: { summary: updatedSummary }
        });
      })
      .catch(() => undefined);

    return NextResponse.json({ answer, sessionId: session.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
