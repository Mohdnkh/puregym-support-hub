import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getSeedScripts } from "@/lib/seed-data";

const scriptSchema = z.object({
  key: z.string().min(3),
  title: z.string().min(2),
  category: z.string().min(2),
  country: z.enum(["ALL", "KSA", "UAE"]),
  language: z.enum(["AR", "EN"]),
  body: z.string().min(1),
  active: z.boolean().optional()
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const scripts = await prisma.script.findMany({ where: { active: true }, orderBy: [{ category: "asc" }, { title: "asc" }] });
    if (scripts.length > 0) return NextResponse.json({ scripts });
  } catch {
    // Allow the UI to still work before DB setup by returning fallback seed data.
  }

  return NextResponse.json({ scripts: getSeedScripts().map((s, index) => ({ id: `seed-${index}`, active: true, ...s })) });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const body = scriptSchema.parse(await req.json());
  const script = await prisma.script.create({ data: { ...body, active: body.active ?? true } });
  return NextResponse.json({ script });
}
