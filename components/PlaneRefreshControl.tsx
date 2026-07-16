import Ionicons from "react-native-vector-icons/Ionicons";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, RefreshControl, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

// Native RefreshControl still drives the actual pull gesture (reliable, platform-correct),
// but its own spinner is made invisible so the global plane overlay can take over instead.
export function PlaneRefreshControl({ refreshing, onRefresh }: { refreshing: boolean; onRefresh: () => void }) {
  useEffect(() => {
    if (refreshing) showPlaneOverlay();
    else hidePlaneOverlay();
  }, [refreshing]);

  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor="transparent"
      colors={["transparent"]}
      progressBackgroundColor="transparent"
      progressViewOffset={-1000}
      style={{ backgroundColor: "transparent" }}
    />
  );
}

// Deprecated no-op kept so any remaining call sites don't crash — the overlay is now
// global (see PlaneRefreshOverlay) and driven automatically by PlaneRefreshControl above.
export function PlaneRefreshBanner(_props: { visible: boolean }) {
  return null;
}

let showPlaneOverlay: () => void = () => {};
let hidePlaneOverlay: () => void = () => {};

// Mounted once at the true app root (see App.tsx) so it always renders above every
// screen's own header/content stacking — a per-screen banner kept ending up buried
// under other content depending on each screen's own layout.
export function PlaneRefreshOverlay() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const fly = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    showPlaneOverlay = () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setVisible(true);
    };
    hidePlaneOverlay = () => {
      // Guarantee a minimum visible duration so a fast refresh doesn't just flash.
      hideTimer.current = setTimeout(() => setVisible(false), 350);
    };
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  useEffect(() => {
    Animated.timing(opacity, { toValue: visible ? 1 : 0, duration: 200, useNativeDriver: true }).start();

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
    <Animated.View pointerEvents="none" style={[styles.wrap, { top: insets.top + 10, opacity }]}>
      <Animated.View style={[styles.pill, { backgroundColor: colors.card, borderColor: colors.border, transform: [{ translateX }, { rotate }] }]}>
        <Ionicons name="airplane" size={20} color={colors.accent} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, alignItems: "center", zIndex: 9999, elevation: 999 },
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
