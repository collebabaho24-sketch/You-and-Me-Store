"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CATEGORIES } from "@/lib/categories";

export default function NewListingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (status === "loading") {
    return <p className="text-brand-500">Loading...</p>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="card p-6 max-w-md mx-auto text-center">
        <p className="text-brand-700">Please log in as a seller to create a listing.</p>
      </div>
    );
  }

  if (session?.user.role !== "SELLER") {
    return (
      <div className="card p-6 max-w-md mx-auto text-center">
        <p className="text-brand-700">Only seller accounts can create listings.</p>
      </div>
    );
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    setUploading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Photo upload failed.");
      return;
    }

    const data = await res.json();
    setImageUrl(data.url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const priceNum = parseFloat(price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setError("Please enter a valid price.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, price: priceNum, category, imageUrl }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }

    const listing = await res.json();
    router.push(`/listings/${listing.id}`);
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-brand-800 mb-6">Create a listing</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="label">Title</label>
            <input
              id="title"
              required
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="description" className="label">Description</label>
            <textarea
              id="description"
              required
              rows={5}
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="label">Price ($)</label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                required
                className="input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="category" className="label">Category</label>
              <select
                id="category"
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="photo" className="label">Photo (optional)</label>
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="Listing preview"
                className="mb-2 h-32 w-full rounded-lg object-cover border border-brand-100"
              />
            )}
            <input
              id="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="input file:mr-3 file:rounded-md file:border-0 file:bg-brand-100 file:px-3 file:py-1.5 file:text-brand-700"
              onChange={handlePhotoChange}
            />
            {uploading && <p className="text-xs text-brand-500 mt-1">Uploading...</p>}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading || uploading} className="btn-primary w-full">
            {loading ? "Publishing..." : "Publish listing"}
          </button>
        </form>
      </div>
    </div>
  );
}
