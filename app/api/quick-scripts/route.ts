import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const createSchema = z.object({
  title: z.string().trim().min(1).max(120),
  country: z.enum(["ALL", "KSA", "UAE"]),
  language: z.enum(["AR", "EN"]),
  body: z.string().trim().min(1),
});

async function ensurePersonalQuickScripts(userId: string) {
  const existingCount = await prisma.userQuickScript.count({ where: { userId } });
  if (existingCount > 0) return;

  const seedScripts = await prisma.script.findMany({
    where: { active: true, category: "Quick Scripts" },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  if (!seedScripts.length) return;

  await prisma.userQuickScript.createMany({
    data: seedScripts.map((script) => ({
      userId,
      title: script.title,
      country: script.country,
      language: String(script.language) === "EN" ? "EN" : "AR",
      body: script.body,
      active: true,
      sortOrder: script.sortOrder,
    })),
  });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensurePersonalQuickScripts(user.id);
  const quickScripts = await prisma.userQuickScript.findMany({
    where: { userId: user.id, active: true },
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
  const lastQuick = await prisma.userQuickScript.findFirst({
    where: { userId: user.id },
    orderBy: { sortOrder: "desc" },
  });

  const quickScript = await prisma.userQuickScript.create({
    data: {
      userId: user.id,
      title: data.title,
      country: data.country,
      language: data.language,
      body: data.body,
      active: true,
      sortOrder: (lastQuick?.sortOrder || 0) + 10,
    },
  });

  return NextResponse.json({ quickScript }, { status: 201 });
}
