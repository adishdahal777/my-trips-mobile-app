import Ionicons from "react-native-vector-icons/Ionicons";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

interface ToastData {
  title: string;
  body: string;
  onPress?: () => void;
}

// Module-level so the push listener (registered outside the React tree, in
// utils/push.ts) can trigger a visible in-app banner when a message arrives
// while the app is foregrounded — independent of whether the native OS banner
// is configured to show.
let showToastImpl: ((data: ToastData) => void) | null = null;

export function showForegroundToast(data: ToastData) {
  showToastImpl?.(data);
}

export function ForegroundNotificationToast() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastData | null>(null);
  const translateY = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    showToastImpl = (data: ToastData) => {
      setToast(data);
      Animated.sequence([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8 }),
        Animated.delay(3500),
        Animated.timing(translateY, { toValue: -120, duration: 250, useNativeDriver: true }),
      ]).start(() => setToast(null));
    };
    return () => {
      showToastImpl = null;
    };
  }, [translateY]);

  if (!toast) return null;

  return (
    <Animated.View
      style={[
        styles.wrap,
        { top: insets.top + 8, transform: [{ translateY }] },
      ]}
    >
      <Pressable
        onPress={() => {
          toast.onPress?.();
          setToast(null);
        }}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Ionicons name="notifications" size={18} color={colors.accent} style={{ marginRight: 10 }} />
        <Text style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>{toast.title}</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>{"\n" + toast.body}</Text>
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 12, right: 12, zIndex: 999, elevation: 20 },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  title: { fontSize: 13, fontWeight: "700" },
  body: { fontSize: 12 },
});
