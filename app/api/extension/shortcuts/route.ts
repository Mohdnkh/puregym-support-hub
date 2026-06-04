import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserFromExtensionToken } from "@/lib/extensionAuth";

const shortcutSchema = z.object({
  shortcut: z.string().trim().min(1).max(28),
  scriptId: z.string().min(1),
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

function renderForUser(text: string, user: { nameAr: string; nameEn: string }, language: string) {
  const name = language === "AR" ? user.nameAr : user.nameEn;
  return String(text || "")
    .replaceAll("{{employeeName}}", name)
    .replaceAll("(اسم الموظف)", name)
    .replaceAll("(Agent Name)", name)
    .replaceAll("[Agent Name]", name);
}

async function findRequester(req: Request) {
  const tokenUser = await getUserFromExtensionToken(req);
  if (tokenUser) return tokenUser;
  return getCurrentUser();
}

export async function GET(req: Request) {
  const user = await findRequester(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const shortcuts = await prisma.userShortcut.findMany({
    where: { userId: user.id, active: true },
    include: {
      script: {
        select: {
          id: true,
          key: true,
          title: true,
          category: true,
          country: true,
          language: true,
          body: true,
          active: true,
          updatedAt: true
        }
      }
    },
    orderBy: [{ updatedAt: "desc" }, { shortcut: "asc" }]
  });

  const items = shortcuts
    .filter((item) => item.script?.active)
    .map((item) => ({
      id: item.id,
      shortcut: item.shortcut,
      title: item.title || item.script.title,
      scriptId: item.scriptId,
      category: item.script.category,
      country: item.script.country,
      language: item.script.language,
      body: item.script.body,
      renderedBody: renderForUser(item.script.body, user, item.script.language),
      updatedAt: item.updatedAt
    }));

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      nameAr: user.nameAr,
      nameEn: user.nameEn,
      role: user.role
    },
    shortcuts: items
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = shortcutSchema.parse(await req.json());
  const shortcut = normalizeShortcut(data.shortcut);
  if (!shortcut) return NextResponse.json({ error: "Invalid shortcut" }, { status: 400 });

  const script = await prisma.script.findFirst({
    where: { id: data.scriptId, active: true },
    select: { id: true, title: true }
  });
  if (!script) return NextResponse.json({ error: "Script not found" }, { status: 404 });

  const item = await prisma.userShortcut.upsert({
    where: { userId_shortcut: { userId: user.id, shortcut } },
    create: {
      userId: user.id,
      scriptId: script.id,
      shortcut,
      title: data.title || script.title,
      active: data.active ?? true
    },
    update: {
      scriptId: script.id,
      title: data.title || script.title,
      active: data.active ?? true
    }
  });

  return NextResponse.json({ shortcut: item }, { status: 201 });
}
