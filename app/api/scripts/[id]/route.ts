import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const updateSchema = z.object({
  title: z.string().min(2).optional(),
  category: z.string().min(2).optional(),
  country: z.enum(["ALL", "KSA", "UAE"]).optional(),
  language: z.enum(["AR", "EN"]).optional(),
  body: z.string().min(1).optional(),
  active: z.boolean().optional()
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  if (params.id.startsWith("seed-")) {
    return NextResponse.json({ error: "Seed scripts must be seeded into DB before editing." }, { status: 400 });
  }

  const data = updateSchema.parse(await req.json());
  const script = await prisma.script.update({ where: { id: params.id }, data });
  return NextResponse.json({ script });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  if (params.id.startsWith("seed-")) {
    return NextResponse.json({ error: "Seed scripts must be seeded into DB before deleting." }, { status: 400 });
  }

  await prisma.script.update({ where: { id: params.id }, data: { active: false } });
  return NextResponse.json({ ok: true });
}
