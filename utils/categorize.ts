import { getCategoryIcon } from "./categoryIcon";

export function categorize(description: string): { category: string; icon: string } {
  const d = description.toLowerCase();
  let category = "Other";
  if (/lunch|dinner|breakfast|cafe|coffee|food|pizza|meal|snack|restaurant|warung/.test(d)) category = "Food";
  else if (/taxi|uber|bus|train|flight|ferry|fuel|metro|toll|parking|grab/.test(d)) category = "Transport";
  else if (/hotel|hostel|airbnb|motel|resort|room|lodge|stay|villa/.test(d)) category = "Accommodation";
  else if (/ticket|tour|museum|park|show|concert|activity|ride|entry|temple/.test(d)) category = "Activities";
  else if (/shop|mall|clothes|souvenir|store|market|buy|batik/.test(d)) category = "Shopping";
  return { category, icon: getCategoryIcon(category) };
}
