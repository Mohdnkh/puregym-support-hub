import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

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

  await prisma.chatSession.deleteMany({ where: { id: sessionId, userId: user.id } });
  return NextResponse.json({ ok: true });
}
