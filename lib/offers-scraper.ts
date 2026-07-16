import { prisma } from "./db";

type OfferSource = {
  country: "KSA" | "UAE";
  language: "AR" | "EN";
  url: string;
};

const SOURCES: OfferSource[] = [
  { country: "KSA", language: "EN", url: "https://ksa.puregymarabia.com/en-gb" },
  { country: "KSA", language: "AR", url: "https://ksa.puregymarabia.com/" },
  { country: "UAE", language: "EN", url: "https://uae.puregymarabia.com/" },
  { country: "UAE", language: "AR", url: "https://uae.puregymarabia.com/ar-ae/" },
];

const CATEGORY = "Offers, Prices & PT";
const SOURCE_TAG = "live-offer";

function decodeEntities(text: string) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function htmlToText(html: string) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|section|article|li|h[1-6])>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  );
}

function compactSnippet(text: string, startPattern: RegExp, stopPatterns: RegExp[]) {
  const match = startPattern.exec(text);
  if (!match || match.index < 0) return null;
  const start = match.index;
  let end = Math.min(text.length, start + 700);

  for (const stop of stopPatterns) {
    stop.lastIndex = start + match[0].length;
    const stopMatch = stop.exec(text);
    if (stopMatch?.index && stopMatch.index > start && stopMatch.index < end) {
      end = stopMatch.index;
    }
  }

  return text
    .slice(start, end)
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?،؛:])/g, "$1")
    .trim();
}

function extractCodeBasedOffer(html: string) {
  const codeMarker = /use\s*code|استخدم(?:وا)?\s*(?:الكود|كود)|كود\s*:/i;
  const discountMarker = /\d{1,3}\s*%|%\s*off|off\s*on|خصم/i;
  const nodes = html.match(/>([^<>]{12,280})</g) || [];

  for (const raw of nodes) {
    const text = decodeEntities(raw.slice(1, -1));
    if (codeMarker.test(text) && discountMarker.test(text)) return text;
  }

  return null;
}

function extractHomepageHighlights(html: string, language: "AR" | "EN") {
  const text = htmlToText(html);
  const snippets: string[] = [];

  if (language === "AR") {
    const memberOffers = compactSnippet(text, /استمتع\s+بعروض\s+الأعضاء/i, [
      /اشترِ?\s+الآن\s+وادفع\s+لاحقًا/gi,
      /أكثر\s+من\s+مجرد\s+نادي/gi,
    ]);
    const instalments = compactSnippet(text, /اشترِ?\s+الآن\s+وادفع\s+لاحقًا/i, [
      /أكثر\s+من\s+مجرد\s+نادي/gi,
      /بيورجيم\s+بلس/gi,
    ]);
    const uaeFlex = compactSnippet(text, /مرونة\s+لا\s+مثيل\s+لها/i, [
      /دعم\s+شامل/gi,
      /بيورجيم\s+بلس/gi,
    ]);
    const plus = compactSnippet(text, /بيورجيم\s+بلس/i, [
      /انضموا\s+إلى\s+صفوف/gi,
      /دروس\s+اللياقة/gi,
    ]);
    for (const item of [memberOffers, instalments, uaeFlex, plus]) {
      if (item && item.length > 20) snippets.push(item);
    }
  } else {
    const memberOffers = compactSnippet(text, /Enjoy\s+members\s+offers/i, [
      /Buy\s+now\s+and\s+pay\s+later/gi,
      /More\s+than\s+just\s+a\s+gym/gi,
    ]);
    const instalments = compactSnippet(text, /Buy\s+now\s+and\s+pay\s+later/i, [
      /More\s+than\s+just\s+a\s+gym/gi,
      /PureGym\s+Plus/gi,
    ]);
    const flexible = compactSnippet(text, /Join\s+now\s+Train\s+with\s+top\s+equipment|Way\s+more\s+flexibility/i, [
      /Way\s+more\s+support/gi,
      /PureGym\s+Plus/gi,
    ]);
    const plus = compactSnippet(text, /PureGym\s+Plus/i, [
      /Experience\s+the\s+PureGym\s+Difference/gi,
    ]);
    for (const item of [memberOffers, instalments, flexible, plus]) {
      if (item && item.length > 20) snippets.push(item);
    }
  }

  return snippets.slice(0, 2).join("\n\n");
}

export function extractOffer(html: string, language: "AR" | "EN" = "EN"): string | null {
  const codeBasedOffer = extractCodeBasedOffer(html);
  if (codeBasedOffer) return codeBasedOffer;

  const highlights = extractHomepageHighlights(html, language);
  return highlights || null;
}

function cleanupOfferText(offer: string) {
  return offer
    .replace(/\bJoin Now\b/gi, " ")
    .replace(/\bLearn More\b/gi, " ")
    .replace(/\bHow monthly instalments work\??\b/gi, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?،؛:])/g, "$1")
    .trim();
}

function extractPromoCode(text: string) {
  const markerMatch = text.match(
    /(?:promo\s*code|use\s*code|code|كود|الرمز|رمز)\s*[:：]?\s*([A-Z0-9][A-Z0-9-]{2,15})/i,
  );
  if (markerMatch?.[1]) return markerMatch[1].toUpperCase();

  const candidates = text.match(/\b[A-Z0-9][A-Z0-9-]{2,15}\b/g) || [];
  const ignored = new Set([
    "CORE",
    "PLUS",
    "PUREGYM",
    "TABBY",
    "KSA",
    "UAE",
    "SAR",
    "AED",
    "MONTH",
    "MONTHS",
  ]);
  return candidates.find((code) => !ignored.has(code.toUpperCase()))?.toUpperCase() || null;
}

function extractDiscount(text: string) {
  const match =
    text.match(/\b\d{1,3}\s*%\s*(?:off|discount)?/i) ||
    text.match(/(?:خصم|discount|off)\s*\d{1,3}\s*%/i) ||
    text.match(/\b\d{1,3}\s*percent\s*(?:off|discount)?/i);
  return match?.[0]?.replace(/\s+/g, " ").trim() || null;
}

function formatDiscount(discount: string | null, language: "AR" | "EN") {
  if (!discount) return null;
  const percent = discount.match(/\d{1,3}\s*%/)?.[0]?.replace(/\s+/g, "") || discount;
  return language === "AR" ? percent : `${percent} off`;
}

function extractOfferScope(text: string, language: "AR" | "EN") {
  const firstTwoMonths =
    /first\s*(?:2|two)\s*months?/i.test(text) ||
    /أول\s*شهرين|اول\s*شهرين/.test(text);
  const monthlyMembership =
    /monthly\s+memberships?/i.test(text) ||
    /الاشتراك\s+الشهري|العضوية\s+الشهرية/.test(text);
  const firstMonth =
    /first\s*month/i.test(text) ||
    /أول\s*شهر|اول\s*شهر/.test(text);
  const fixedTerm = /fixed\s*term|3\s*month|6\s*month|12\s*month|محددة\s+المدة/i.test(text);

  if (firstTwoMonths && monthlyMembership) {
    return language === "AR"
      ? "على أول شهرين من الاشتراك الشهري"
      : "on the first 2 months of monthly memberships";
  }

  if (firstMonth && monthlyMembership) {
    return language === "AR"
      ? "على أول شهر من الاشتراك الشهري"
      : "on the first month of monthly memberships";
  }

  if (fixedTerm) {
    return language === "AR"
      ? "على العضويات محددة المدة حسب نوع العرض"
      : "on fixed-term memberships depending on the offer";
  }

  return null;
}

export function stripAutoUpdateFooter(body: string) {
  return body
    .replace(/\n\n[—-]\s*Auto-updated from the official site\s*\([^)]+\)\s*$/i, "")
    .replace(/\n\n[—-]\s*محدث تلقائياً من الموقع الرسمي\s*\([^)]+\)\s*$/i, "")
    .trim();
}

export function formatOfferForCustomer(
  offer: string,
  src: Pick<OfferSource, "country" | "language">,
) {
  const clean = cleanupOfferText(offer);
  const code = extractPromoCode(clean);
  const discount = extractDiscount(clean);
  const customerDiscount = formatDiscount(discount, src.language);
  const offerScope = extractOfferScope(clean, src.language);
  const hasTabby = /tabby|pay\s*in\s*4|pay\s*later|instalments?|installments?/i.test(clean);
  const heart = src.country === "UAE" ? "💙" : "💚";

  if (src.language === "AR") {
    const lines = [`${heart} حالياً عندنا عرض متاح في بيورجيم.`];

    if (customerDiscount && offerScope) {
      lines.push(`العرض يعطيك خصم ${customerDiscount} ${offerScope}.`);
    } else if (customerDiscount) {
      lines.push(`العرض يشمل خصم ${customerDiscount} حسب التفاصيل الظاهرة في صفحة التسجيل الرسمية.`);
    } else {
      lines.push("تقدر تستفيد من العرض الحالي من خلال صفحة التسجيل الرسمية حسب الفرع والعضوية المختارة.");
    }

    if (code) lines.push(`كود العرض: ${code}`);
    if (hasTabby) lines.push("وقد يظهر لك خيار الدفع على دفعات أثناء إتمام عملية التسجيل إذا كان متاحاً.");

    lines.push("للاستفادة من العرض، اختر الفرع والعضوية المناسبة ثم طبّق كود العرض قبل إتمام الدفع.");
    lines.push("ملاحظة: العروض قد تختلف حسب الفرع أو نوع العضوية، لذلك يُفضّل التأكد من التفاصيل النهائية في صفحة التسجيل قبل الدفع. 🙏");

    return lines.join("\n\n");
  }

  const lines = [`${heart} There is currently a PureGym offer available.`];

  if (customerDiscount && offerScope) {
    lines.push(`The offer gives ${customerDiscount} ${offerScope}.`);
  } else if (customerDiscount) {
    lines.push(`The offer includes ${customerDiscount}, subject to the details shown on the official join page.`);
  } else {
    lines.push("The current offer can be applied through the official join page, depending on the selected gym and membership.");
  }

  if (code) lines.push(`Promo code: ${code}`);
  if (hasTabby) lines.push("Pay-later instalments may also appear at checkout if available.");

  lines.push("To use the offer, select the gym and membership, then apply the promo code before completing payment.");
  lines.push("Please note that offers may vary by gym or membership type, so the final details should be checked on the join page before payment. 🙏");

  return lines.join("\n\n");
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PureGymHubBot/1.0)" },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export type OfferSyncResult = {
  country: string;
  language: string;
  status: "updated" | "skipped";
  offer?: string;
};

export async function syncLiveOffers(): Promise<OfferSyncResult[]> {
  const results: OfferSyncResult[] = [];
  const stamp = new Date().toISOString().slice(0, 10);

  for (const src of SOURCES) {
    const fallbackKey = `${SOURCE_TAG}-${src.country.toLowerCase()}-${src.language.toLowerCase()}`;
    {
    const title = src.language === "AR" ? `🔥 العرض الحالي — ${src.country}` : `🔥 Current Offer — ${src.country}`;
    const footer =
      src.language === "AR"
        ? `\n\n— محدث تلقائياً من الموقع الرسمي (${stamp})`
        : `\n\n— Auto-updated from the official site (${stamp})`;
    }
    const html = await fetchHtml(src.url);
    let offer = html ? extractOffer(html, src.language) : null;

    if (!offer) {
      const existing = await prisma.script.findUnique({
        where: { key: fallbackKey },
        select: { body: true },
      });
      offer = existing?.body ? stripAutoUpdateFooter(existing.body) : null;

      if (!offer) {
        results.push({ country: src.country, language: src.language, status: "skipped" });
        continue;
      }
    }

    const key = `${SOURCE_TAG}-${src.country.toLowerCase()}-${src.language.toLowerCase()}`;
    const title = src.language === "AR" ? `🔥 العرض الحالي — ${src.country}` : `🔥 Current Offer — ${src.country}`;
    const footer =
      src.language === "AR"
        ? `\n\n— محدث تلقائياً من الموقع الرسمي (${stamp})`
        : `\n\n— Auto-updated from the official site (${stamp})`;
    const body = `${formatOfferForCustomer(offer, src)}${footer}`;

    await prisma.script.upsert({
      where: { key },
      update: {
        title,
        category: CATEGORY,
        country: src.country,
        language: src.language,
        body,
        source: SOURCE_TAG,
        active: true,
        sortOrder: 1,
      },
      create: {
        key,
        title,
        category: CATEGORY,
        country: src.country,
        language: src.language,
        body,
        source: SOURCE_TAG,
        active: true,
        sortOrder: 1,
      },
    });

    results.push({ country: src.country, language: src.language, status: "updated", offer });
  }

  return results;
}
