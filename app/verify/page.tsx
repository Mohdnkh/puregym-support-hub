import { Suspense } from "react";
import VerifyClient from "./VerifyClient";

export default function VerifyPage() {
  return (
    <main className="auth-page">
      <Suspense fallback={<div className="auth-card">Verifying...</div>}>
        <VerifyClient />
      </Suspense>
    </main>
  );
}
