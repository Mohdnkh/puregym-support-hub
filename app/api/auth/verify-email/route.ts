import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").toLowerCase().trim();
    const code = String(body.code || body.token || "").trim();

    if (!email || !code) {
      return NextResponse.json({ error: "Missing email or verification code" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const tokenHash = hashToken(`${email}:${code}`);
    const record = await prisma.verificationToken.findUnique({ where: { tokenHash } });

    if (!record || record.userId !== user.id || record.usedAt || record.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } }),
      prisma.verificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } })
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
