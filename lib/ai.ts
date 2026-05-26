import { prisma } from "./db";
import { getSeedScripts } from "./seed-data";

type OpenAITextOptions = {
  system: string;
  user: string;
  temperature?: number;
  maxOutputTokens?: number;
};

export function getOpenAIConfig() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  return {
    apiKey,
    model,
    temperature: Number(process.env.OPENAI_TEMPERATURE || 0.2),
    maxOutputTokens: Number(process.env.OPENAI_MAX_OUTPUT_TOKENS || 1200)
  };
}

function extractResponseText(data: any) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const pieces: string[] = [];

  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === "string") pieces.push(content.text);
      if (typeof content?.output_text === "string") pieces.push(content.output_text);
    }
  }

  if (pieces.length) return pieces.join("\n").trim();

  const chatText = data?.choices?.[0]?.message?.content;
  if (typeof chatText === "string") return chatText.trim();

  return "";
}

export async function callOpenAIText(options: OpenAITextOptions) {
  const config = getOpenAIConfig();

  if (!config.apiKey) {
    throw new Error("OPENAI_API_KEY is missing. Add it to .env, then restart npm run dev.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      input: [
        { role: "system", content: options.system },
        { role: "user", content: options.user }
      ],
      temperature: options.temperature ?? config.temperature,
      max_output_tokens: options.maxOutputTokens ?? config.maxOutputTokens
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.error?.message || data?.message || `OpenAI request failed with status ${response.status}`;
    throw new Error(message);
  }

  const text = extractResponseText(data);
  if (!text) throw new Error("OpenAI returned an empty response.");

  return text;
}

export async function getKnowledgeBaseText(country?: "KSA" | "UAE", language?: "AR" | "EN") {
  let scripts: Array<{ title: string; category: string; country: string; language: string; body: string }> = [];

  try {
    scripts = await prisma.script.findMany({
      where: {
        active: true,
        ...(country ? { country: { in: [country, "ALL"] } } : {}),
        ...(language ? { language } : {})
      },
      select: { title: true, category: true, country: true, language: true, body: true },
      orderBy: [{ category: "asc" }, { title: "asc" }]
    });
  } catch {
    scripts = getSeedScripts().filter((script) => {
      const countryOk = !country || script.country === country || script.country === "ALL";
      const langOk = !language || script.language === language;
      return countryOk && langOk;
    });
  }

  return scripts
    .slice(0, 180)
    .map((script) => `[${script.category} | ${script.country} | ${script.language}] ${script.title}\n${script.body}`)
    .join("\n\n---\n\n");
}

export function styleInstruction(country: "KSA" | "UAE", language: "AR" | "EN") {
  const countryName = country === "KSA" ? "Saudi Arabia / KSA" : "United Arab Emirates / UAE";
  const langName = language === "AR" ? "Arabic" : "English";
  const emoji = country === "KSA" ? "💚" : "💙";

  return [
    `Reply for ${countryName}.`,
    `Language: ${langName}.`,
    `Use ${emoji} only when a friendly support script needs an emoji.`,
    "Use PureGym support tone.",
    "Keep the reply direct and ready to paste to a customer.",
    "Make Arabic wording neutral for male and female as much as possible.",
    "Do not invent policies, prices, links, or promises.",
    "If the answer is not in the knowledge base, say the agent should verify from the system or official source."
  ].join(" ");
}
