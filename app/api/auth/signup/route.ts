import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/crypto";
import { sendVerificationCode } from "@/lib/mail";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  nameAr: z.string().min(2),
  nameEn: z.string().min(2)
});

function makeCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing?.emailVerifiedAt) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    if (existing && !existing.emailVerifiedAt) {
      await prisma.user.delete({ where: { id: existing.id } });
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        nameAr: body.nameAr,
        nameEn: body.nameEn
      }
    });

    const code = makeCode();
    const tokenHash = hashToken(`${email}:${code}`);
    const expiresAt = new Date(Date.now() + Number(process.env.VERIFY_EMAIL_TOKEN_EXPIRES_MINUTES || 30) * 60 * 1000);

    await prisma.verificationToken.create({
      data: { tokenHash, userId: user.id, expiresAt }
    });

    await sendVerificationCode(user.email, code);

    return NextResponse.json({ ok: true, email: user.email, message: "Account created. Verification code sent to your email." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
