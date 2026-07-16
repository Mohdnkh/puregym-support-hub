import { prisma } from "../lib/db";
import { formatOfferForCustomer } from "../lib/offers-scraper";

const SOURCE_TAG = "live-offer";

function stripAutoUpdateFooter(body: string) {
  return body
    .replace(/\n\n[—-]\s*Auto-updated from the official site\s*\([^)]+\)\s*$/i, "")
    .replace(/\n\n[—-]\s*محدث تلقائياً من الموقع الرسمي\s*\([^)]+\)\s*$/i, "")
    .trim();
}

async function main() {
  const stamp = new Date().toISOString().slice(0, 10);
  const scripts = await prisma.script.findMany({
    where: { source: SOURCE_TAG },
    select: { id: true, key: true, country: true, language: true, body: true },
    orderBy: [{ country: "asc" }, { language: "asc" }],
  });

  const updated = [];

  for (const script of scripts) {
    if (
      (script.country !== "KSA" && script.country !== "UAE") ||
      (script.language !== "AR" && script.language !== "EN")
    ) {
      continue;
    }

    const rawOffer = stripAutoUpdateFooter(script.body);
    if (!rawOffer) continue;

    const footer =
      script.language === "AR"
        ? `\n\n— محدث تلقائياً من الموقع الرسمي (${stamp})`
        : `\n\n— Auto-updated from the official site (${stamp})`;

    const body = `${formatOfferForCustomer(rawOffer, {
      country: script.country,
      language: script.language,
    })}${footer}`;

    await prisma.script.update({
      where: { id: script.id },
      data: { body },
    });

    updated.push({ key: script.key, country: script.country, language: script.language });
  }

  console.log(JSON.stringify({ updated: updated.length, scripts: updated }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
