import Ionicons from "react-native-vector-icons/Ionicons";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, RefreshControl, StyleSheet } from "react-native";
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

export function PlaneRefreshBanner({ visible }: { visible: boolean }) {
  const { colors } = useTheme();
  const height = useRef(new Animated.Value(0)).current;
  const fly = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    Animated.timing(height, {
      toValue: visible ? 56 : 0,
      duration: 220,
      useNativeDriver: false,
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
  }, [visible, height, fly]);

  const translateX = fly.interpolate({ inputRange: [0, 1], outputRange: [-10, 10] });
  const rotate = fly.interpolate({ inputRange: [0, 1], outputRange: ["-8deg", "8deg"] });

  return (
    <Animated.View style={[styles.wrap, { height, backgroundColor: colors.background }]}>
      <Animated.View style={{ transform: [{ translateX }, { rotate }] }}>
        <Ionicons name="airplane" size={22} color={colors.accent} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
});
