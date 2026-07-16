import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

// ── Color Tokens ──────────────────────────────────
// Flat, bordered, editorial style (ported from the Lahar app's design system):
// warm neutral surfaces, hairline borders instead of shadow, muted text hierarchy, tight radii.
export const lightColors = {
  // Backgrounds
  background: "#F6F5F2",
  surface: "#FFFFFF",
  surfaceAlt: "#FAFAF7",
  card: "#FFFFFF",

  // Text
  text: "#1A1814",
  textSecondary: "#4B4944",
  textMuted: "#8A877F",
  textFaint: "#B5B2AA",
  textInverse: "#FFFFFF",

  // Borders
  border: "#E7E4DC",
  borderLight: "#F2F1EC",
  borderStrong: "#D7D2C7",

  // Accent
  accent: "#2563EB",
  accentLight: "rgba(37, 99, 235, 0.08)",
  accentMuted: "#93C5FD",

  // Semantic
  success: "#15803D",
  successLight: "rgba(21, 128, 61, 0.10)",
  warning: "#B45309",
  warningLight: "rgba(180, 83, 9, 0.10)",
  danger: "#B91C1C",
  dangerLight: "rgba(185, 28, 28, 0.10)",
  coral: "#B91C1C",
  coralLight: "rgba(185, 28, 28, 0.10)",

  // Category Colors
  categoryFood: "#B45309",
  categoryFoodBg: "rgba(180, 83, 9, 0.10)",
  categoryTransport: "#1D4ED8",
  categoryTransportBg: "rgba(29, 78, 216, 0.10)",
  categoryAccommodation: "#15803D",
  categoryAccommodationBg: "rgba(21, 128, 61, 0.10)",
  categoryActivities: "#7C3AED",
  categoryActivitiesBg: "rgba(124, 58, 237, 0.10)",
  categoryShopping: "#BE185D",
  categoryShoppingBg: "rgba(190, 24, 93, 0.10)",
  categoryOther: "#8A877F",
  categoryOtherBg: "#F2F1EC",

  // Navigation
  tabBar: "#FFFFFF",
  tabBarBorder: "#E7E4DC",
  tabActive: "#2563EB",
  tabInactive: "#8A877F",

  // Misc
  skeleton: "#F2F1EC",
  overlay: "rgba(0,0,0,0.4)",
  shadow: "#000000",
  shadowOpacity: 0,
  statusBar: "dark" as "dark" | "light",

  // Input
  inputBg: "#FAFAF7",
  inputBorder: "#E7E4DC",
  inputText: "#1A1814",
  inputPlaceholder: "#8A877F",

  // Badge
  aiBadgeBg: "rgba(37, 99, 235, 0.08)",
  aiBadgeBorder: "#93C5FD",
  aiBadgeText: "#2563EB",
};

export const darkColors: typeof lightColors = {
  // Backgrounds
  background: "#15130F",
  surface: "#1E1C17",
  surfaceAlt: "#26241D",
  card: "#1E1C17",

  // Text
  text: "#F2F1EC",
  textSecondary: "#B5B2AA",
  textMuted: "#8A877F",
  textFaint: "#5C594F",
  textInverse: "#15130F",

  // Borders
  border: "#332F26",
  borderLight: "#26241D",
  borderStrong: "#454034",

  // Accent
  accent: "#3B82F6",
  accentLight: "rgba(59, 130, 246, 0.12)",
  accentMuted: "#1D4ED8",

  // Semantic
  success: "#34D399",
  successLight: "rgba(52, 211, 153, 0.12)",
  warning: "#FBBF24",
  warningLight: "rgba(251, 191, 36, 0.12)",
  danger: "#F87171",
  dangerLight: "rgba(248, 113, 113, 0.12)",
  coral: "#F87171",
  coralLight: "rgba(248, 113, 113, 0.12)",

  // Category Colors
  categoryFood: "#FBBF24",
  categoryFoodBg: "rgba(251, 191, 36, 0.12)",
  categoryTransport: "#60A5FA",
  categoryTransportBg: "rgba(96, 165, 250, 0.12)",
  categoryAccommodation: "#34D399",
  categoryAccommodationBg: "rgba(52, 211, 153, 0.12)",
  categoryActivities: "#A78BFA",
  categoryActivitiesBg: "rgba(167, 139, 250, 0.12)",
  categoryShopping: "#F472B6",
  categoryShoppingBg: "rgba(244, 114, 182, 0.12)",
  categoryOther: "#8A877F",
  categoryOtherBg: "#26241D",

  // Navigation
  tabBar: "#1A1814",
  tabBarBorder: "#332F26",
  tabActive: "#3B82F6",
  tabInactive: "#8A877F",

  // Misc
  skeleton: "#26241D",
  overlay: "rgba(0,0,0,0.6)",
  shadow: "#000000",
  shadowOpacity: 0,
  statusBar: "light" as const,

  // Input
  inputBg: "#1E1C17",
  inputBorder: "#332F26",
  inputText: "#F2F1EC",
  inputPlaceholder: "#8A877F",

  // Badge
  aiBadgeBg: "rgba(59, 130, 246, 0.12)",
  aiBadgeBorder: "#1D4ED8",
  aiBadgeText: "#60A5FA",
};

// ── Context ───────────────────────────────────────
export type ThemeColors = typeof lightColors;

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: "light" | "dark" | "system") => void;
  themeMode: "light" | "dark" | "system";
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
  setTheme: () => {},
  themeMode: "light",
});

const STORAGE_KEY = "mytrips_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("light");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored && (stored === "light" || stored === "dark" || stored === "system")) {
          setThemeMode(stored);
        }
      } catch {}
      setLoaded(true);
    })();
  }, []);

  const isDark =
    themeMode === "system"
      ? systemScheme === "dark"
      : themeMode === "dark";

  const colors = isDark ? darkColors : lightColors;

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setThemeMode(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  };

  const setTheme = (mode: "light" | "dark" | "system") => {
    setThemeMode(mode);
    AsyncStorage.setItem(STORAGE_KEY, mode);
  };

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme, setTheme, themeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
