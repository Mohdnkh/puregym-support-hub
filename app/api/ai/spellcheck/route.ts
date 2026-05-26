import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { callOpenAIText } from "@/lib/ai";

export const runtime = "nodejs";

const schema = z.object({
  text: z.string().min(1),
  language: z.enum(["AR", "EN"])
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized. Please log in again." }, { status: 401 });

  try {
    const { text, language } = schema.parse(await req.json());

    const system =
      language === "AR"
        ? "صحح الأخطاء الإملائية فقط في النص العربي. لا تغيّر المعنى، لا تضيف معلومات، لا تشرح. أعد النص المصحح فقط."
        : "Correct spelling and grammar only. Do not change meaning, do not add information, do not explain. Return only the corrected text.";

    const corrected = await callOpenAIText({
      system,
      user: text,
      temperature: 0,
      maxOutputTokens: 1200
    });

    return NextResponse.json({ text: corrected || text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Spellcheck failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
