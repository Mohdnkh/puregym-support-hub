import { prisma } from "./db";
import { getSeedScripts } from "./seed-data";

type OpenAITextOptions = {
  system: string;
  user: string;
  messages?: Array<{ role: "user" | "assistant"; content: string }>;
  temperature?: number;
  maxOutputTokens?: number;
};

export function getOpenAIConfig() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  return {
    apiKey,
    model,
    temperature: Number(process.env.OPENAI_TEMPERATURE || 0.25),
    maxOutputTokens: Number(process.env.OPENAI_MAX_OUTPUT_TOKENS || 1400)
  };
}

function extractResponseText(data: any) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) return data.output_text.trim();

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
    throw new Error("OPENAI_API_KEY is missing. Add it to .env / Vercel Variables, then restart or redeploy.");
  }

  const input = [
    { role: "system", content: options.system },
    ...(options.messages || []).slice(-10).map((msg) => ({ role: msg.role, content: msg.content })),
    { role: "user", content: options.user }
  ];

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      input,
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
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { title: "asc" }]
    });
  } catch {
    scripts = getSeedScripts().filter((script) => {
      const countryOk = !country || script.country === country || script.country === "ALL";
      const langOk = !language || script.language === language;
      return countryOk && langOk;
    });
  }

  const officialKnowledge = country === "KSA"
    ? [
        "Official KSA join page: https://ksa.puregymarabia.com/en-gb/join/",
        "Official KSA gyms page: https://ksa.puregymarabia.com/en-gb/gyms/",
        "Official KSA app page: https://ksa.puregymarabia.com/en-gb/puregym-app/",
        "Official KSA login page: https://ksa.puregymarabia.com/login/"
      ]
    : [
        "Official UAE join page: https://uae.puregymarabia.com/en-gb/join/",
        "Official UAE gyms page: https://uae.puregymarabia.com/gyms/",
        "Official UAE app page: https://uae.puregymarabia.com/puregym-app/",
        "Official UAE login page: https://uae.puregymarabia.com/login/"
      ];

  return [
    officialKnowledge.join("\n"),
    ...scripts.slice(0, 220).map((script) => `[${script.category} | ${script.country} | ${script.language}] ${script.title}\n${script.body}`)
  ].join("\n\n---\n\n");
}

export function styleInstruction(country: "KSA" | "UAE", language: "AR" | "EN") {
  const countryName = country === "KSA" ? "Saudi Arabia / KSA" : "United Arab Emirates / UAE";
  const langName = language === "AR" ? "Arabic" : "English";
  const emoji = country === "KSA" ? "💚" : "💙";

  return [
    `You are a helpful internal PureGym support assistant for ${countryName}.`,
    `Preferred response language: ${langName}.`,
    `Use ${emoji} in ready-to-send customer scripts only.`,
    "Behave like a normal chatbot first: if the user greets you, greet them naturally and ask how you can help. Do not force a scripted welcome unless requested.",
    "When the user asks for a customer reply, produce a ready-to-paste support script.",
    "When the user asks to translate or rewrite, do that directly using the selected country and language style.",
    "Use the knowledge base and official links provided below. Do not invent policies, prices, links, or promises.",
    "For Arabic, use neutral wording that works for male and female as much as possible.",
    "If the answer is not available, say the agent should verify from the system or official source.",
    "Keep answers clear, practical, and not too long unless the user asks for detail."
  ].join(" ");
}
