import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../../context/ThemeContext";

const ICONS: Record<string, string> = {
  Dashboard: "home-outline",
  Trips: "map-outline",
  Explore: "compass-outline",
  Profile: "person-outline",
};

// Nested stacks reset to this screen when their tab is re-pressed while already focused.
const INITIAL_SCREEN: Record<string, string | undefined> = {
  Trips: "TripsList",
};

export default function TabBar({ state, navigation, descriptors }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const focusedOptions = descriptors[state.routes[state.index].key]?.options;
  if (focusedOptions?.tabBarStyle && (focusedOptions.tabBarStyle as any).display === 'none') {
    return null;
  }

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]} pointerEvents="box-none">
      <View style={[styles.pill, { backgroundColor: isDark ? "#26241D" : "#1A1814" }]}>
        {state.routes.map((route, index) => {
          const icon = ICONS[route.name] ?? "ellipse-outline";
          const focused = state.index === index;

          return (
            <Pressable
              key={route.key}
              onPress={() => {
                const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                if (event.defaultPrevented) return;
                if (focused) {
                  const initial = INITIAL_SCREEN[route.name];
                  if (initial) navigation.navigate(route.name, { screen: initial } as never);
                } else {
                  navigation.navigate(route.name);
                }
              }}
              style={[styles.tab, focused && { backgroundColor: colors.accent }]}
            >
              <Ionicons name={icon} size={18} color={focused ? "#FFF" : "#8A877F"} />
              {focused && <Text style={styles.label}>{route.name}</Text>}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, bottom: 0, alignItems: "center", backgroundColor: "transparent" },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  tab: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  label: { color: "#FFF", fontSize: 12, fontWeight: "600" },
});
