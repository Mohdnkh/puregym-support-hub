import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const DEFAULT_PENDING_PASSWORD = "Aa@123456789";

// Admin + Super Admin: approve a pending account and/or (re)generate a password.
// Returns the new plaintext password once so the admin can share it with the user.
function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(12);
  (globalThis.crypto || require("crypto").webcrypto).getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN"))
    return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Pending account approval should be easy to communicate the first time.
  // Existing active users still get a generated password if an admin resets it.
  const password = target.emailVerifiedAt ? generatePassword() : DEFAULT_PENDING_PASSWORD;
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: params.id },
    // Setting emailVerifiedAt also approves/activates a pending request.
    data: { passwordHash, emailVerifiedAt: target.emailVerifiedAt ?? new Date() }
  });

  return NextResponse.json({ ok: true, email: target.email, password });
}
