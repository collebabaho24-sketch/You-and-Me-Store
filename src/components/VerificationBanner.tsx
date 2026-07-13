"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function VerificationBanner() {
  const { data: session, status } = useSession();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (status !== "authenticated" || session.user.emailVerified) {
    return null;
  }

  async function handleResend() {
    setSending(true);
    await fetch("/api/resend-verification", { method: "POST" });
    setSending(false);
    setSent(true);
  }

  return (
    <div className="bg-accent-500 text-white text-sm px-4 py-2 flex items-center justify-center gap-3 text-center">
      <span>Please verify your email to unlock creating listings.</span>
      {sent ? (
        <span className="font-medium">Verification email sent!</span>
      ) : (
        <button onClick={handleResend} disabled={sending} className="underline font-medium disabled:opacity-60">
          {sending ? "Sending..." : "Resend email"}
        </button>
      )}
    </div>
  );
}
