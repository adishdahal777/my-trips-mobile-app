const CATEGORY_ICONS: Record<string, string> = {
  Food: "restaurant-outline",
  Transport: "car-outline",
  Accommodation: "bed-outline",
  Activities: "ticket-outline",
  Shopping: "bag-outline",
  Other: "ellipsis-horizontal-outline",
};

export function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] ?? CATEGORY_ICONS.Other;
}
