import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const deleteSchema = z.object({ sessionId: z.string().min(1) });

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");

  if (sessionId) {
    const session = await prisma.aiChatSession.findFirst({
      where: { id: sessionId, userId: user.id },
      include: { messages: { orderBy: { createdAt: "asc" } } }
    });

    if (!session) return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    return NextResponse.json({ session });
  }

  const sessions = await prisma.aiChatSession.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { messages: true } } },
    take: 40
  });

  return NextResponse.json({ sessions });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId } = deleteSchema.parse(await req.json());
  const session = await prisma.aiChatSession.findFirst({ where: { id: sessionId, userId: user.id } });
  if (!session) return NextResponse.json({ error: "Chat not found" }, { status: 404 });

  await prisma.aiChatSession.delete({ where: { id: sessionId } });
  return NextResponse.json({ ok: true });
}
