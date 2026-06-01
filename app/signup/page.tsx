"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", nameAr: "", nameEn: "" });
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"form" | "code">("form");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) return setError(data.error || "Signup failed");

    setSuccess("Account created. Please enter the verification code sent to your email.");
    setStep("code");
  }

  async function verify(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const res = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, code })
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) return setError(data.error || "Verification failed");

    setSuccess("Account verified successfully. Redirecting to login...");
    setTimeout(() => router.push("/login"), 900);
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-logo-row">
          <div className="auth-logo">PG</div>
          <div>
            <h1>Create account</h1>
            <p>{step === "form" ? "Your Arabic and English names will be used automatically in scripts." : "Enter the 6-digit verification code sent to your email."}</p>
          </div>
        </div>

        {step === "form" ? (
          <form onSubmit={submit}>
            <div className="field"><label>Arabic name</label><input className="input" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} /></div>
            <div className="field"><label>English name</label><input className="input" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} /></div>
            <div className="field"><label>Email</label><input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" /></div>
            <div className="field"><label>Password</label><input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" /></div>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
            <button className="btn full" type="submit" disabled={loading}>{loading ? "Creating..." : "Create account"}</button>
            <div className="auth-actions"><span>Already have an account?</span><Link href="/login">Login</Link></div>
          </form>
        ) : (
          <form onSubmit={verify}>
            <div className="verify-email-box">{form.email}</div>
            <div className="field">
              <label>Verification code</label>
              <input className="input verification-code-input" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" />
            </div>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
            <button className="btn full" type="submit" disabled={loading || code.length < 6}>{loading ? "Verifying..." : "Verify account"}</button>
            <div className="auth-actions"><button className="btn ghost small" type="button" onClick={() => setStep("form")}>Back</button><Link href="/login">Login</Link></div>
          </form>
        )}
      </div>
    </main>
  );
}
