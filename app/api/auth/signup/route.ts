import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

// New flow: no password, no code. The user requests an account with just their
// email + first name. It stays pending (emailVerifiedAt = null) until an admin
// approves it and generates a password.
const schema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(2).max(80)
});

export async function POST(req: Request) {
  // Limit account requests: 5 per IP per 10 minutes.
  const limit = rateLimit(`signup:${getClientIp(req)}`, 5, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing?.emailVerifiedAt) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    if (existing && !existing.emailVerifiedAt) {
      return NextResponse.json({ ok: true, message: "Your account request is already pending admin approval." });
    }

    // Placeholder unusable password until an admin generates a real one on approval.
    const placeholder = await bcrypt.hash(randomBytes(24).toString("hex"), 12);

    await prisma.user.create({
      data: {
        email,
        passwordHash: placeholder,
        nameAr: body.name,
        nameEn: body.name,
        role: "USER",
        emailVerifiedAt: null
      }
    });

    return NextResponse.json({
      ok: true,
      message: "Account request submitted. An admin will approve it and send you your login details."
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
