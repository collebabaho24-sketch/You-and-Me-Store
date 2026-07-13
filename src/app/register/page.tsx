"use client";

import { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"BUYER" | "SELLER">("BUYER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    getProviders().then((providers) => {
      setGoogleEnabled(Boolean(providers?.google));
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (signInRes?.error) {
      router.push("/login");
      return;
    }

    router.push(role === "SELLER" ? "/dashboard" : "/listings");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-brand-800 mb-1">Create your account</h1>
        <p className="text-brand-500 mb-6 text-sm">
          Join as a buyer to shop, or a seller to list what you offer.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">I want to</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("BUYER")}
                className={`rounded-lg border px-4 py-3 text-sm font-medium ${
                  role === "BUYER"
                    ? "border-brand-600 bg-brand-100 text-brand-800"
                    : "border-brand-200 text-brand-500"
                }`}
              >
                Buy items
              </button>
              <button
                type="button"
                onClick={() => setRole("SELLER")}
                className={`rounded-lg border px-4 py-3 text-sm font-medium ${
                  role === "SELLER"
                    ? "border-brand-600 bg-brand-100 text-brand-800"
                    : "border-brand-200 text-brand-500"
                }`}
              >
                Sell items
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="name" className="label">Full name</label>
            <input
              id="name"
              required
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
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

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        {googleEnabled && (
          <>
            <div className="my-4 flex items-center gap-3 text-xs text-brand-400">
              <div className="h-px flex-1 bg-brand-100" />
              or
              <div className="h-px flex-1 bg-brand-100" />
            </div>
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/listings" })}
              className="btn-outline w-full"
            >
              Continue with Google
            </button>
            <p className="mt-2 text-xs text-brand-400 text-center">
              Google sign-up starts you off as a buyer.
            </p>
          </>
        )}

        <p className="mt-4 text-sm text-brand-500">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-700 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
