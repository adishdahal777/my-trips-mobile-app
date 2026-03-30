import { Platform } from "react-native";

// Re-export the color tokens from ThemeContext as the canonical source
export { darkColors, lightColors } from "../context/ThemeContext";

// Category color mapping (used by ExpenseFeedItem, ExpenseItem, etc.)
export const CATEGORY_STYLES: Record<string, { bgKey: string; textKey: string; icon: string }> = {
  Food: { bgKey: "categoryFoodBg", textKey: "categoryFood", icon: "🍕" },
  Transport: { bgKey: "categoryTransportBg", textKey: "categoryTransport", icon: "🚗" },
  Accommodation: { bgKey: "categoryAccommodationBg", textKey: "categoryAccommodation", icon: "🏨" },
  Activities: { bgKey: "categoryActivitiesBg", textKey: "categoryActivities", icon: "🎭" },
  Shopping: { bgKey: "categoryShoppingBg", textKey: "categoryShopping", icon: "🛍️" },
  Other: { bgKey: "categoryOtherBg", textKey: "categoryOther", icon: "📦" },
};

// Status colors
export const STATUS_COLORS = {
  upcoming: { bg: "#EFF6FF", text: "#2563EB", label: "Upcoming" },
  ongoing: { bg: "#ECFDF5", text: "#059669", label: "Ongoing" },
  completed: { bg: "#F8FAFC", text: "#64748B", label: "Completed" },
};

export const STATUS_COLORS_DARK = {
  upcoming: { bg: "#1E3A5F", text: "#60A5FA", label: "Upcoming" },
  ongoing: { bg: "#064E3B", text: "#34D399", label: "Ongoing" },
  completed: { bg: "#1E293B", text: "#94A3B8", label: "Completed" },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
