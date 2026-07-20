import { createHash } from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SHEET_ID = "136VUgcodHn8TRqm8cU4DpJ4Aw1u0EYBPrHonFGYiFT0";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`;
const SOURCE = "sheet-knowledge";

type Country = "ALL" | "KSA" | "UAE";
type Language = "AR" | "EN" | "BOTH";
type ImportScript = {
  key: string;
  title: string;
  category: string;
  country: Country;
  language: "AR" | "EN";
  body: string;
  source: string;
  sortOrder: number;
};
type ImportKnowledge = {
  title: string;
  content: string;
  country: Country;
  language: Language;
  kind: string;
  sourceUrl: string;
};

const includedTabs = [
  "KSA Agent Scripts",
  "UAE Agent Scripts",
  "Action Templates",
  "Referral Scripts",
  "Google Reviews Scripts",
  "New App FAQs",
] as const;

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  row.push(field);
  rows.push(row);
  return rows;
}

function clean(value: string) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function slugify(value: string) {
  return clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 54);
}

function shortHash(value: string) {
  return createHash("sha1").update(value).digest("hex").slice(0, 10);
}

function containsArabic(value: string) {
  return /[\u0600-\u06FF]/.test(value);
}

function pickTitle(question: string, language: "AR" | "EN", fallback: string) {
  const parts = clean(question)
    .split(/\n+/)
    .map((part) => clean(part))
    .filter(Boolean);
  const preferred =
    language === "AR"
      ? parts.find((part) => containsArabic(part))
      : parts.find((part) => /[A-Za-z]/.test(part) && !containsArabic(part));
  return clean(preferred || parts[0] || fallback).slice(0, 120);
}

function categorize(title: string, body = "") {
  const text = `${title} ${body}`.toLowerCase();
  if (/review|google|تقييم|مراجعة/.test(text)) return "Google Reviews";
  if (/freeze|frozen|تجميد|جمّد|مجمد/.test(text)) return "Freeze Policy";
  if (/cancel|cancellation|auto-renew|renewal|إلغاء|الغاء|التجديد التلقائي|تجديد تلقائي/.test(text)) return "Cancellation & Retention";
  if (/payment|billing|card|tabby|refund|paid|pay|دفع|دفعة|بطاقة|تابي|استرجاع|فاتورة|فشل/.test(text)) return "Payment & Billing";
  if (/ticket|escalat|transfer|نرفع|تصعيد|طلب متابعة|نقل/.test(text)) return "Tickets";
  if (/app|login|password|pin|qr|booking|bookings|تطبيق|دخول|كلمة|رمز|حجز|حجوزات/.test(text)) return "App / Login / Password";
  if (/referral|refer|friend|bring a friend|إحالة|احالة|صديق|أصدقاء/.test(text)) return "Friend / Bring a Friend";
  if (/offer|price|pricing|pt|personal training|trainer|yanga|عرض|عروض|سعر|أسعار|تدريب شخصي|مدرب|يانغا/.test(text)) return "Offers, Prices & PT";
  if (/corporate|employee|discount|خصم|شركة|موظف/.test(text)) return "Corporate Offers";
  if (/branch|location|hours|class|opening|gym|club|فرع|فروع|موقع|مواقع|ساعات|كلاس|النادي/.test(text)) return "Branches & Hours";
  return "Membership & Packages";
}

function makeScriptKey(tab: string, rowIndex: number, country: Country, language: "AR" | "EN", title: string, body: string) {
  return `${SOURCE}-${slugify(tab)}-${rowIndex}-${country.toLowerCase()}-${language.toLowerCase()}-${shortHash(`${title}\n${body}`)}`;
}

function makeScript(tab: string, rowIndex: number, country: Country, language: "AR" | "EN", title: string, body: string, category?: string): ImportScript | null {
  const cleanBody = clean(body);
  const cleanTitle = clean(title);
  if (!cleanTitle || cleanBody.length < 3) return null;
  if (category === "Quick Scripts") return null;

  return {
    key: makeScriptKey(tab, rowIndex, country, language, cleanTitle, cleanBody),
    title: cleanTitle,
    category: category || categorize(cleanTitle, cleanBody),
    country,
    language,
    body: cleanBody,
    source: SOURCE,
    sortOrder: rowIndex * 10,
  };
}

function makeKnowledge(tab: string, rowIndex: number, country: Country, language: Language, title: string, content: string): ImportKnowledge | null {
  const cleanTitle = clean(title);
  const cleanContent = clean(content);
  if (!cleanTitle || cleanContent.length < 8) return null;
  return {
    title: cleanTitle.slice(0, 180),
    content: cleanContent,
    country,
    language,
    kind: `Sheet Knowledge - ${tab}`,
    sourceUrl: `${SHEET_URL}#${encodeURIComponent(tab)}-row-${rowIndex}`,
  };
}

async function fetchRows(tab: string) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${tab}: ${response.status}`);
  return parseCsv(await response.text());
}

function scriptsFromQuestionArEn(tab: string, rows: string[][], country: Country, forcedCategory?: string) {
  const scripts: ImportScript[] = [];
  const knowledge: ImportKnowledge[] = [];
  let lastQuestion = "";
  const variantCount = new Map<string, number>();

  rows.slice(1).forEach((row, index) => {
    const rowIndex = index + 2;
    const question = clean(row[0]) || lastQuestion;
    if (question) lastQuestion = question;

    const ar = clean(row[1]);
    const en = clean(row[2]);
    if (!question || (!ar && !en)) return;

    const variant = (variantCount.get(question) || 0) + 1;
    variantCount.set(question, variant);
    const suffix = variant > 1 ? ` - ${variant}` : "";

    const arTitle = pickTitle(question, "AR", `Script ${rowIndex}`) + suffix;
    const enTitle = pickTitle(question, "EN", arTitle) + suffix;
    const category = forcedCategory || categorize(`${arTitle} ${enTitle}`, `${ar}\n${en}`);

    const arScript = makeScript(tab, rowIndex, country, "AR", arTitle, ar, category);
    const enScript = makeScript(tab, rowIndex, country, "EN", enTitle, en, category);
    if (arScript) scripts.push(arScript);
    if (enScript) scripts.push(enScript);

    const item = makeKnowledge(
      tab,
      rowIndex,
      country,
      ar && en ? "BOTH" : ar ? "AR" : "EN",
      `${pickTitle(question, "EN", pickTitle(question, "AR", `Row ${rowIndex}`))}`,
      [`Question:\n${question}`, ar ? `Arabic answer:\n${ar}` : "", en ? `English answer:\n${en}` : ""].filter(Boolean).join("\n\n"),
    );
    if (item) knowledge.push(item);
  });

  return { scripts, knowledge };
}

function scriptsFromNewApp(rows: string[][]) {
  const scripts: ImportScript[] = [];
  const knowledge: ImportKnowledge[] = [];

  rows.slice(1).forEach((row, index) => {
    const rowIndex = index + 2;
    const language = clean(row[0]).toUpperCase() === "AR" ? "AR" : clean(row[0]).toUpperCase() === "EN" ? "EN" : null;
    const question = clean(row[1]);
    const answer = clean(row[2]);
    if (!language || !question || !answer) return;

    const script = makeScript("New App FAQs", rowIndex, "ALL", language, question, answer, "App / Login / Password");
    if (script) scripts.push(script);
    const item = makeKnowledge("New App FAQs", rowIndex, "ALL", language, question, answer);
    if (item) knowledge.push(item);
  });

  return { scripts, knowledge };
}

function scriptsFromGoogleReviews(rows: string[][]) {
  const scripts: ImportScript[] = [];
  const knowledge: ImportKnowledge[] = [];
  let lastCategory = "";
  let lastScenario = "";

  rows.slice(1).forEach((row, index) => {
    const rowIndex = index + 2;
    const reviewCategory = clean(row[0]) || lastCategory;
    const scenario = clean(row[1]) || lastScenario || reviewCategory;
    if (reviewCategory) lastCategory = reviewCategory;
    if (scenario) lastScenario = scenario;
    const ar = clean(row[2]);
    const en = clean(row[3]);
    if (!scenario || (!ar && !en)) return;

    const arTitle = `Google Review - ${pickTitle(scenario, "AR", reviewCategory || `Row ${rowIndex}`)}`;
    const enTitle = `Google Review - ${pickTitle(scenario, "EN", arTitle)}`;
    const arScript = makeScript("Google Reviews Scripts", rowIndex, "ALL", "AR", arTitle, ar, "Google Reviews");
    const enScript = makeScript("Google Reviews Scripts", rowIndex, "ALL", "EN", enTitle, en, "Google Reviews");
    if (arScript) scripts.push(arScript);
    if (enScript) scripts.push(enScript);

    const item = makeKnowledge(
      "Google Reviews Scripts",
      rowIndex,
      "ALL",
      ar && en ? "BOTH" : ar ? "AR" : "EN",
      `Google Review - ${scenario}`,
      [`Category: ${reviewCategory}`, ar ? `Arabic response:\n${ar}` : "", en ? `English response:\n${en}` : ""].filter(Boolean).join("\n\n"),
    );
    if (item) knowledge.push(item);
  });

  return { scripts, knowledge };
}

function manualNewAppPaymentCase() {
  const ar = `نعتذر لك عن المشكلة اللي واجهتك أثناء الاشتراك والدفع عبر التطبيق الجديد.\n\nحالياً قد تظهر لبعض الأعضاء رسالة فشل عملية الدفع أثناء محاولة الاشتراك، وفريقنا المختص يتابع المشكلة.\n\nجرّب فضلاً الخطوات التالية:\n- التأكد من أن البطاقة مفعّلة للشراء الإلكتروني.\n- التأكد من وجود رصيد كافٍ.\n- تجربة بطاقة أخرى إن أمكن.\n- إعادة المحاولة بعد وقت قصير.\n\nإذا استمرت المشكلة، أرسل لنا البريد الإلكتروني، رقم الجوال، الفرع المطلوب، نوع العضوية، وصورة للخطأ حتى نرفعها للفريق المختص ونساعدك بأسرع وقت.`;
  const en = `We apologize for the issue you faced while trying to join and pay through the new app.\n\nSome members may currently see a payment failed message during signup, and our relevant team is following up on it.\n\nPlease try the following:\n- Make sure your card is enabled for online purchases.\n- Make sure there is enough balance.\n- Try another card if possible.\n- Try again after a short while.\n\nIf the issue continues, please send us your email address, phone number, selected branch, membership type, and a screenshot of the error so we can escalate it to the relevant team and assist you as quickly as possible.`;

  const scripts = [
    makeScript("Manual New App Cases", 1, "ALL", "AR", "فشل الدفع أثناء الاشتراك من التطبيق الجديد", ar, "App / Login / Password"),
    makeScript("Manual New App Cases", 2, "ALL", "EN", "New app signup payment failed", en, "App / Login / Password"),
  ].filter(Boolean) as ImportScript[];
  const knowledge = [
    makeKnowledge("Manual New App Cases", 1, "ALL", "BOTH", "Known case: New app signup payment failed", `Arabic script:\n${ar}\n\nEnglish script:\n${en}`),
  ].filter(Boolean) as ImportKnowledge[];
  return { scripts, knowledge };
}

async function collectImports() {
  const allScripts: ImportScript[] = [];
  const allKnowledge: ImportKnowledge[] = [];

  for (const tab of includedTabs) {
    const rows = await fetchRows(tab);
    let parsed: { scripts: ImportScript[]; knowledge: ImportKnowledge[] };
    if (tab === "KSA Agent Scripts") parsed = scriptsFromQuestionArEn(tab, rows, "KSA");
    else if (tab === "UAE Agent Scripts") parsed = scriptsFromQuestionArEn(tab, rows, "UAE");
    else if (tab === "Action Templates") parsed = scriptsFromQuestionArEn(tab, rows, "ALL", "Tickets");
    else if (tab === "Referral Scripts") parsed = scriptsFromQuestionArEn(tab, rows, "ALL", "Friend / Bring a Friend");
    else if (tab === "Google Reviews Scripts") parsed = scriptsFromGoogleReviews(rows);
    else parsed = scriptsFromNewApp(rows);

    allScripts.push(...parsed.scripts);
    allKnowledge.push(...parsed.knowledge);
  }

  const manual = manualNewAppPaymentCase();
  allScripts.push(...manual.scripts);
  allKnowledge.push(...manual.knowledge);

  const uniqueScripts = Array.from(new Map(allScripts.map((script) => [script.key, script])).values());
  const uniqueKnowledge = Array.from(
    new Map(
      allKnowledge.map((item) => [
        `${item.kind}|${item.country}|${item.language}|${item.title}|${item.sourceUrl}`,
        item,
      ]),
    ).values(),
  );

  return { scripts: uniqueScripts, knowledge: uniqueKnowledge };
}

async function upsertKnowledge(item: ImportKnowledge) {
  const existing = await prisma.aiKnowledgeItem.findFirst({
    where: {
      title: item.title,
      kind: item.kind,
      country: item.country,
      language: item.language,
      sourceUrl: item.sourceUrl,
    },
  });

  if (existing) {
    await prisma.aiKnowledgeItem.update({
      where: { id: existing.id },
      data: {
        content: item.content,
        active: true,
      },
    });
    return "updated";
  }

  await prisma.aiKnowledgeItem.create({
    data: {
      title: item.title,
      content: item.content,
      country: item.country,
      language: item.language,
      kind: item.kind,
      sourceUrl: item.sourceUrl,
      active: true,
    },
  });
  return "created";
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const { scripts, knowledge } = await collectImports();

  console.log(`Prepared ${scripts.length} script-library items and ${knowledge.length} AI knowledge items.`);
  console.log("Quick Scripts are excluded by design.");
  console.log("By category:");
  const byCategory = scripts.reduce<Record<string, number>>((acc, script) => {
    acc[script.category] = (acc[script.category] || 0) + 1;
    return acc;
  }, {});
  Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => console.log(`- ${category}: ${count}`));

  if (dryRun) {
    console.log("Dry run only. No database changes were made.");
    return;
  }

  let scriptCreated = 0;
  let scriptUpdated = 0;
  for (const script of scripts) {
    const existing = await prisma.script.findUnique({ where: { key: script.key } });
    await prisma.script.upsert({
      where: { key: script.key },
      update: {
        title: script.title,
        category: script.category,
        country: script.country,
        language: script.language,
        body: script.body,
        source: script.source,
        active: true,
        sortOrder: script.sortOrder,
      },
      create: script,
    });
    if (existing) scriptUpdated += 1;
    else scriptCreated += 1;
  }

  let knowledgeCreated = 0;
  let knowledgeUpdated = 0;
  for (const item of knowledge) {
    const result = await upsertKnowledge(item);
    if (result === "created") knowledgeCreated += 1;
    else knowledgeUpdated += 1;
  }

  console.log(`Script Library import done: ${scriptCreated} created, ${scriptUpdated} updated.`);
  console.log(`AI Knowledge import done: ${knowledgeCreated} created, ${knowledgeUpdated} updated.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
