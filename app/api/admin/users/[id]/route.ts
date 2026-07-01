import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const roleSchema = z.object({ role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]) });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Super Admin only" }, { status: 403 });
  if (params.id === user.id) return NextResponse.json({ error: "You cannot change your own role." }, { status: 400 });

  const data = roleSchema.parse(await req.json());
  const updated = await prisma.user.update({
    where: { id: params.id },
    data: { role: data.role },
    select: { id: true, email: true, nameAr: true, nameEn: true, profileImage: true, role: true, emailVerifiedAt: true, createdAt: true }
  });

  return NextResponse.json({ user: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Super Admin only" }, { status: 403 });
  if (params.id === user.id) return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
