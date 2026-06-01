import { prisma } from "./db";
import { getSeedScripts } from "./seed-data";

type ChatRole = "USER" | "ASSISTANT";

type OpenAITextOptions = {
  system: string;
  user: string;
  temperature?: number;
  maxOutputTokens?: number;
};

type MultimodalMessage = {
  role: ChatRole;
  content: string;
  imageDataUrl?: string | null;
};

type OpenAIMultimodalOptions = {
  system: string;
  messages: MultimodalMessage[];
  temperature?: number;
  maxOutputTokens?: number;
};

const OFFICIAL_SOURCE_URLS = [
  "https://ksa.puregymarabia.com/terms-conditions/",
  "https://ksa.puregymarabia.com/en-gb/terms-conditions/",
  "https://uae.puregymarabia.com/ar-ae/terms-conditions/",
  "https://uae.puregymarabia.com/terms-conditions/",
  "GymRules A4-DUAL-REV1.pdf"
];

export const DEFAULT_AI_KNOWLEDGE_ITEMS = [
  {
    title: "Official KSA membership terms - core operating rules",
    country: "KSA" as const,
    language: "EN" as const,
    sourceType: "official-url",
    sourceUrl: "https://ksa.puregymarabia.com/en-gb/terms-conditions/",
    body:
      "KSA official terms: The member is a PureGym KSA member and PureGym is operated by Ektimal Sports Company. Membership benefits depend on the membership type chosen. Membership transfer to another branch is subject to PureGym approval; if approved, the price difference between current and target branch can be paid in advance or equivalent membership days can be deducted. Joining fees and first-month fees are collected at purchase. The member must keep a valid payment method. Unless cancelled, the next billing cycle is charged automatically. Monthly billing date remains the official deduction date unless formally changed. PureGym may increase membership prices or end promotional prices with notice, and members retain their cancellation rights."
  },
  {
    title: "Official KSA cancellation, failed payment, and PIF rules",
    country: "KSA" as const,
    language: "EN" as const,
    sourceType: "official-url",
    sourceUrl: "https://ksa.puregymarabia.com/en-gb/terms-conditions/",
    body:
      "KSA official terms: Monthly memberships can be cancelled by contacting Member Services at least 2 days before the next deduction date; the membership remains active until the day before the next payment date, then ends automatically. Fixed-term memberships / PIF cannot be cancelled; they may only be frozen according to the applicable freeze policy. If a monthly payment fails, membership is temporarily suspended; PureGym retries after 10 days. If the second attempt fails, the membership is automatically cancelled. If the second attempt succeeds, the billing date does not change and no compensation is provided for suspended days."
  },
  {
    title: "Official KSA Hyper Bill payment link terms",
    country: "KSA" as const,
    language: "EN" as const,
    sourceType: "official-url",
    sourceUrl: "https://ksa.puregymarabia.com/en-gb/terms-conditions/",
    body:
      "KSA official Hyper Bill terms: Payment links may be issued for one-off services, upgrades, freeze payments, failed or declined payments, or other ad hoc requests. If valid card data is not stored, the member receives a no-reply email from hyperbill@hyperpay.com with a personalized payment link. The member must complete payment via the link to avoid service interruption, delayed freeze/reactivation/upgrade, or temporary suspension. Payments are processed securely by Hyper Bill; PureGym does not retain full card details. For support, members should not reply to the no-reply email and should contact Member Services."
  },
  {
    title: "Official KSA PIN / QR abuse policy",
    country: "KSA" as const,
    language: "EN" as const,
    sourceType: "official-url",
    sourceUrl: "https://ksa.puregymarabia.com/en-gb/terms-conditions/",
    body:
      "KSA official PIN/QR abuse policy: PIN, QR, or access device is issued for the member's personal use only and the membership covers only that member. The member must keep it secure and confidential. Use is monitored for safety and security. If PureGym believes the PIN/QR/access device was used by someone else, it may investigate and request cooperation. Where misuse is found, PureGym may charge a penalty equivalent to the applicable daily membership fee for each misuse and/or cancel membership immediately in serious or repeated misuse cases. Tailgating or giving access to another person may make the member responsible for that person's behavior and losses."
  },
  {
    title: "Official UAE membership terms - core operating rules",
    country: "UAE" as const,
    language: "EN" as const,
    sourceType: "official-url",
    sourceUrl: "https://uae.puregymarabia.com/terms-conditions/",
    body:
      "UAE official terms: The member is a PureGym UAE member and PureGym is operated by Ektimal Sport Investment LLC. The agreement becomes binding once the membership application is accepted. Members are entitled to benefits according to the membership type chosen. Members cannot transfer the agreement to another person. Joining fees and first-month fees are collected at purchase; valid payment method is required; unless cancelled, membership fees for the next billing cycle are charged automatically. PureGym may update membership prices with at least one month's notice, and members can terminate according to terms during that notice period."
  },
  {
    title: "Official UAE offer and membership context",
    country: "UAE" as const,
    language: "EN" as const,
    sourceType: "official-url",
    sourceUrl: "https://uae.puregymarabia.com/terms-conditions/",
    body:
      "UAE official site context: Current public page may show promotional banners such as first-month discount codes. Always verify current live offers from the official UAE website before promising a discount, code, or expiry date. If the agent is unsure, respond with a safe script advising the member to check the official website/app or share the specific branch/membership so the agent can verify."
  },
  {
    title: "Gym rules - English operational summary",
    country: "ALL" as const,
    language: "EN" as const,
    sourceType: "uploaded-policy",
    sourceUrl: "GymRules A4-DUAL-REV1.pdf",
    body:
      "Gym rules: Members must use their own QR code every visit and must not let anyone else use it. QR misuse is monitored by CCTV 24/7 and may result in additional charges or access/membership action. Photos/selfies must not identify other members. Aggressive, abusive, anti-social or threatening behavior can result in an instant ban. Only PureGym licensed personal trainers may train members unless written permission is granted by Central Support. Lockers are used at member risk; belongings must not be left after leaving the gym, and lost property is held for no more than one month. Smoking and e-cigarettes are prohibited. Members must be 16+. Members should ask for help before using equipment. Bags should be kept in lockers. Suitable sports attire and shoes are required; jeans, boots, dresses, flip-flops/sandals and football tops are not allowed. Drugs, steroids, recreational drugs and alcohol are banned. Wipe equipment after use. Pets are not allowed except official aid dogs. Late members cannot join classes after warm-up. Members should cancel classes online/app if they cannot attend. Replace weights and do not drop/slam them. Share equipment during rest periods when busy. External training equipment is not allowed. Members not following rules may be denied access."
  },
  {
    title: "قواعد النادي - ملخص عربي تشغيلي",
    country: "ALL" as const,
    language: "AR" as const,
    sourceType: "uploaded-policy",
    sourceUrl: "GymRules A4-DUAL-REV1.pdf",
    body:
      "قواعد النادي: يجب استخدام رمز QR الخاص بالعضو فقط في كل زيارة ولا يسمح بمشاركته مع أي شخص آخر. يتم تتبع سوء استخدام QR عبر كاميرات المراقبة 24/7 وقد يؤدي ذلك إلى رسوم إضافية أو إجراء على العضوية/الدخول. التصوير مسموح فقط إذا لم يظهر أعضاء آخرون. التصرف العدواني أو المسيء أو غير اللائق مع الموظفين أو الأعضاء قد يؤدي إلى حظر فوري. يسمح فقط لمدربي PureGym المعتمدين بتقديم التدريب الشخصي إلا بموافقة خطية. الخزائن على مسؤولية العضو ولا يجوز ترك الممتلكات بعد مغادرة النادي؛ المفقودات تحفظ لمدة شهر فقط. التدخين والسجائر الإلكترونية ممنوعة. الحد الأدنى للعمر 16 سنة. يجب طلب المساعدة عند عدم معرفة استخدام الأجهزة. الحقائب توضع في الخزائن. يجب ارتداء الزي الرياضي والحذاء المناسب؛ الجينز والأحذية غير الرياضية والكروكس/الشباشب غير مسموحة. يمنع استخدام المنشطات أو المخدرات أو الكحول. يجب مسح الأجهزة بعد الاستخدام. الحيوانات الأليفة ممنوعة إلا كلاب المساعدة الرسمية. لا يمكن دخول الحصة بعد انتهاء الإحماء، ويجب إلغاء الحجز من الموقع أو التطبيق عند عدم الحضور. يجب إعادة الأوزان وعدم رميها أو إسقاطها. عند الازدحام يفضل مشاركة الجهاز أثناء فترات الراحة. لا يسمح بإحضار معدات تدريب خارجية. عدم الالتزام قد يؤدي إلى منع الدخول للنادي."
  }
];

export function getOpenAIConfig() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini";

  return {
    apiKey,
    model,
    temperature: Number(process.env.OPENAI_TEMPERATURE || 0.2),
    maxOutputTokens: Number(process.env.OPENAI_MAX_OUTPUT_TOKENS || 1400)
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

async function callResponsesApi(input: any[], temperature: number, maxOutputTokens: number) {
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
      input,
      temperature,
      max_output_tokens: maxOutputTokens
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

export async function callOpenAIText(options: OpenAITextOptions) {
  const config = getOpenAIConfig();
  return callResponsesApi(
    [
      { role: "system", content: options.system },
      { role: "user", content: options.user }
    ],
    options.temperature ?? config.temperature,
    options.maxOutputTokens ?? config.maxOutputTokens
  );
}

export async function callOpenAIMultimodal(options: OpenAIMultimodalOptions) {
  const config = getOpenAIConfig();
  const input = [
    { role: "system", content: options.system },
    ...options.messages.map((message) => {
      const role = message.role === "ASSISTANT" ? "assistant" : "user";
      if (message.imageDataUrl && message.role === "USER") {
        return {
          role,
          content: [
            { type: "input_text", text: message.content || "Please analyze this image in the PureGym support context." },
            { type: "input_image", image_url: message.imageDataUrl }
          ]
        };
      }
      return { role, content: message.content };
    })
  ];

  return callResponsesApi(input, options.temperature ?? config.temperature, options.maxOutputTokens ?? config.maxOutputTokens);
}

function compact(text: string, limit = 9000) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > limit ? clean.slice(0, limit) + "…" : clean;
}

export async function getKnowledgeBaseText() {
  let scripts: Array<{ title: string; category: string; country: string; language: string; body: string }> = [];
  let customKnowledge: Array<{ title: string; country: string; language: string; body: string; sourceType: string; sourceUrl: string | null }> = [];

  try {
    scripts = await prisma.script.findMany({
      where: { active: true },
      select: { title: true, category: true, country: true, language: true, body: true },
      orderBy: [{ category: "asc" }, { title: "asc" }]
    });
  } catch {
    scripts = getSeedScripts().map((script) => ({
      title: script.title,
      category: script.category,
      country: script.country,
      language: script.language,
      body: script.body
    }));
  }

  try {
    customKnowledge = await prisma.aiKnowledgeItem.findMany({
      where: { active: true },
      select: { title: true, country: true, language: true, body: true, sourceType: true, sourceUrl: true },
      orderBy: [{ updatedAt: "desc" }],
      take: 120
    });
  } catch {
    customKnowledge = [];
  }

  const official = DEFAULT_AI_KNOWLEDGE_ITEMS.map(
    (item) => `[OFFICIAL SOURCE | ${item.country} | ${item.language} | ${item.sourceType}] ${item.title}\nSource: ${item.sourceUrl}\n${item.body}`
  );

  const trainer = customKnowledge.map(
    (item) => `[ADMIN TRAINER | ${item.country} | ${item.language} | ${item.sourceType}] ${item.title}\nSource: ${item.sourceUrl || "internal"}\n${item.body}`
  );

  const scriptText = scripts.slice(0, 260).map(
    (script) => `[SCRIPT LIBRARY | ${script.category} | ${script.country} | ${script.language}] ${script.title}\n${script.body}`
  );

  return compact([
    `Official source URLs available to the assistant:\n${OFFICIAL_SOURCE_URLS.map((url) => `- ${url}`).join("\n")}`,
    ...official,
    ...trainer,
    ...scriptText
  ].join("\n\n---\n\n"), 60000);
}

export function buildPureGymSystemPrompt(globalMemory?: string | null) {
  return [
    "You are PureGym Support Hub AI, an internal assistant for PureGym Arabia support agents.",
    "Scope: answer ONLY PureGym Arabia support questions, scripts, policies, membership, billing, app, freeze, cancellation, branches, gym rules, offers, payment links, QR/PIN/access, and operational support topics.",
    "If the user asks outside PureGym support scope, politely say you can only help with PureGym-related support work.",
    "Language behavior: detect the user's language from their latest message. Reply in Arabic when they write Arabic. Reply in English when they write English. If they ask for translation or a specific country style, follow that.",
    "Country behavior: infer KSA or UAE from the user's message, currency, branch, email, or context. If unclear and the policy differs by country, ask a short clarifying question before giving a final policy answer.",
    "Accuracy rule: never invent policy, prices, offers, links, refunds, freeze rights, cancellation rights, or compensation. Use the knowledge base, official source summaries, uploaded gym rules, and script library only. If unknown, say the agent should verify through the member system or official source.",
    "Privacy rule: do not expose one user's private chat history to another user. Global memory may only be used as anonymized operational learning.",
    "Support style: be practical, concise, agent-ready, and customer-safe. When useful, provide a ready-to-send script plus short internal notes.",
    "Script style: use neutral Arabic where possible, avoid gendered wording unless the user requests it, and add KSA 💚 or UAE 💙 only when producing a customer-facing script and the country is clear.",
    globalMemory ? `Global anonymized operational memory:\n${globalMemory}` : "Global anonymized operational memory: none yet."
  ].join("\n");
}

export async function summarizeGlobalMemory(previousMemory: string, latestUserMessage: string, latestAnswer: string) {
  const system = [
    "You maintain PureGym Support Hub global memory.",
    "Create a concise anonymized operational memory summary.",
    "Do NOT include names, emails, phone numbers, IDs, transaction IDs, card digits, or private user-specific details.",
    "Keep only reusable PureGym support learnings, patterns, policy clarifications, and common answers.",
    "Maximum 1200 words."
  ].join(" ");

  const user = `Previous memory:\n${previousMemory || "None"}\n\nLatest question:\n${latestUserMessage}\n\nLatest answer:\n${latestAnswer}\n\nUpdate the memory.`;

  try {
    return await callOpenAIText({ system, user, temperature: 0, maxOutputTokens: 1800 });
  } catch {
    const addition = `\n- Recent reusable learning: ${latestUserMessage.replace(/\s+/g, " ").slice(0, 220)} -> ${latestAnswer
      .replace(/\s+/g, " ")
      .slice(0, 420)}`;
    return compact(`${previousMemory || ""}${addition}`, 7000);
  }
}

export function legacyStyleInstruction(country: "KSA" | "UAE", language: "AR" | "EN") {
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

export const styleInstruction = legacyStyleInstruction;
