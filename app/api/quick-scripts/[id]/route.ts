import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const updateSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  country: z.enum(["ALL", "KSA", "UAE"]).optional(),
  language: z.enum(["AR", "EN"]).optional(),
  body: z.string().trim().min(1).optional(),
  active: z.boolean().optional(),
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = updateSchema.parse(await req.json());
  const quickScript = await prisma.userQuickScript.updateMany({
    where: { id: params.id, userId: user.id },
    data,
  });

  if (!quickScript.count) return NextResponse.json({ error: "Quick script not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.userQuickScript.deleteMany({ where: { id: params.id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
