import Ionicons from "react-native-vector-icons/Ionicons";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, RefreshControl, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

// Native RefreshControl still drives the actual pull gesture (reliable, platform-correct),
// but its own spinner is made invisible so our branded plane animation can take over instead.
export function PlaneRefreshControl({ refreshing, onRefresh }: { refreshing: boolean; onRefresh: () => void }) {
  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor="transparent"
      colors={["transparent"]}
      progressBackgroundColor="transparent"
      style={{ backgroundColor: "transparent" }}
    />
  );
}

// Absolutely positioned overlay (not laid out in normal flow) so it always renders above
// screen content — a sibling in normal flow could end up stacked behind headers/other
// content depending on each screen's layout.
export function PlaneRefreshBanner({ visible }: { visible: boolean }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const fly = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (visible) {
      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(fly, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(fly, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
      loopRef.current.start();
    } else {
      loopRef.current?.stop();
    }

    return () => loopRef.current?.stop();
  }, [visible, opacity, fly]);

  const translateX = fly.interpolate({ inputRange: [0, 1], outputRange: [-10, 10] });
  const rotate = fly.interpolate({ inputRange: [0, 1], outputRange: ["-8deg", "8deg"] });

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.wrap, { top: insets.top + 6, opacity }]}
    >
      <Animated.View style={[styles.pill, { backgroundColor: colors.card, borderColor: colors.border, transform: [{ translateX }, { rotate }] }]}>
        <Ionicons name="airplane" size={20} color={colors.accent} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, alignItems: "center", zIndex: 999, elevation: 20 },
  pill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
});
