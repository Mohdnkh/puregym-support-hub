import { prisma } from "./db";

// Scrapes the current promotional offer banner from the public PureGym Arabia
// homepages (KSA/UAE x EN/AR) and stores it in the Offers category. The banner
// is plain text in the HTML (e.g. "...50% Off... Use Code: HALF..."), so a simple
// fetch + text extraction is enough — no headless browser needed.

type OfferSource = {
  country: "KSA" | "UAE";
  language: "AR" | "EN";
  url: string;
};

const SOURCES: OfferSource[] = [
  { country: "KSA", language: "EN", url: "https://ksa.puregymarabia.com/en-gb/" },
  { country: "KSA", language: "AR", url: "https://ksa.puregymarabia.com/" },
  { country: "UAE", language: "EN", url: "https://uae.puregymarabia.com/en-gb/" },
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
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Pull the offer banner: a short text node that mentions a promo code AND a discount.
export function extractOffer(html: string): string | null {
  const codeMarker = /use\s*code|استخدم.{0,6}الكود|استخدمو?ا?\s*كود|كود\s*:/i;
  const discountMarker = /\d{1,3}\s*%|%\s*off|off\s*on|خصم/i;

  const nodes = html.match(/>([^<>]{12,240})</g) || [];
  for (const raw of nodes) {
    const text = decodeEntities(raw.slice(1, -1));
    if (codeMarker.test(text) && discountMarker.test(text)) {
      return text;
    }
  }
  return null;
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
    const offer = html ? extractOffer(html) : null;

    // If extraction fails, keep the last known good offer instead of wiping it.
    if (!offer) {
      results.push({ country: src.country, language: src.language, status: "skipped" });
      continue;
    }

    const key = `${SOURCE_TAG}-${src.country.toLowerCase()}-${src.language.toLowerCase()}`;
    const title = src.language === "AR" ? `🔥 العرض الحالي — ${src.country}` : `🔥 Current Offer — ${src.country}`;
    const footer = src.language === "AR" ? `\n\n— محدّث تلقائياً من الموقع الرسمي (${stamp})` : `\n\n— Auto-updated from the official site (${stamp})`;
    const body = `${offer}${footer}`;

    await prisma.script.upsert({
      where: { key },
      update: { title, category: CATEGORY, country: src.country, language: src.language, body, source: SOURCE_TAG, active: true, sortOrder: 1 },
      create: { key, title, category: CATEGORY, country: src.country, language: src.language, body, source: SOURCE_TAG, active: true, sortOrder: 1 },
    });

    results.push({ country: src.country, language: src.language, status: "updated", offer });
  }

  return results;
}
