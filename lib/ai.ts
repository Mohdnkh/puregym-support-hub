import { prisma } from "./db";
import { getSeedScripts } from "./seed-data";

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

function assertOpenAIKey(apiKey?: string) {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing. Add it to .env / Vercel Variables, then restart or redeploy.");
  }
}

function buildTextInput(options: OpenAITextOptions) {
  return [
    { role: "system", content: options.system },
    ...(options.messages || []).slice(-12).map((msg) => ({ role: msg.role, content: msg.content })),
    { role: "user", content: options.user }
  ];
}

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
        { type: "input_text", text: options.user || "Please analyze the attached image." },
        { type: "input_image", image_url: options.imageDataUrl }
      ]
    }
  ];
}

export async function callOpenAIText(options: OpenAITextOptions) {
  const config = getOpenAIConfig();
  assertOpenAIKey(config.apiKey);

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      input: buildTextInput(options),
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

export async function callOpenAIMultimodal(options: OpenAIMultimodalOptions) {
  const config = getOpenAIConfig();
  assertOpenAIKey(config.apiKey);

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      input: buildMultimodalInput(options),
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
        "Official KSA Arabic join page: https://ksa.puregymarabia.com/join/",
        "Official KSA English join page: https://ksa.puregymarabia.com/en-gb/join/",
        "Official KSA Arabic gyms page: https://ksa.puregymarabia.com/gyms/",
        "Official KSA English gyms page: https://ksa.puregymarabia.com/en-gb/gyms/",
        "Official KSA Arabic app page: https://ksa.puregymarabia.com/puregym-app/",
        "Official KSA English app page: https://ksa.puregymarabia.com/en-gb/puregym-app/",
        "Official KSA login page: https://ksa.puregymarabia.com/login/",
        "KSA current offer knowledge from official site screenshot: First month offer for Core and Plus monthly membership using code PGM30. 3-month fixed-term Plus memberships offer using code PG3M. Always tell the agent to verify live offers from the join page before promising prices.",
        "KSA prices can differ by branch, membership type, campaign, and timing. Direct members to the join page to view exact live prices."
      ]
    : [
        "Official UAE Arabic join page: https://uae.puregymarabia.com/join/",
        "Official UAE English join page: https://uae.puregymarabia.com/en-gb/join/",
        "Official UAE Arabic gyms page: https://uae.puregymarabia.com/gyms/",
        "Official UAE English gyms page: https://uae.puregymarabia.com/en-gb/gyms/",
        "Official UAE Arabic app page: https://uae.puregymarabia.com/puregym-app/",
        "Official UAE English app page: https://uae.puregymarabia.com/en-gb/puregym-app/",
        "Official UAE login page: https://uae.puregymarabia.com/login/",
        "UAE current offer knowledge from official site screenshot: Eid offer / first month offer with 30% off using code PGA30. Always tell the agent to verify live offers from the join page before promising prices.",
        "UAE prices can differ by branch, membership type, campaign, and timing. Direct members to the join page to view exact live prices."
      ];

  return [
    officialKnowledge.join("\n"),
    ...scripts.slice(0, 260).map((script) => `[${script.category} | ${script.country} | ${script.language}] ${script.title}\n${script.body}`)
  ].join("\n\n---\n\n");
}

export function styleInstruction(country: "KSA" | "UAE", language: "AR" | "EN") {
  const countryName = country === "KSA" ? "Saudi Arabia / KSA" : "United Arab Emirates / UAE";
  const langName = language === "AR" ? "Arabic" : "English";
  const emoji = country === "KSA" ? "💚" : "💙";

  return [
    `You are a senior internal PureGym support assistant for ${countryName}.`,
    `Preferred response language: ${langName}.`,
    `Use ${emoji} in ready-to-send customer scripts only.`,
    "You can handle normal conversation, customer support wording, translations, rewriting, policy explanation, ticket wording, link lookup, app guidance, freeze/cancel/payment scenarios, and image-based support requests.",
    "If the user is casual, reply naturally and briefly. Do not force a customer script unless the user asks for one or the context clearly needs one.",
    "When the user asks for a customer reply, produce a ready-to-paste support script matching the selected country/language automatically.",
    "When the user asks to translate or rewrite, do that directly using the selected country and language style.",
    "If an image is attached, inspect it and answer the user's request based on the image. If it contains member data, do not expose unnecessary personal details; focus on the support action needed.",
    "Use the knowledge base, scripts, official links, and stored conversation context. Do not invent policies, prices, links, offers, or promises.",
    "For Arabic, use neutral wording that works for male and female as much as possible.",
    "If the answer is not available, say the agent should verify from the system or official source.",
    "Keep answers clear, practical, and not too long unless the user asks for detail."
  ].join(" ");
}

export function buildMemoryInstruction(memorySummary?: string | null) {
  if (!memorySummary?.trim()) return "";
  return `\n\nUseful memory from previous AI chats with this user. Use it only when relevant, and do not mention that you have memory unless asked:\n${memorySummary.trim()}`;
}

export async function summarizeAiMemory(params: {
  existingSummary?: string | null;
  userMessage: string;
  assistantAnswer: string;
  country: "KSA" | "UAE";
  language: "AR" | "EN";
}) {
  const current = params.existingSummary?.trim() || "No previous memory.";

  return callOpenAIText({
    system: "Update a concise internal memory summary for a PureGym support assistant. Keep durable preferences, repeated issues, useful corrections, and facts that help future answers. Do not store sensitive unnecessary personal data. Maximum 8 bullet points.",
    user: [
      `Country: ${params.country}`,
      `Language: ${params.language}`,
      `Existing memory:\n${current}`,
      `New user message:\n${params.userMessage}`,
      `Assistant answer:\n${params.assistantAnswer}`,
      "Return the updated memory summary only."
    ].join("\n\n"),
    temperature: 0.1,
    maxOutputTokens: 500
  });
}
