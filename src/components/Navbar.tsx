"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b border-brand-100 bg-white/80 backdrop-blur sticky top-0 z-10">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-700 text-lg">
          <span className="inline-block h-8 w-8 rounded-full bg-brand-600 text-white text-center leading-8">
            YM
          </span>
          You &amp; Me Store
        </Link>

        <div className="flex items-center gap-3 text-sm">
          <Link href="/listings" className="hover:text-brand-600">
            Browse
          </Link>

          {status === "authenticated" ? (
            <>
              {session.user.role === "SELLER" && (
                <>
                  <Link href="/listings/new" className="hover:text-brand-600">
                    New listing
                  </Link>
                  <Link href="/dashboard" className="hover:text-brand-600">
                    Dashboard
                  </Link>
                </>
              )}
              <Link href="/messages" className="hover:text-brand-600">
                Messages
              </Link>
              <span className="text-brand-400">|</span>
              <span className="text-brand-600">Hi, {session.user.name?.split(" ")[0]}</span>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-outline !py-1">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-outline !py-1">
                Log in
              </Link>
              <Link href="/register" className="btn-primary !py-1">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
