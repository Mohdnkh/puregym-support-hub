// Run background work that must finish AFTER the HTTP response is sent.
//
// On Vercel serverless, the function can freeze the moment the response
// returns, which silently kills "fire-and-forget" promises. `waitUntil`
// from @vercel/functions tells the platform to keep the instance alive
// until the promise settles. Outside Vercel (local dev) we just let the
// promise run normally.

export function runAfterResponse(work: Promise<unknown>): void {
  const safe = Promise.resolve(work).catch(() => undefined);

  try {
    // Imported lazily so local/dev without the package still works.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { waitUntil } = require("@vercel/functions");
    if (typeof waitUntil === "function") {
      waitUntil(safe);
      return;
    }
  } catch {
    // Package not available (e.g. local dev) — fall through.
  }

  // Fallback: best-effort, works locally where the process stays alive.
  void safe;
}
