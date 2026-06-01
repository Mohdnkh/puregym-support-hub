import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildPureGymSystemPrompt, callOpenAIMultimodal, getKnowledgeBaseText, summarizeGlobalMemory } from "@/lib/ai";

export const runtime = "nodejs";

const schema = z.object({
  message: z.string().min(1),
  sessionId: z.string().optional().nullable(),
  imageDataUrl: z.string().optional().nullable()
});

function titleFromMessage(message: string) {
  const clean = message.replace(/\s+/g, " ").trim();
  if (!clean) return "New chat";
  return clean.length > 46 ? clean.slice(0, 46) + "…" : clean;
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized. Please log in again." }, { status: 401 });

  try {
    const { message, sessionId, imageDataUrl } = schema.parse(await req.json());

    let session = sessionId
      ? await prisma.aiChatSession.findFirst({ where: { id: sessionId, userId: user.id } })
      : null;

    if (!session) {
      session = await prisma.aiChatSession.create({
        data: {
          userId: user.id,
          title: titleFromMessage(message)
        }
      });
    }

    const previousMessages = await prisma.aiChatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: "asc" },
      take: 20
    });

    const userMessage = await prisma.aiChatMessage.create({
      data: {
        sessionId: session.id,
        role: "USER",
        content: message,
        imageDataUrl: imageDataUrl || null
      }
    });

    const [knowledgeBase, globalMemory] = await Promise.all([
      getKnowledgeBaseText(),
      prisma.aiGlobalMemory.findUnique({ where: { id: "global" } }).catch(() => null)
    ]);

    const system = `${buildPureGymSystemPrompt(globalMemory?.summary)}\n\nKnowledge base:\n${knowledgeBase}`;

    const answer = await callOpenAIMultimodal({
      system,
      messages: [
        ...previousMessages.map((msg: { role: string; content: string; imageDataUrl: string | null }) => ({
          role: msg.role === "ASSISTANT" ? ("ASSISTANT" as const) : ("USER" as const),
          content: msg.content,
          imageDataUrl: msg.imageDataUrl
        })),
        { role: "USER", content: message, imageDataUrl: imageDataUrl || null }
      ]
    });

    const assistantMessage = await prisma.aiChatMessage.create({
      data: {
        sessionId: session.id,
        role: "ASSISTANT",
        content: answer
      }
    });

    await prisma.aiChatSession.update({
      where: { id: session.id },
      data: { title: session.title === "New chat" ? titleFromMessage(message) : session.title }
    });

    // Global anonymized memory: shared intelligence, not shared conversations.
    summarizeGlobalMemory(globalMemory?.summary || "", message, answer)
      .then((summary) =>
        prisma.aiGlobalMemory.upsert({
          where: { id: "global" },
          update: { summary },
          create: { id: "global", summary }
        })
      )
      .catch(() => undefined);

    return NextResponse.json({
      sessionId: session.id,
      answer,
      userMessage,
      assistantMessage
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
