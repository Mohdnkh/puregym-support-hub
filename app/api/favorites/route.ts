import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({ scriptId: z.string().min(1) });

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const favorites = await prisma.scriptFavorite.findMany({
    where: { userId: user.id },
    select: { scriptId: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ scriptIds: favorites.map((item: { scriptId: string }) => item.scriptId) });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = schema.parse(await req.json());

  await prisma.scriptFavorite.upsert({
    where: { userId_scriptId: { userId: user.id, scriptId: data.scriptId } },
    create: { userId: user.id, scriptId: data.scriptId },
    update: {}
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = schema.parse(await req.json());

  await prisma.scriptFavorite.deleteMany({
    where: { userId: user.id, scriptId: data.scriptId }
  });

  return NextResponse.json({ ok: true });
}
