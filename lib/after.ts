import { waitUntil } from "@vercel/functions";

// Run background work that must finish AFTER the HTTP response is sent.
//
// On Vercel serverless, the function can freeze the moment the response
// returns, which silently kills "fire-and-forget" promises. `waitUntil`
// tells the platform to keep the instance alive until the promise settles.
// Outside a Vercel request context (e.g. local `next dev`) waitUntil throws,
// so we fall back to letting the promise run on its own.
export function runAfterResponse(work: Promise<unknown>): void {
  const safe = Promise.resolve(work).catch(() => undefined);

  try {
    waitUntil(safe);
  } catch {
    void safe;
  }
}
