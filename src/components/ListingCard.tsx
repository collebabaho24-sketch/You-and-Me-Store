import Link from "next/link";
import StarRating from "./StarRating";

type Listing = {
  id: string;
  title: string;
  price: number;
  category: string;
  imageUrl: string | null;
  seller: { name: string; rating?: { average: number; count: number } };
};

export default function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link href={`/listings/${listing.id}`} className="card overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video bg-brand-100 flex items-center justify-center overflow-hidden">
        {listing.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.imageUrl} alt={listing.title} className="h-full w-full object-cover" />
        ) : (
          <span className="text-brand-300 text-sm">No image</span>
        )}
      </div>
      <div className="p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-accent-600">
          {listing.category}
        </span>
        <h3 className="font-semibold text-brand-800 mt-1 truncate">{listing.title}</h3>
        <p className="text-brand-500 text-sm mt-1">by {listing.seller.name}</p>
        {listing.seller.rating && (
          <StarRating rating={listing.seller.rating.average} count={listing.seller.rating.count} size="text-xs" />
        )}
        <p className="text-lg font-bold text-brand-700 mt-2">${listing.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
