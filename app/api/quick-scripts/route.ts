import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const createSchema = z.object({
  title: z.string().trim().min(1).max(120),
  country: z.enum(["ALL", "KSA", "UAE"]),
  language: z.enum(["AR", "EN"]),
  body: z.string().trim().min(1),
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
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quickScripts = await prisma.script.findMany({
    where: { category: "Quick Scripts", active: true },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }, { title: "asc" }],
  });

  return NextResponse.json({ quickScripts });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Only admins can manage quick scripts." }, { status: 403 });

  const data = createSchema.parse(await req.json());
  const lastQuick = await prisma.script.findFirst({
    where: { category: "Quick Scripts", country: data.country, language: data.language },
    orderBy: { sortOrder: "desc" },
  });

  const quickScript = await prisma.script.create({
    data: {
      key: `quick-admin-${slugify(data.title)}-${randomUUID().slice(0, 8)}`,
      title: data.title,
      category: "Quick Scripts",
      country: data.country,
      language: data.language,
      body: data.body,
      source: "admin",
      active: true,
      sortOrder: (lastQuick?.sortOrder || 0) + 10,
    },
  });

  return NextResponse.json({ quickScript }, { status: 201 });
}
