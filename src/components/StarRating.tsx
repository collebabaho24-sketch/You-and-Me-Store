export default function StarRating({
  rating,
  count,
  size = "text-sm",
}: {
  rating: number;
  count: number;
  size?: string;
}) {
  if (count === 0) {
    return <span className={`text-brand-400 ${size}`}>No reviews yet</span>;
  }

  const rounded = Math.round(rating);

  return (
    <span className={`inline-flex items-center gap-1 text-accent-500 ${size}`}>
      <span aria-hidden="true">
        {"★".repeat(rounded)}
        <span className="text-brand-200">{"★".repeat(5 - rounded)}</span>
      </span>
      <span className="text-brand-500">
        {rating.toFixed(1)} ({count})
      </span>
    </span>
  );
}
