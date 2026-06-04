import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { makeToken, hashToken } from "@/lib/crypto";
import { prisma } from "@/lib/db";

const createSchema = z.object({
  label: z.string().trim().min(1).max(80).optional()
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tokens = await prisma.extensionAccessToken.findMany({
    where: { userId: user.id, revokedAt: null },
    select: { id: true, label: true, createdAt: true, lastUsedAt: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ tokens });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = createSchema.parse(await req.json().catch(() => ({})));
  const rawToken = `pgx_${makeToken()}`;

  const token = await prisma.extensionAccessToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      label: data.label || "Chrome Extension"
    },
    select: { id: true, label: true, createdAt: true }
  });

  return NextResponse.json({ token, accessToken: rawToken }, { status: 201 });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = z.object({ id: z.string().min(1) }).parse(await req.json());

  await prisma.extensionAccessToken.updateMany({
    where: { id, userId: user.id },
    data: { revokedAt: new Date() }
  });

  return NextResponse.json({ ok: true });
}
