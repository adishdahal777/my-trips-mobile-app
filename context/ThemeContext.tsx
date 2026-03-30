import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

// ── Color Tokens ──────────────────────────────────
export const lightColors = {
  // Backgrounds
  background: "#FFFFFF",
  surface: "#F8FAFC",
  surfaceAlt: "#F1F5F9",
  card: "#FFFFFF",

  // Text
  text: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  textInverse: "#FFFFFF",

  // Borders
  border: "#E2E8F0",
  borderLight: "#F1F5F9",

  // Accent
  accent: "#2563EB",
  accentLight: "#EFF6FF",
  accentMuted: "#93C5FD",

  // Semantic
  success: "#10B981",
  successLight: "#ECFDF5",
  warning: "#F59E0B",
  warningLight: "#FFFBEB",
  danger: "#EF4444",
  dangerLight: "#FEF2F2",
  coral: "#F97316",
  coralLight: "#FFF7ED",

  // Category Colors
  categoryFood: "#F59E0B",
  categoryFoodBg: "#FFFBEB",
  categoryTransport: "#3B82F6",
  categoryTransportBg: "#EFF6FF",
  categoryAccommodation: "#10B981",
  categoryAccommodationBg: "#ECFDF5",
  categoryActivities: "#8B5CF6",
  categoryActivitiesBg: "#F5F3FF",
  categoryShopping: "#EC4899",
  categoryShoppingBg: "#FDF2F8",
  categoryOther: "#64748B",
  categoryOtherBg: "#F8FAFC",

  // Navigation
  tabBar: "#FFFFFF",
  tabBarBorder: "#F1F5F9",
  tabActive: "#2563EB",
  tabInactive: "#94A3B8",

  // Misc
  skeleton: "#E2E8F0",
  overlay: "rgba(0,0,0,0.4)",
  shadow: "#000000",
  shadowOpacity: 0.04,
  statusBar: "dark" as "dark" | "light",

  // Input
  inputBg: "#F8FAFC",
  inputBorder: "#E2E8F0",
  inputText: "#0F172A",
  inputPlaceholder: "#94A3B8",

  // Badge
  aiBadgeBg: "#EFF6FF",
  aiBadgeBorder: "#BFDBFE",
  aiBadgeText: "#2563EB",
};

export const darkColors: typeof lightColors = {
  // Backgrounds
  background: "#0F1117",
  surface: "#1A1D27",
  surfaceAlt: "#232732",
  card: "#1A1D27",

  // Text
  text: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  textInverse: "#0F172A",

  // Borders
  border: "#2A2E3A",
  borderLight: "#1E2230",

  // Accent
  accent: "#3B82F6",
  accentLight: "#1E3A5F",
  accentMuted: "#1D4ED8",

  // Semantic
  success: "#34D399",
  successLight: "#064E3B",
  warning: "#FBBF24",
  warningLight: "#78350F",
  danger: "#F87171",
  dangerLight: "#7F1D1D",
  coral: "#FB923C",
  coralLight: "#7C2D12",

  // Category Colors
  categoryFood: "#FBBF24",
  categoryFoodBg: "#422006",
  categoryTransport: "#60A5FA",
  categoryTransportBg: "#1E3A5F",
  categoryAccommodation: "#34D399",
  categoryAccommodationBg: "#064E3B",
  categoryActivities: "#A78BFA",
  categoryActivitiesBg: "#2E1065",
  categoryShopping: "#F472B6",
  categoryShoppingBg: "#831843",
  categoryOther: "#94A3B8",
  categoryOtherBg: "#1E293B",

  // Navigation
  tabBar: "#141720",
  tabBarBorder: "#1E2230",
  tabActive: "#3B82F6",
  tabInactive: "#64748B",

  // Misc
  skeleton: "#2A2E3A",
  overlay: "rgba(0,0,0,0.6)",
  shadow: "#000000",
  shadowOpacity: 0.2,
  statusBar: "light" as const,

  // Input
  inputBg: "#1A1D27",
  inputBorder: "#2A2E3A",
  inputText: "#F1F5F9",
  inputPlaceholder: "#64748B",

  // Badge
  aiBadgeBg: "#1E3A5F",
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
