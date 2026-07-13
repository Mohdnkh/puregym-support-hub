import { prisma } from "./db";
import { seedScripts } from "./seed-data";

type ChatRole = "user" | "assistant";

type OpenAITextOptions = {
  system: string;
  user: string;
  messages?: Array<{ role: ChatRole; content: string }>;
  temperature?: number;
  maxOutputTokens?: number;
};

type OpenAIMultimodalOptions = OpenAITextOptions & {
  imageDataUrl?: string | null;
};

export type AiLanguage = "AR" | "EN" | "BOTH";
export type AiCountry = "ALL" | "KSA" | "UAE";
type AiProvider = "groq" | "gemini" | "openai" | "custom";
type KnowledgeScript = { title: string; category: string; country: string; language: string; body: string };
type KnowledgeItem = { kind: string; country: string; language: string; title: string; sourceUrl: string | null; content: string };

const KNOWLEDGE_CHAR_BUDGET = Number(process.env.AI_KNOWLEDGE_CHAR_BUDGET || 9500);
const TRAINER_KNOWLEDGE_TAKE = Number(process.env.AI_TRAINER_ITEMS || 40);
const SCRIPT_KNOWLEDGE_TAKE = Number(process.env.AI_SCRIPT_ITEMS || 90);

const AI_PROVIDER_PRESETS: Record<Exclude<AiProvider, "custom">, { baseUrl: string; model: string }> = {
  groq: {
    baseUrl: "https://api.groq.com/openai/v1",
    model: "llama-3.1-8b-instant"
  },
  gemini: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    model: "gemini-2.0-flash"
  },
  openai: {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini"
  }
};

const OFFICIAL_SOURCE_NOTES = [
  {
    country: "KSA",
    language: "BOTH",
    title: "KSA official terms sources",
    content:
      "Official KSA Terms & Conditions sources: https://ksa.puregymarabia.com/terms-conditions/ and https://ksa.puregymarabia.com/en-gb/terms-conditions/. Key rules: monthly memberships can be cancelled by contacting Member Services at least 2 days before the next deduction date; membership remains active until the day before the next payment date. Fixed-term/PIF memberships cannot be cancelled; they may only be frozen according to freeze rules. If monthly payment fails, the membership is temporarily suspended, PureGym retries after 10 days, and if the second attempt fails the membership is automatically cancelled. Hyper Bill payment links may be used for one-off services, upgrades/freezes, failed payments, and ad hoc payment requests; the payment link email comes from hyperbill@hyperpay.com / no-reply; members should complete payment via the link and contact Member Services for support.",
    sourceUrl: "https://ksa.puregymarabia.com/en-gb/terms-conditions/",
    kind: "Official Source"
  },
  {
    country: "UAE",
    language: "BOTH",
    title: "UAE official terms sources",
    content:
      "Official UAE Terms & Conditions sources: https://uae.puregymarabia.com/ar-ae/terms-conditions/ and https://uae.puregymarabia.com/terms-conditions/. Key rules: failed monthly payment temporarily suspends membership; PureGym retries after 10 days and if the second attempt fails the membership is automatically cancelled. UAE freeze: 39 AED fee is charged if membership is frozen; unless the member is PLUS, freeze is maximum 3 months, then membership automatically unfreezes and returns to monthly rate; freeze must be actioned at least 2 working days before payment date and starts from payment date. Monthly memberships can be cancelled by contacting Member Services at least 2 days before next deduction date; paid-in-full/fixed-term memberships are not refundable and cannot be cancelled.",
    sourceUrl: "https://uae.puregymarabia.com/terms-conditions/",
    kind: "Official Source"
  },
  {
    country: "ALL",
    language: "BOTH",
    title: "Gym Rules A4 dual language summary",
    content:
      "Gym rules: members must use their own personal QR/PIN/access device every visit and must not share it; usage may be monitored by CCTV/security systems and misuse can lead to extra charges, investigation, cancellation, or denied access. Members should not photograph or post other members. Aggressive, abusive, anti-social, threatening, or inappropriate behavior may lead to immediate ban or membership action. Only PureGym licensed personal trainers may train members unless written permission is granted. Members should use lockers at their own risk and not leave belongings after leaving. Smoking and e-cigarettes are prohibited. Minimum age is 16+. Members should ask for help before using equipment if unsure. Bags should be placed in lockers. Suitable sports attire and shoes are required; jeans, non-sports shoes, crocs/flip flops/sandals/boots/dresses/football tops are not allowed. Drugs, steroids, recreational drugs, and alcohol are banned. Wipe equipment after use. Pets are not allowed except official aid dogs. Members must arrive on time for classes and cancel classes online or in the app if they cannot attend. Weights must be returned and not dropped/slammed. Do not bring external training equipment. Members who do not follow rules may be denied access.",
    sourceUrl: "GymRules A4-DUAL-REV1.pdf",
    kind: "Official Source"
  }
] as const;

// Provider-agnostic config. Works with any OpenAI-compatible chat/completions
// endpoint. Groq is the default free-tier option; Gemini and OpenAI remain
// optional through their OpenAI-compatible APIs.
// Set AI_BASE_URL + AI_API_KEY + AI_MODEL to switch provider with zero code changes.
export function getOpenAIConfig() {
  const explicitBaseUrl = process.env.AI_BASE_URL?.trim();
  const requestedProvider = process.env.AI_PROVIDER?.trim().toLowerCase() as AiProvider | undefined;
  const provider: AiProvider = explicitBaseUrl
    ? "custom"
    : requestedProvider && requestedProvider in AI_PROVIDER_PRESETS
      ? requestedProvider
      : "groq";
  const preset = provider === "custom" ? AI_PROVIDER_PRESETS.groq : AI_PROVIDER_PRESETS[provider];
  const baseUrl = (explicitBaseUrl || preset.baseUrl).replace(/\/+$/, "");
  const apiKey =
    process.env.AI_API_KEY?.trim() ||
    (provider === "gemini" ? process.env.GEMINI_API_KEY?.trim() : undefined) ||
    (provider === "openai" ? process.env.OPENAI_API_KEY?.trim() : undefined) ||
    process.env.GROQ_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim();
  const model =
    process.env.AI_MODEL?.trim() ||
    (provider === "openai" ? process.env.OPENAI_MODEL?.trim() : undefined) ||
    preset.model;

  return {
    provider,
    baseUrl,
    apiKey,
    model,
    temperature: Number(process.env.AI_TEMPERATURE || process.env.OPENAI_TEMPERATURE || 0.25),
    maxOutputTokens: Number(process.env.AI_MAX_OUTPUT_TOKENS || process.env.OPENAI_MAX_OUTPUT_TOKENS || 800)
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

function assertOpenAIKey(apiKey?: string) {
  if (!apiKey) {
    throw new Error("AI API key is missing. Add GROQ_API_KEY (recommended free tier) or AI_API_KEY / GEMINI_API_KEY / OPENAI_API_KEY to .env or Vercel Variables, then restart or redeploy.");
  }
}

function buildTextInput(options: OpenAITextOptions) {
  return [
    { role: "system", content: options.system },
    ...(options.messages || []).slice(-12).map((msg) => ({ role: msg.role, content: msg.content })),
    { role: "user", content: options.user }
  ];
}

// chat/completions multimodal format — supported by OpenAI, Groq and Gemini's
// OpenAI-compatible endpoint alike.
function buildMultimodalInput(options: OpenAIMultimodalOptions) {
  const previous = (options.messages || []).slice(-12).map((msg) => ({ role: msg.role, content: msg.content }));

  if (!options.imageDataUrl) {
    return [{ role: "system", content: options.system }, ...previous, { role: "user", content: options.user }];
  }

  return [
    { role: "system", content: options.system },
    ...previous,
    {
      role: "user",
      content: [
        { type: "text", text: options.user || "Please analyze the attached image." },
        { type: "image_url", image_url: { url: options.imageDataUrl } }
      ]
    }
  ];
}

async function callChatCompletions(messages: unknown[], options: OpenAITextOptions) {
  const config = getOpenAIConfig();
  assertOpenAIKey(config.apiKey);

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: options.temperature ?? config.temperature,
      max_tokens: options.maxOutputTokens ?? config.maxOutputTokens
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.error?.message || data?.message || `AI request failed with status ${response.status}`;
    throw new Error(message);
  }

  const text = extractResponseText(data);
  if (!text) throw new Error("The AI returned an empty response.");

  return text;
}

export async function callOpenAIText(options: OpenAITextOptions) {
  return callChatCompletions(buildTextInput(options), options);
}

export async function callOpenAIMultimodal(options: OpenAIMultimodalOptions) {
  return callChatCompletions(buildMultimodalInput(options), options);
}

export function detectAiSignals(message: string): { language: AiLanguage; country: AiCountry | null } {
  const text = String(message || "").toLowerCase();
  const hasArabic = /[\u0600-\u06FF]/.test(text);
  const language: AiLanguage = hasArabic ? "AR" : "EN";

  const ksaWords = ["ksa", "saudi", "saudi arabia", "السعود", "السعودية", "سعوديه", "رياض", "جدة", "جده", "الخبر", "دمام", "ريال", "sar", "اكتمال"];
  const uaeWords = ["uae", "emirates", "dubai", "abu dhabi", "دبي", "ابوظبي", "أبوظبي", "الامارات", "الإمارات", "امارات", "درهم", "aed", "نادي النهدة", "البرشاء"];

  const ksaScore = ksaWords.reduce((score, word) => score + (text.includes(word) ? 1 : 0), 0);
  const uaeScore = uaeWords.reduce((score, word) => score + (text.includes(word) ? 1 : 0), 0);

  if (ksaScore > uaeScore) return { language, country: "KSA" };
  if (uaeScore > ksaScore) return { language, country: "UAE" };
  return { language, country: null };
}

function normalizeKnowledgeText(value: string) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function queryTerms(query?: string | null) {
  return Array.from(
    new Set(
      normalizeKnowledgeText(query || "")
        .split(" ")
        .filter((word) => word.length >= 2)
        .slice(0, 18),
    ),
  );
}

function scoreKnowledge(text: string, terms: string[]) {
  if (!terms.length) return 0;
  const haystack = normalizeKnowledgeText(text);
  return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}

function clipText(text: string, maxChars: number) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= maxChars) return clean;
  return `${clean.slice(0, Math.max(0, maxChars - 1)).trim()}…`;
}

function packKnowledgeSections(sections: string[], budget = KNOWLEDGE_CHAR_BUDGET) {
  const packed: string[] = [];
  let used = 0;
  for (const section of sections) {
    const next = section.trim();
    if (!next) continue;
    const projected = used + next.length + 7;
    if (projected > budget) break;
    packed.push(next);
    used = projected;
  }
  return packed.join("\n\n---\n\n");
}

function rankByQuery<T>(items: T[], query: string | null | undefined, textForItem: (item: T) => string) {
  const terms = queryTerms(query);
  return [...items]
    .map((item, index) => ({ item, index, score: scoreKnowledge(textForItem(item), terms) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ item }) => item);
}

async function getTrainerKnowledge(country?: AiCountry | null, language?: AiLanguage | null, query?: string | null) {
  try {
    const items = await prisma.aiKnowledgeItem.findMany({
      where: {
        active: true,
        ...(country ? { country: { in: [country, "ALL"] } } : {}),
        ...(language ? { language: { in: [language, "BOTH"] } } : {})
      },
      orderBy: [{ kind: "asc" }, { updatedAt: "desc" }],
      take: TRAINER_KNOWLEDGE_TAKE
    });

    return rankByQuery<KnowledgeItem>(
      items,
      query,
      (item) => `${item.kind} ${item.title} ${item.sourceUrl || ""} ${item.content}`,
    ).map((item) => `[AI Trainer | ${item.kind} | ${item.country} | ${item.language}] ${item.title}\nSource: ${item.sourceUrl || "internal"}\n${clipText(item.content, 900)}`);
  } catch {
    return [];
  }
}

export async function getAiGlobalMemoryText() {
  try {
    const memory = await prisma.aiGlobalMemory.findUnique({ where: { key: "global" } });
    return memory?.summary?.trim() || "";
  } catch {
    return "";
  }
}

export async function getKnowledgeBaseText(country?: AiCountry | null, language?: AiLanguage | null, query?: string | null) {
  let scripts: KnowledgeScript[] = [];

  try {
    scripts = await prisma.script.findMany({
      where: {
        active: true,
        ...(country ? { country: { in: [country, "ALL"] } } : {}),
        ...(language ? { language } : {})
      },
      select: { title: true, category: true, country: true, language: true, body: true },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { title: "asc" }],
      take: 220
    });
  } catch {
    scripts = seedScripts.filter((script) => {
      const activeOk = script.active !== false;
      const countryOk = !country || script.country === country || script.country === "ALL";
      const langOk = !language || script.language === language;
      return activeOk && countryOk && langOk;
    });
  }

  const trainerKnowledge = await getTrainerKnowledge(country, language, query);
  const officialKnowledge = OFFICIAL_SOURCE_NOTES.filter((item) => {
    const countryOk = !country || item.country === country || item.country === "ALL";
    const langOk = !language || String(item.language) === language || String(item.language) === "BOTH";
    return countryOk && langOk;
  }).map((item) => `[Official Knowledge | ${item.country} | ${item.language}] ${item.title}\nSource: ${item.sourceUrl}\n${item.content}`);

  const rankedScripts = rankByQuery(
    scripts,
    query,
    (script) => `${script.category} ${script.title} ${script.country} ${script.language} ${script.body}`,
  ).slice(0, SCRIPT_KNOWLEDGE_TAKE);

  const sections = [
    ...officialKnowledge,
    ...trainerKnowledge,
    ...rankedScripts.map((script) => `[Script Library | ${script.category} | ${script.country} | ${script.language}] ${script.title}\n${clipText(script.body, 700)}`)
  ];

  return packKnowledgeSections(sections);
}

export function styleInstruction(country?: AiCountry | null, language?: AiLanguage | null) {
  const langName = language === "AR" ? "Arabic" : "English";
  const countryName = country === "KSA" ? "Saudi Arabia / KSA" : country === "UAE" ? "United Arab Emirates / UAE" : "country not explicitly selected";
  const emojiHint = country === "UAE" ? "💙" : country === "KSA" ? "💚" : "the suitable PureGym country emoji only when a country is clear";

  return [
    "You are 'PureGym Arabia Assistant' — a senior, highly experienced PureGym Arabia member-services expert who is helping an internal support agent. You know PureGym Arabia inside out: memberships, billing and deductions, cancellation, freeze, access/PIN/QR, the app and login, branches, offers and pricing structure, tickets, retention, and gym rules for both KSA and UAE.",
    "Personality: talk like a sharp, warm, real human colleague — natural and confident, never robotic or templated. Be genuinely helpful and calm. Show that you understand the member's situation and feelings (frustration about a charge, confusion about freeze, etc.) before solving it. Sound like someone who has handled thousands of these cases.",
    "Think before you answer: work out what the agent (and the member behind them) is really trying to achieve, then give the most useful answer. Briefly explain the 'why' behind a policy when it helps the agent handle the member better — don't just state rules coldly.",
    "Be proactive: anticipate the obvious next question and cover it in one go (e.g. if they ask how to freeze, also mention the fee, timing, and what happens after). Don't make the agent ask three follow-ups for one situation.",
    `Detected answer language: ${langName}. Always answer in the same language as the user's latest message, in natural, fluent ${langName}. For Arabic use clean, natural Gulf/Saudi phrasing — warm and professional, not stiff Modern Standard Arabic. If the user mixes Arabic and English, follow the language they used most in the latest request.`,
    `Detected country context: ${countryName}. If the user clearly asks about one country, answer for that country only.`,
    "Country intelligence rule: do NOT keep asking 'UAE or KSA?' by default. If the answer is the same for both countries, give one direct answer and mention it applies to both. If the answer differs, show a short KSA section and a short UAE section. Ask a country clarification only when a single exact action, price, branch, link, or policy cannot be safely answered without choosing one country.",
    `Use ${emojiHint} only in ready-to-send customer scripts, not in internal analysis unless helpful.`,
    "Scope: only PureGym Arabia support topics. If asked something unrelated, kindly steer back and offer to help with a PureGym question — but do it in one friendly line, not a lecture.",
    "Accuracy is sacred: rely on the Knowledge Base, Script Library, Official Sources, AI Trainer items, global memory, and the conversation. NEVER invent policies, prices, offers, links, dates, or guarantees. If the knowledge base does not cover something, say clearly what you do know, then tell the agent exactly where/how to verify the rest instead of guessing.",
    "For live prices, current offers, and real-time branch availability, remind the agent to confirm on the official join/branch page or internal system before promising anything to the member.",
    "When the agent wants a customer reply, produce a polished, ready-to-paste script in the member's language: empathetic opening, clear solution, and a warm close. Keep Arabic gender-neutral where possible so it works for any member.",
    "When the agent is just asking you a question (not requesting a script), reply naturally and conversationally — clear and to the point, no forced template.",
    "If an image is attached (screenshot, payment proof, app error), read it carefully and base your answer on what it actually shows. Do not expose unnecessary personal data from images.",
    "Format for fast reading: short paragraphs, and bullets or numbered steps for any process. Be thorough enough to be genuinely useful, but never padded."
  ].join(" ");
}

export function buildMemoryInstruction(memorySummary?: string | null, globalMemory?: string | null) {
  const parts: string[] = [];
  if (globalMemory?.trim()) {
    parts.push(`Global PureGym learning memory shared across users. Use it only as generalized knowledge and never reveal user-specific conversations:\n${globalMemory.trim()}`);
  }
  if (memorySummary?.trim()) {
    parts.push(`Private memory for this user only. Use it only when relevant and do not mention it unless asked:\n${memorySummary.trim()}`);
  }
  return parts.length ? `\n\n${parts.join("\n\n")}` : "";
}

export async function summarizeAiMemory(params: {
  existingSummary?: string | null;
  userMessage: string;
  assistantAnswer: string;
  country?: AiCountry | null;
  language: AiLanguage;
}) {
  const current = params.existingSummary?.trim() || "No previous memory.";

  return callOpenAIText({
    system: "Update a concise private memory summary for this single PureGym support user. Keep durable preferences, repeated issues, and useful corrections. Do not store unnecessary personal data. Maximum 8 bullet points.",
    user: [
      `Country: ${params.country || "unknown"}`,
      `Language: ${params.language}`,
      `Existing private memory:\n${current}`,
      `New user message:\n${params.userMessage}`,
      `Assistant answer:\n${params.assistantAnswer}`,
      "Return the updated private memory summary only."
    ].join("\n\n"),
    temperature: 0.1,
    maxOutputTokens: 500
  });
}

export async function summarizeAiGlobalMemory(params: {
  existingSummary?: string | null;
  userMessage: string;
  assistantAnswer: string;
}) {
  const current = params.existingSummary?.trim() || "No global memory yet.";

  return callOpenAIText({
    system: "Update a global PureGym support learning memory. Store only generalized operational lessons, approved wording patterns, policy clarifications, and recurring issue handling. Never include personal data, emails, phone numbers, names, IDs, or details that identify a user. Maximum 14 concise bullets.",
    user: [
      `Existing global memory:\n${current}`,
      `Latest user request:\n${params.userMessage}`,
      `Assistant answer:\n${params.assistantAnswer}`,
      "Return the updated global memory only."
    ].join("\n\n"),
    temperature: 0.1,
    maxOutputTokens: 700
  });
}
