"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");
  const requestedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Missing verification token.");
      return;
    }

    // Guard against double-invocation (React Strict Mode, re-renders) —
    // the token is single-use, so a second call would otherwise 500.
    if (requestedRef.current) return;
    requestedRef.current = true;

    fetch("/api/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Verification failed.");
        }
        setStatus("success");
      })
      .catch((e) => {
        setStatus("error");
        setError(e.message);
      });
  }, [token]);

  return (
    <div className="card p-6 text-center">
      {status === "loading" && <p className="text-brand-500">Verifying your email...</p>}
      {status === "success" && (
        <>
          <h1 className="text-xl font-bold text-brand-800 mb-2">Email verified</h1>
          <p className="text-brand-600 mb-4">You can now create listings on You &amp; Me Store.</p>
          <Link href="/listings" className="btn-primary">
            Browse listings
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <h1 className="text-xl font-bold text-brand-800 mb-2">Verification failed</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/login" className="btn-outline">
            Back to login
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="mx-auto max-w-md">
      <Suspense fallback={<p className="text-brand-500 text-center">Loading...</p>}>
        <VerifyEmailInner />
      </Suspense>
    </div>
  );
}
