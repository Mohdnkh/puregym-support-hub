import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { callOpenAIText, getKnowledgeBaseText, styleInstruction } from "@/lib/ai";

export const runtime = "nodejs";

const schema = z.object({
  message: z.string().min(1),
  country: z.enum(["KSA", "UAE"]),
  language: z.enum(["AR", "EN"])
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized. Please log in again." }, { status: 401 });

  try {
    const { message, country, language } = schema.parse(await req.json());
    const knowledgeBase = await getKnowledgeBaseText(country, language);

    const answer = await callOpenAIText({
      system: `You are PureGym Support Hub AI.\n${styleInstruction(country, language)}\n\nKnowledge base:\n${knowledgeBase}`,
      user: message
    });

    return NextResponse.json({ answer });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
