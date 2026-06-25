import { NextResponse } from "next/server";
import { syncLiveOffers } from "@/lib/offers-scraper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Called daily by Vercel Cron (see vercel.json). If CRON_SECRET is set in the
// environment, the request must carry it (Vercel adds it automatically as a
// Bearer token); if it is not set, the endpoint stays open so it works out of
// the box and can be locked down later by adding CRON_SECRET.
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = req.headers.get("authorization");
  const url = new URL(req.url);
  return auth === `Bearer ${secret}` || url.searchParams.get("secret") === secret;
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await syncLiveOffers();
    return NextResponse.json({ ok: true, ranAt: new Date().toISOString(), results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Offer sync failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
