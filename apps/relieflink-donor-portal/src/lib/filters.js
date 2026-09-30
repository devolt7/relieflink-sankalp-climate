export const DEFAULT_FILTERS = { district: "all", item: "all", urgency: "all", verifiedOnly: false };

export function countActiveFilters(f) {
  return (f.district !== "all") + (f.item !== "all") + (f.urgency !== "all") + (f.verifiedOnly ? 1 : 0);
}
