import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const DEFAULT_PENDING_PASSWORD = "Aa@123456789";

// Admin + Super Admin: approve a pending account and/or set a password.
// Returns the new plaintext password once so the admin can share it with the user.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN"))
    return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const password =
    typeof body.password === "string" && body.password.trim()
      ? body.password.trim()
      : DEFAULT_PENDING_PASSWORD;

  if (password.length < 8 || password.length > 72) {
    return NextResponse.json(
      { error: "Password must be between 8 and 72 characters." },
      { status: 400 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: params.id },
    // Setting emailVerifiedAt also approves/activates a pending request.
    data: { passwordHash, emailVerifiedAt: target.emailVerifiedAt ?? new Date() }
  });

  return NextResponse.json({ ok: true, email: target.email, password });
}
