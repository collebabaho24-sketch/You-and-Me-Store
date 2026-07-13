"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Missing reset token.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (success) {
    return (
      <div className="card p-6 text-center">
        <h1 className="text-xl font-bold text-brand-800 mb-2">Password updated</h1>
        <p className="text-brand-600">Redirecting you to log in...</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h1 className="text-2xl font-bold text-brand-800 mb-6">Set a new password</h1>

      {!token ? (
        <p className="text-sm text-red-600">
          This reset link is missing its token. Please request a new one from the{" "}
          <Link href="/forgot-password" className="text-brand-700 font-medium hover:underline">
            reset password
          </Link>{" "}
          page.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="label">New password</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="label">Confirm password</label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={6}
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Saving..." : "Reset password"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md">
      <Suspense fallback={<p className="text-brand-500 text-center">Loading...</p>}>
        <ResetPasswordInner />
      </Suspense>
    </div>
  );
}
