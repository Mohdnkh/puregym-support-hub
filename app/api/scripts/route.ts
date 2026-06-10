import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const createSchema = z.object({
  title: z.string().min(2),
  category: z.string().min(2),
  country: z.enum(["ALL", "KSA", "UAE"]),
  language: z.enum(["AR", "EN"]),
  body: z.string().min(1)
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scripts = await prisma.script.findMany({
    where: { active: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { title: "asc" }]
  });

  return NextResponse.json({ scripts });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const data = createSchema.parse(await req.json());

  const lastScript = await prisma.script.findFirst({
    where: {
      category: data.category,
      country: data.country,
      language: data.language
    },
    orderBy: { sortOrder: "desc" }
  });

  const script = await prisma.script.create({
    data: {
      key: `admin-${slugify(data.category)}-${slugify(data.title)}-${randomUUID().slice(0, 8)}`,
      title: data.title,
      category: data.category,
      country: data.country,
      language: data.language,
      body: data.body,
      source: "admin",
      active: true,
      sortOrder: (lastScript?.sortOrder || 0) + 10
    }
  });

  return NextResponse.json({ script }, { status: 201 });
}
