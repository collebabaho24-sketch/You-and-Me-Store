"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CATEGORIES } from "@/lib/categories";

const MAX_PHOTOS = 6;

export default function NewListingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [images, setImages] = useState<string[]>([]);
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

  if (!session.user.emailVerified) {
    return (
      <div className="card p-6 max-w-md mx-auto text-center">
        <p className="text-brand-700">Please verify your email before creating a listing.</p>
      </div>
    );
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;

    setError("");

    if (images.length + selected.length > MAX_PHOTOS) {
      setError(`You can upload up to ${MAX_PHOTOS} photos per listing.`);
      e.target.value = "";
      return;
    }

    setUploading(true);

    const formData = new FormData();
    selected.forEach((file) => formData.append("files", file));

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    setUploading(false);
    e.target.value = "";

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Photo upload failed.");
      return;
    }

    const data = await res.json();
    setImages((prev) => [...prev, ...data.urls]);
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
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
      body: JSON.stringify({ title, description, price: priceNum, category, images }),
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
            <label htmlFor="photo" className="label">
              Photos (optional, up to {MAX_PHOTOS})
            </label>
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                {images.map((url) => (
                  <div key={url} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt="Listing preview"
                      className="h-20 w-full rounded-lg object-cover border border-brand-100"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-brand-700 text-white text-xs leading-5"
                      aria-label="Remove photo"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {images.length < MAX_PHOTOS && (
              <input
                id="photo"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="input file:mr-3 file:rounded-md file:border-0 file:bg-brand-100 file:px-3 file:py-1.5 file:text-brand-700"
                onChange={handlePhotoChange}
              />
            )}
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
