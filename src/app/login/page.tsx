"use client";

import { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/listings");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-brand-800 mb-1">Welcome back</h1>
        <p className="text-brand-500 mb-6 text-sm">Log in to buy, sell, and message.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Signing in..." : "Log in"}
          </button>
        </form>

        <p className="mt-3 text-sm text-right">
          <Link href="/forgot-password" className="text-brand-500 hover:underline">
            Forgot password?
          </Link>
        </p>

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
          </>
        )}

        <p className="mt-4 text-sm text-brand-500">
          No account yet?{" "}
          <Link href="/register" className="text-brand-700 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
