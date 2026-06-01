"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [form, setForm] = useState({ email: "", password: "", nameAr: "", nameEn: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Signup failed");
    setSuccess("Account created. Check your email to activate the account.");
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-logo-row">
          <img className="auth-logo-img" src="/pg-hub-mark.svg" alt="PureGym Hub" />
          <div>
            <h1>Create account</h1>
            <p>Your Arabic and English names will be used automatically in scripts.</p>
          </div>
        </div>
        <div className="field"><label>Arabic name</label><input className="input" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} /></div>
        <div className="field"><label>English name</label><input className="input" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} /></div>
        <div className="field"><label>Email</label><input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div className="field"><label>Password</label><input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <button className="btn" type="submit">Sign up</button>
        <p>Already have an account? <Link href="/login">Login</Link></p>
      </form>
    </main>
  );
}
