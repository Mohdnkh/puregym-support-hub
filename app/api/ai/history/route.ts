import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { summarizeAiMemory, type AiCountry, type AiLanguage } from "@/lib/ai";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized. Please log in again." }, { status: 401 });

  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");

  if (sessionId) {
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          select: { id: true, role: true, content: true, imageData: true, imageName: true, createdAt: true }
        }
      }
    });

    if (!session) return NextResponse.json({ error: "Chat session not found" }, { status: 404 });
    return NextResponse.json({ session });
  }

  const sessions = await prisma.chatSession.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: 30,
    select: {
      id: true,
      title: true,
      country: true,
      language: true,
      updatedAt: true,
      _count: { select: { messages: true } }
    }
  });

  return NextResponse.json({ sessions });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized. Please log in again." }, { status: 401 });

  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId) return NextResponse.json({ error: "sessionId is required" }, { status: 400 });

  const session = await prisma.chatSession.findFirst({
    where: { id: sessionId, userId: user.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        select: { role: true, content: true },
        take: 30,
      },
    },
  });

  if (session?.messages.length) {
    const country = (session.country === "KSA" || session.country === "UAE" ? session.country : "ALL") as AiCountry;
    const language = (session.language === "EN" ? "EN" : "AR") as AiLanguage;
    const existing = await prisma.userAiMemory.findUnique({
      where: { userId_country_language: { userId: user.id, country, language } },
    });
    const transcript = session.messages
      .map((message) => `${message.role}: ${message.content}`)
      .join("\n")
      .slice(0, 6000);

    let updatedSummary =
      existing?.summary ||
      `Deleted chat memory:\n${transcript.slice(0, 1200)}`;

    try {
      updatedSummary = await summarizeAiMemory({
        existingSummary: existing?.summary,
        userMessage: "The user deleted this chat. Preserve durable useful context before deletion.",
        assistantAnswer: transcript,
        country,
        language,
      });
    } catch {
      // Keep a conservative fallback so deletion never fails because of AI.
    }

    await prisma.userAiMemory.upsert({
      where: { userId_country_language: { userId: user.id, country, language } },
      create: { userId: user.id, country, language, summary: updatedSummary },
      update: { summary: updatedSummary },
    });
  }

  await prisma.chatSession.deleteMany({ where: { id: sessionId, userId: user.id } });
  return NextResponse.json({ ok: true });
}
