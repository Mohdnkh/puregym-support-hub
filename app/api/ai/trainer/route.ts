import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const itemSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2).max(180),
  content: z.string().trim().min(3).max(12000),
  country: z.enum(["ALL", "KSA", "UAE"]).default("ALL"),
  language: z.enum(["BOTH", "AR", "EN"]).default("BOTH"),
  kind: z.string().trim().min(2).max(80).default("Internal Note"),
  sourceUrl: z.string().trim().max(500).optional().nullable(),
  active: z.boolean().default(true)
});

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) return null;
  return user;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const items = await prisma.aiKnowledgeItem.findMany({ orderBy: [{ active: "desc" }, { updatedAt: "desc" }] });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const data = itemSchema.parse(await req.json());
  const item = await prisma.aiKnowledgeItem.create({
    data: {
      title: data.title,
      content: data.content,
      country: data.country,
      language: data.language,
      kind: data.kind,
      sourceUrl: data.sourceUrl || null,
      active: data.active
    }
  });

  return NextResponse.json({ item }, { status: 201 });
}

export async function PUT(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const data = itemSchema.extend({ id: z.string().min(1) }).parse(await req.json());
  const item = await prisma.aiKnowledgeItem.update({
    where: { id: data.id },
    data: {
      title: data.title,
      content: data.content,
      country: data.country,
      language: data.language,
      kind: data.kind,
      sourceUrl: data.sourceUrl || null,
      active: data.active
    }
  });

  return NextResponse.json({ item });
}

export async function DELETE(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  await prisma.aiKnowledgeItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
