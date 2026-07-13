import Link from "next/link";
import StarRating from "./StarRating";
import { conditionLabel } from "@/lib/categories";

type Listing = {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  location: string | null;
  images: string[];
  seller: { name: string; rating?: { average: number; count: number } };
};

export default function ListingCard({ listing }: { listing: Listing }) {
  const thumbnail = listing.images[0];

  return (
    <Link href={`/listings/${listing.id}`} className="card overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video bg-brand-100 flex items-center justify-center overflow-hidden">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnail} alt={listing.title} className="h-full w-full object-cover" />
        ) : (
          <span className="text-brand-300 text-sm">No image</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-accent-600">
            {listing.category}
          </span>
          {listing.condition !== "NOT_APPLICABLE" && (
            <span className="text-xs font-medium text-brand-500">· {conditionLabel(listing.condition)}</span>
          )}
        </div>
        <h3 className="font-semibold text-brand-800 mt-1 truncate">{listing.title}</h3>
        <p className="text-brand-500 text-sm mt-1">
          by {listing.seller.name}
          {listing.location && <> · {listing.location}</>}
        </p>
        {listing.seller.rating && (
          <StarRating rating={listing.seller.rating.average} count={listing.seller.rating.count} size="text-xs" />
        )}
        <p className="text-lg font-bold text-brand-700 mt-2">${listing.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
