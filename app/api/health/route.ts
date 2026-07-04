import { NextResponse } from "next/server";
import { getOpenAIConfig } from "@/lib/ai";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: Request) {
  const secret = process.env.HEALTH_SECRET || process.env.CRON_SECRET;
  if (!secret) return true;

  const auth = req.headers.get("authorization");
  const url = new URL(req.url);
  return auth === `Bearer ${secret}` || url.searchParams.get("secret") === secret;
}

function hoursSince(date: Date | null) {
  if (!date) return null;
  return Math.round(((Date.now() - date.getTime()) / 3_600_000) * 100) / 100;
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checkedAt = new Date();
  const startedAt = Date.now();
  const ai = getOpenAIConfig();
  const maxOfferAgeHours = Number(process.env.OFFER_HEALTH_MAX_AGE_HOURS || 36);

  let dbOk = true;
  let dbError: string | null = null;
  let scriptsCount: number | null = null;
  let liveOfferScripts = 0;
  let latestOfferUpdatedAt: Date | null = null;

  try {
    const [scriptCountResult, liveOffers] = await Promise.all([
      prisma.script.count(),
      prisma.script.findMany({
        where: { source: "live-offer" },
        select: { updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    scriptsCount = scriptCountResult;
    liveOfferScripts = liveOffers.length;
    latestOfferUpdatedAt = liveOffers[0]?.updatedAt || null;
  } catch (error) {
    dbOk = false;
    dbError = error instanceof Error ? error.message : "Database check failed";
  }

  const offerAgeHours = hoursSince(latestOfferUpdatedAt);
  const offersOk = Boolean(latestOfferUpdatedAt) && (offerAgeHours ?? Infinity) <= maxOfferAgeHours;
  const aiOk = Boolean(ai.apiKey);

  return NextResponse.json({
    ok: dbOk && aiOk && offersOk,
    checkedAt: checkedAt.toISOString(),
    database: {
      ok: dbOk,
      latencyMs: Date.now() - startedAt,
      scriptsCount,
      error: dbError,
    },
    ai: {
      ok: aiOk,
      provider: ai.provider,
      model: ai.model,
      keyConfigured: aiOk,
    },
    offers: {
      ok: offersOk,
      liveOfferScripts,
      latestUpdatedAt: latestOfferUpdatedAt?.toISOString() || null,
      ageHours: offerAgeHours,
      maxAgeHours: maxOfferAgeHours,
    },
    cron: {
      offerSyncSchedule: "0 6 * * *",
      cronSecretConfigured: Boolean(process.env.CRON_SECRET),
      githubActionsFallback: true,
    },
  });
}
