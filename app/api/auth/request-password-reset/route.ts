import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/crypto";
import { sendPasswordResetCode } from "@/lib/mail";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
});

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: Request) {
  // Limit reset-code emails: 5 per IP per 10 minutes.
  const limit = rateLimit(`reset:${getClientIp(req)}`, 5, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many reset requests. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const { email } = schema.parse(await req.json());
    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Keep the response generic so account existence is not exposed.
    if (!user) return NextResponse.json({ ok: true });

    const code = generateCode();
    const tokenHash = hashToken(`reset:${normalizedEmail}:${code}`);

    await prisma.verificationToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    await sendPasswordResetCode(normalizedEmail, code);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
