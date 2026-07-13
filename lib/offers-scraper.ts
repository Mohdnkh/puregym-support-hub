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
    const html = await fetchHtml(src.url);
    const offer = html ? extractOffer(html, src.language) : null;

    if (!offer) {
      results.push({ country: src.country, language: src.language, status: "skipped" });
      continue;
    }

    const key = `${SOURCE_TAG}-${src.country.toLowerCase()}-${src.language.toLowerCase()}`;
    const title = src.language === "AR" ? `🔥 العرض الحالي — ${src.country}` : `🔥 Current Offer — ${src.country}`;
    const footer =
      src.language === "AR"
        ? `\n\n— محدث تلقائياً من الموقع الرسمي (${stamp})`
        : `\n\n— Auto-updated from the official site (${stamp})`;
    const body = `${offer}${footer}`;

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
