"use client";

/* eslint-disable @next/next/no-img-element */
import { FormEvent, useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [form, setForm] = useState({ email: "", name: "" });
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

    if (!res.ok) return setError(data.error || "Request failed");

    setSuccess(
      data.message ||
        "Account request submitted. An admin will approve it and send you your login details."
    );
    setForm({ email: "", name: "" });
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-logo-row">
          <div className="auth-logo">
            <img src="/pg-hub-mark.svg" alt="PureGym Hub" />
          </div>
          <div>
            <h1>Request access</h1>
            <p>Enter your email and first name. An admin will approve your account and send you your login details — no password needed here.</p>
          </div>
        </div>

        <form onSubmit={submit}>
          <div className="field">
            <label>First name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
          </div>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          <button className="btn full" type="submit" disabled={loading || !form.email || !form.name}>
            {loading ? "Submitting..." : "Request account"}
          </button>
          <div className="auth-actions"><span>Already have an account?</span><Link href="/login">Login</Link></div>
        </form>
      </div>
    </main>
  );
}
