import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const profileSchema = z.object({
  nameAr: z.string().min(2).optional(),
  nameEn: z.string().min(2).optional(),
  profileImage: z.string().max(1_200_000).nullable().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional()
});

export async function GET() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, email: true, nameAr: true, nameEn: true, profileImage: true, role: true, emailVerifiedAt: true }
  });

  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = profileSchema.parse(await req.json());
    const updateData: { nameAr?: string; nameEn?: string; profileImage?: string | null; passwordHash?: string } = {};

    if (typeof data.nameAr === "string") updateData.nameAr = data.nameAr;
    if (typeof data.nameEn === "string") updateData.nameEn = data.nameEn;
    if (data.profileImage !== undefined) updateData.profileImage = data.profileImage;

    if (data.newPassword) {
      if (!data.currentPassword) {
        return NextResponse.json({ error: "Current password is required" }, { status: 400 });
      }

      const user = await prisma.user.findUnique({ where: { id: session.id } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
      if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

      updateData.passwordHash = await bcrypt.hash(data.newPassword, 12);
    }

    const updated = await prisma.user.update({
      where: { id: session.id },
      data: updateData,
      select: { id: true, email: true, nameAr: true, nameEn: true, profileImage: true, role: true, emailVerifiedAt: true }
    });

    return NextResponse.json({ user: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
