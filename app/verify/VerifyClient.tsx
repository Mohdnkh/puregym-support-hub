"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function VerifyClient() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [status, setStatus] = useState("Verifying account...");

  useEffect(() => {
    async function verify() {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      const data = await res.json();
      setStatus(res.ok ? "Account verified successfully. You can now login." : data.error || "Verification failed");
    }
    if (token) verify();
    else setStatus("Missing verification token.");
  }, [token]);

  return (
    <div className="auth-card">
      <h1>Email verification</h1>
      <p>{status}</p>
      <Link href="/login"><button className="btn">Go to login</button></Link>
    </div>
  );
}
