export const CATEGORIES = [
  "Electronics",
  "Home & Garden",
  "Fashion",
  "Vehicles",
  "Services",
  "Videography Services",
  "Photography Services",
  "Hobbies",
  "Books & Media",
  "Other",
] as const;

export const CONDITIONS = [
  { value: "NEW", label: "New" },
  { value: "USED", label: "Used" },
  { value: "NOT_APPLICABLE", label: "Not applicable" },
] as const;

export function conditionLabel(value: string): string {
  return CONDITIONS.find((c) => c.value === value)?.label ?? value;
}
