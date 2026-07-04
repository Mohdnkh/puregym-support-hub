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
  sortOrder: z.number().int().optional(),
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Only admins can manage quick scripts." }, { status: 403 });

  const data = updateSchema.parse(await req.json());
  const quickScript = await prisma.script.updateMany({
    where: { id: params.id, category: "Quick Scripts" },
    data,
  });

  if (!quickScript.count) return NextResponse.json({ error: "Quick script not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Only admins can manage quick scripts." }, { status: 403 });

  await prisma.script.deleteMany({ where: { id: params.id, category: "Quick Scripts" } });
  return NextResponse.json({ ok: true });
}
