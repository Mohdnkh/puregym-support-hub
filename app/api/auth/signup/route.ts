import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { makeToken, hashToken } from "@/lib/crypto";
import { sendVerificationEmail } from "@/lib/mail";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  nameAr: z.string().min(2),
  nameEn: z.string().min(2)
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const existing = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        passwordHash,
        nameAr: body.nameAr,
        nameEn: body.nameEn
      }
    });

    const token = makeToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + Number(process.env.VERIFY_EMAIL_TOKEN_EXPIRES_MINUTES || 1440) * 60 * 1000);

    await prisma.verificationToken.create({
      data: { tokenHash, userId: user.id, expiresAt }
    });

    await sendVerificationEmail(user.email, token);

    return NextResponse.json({ ok: true, message: "Account created. Please verify your email." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
