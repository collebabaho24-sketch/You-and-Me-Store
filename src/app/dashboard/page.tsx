"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Listing = {
  id: string;
  title: string;
  price: number;
  category: string;
  status: string;
  createdAt: string;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated" || session.user.role !== "SELLER") return;
    fetch("/api/listings?mine=true")
      .then((res) => res.json())
      .then((data) => {
        setListings(data);
        setLoading(false);
      });
  }, [status, session]);

  async function handleDelete(id: string) {
    if (!confirm("Remove this listing?")) return;
    await fetch(`/api/listings/${id}`, { method: "DELETE" });
    setListings((prev) => prev.filter((l) => l.id !== id));
  }

  if (status === "unauthenticated") {
    return <p className="text-brand-600">Please log in to view your dashboard.</p>;
  }

  if (status === "loading") {
    return <p className="text-brand-500">Loading...</p>;
  }

  if (session?.user.role !== "SELLER") {
    return <p className="text-brand-600">This dashboard is for seller accounts only.</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-800">Your listings</h1>
        <Link href="/listings/new" className="btn-primary">
          + New listing
        </Link>
      </div>

      {loading ? (
        <p className="text-brand-500">Loading...</p>
      ) : listings.length === 0 ? (
        <p className="text-brand-500">You haven&apos;t posted any listings yet.</p>
      ) : (
        <div className="card divide-y divide-brand-100">
          {listings.map((l) => (
            <div key={l.id} className="p-4 flex items-center justify-between">
              <div>
                <Link href={`/listings/${l.id}`} className="font-semibold text-brand-800 hover:underline">
                  {l.title}
                </Link>
                <p className="text-sm text-brand-500">
                  {l.category} · ${l.price.toFixed(2)} ·{" "}
                  {new Date(l.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => handleDelete(l.id)} className="btn-outline !py-1 text-red-600 border-red-200">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
