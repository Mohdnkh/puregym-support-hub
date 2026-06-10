import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const users = await prisma.user.findMany({
    select: { id: true, email: true, nameAr: true, nameEn: true, profileImage: true, role: true, emailVerifiedAt: true, createdAt: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ users });
}
