"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, rememberMe })
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) return setError(data.error || "Login failed");
    router.push("/dashboard");
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-logo-row">
          <div className="auth-logo">PG</div>
          <div>
            <h1>PureGym Hub</h1>
            <p>Scripts, AI support, tickets, and calculation tools.</p>
          </div>
        </div>
        <div className="field"><label>Email</label><input className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
        <div className="field"><label>Password</label><input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></div>
        <label className="remember-row"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /> <span>Remember me</span></label>
        {error && <p className="error">{error}</p>}
        <button className="btn full" type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        <div className="auth-actions"><span>New user?</span><Link href="/signup">Create account</Link></div>
      </form>
    </main>
  );
}
