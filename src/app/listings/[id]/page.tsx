"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import StarRating from "@/components/StarRating";

type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  seller: { id: string; name: string };
};

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: { name: string };
  listing: { title: string };
};

type ReviewsData = { average: number; count: number; reviews: Review[] };

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [listing, setListing] = useState<Listing | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const [activeImage, setActiveImage] = useState<string | null>(null);

  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const loadReviews = useCallback(async (sellerId: string) => {
    const res = await fetch(`/api/reviews?sellerId=${sellerId}`);
    if (res.ok) setReviewsData(await res.json());
  }, []);

  useEffect(() => {
    fetch(`/api/listings/${params.id}`).then(async (res) => {
      if (!res.ok) {
        setNotFound(true);
        return;
      }
      const data: Listing = await res.json();
      setListing(data);
      setActiveImage(data.images[0] ?? null);
      loadReviews(data.seller.id);
    });
  }, [params.id, loadReviews]);

  async function handleContact(e: React.FormEvent) {
    e.preventDefault();
    if (!listing) return;
    setError("");
    setSending(true);

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId: listing.id,
        receiverId: listing.seller.id,
        content: message,
      }),
    });

    setSending(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not send message.");
      return;
    }

    setSent(true);
    setMessage("");
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!listing) return;
    setReviewError("");
    setReviewSubmitting(true);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId: listing.id,
        rating: reviewRating,
        comment: reviewComment,
      }),
    });

    setReviewSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setReviewError(data.error ?? "Could not submit review.");
      return;
    }

    setReviewSubmitted(true);
    setReviewComment("");
    loadReviews(listing.seller.id);
  }

  if (notFound) {
    return <p className="text-brand-600">This listing could not be found.</p>;
  }

  if (!listing) {
    return <p className="text-brand-500">Loading...</p>;
  }

  const isOwnListing = session?.user.id === listing.seller.id;
  const alreadyReviewed =
    reviewSubmitted ||
    reviewsData?.reviews.some(
      (r) => r.reviewer.name === session?.user.name && r.listing.title === listing.title
    );

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2 space-y-6">
        <div className="card overflow-hidden">
          <div className="aspect-video bg-brand-100 flex items-center justify-center overflow-hidden">
            {activeImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activeImage} alt={listing.title} className="h-full w-full object-cover" />
            ) : (
              <span className="text-brand-300">No image</span>
            )}
          </div>
          {listing.images.length > 1 && (
            <div className="flex gap-2 p-3 border-b border-brand-100 overflow-x-auto">
              {listing.images.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveImage(url)}
                  className={`h-14 w-14 shrink-0 rounded-md overflow-hidden border-2 ${
                    activeImage === url ? "border-brand-600" : "border-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="p-6">
            <span className="text-xs font-medium uppercase tracking-wide text-accent-600">
              {listing.category}
            </span>
            <h1 className="text-2xl font-bold text-brand-800 mt-1">{listing.title}</h1>
            <p className="text-2xl font-bold text-brand-600 mt-2">${listing.price.toFixed(2)}</p>
            <p className="text-brand-700 mt-4 whitespace-pre-wrap">{listing.description}</p>
            <div className="flex items-center gap-2 mt-4">
              <p className="text-brand-500 text-sm">Listed by {listing.seller.name}</p>
              {reviewsData && <StarRating rating={reviewsData.average} count={reviewsData.count} />}
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-brand-800 mb-4">
            Reviews {reviewsData && reviewsData.count > 0 && `(${reviewsData.count})`}
          </h2>

          {!reviewsData || reviewsData.reviews.length === 0 ? (
            <p className="text-sm text-brand-500">
              No reviews yet for {listing.seller.name}. Be the first to leave one after connecting.
            </p>
          ) : (
            <div className="space-y-4">
              {reviewsData.reviews.map((r) => (
                <div key={r.id} className="border-b border-brand-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-brand-800 text-sm">{r.reviewer.name}</p>
                    <span className="text-xs text-brand-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <StarRating rating={r.rating} count={1} />
                  {r.comment && <p className="text-sm text-brand-600 mt-1">{r.comment}</p>}
                  <p className="text-xs text-brand-400 mt-1">re: {r.listing.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="card p-5">
          <h2 className="font-semibold text-brand-800 mb-3">Contact the seller</h2>

          {isOwnListing ? (
            <p className="text-sm text-brand-500">This is your own listing.</p>
          ) : status === "unauthenticated" ? (
            <p className="text-sm text-brand-500">
              <Link href="/login" className="text-brand-700 font-medium hover:underline">
                Log in
              </Link>{" "}
              to message the seller.
            </p>
          ) : sent ? (
            <div className="text-sm text-brand-700">
              <p>Message sent!</p>
              <button
                className="btn-outline mt-3 !py-1"
                onClick={() => router.push(`/messages/${listing.id}/${listing.seller.id}`)}
              >
                View conversation
              </button>
            </div>
          ) : (
            <form onSubmit={handleContact} className="space-y-3">
              <textarea
                required
                rows={4}
                className="input"
                placeholder={`Hi ${listing.seller.name}, is this still available?`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit" disabled={sending} className="btn-accent w-full">
                {sending ? "Sending..." : "Send message"}
              </button>
            </form>
          )}
        </div>

        {!isOwnListing && status === "authenticated" && (
          <div className="card p-5">
            <h2 className="font-semibold text-brand-800 mb-3">Leave a review</h2>

            {alreadyReviewed ? (
              <p className="text-sm text-brand-500">Thanks — you&apos;ve already reviewed this listing.</p>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div>
                  <label htmlFor="reviewRating" className="label">Rating</label>
                  <select
                    id="reviewRating"
                    className="input"
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {"★".repeat(n)} ({n})
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  rows={3}
                  className="input"
                  placeholder="Share details of your experience (optional)"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
                {reviewError && <p className="text-sm text-red-600">{reviewError}</p>}
                <button type="submit" disabled={reviewSubmitting} className="btn-primary w-full">
                  {reviewSubmitting ? "Submitting..." : "Submit review"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
