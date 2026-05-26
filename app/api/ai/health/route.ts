import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getOpenAIConfig } from "@/lib/ai";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized. Please log in again." }, { status: 401 });

  const config = getOpenAIConfig();

  let scriptsCount: number | null = null;
  let dbOk = true;

  try {
    scriptsCount = await prisma.script.count({ where: { active: true } });
  } catch {
    dbOk = false;
  }

  return NextResponse.json({
    ok: Boolean(config.apiKey),
    openaiKeyConfigured: Boolean(config.apiKey),
    model: config.model,
    dbOk,
    scriptsCount,
    note: config.apiKey ? "AI configuration looks ready." : "OPENAI_API_KEY is missing in .env."
  });
}
