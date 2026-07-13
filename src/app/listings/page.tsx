"use client";

import { useEffect, useState, useCallback } from "react";
import ListingCard from "@/components/ListingCard";
import { CATEGORIES, CONDITIONS } from "@/lib/categories";

type Listing = {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  location: string | null;
  images: string[];
  seller: { name: string };
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (condition) params.set("condition", condition);
    if (location) params.set("location", location);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort) params.set("sort", sort);

    const res = await fetch(`/api/listings?${params.toString()}`);
    const data = await res.json();
    setListings(data);
    setLoading(false);
  }, [q, category, condition, location, minPrice, maxPrice, sort]);

  useEffect(() => {
    const timeout = setTimeout(fetchListings, 250);
    return () => clearTimeout(timeout);
  }, [fetchListings]);

  const hasFilters = q || category || condition || location || minPrice || maxPrice || sort !== "newest";

  function clearFilters() {
    setQ("");
    setCategory("");
    setCondition("");
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-brand-800">Browse listings</h1>
        <input
          className="input sm:w-72"
          placeholder="Search by keyword..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="card p-4 mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7 items-end">
        <div>
          <label htmlFor="category" className="label">Category</label>
          <select
            id="category"
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="condition" className="label">Condition</label>
          <select
            id="condition"
            className="input"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            <option value="">Any condition</option>
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="location" className="label">Location</label>
          <input
            id="location"
            className="input"
            placeholder="e.g. UK"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="minPrice" className="label">Min price</label>
          <input
            id="minPrice"
            type="number"
            min="0"
            className="input"
            placeholder="$0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="maxPrice" className="label">Max price</label>
          <input
            id="maxPrice"
            type="number"
            min="0"
            className="input"
            placeholder="Any"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="sort" className="label">Sort by</label>
          <select id="sort" className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="btn-outline">
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-brand-500">Loading listings...</p>
      ) : listings.length === 0 ? (
        <p className="text-brand-500">No listings found. Try a different search or filters.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
