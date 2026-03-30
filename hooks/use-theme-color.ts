/**
 * Theme color hook - uses ThemeContext for dynamic theming.
 */
import { useTheme } from "../context/ThemeContext";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: string
) {
  const { isDark, colors } = useTheme();
  const theme = isDark ? "dark" : "light";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }
  return (colors as any)[colorName] || "#000";
}
