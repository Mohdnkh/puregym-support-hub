import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DEFAULT_AI_KNOWLEDGE_ITEMS } from "@/lib/ai";

export const runtime = "nodejs";

const itemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2),
  body: z.string().min(5),
  country: z.enum(["ALL", "KSA", "UAE"]).default("ALL"),
  language: z.enum(["AR", "EN"]).default("EN"),
  sourceType: z.string().default("manual"),
  sourceUrl: z.string().optional().nullable(),
  active: z.boolean().optional()
});

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (user.role !== "ADMIN") return { error: NextResponse.json({ error: "Admin only" }, { status: 403 }) };
  return { user };
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const items = await prisma.aiKnowledgeItem.findMany({ orderBy: [{ updatedAt: "desc" }] });
  return NextResponse.json({ items, defaults: DEFAULT_AI_KNOWLEDGE_ITEMS });
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = itemSchema.parse(await req.json());
  const item = await prisma.aiKnowledgeItem.create({
    data: {
      title: body.title,
      body: body.body,
      country: body.country,
      language: body.language,
      sourceType: body.sourceType,
      sourceUrl: body.sourceUrl || null,
      active: body.active ?? true
    }
  });

  return NextResponse.json({ item });
}

export async function PUT(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = itemSchema.extend({ id: z.string().min(1) }).parse(await req.json());
  const item = await prisma.aiKnowledgeItem.update({
    where: { id: body.id },
    data: {
      title: body.title,
      body: body.body,
      country: body.country,
      language: body.language,
      sourceType: body.sourceType,
      sourceUrl: body.sourceUrl || null,
      active: body.active ?? true
    }
  });

  return NextResponse.json({ item });
}

export async function DELETE(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = z.object({ id: z.string().min(1) }).parse(await req.json());
  await prisma.aiKnowledgeItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
