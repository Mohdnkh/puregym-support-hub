import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/crypto";

const schema = z.object({
  email: z.string().email(),
  code: z.string().min(4),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase().trim();
    const code = body.code.trim();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return NextResponse.json(
        { error: "Invalid or expired reset code" },
        { status: 400 },
      );

    const tokenHash = hashToken(`reset:${email}:${code}`);
    const record = await prisma.verificationToken.findUnique({
      where: { tokenHash },
    });

    if (
      !record ||
      record.userId !== user.id ||
      record.usedAt ||
      record.expiresAt < new Date()
    ) {
      return NextResponse.json(
        { error: "Invalid or expired reset code" },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(body.password, 12);

    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
      prisma.verificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
