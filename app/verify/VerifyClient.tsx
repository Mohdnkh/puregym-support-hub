"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VerifyClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function verify(event: FormEvent) {
    event.preventDefault();
    setStatus("");
    setLoading(true);

    const res = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code })
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setStatus(data.error || "Verification failed");
      return;
    }

    setStatus("Account verified successfully. Redirecting to login...");
    setTimeout(() => router.push("/login"), 900);
  }

  return (
    <div className="auth-card">
      <div className="auth-logo-row">
        <div className="auth-logo"><img src="/pg-hub-mark.svg" alt="PureGym Hub" /></div>
        <div>
          <h1>Email verification</h1>
          <p>Enter the verification code sent to your email.</p>
        </div>
      </div>

      <form onSubmit={verify}>
        <div className="field"><label>Email</label><input className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
        <div className="field"><label>Verification code</label><input className="input verification-code-input" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" /></div>
        {status && <p className={status.includes("success") ? "success" : "error"}>{status}</p>}
        <button className="btn full" type="submit" disabled={loading || !email || code.length < 6}>{loading ? "Verifying..." : "Verify account"}</button>
      </form>

      <div className="auth-actions"><span>Already verified?</span><Link href="/login">Go to login</Link></div>
    </div>
  );
}
