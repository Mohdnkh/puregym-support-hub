import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const updateSchema = z.object({
  shortcut: z.string().trim().min(1).max(28).optional(),
  scriptId: z.string().min(1).optional(),
  title: z.string().trim().max(120).optional(),
  active: z.boolean().optional()
});

function normalizeShortcut(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^\/+/, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 28);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = updateSchema.parse(await req.json());
  const existing = await prisma.userShortcut.findFirst({ where: { id: params.id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Shortcut not found" }, { status: 404 });

  const updateData: Record<string, unknown> = {};
  if (data.shortcut !== undefined) {
    const shortcut = normalizeShortcut(data.shortcut);
    if (!shortcut) return NextResponse.json({ error: "Invalid shortcut" }, { status: 400 });
    updateData.shortcut = shortcut;
  }
  if (data.scriptId !== undefined) {
    const script = await prisma.script.findFirst({ where: { id: data.scriptId, active: true }, select: { id: true, title: true } });
    if (!script) return NextResponse.json({ error: "Script not found" }, { status: 404 });
    updateData.scriptId = script.id;
    if (data.title === undefined) updateData.title = script.title;
  }
  if (data.title !== undefined) updateData.title = data.title;
  if (data.active !== undefined) updateData.active = data.active;

  const shortcut = await prisma.userShortcut.update({ where: { id: params.id }, data: updateData });
  return NextResponse.json({ shortcut });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.userShortcut.deleteMany({ where: { id: params.id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
