"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type LoginMode = "login" | "forgot" | "reset";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function resetMessages() {
    setError("");
    setStatus("");
  }

  async function submitLogin() {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, rememberMe }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }

    router.push("/dashboard");
  }

  async function requestResetCode() {
    const res = await fetch("/api/auth/request-password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Could not send reset code");
      return;
    }

    setStatus("If this email exists, a password reset code has been sent.");
    setMode("reset");
  }

  async function submitResetPassword() {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: resetCode, password: newPassword }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Password reset failed");
      return;
    }

    setPassword("");
    setResetCode("");
    setNewPassword("");
    setStatus(
      "Password updated successfully. Please login with your new password.",
    );
    setMode("login");
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      if (mode === "login") await submitLogin();
      if (mode === "forgot") await requestResetCode();
      if (mode === "reset") await submitResetPassword();
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextMode: LoginMode) {
    resetMessages();
    setMode(nextMode);
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-logo-row">
          <div className="auth-logo">
            <img src="/pg-hub-mark.svg" alt="PureGym Hub" />
          </div>
          <div>
            <h1>PureGym Hub</h1>
            <p>Scripts, AI support, tickets, and calculation tools.</p>
          </div>
        </div>

        {mode === "login" && (
          <>
            <div className="field">
              <label>Email</label>
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="login-options-row">
              <label className="remember-row">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />{" "}
                <span>Remember me</span>
              </label>
              <span className="muted-text" style={{ fontSize: 12 }}>
                Forgot your password? Ask an admin to reset it.
              </span>
            </div>
          </>
        )}

        {mode === "forgot" && (
          <>
            <div className="auth-mode-note">
              <b>Reset your password</b>
              <span>
                Enter your account email and we’ll send a verification code.
              </span>
            </div>
            <div className="field">
              <label>Email</label>
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </>
        )}

        {mode === "reset" && (
          <>
            <div className="auth-mode-note">
              <b>Enter reset code</b>
              <span>
                Use the code sent to your email, then choose a new password.
              </span>
            </div>
            <div className="field">
              <label>Email</label>
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="field">
              <label>Reset code</label>
              <input
                className="input"
                value={resetCode}
                onChange={(e) =>
                  setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            </div>
            <div className="field">
              <label>New password</label>
              <input
                className="input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </>
        )}

        {error && <p className="error">{error}</p>}
        {status && <p className="success">{status}</p>}

        <button className="btn full" type="submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : mode === "login"
              ? "Login"
              : mode === "forgot"
                ? "Send reset code"
                : "Reset password"}
        </button>

        {mode !== "login" && (
          <button
            className="btn secondary full"
            type="button"
            onClick={() => switchMode("login")}
          >
            Back to login
          </button>
        )}

        <div className="auth-actions">
          <span>New user?</span>
          <Link href="/signup">Create account</Link>
        </div>
      </form>
    </main>
  );
}
