type CheckFn = () => Promise<void>;

const baseUrl = (process.env.SMOKE_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
const smokeEmail = process.env.SMOKE_EMAIL || "";
const smokePassword = process.env.SMOKE_PASSWORD || "";

let failures = 0;

function getSetCookies(headers: Headers) {
  const values = (headers as unknown as { getSetCookie?: () => string[] }).getSetCookie?.();
  if (values?.length) return values;
  const single = headers.get("set-cookie");
  return single ? [single] : [];
}

function cookieHeaderFrom(headers: Headers) {
  return getSetCookies(headers)
    .map((value) => value.split(";")[0])
    .filter(Boolean)
    .join("; ");
}

async function request(path: string, init: RequestInit = {}, cookie?: string) {
  const headers = new Headers(init.headers);
  if (cookie) headers.set("cookie", cookie);
  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    redirect: "manual",
  });
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function check(name: string, fn: CheckFn) {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function expectStatus(name: string, path: string, expected: number | number[], cookie?: string) {
  await check(name, async () => {
    const response = await request(path, {}, cookie);
    const expectedList = Array.isArray(expected) ? expected : [expected];
    assert(
      expectedList.includes(response.status),
      `${path} returned ${response.status}, expected ${expectedList.join(" or ")}`,
    );
  });
}

async function expectJsonObject(name: string, path: string, cookie?: string) {
  await check(name, async () => {
    const response = await request(path, {}, cookie);
    assert(response.ok, `${path} returned ${response.status}`);
    const data = await response.json();
    assert(data && typeof data === "object" && !Array.isArray(data), `${path} did not return a JSON object`);
  });
}

async function login() {
  if (!smokeEmail || !smokePassword) return "";

  const response = await request("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: smokeEmail, password: smokePassword, rememberMe: false }),
  });

  assert(response.ok, `/api/auth/login returned ${response.status}`);
  const cookie = cookieHeaderFrom(response.headers);
  assert(cookie, "login did not return a session cookie");
  return cookie;
}

async function main() {
  console.log(`Smoke target: ${baseUrl}`);

  await expectStatus("login page renders", "/login", 200);
  await expectStatus("signup page renders", "/signup", 200);
  await expectStatus("dashboard shell renders", "/dashboard", 200);
  await expectJsonObject("auth/me returns JSON", "/api/auth/me");
  await expectStatus("health endpoint responds or requires a secret", "/api/health", [200, 401]);
  await expectStatus("scripts API blocks anonymous users", "/api/scripts", 401);
  await expectStatus("quick scripts API blocks anonymous users", "/api/quick-scripts", 401);
  await expectStatus("admin users API blocks anonymous users", "/api/admin/users", 403);

  if (smokeEmail && smokePassword) {
    let cookie = "";
    await check("login with smoke credentials", async () => {
      cookie = await login();
    });

    if (cookie) {
      let role = "USER";
      await check("authenticated auth/me includes user", async () => {
        const response = await request("/api/auth/me", {}, cookie);
        assert(response.ok, `/api/auth/me returned ${response.status}`);
        const data = await response.json();
        assert(data?.user?.email, "authenticated user was not returned");
        role = data.user.role || "USER";
      });

      await expectStatus("authenticated scripts API returns scripts", "/api/scripts", 200, cookie);
      await expectStatus("AI health is reachable for logged-in users", "/api/ai/health", 200, cookie);
      await expectStatus("quick scripts API returns shared scripts", "/api/quick-scripts", 200, cookie);

      await expectStatus(
        "admin users API respects current role",
        "/api/admin/users",
        role === "ADMIN" || role === "SUPER_ADMIN" ? 200 : 403,
        cookie,
      );
    }
  } else {
    console.log("SKIP authenticated checks (set SMOKE_EMAIL and SMOKE_PASSWORD)");
  }

  if (failures > 0) {
    console.error(`${failures} smoke check(s) failed.`);
    process.exit(1);
  }

  console.log("Smoke checks passed.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
