import { useEffect, useRef } from "react";
import { Animated } from "react-native";

export function SkeletonLoader({ width = "100%", height = 20, borderRadius = 8 }: { width?: number | string; height?: number; borderRadius?: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.8, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return <Animated.View style={{ width: width as any, height, borderRadius, backgroundColor: "#334155", opacity }} />;
}
