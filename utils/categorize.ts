export function categorize(description: string): { category: string; icon: string } {
  const d = description.toLowerCase();
  if (/lunch|dinner|breakfast|cafe|coffee|food|pizza|meal|snack|restaurant|warung/.test(d))
    return { category: "Food", icon: "🍕" };
  if (/taxi|uber|bus|train|flight|ferry|fuel|metro|toll|parking|grab/.test(d))
    return { category: "Transport", icon: "🚗" };
  if (/hotel|hostel|airbnb|motel|resort|room|lodge|stay|villa/.test(d))
    return { category: "Accommodation", icon: "🏨" };
  if (/ticket|tour|museum|park|show|concert|activity|ride|entry|temple/.test(d))
    return { category: "Activities", icon: "🎭" };
  if (/shop|mall|clothes|souvenir|store|market|buy|batik/.test(d))
    return { category: "Shopping", icon: "🛍️" };
  return { category: "Other", icon: "📦" };
}
