import Ionicons from "react-native-vector-icons/Ionicons";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { checkApiHealth } from "../services/api";

const MIN_SPLASH_MS = 1200;

export function SplashScreen({ onReady }: { onReady: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const fly = useRef(new Animated.Value(0)).current;
  const [status, setStatus] = useState<"checking" | "error">("checking");

  const runCheck = useCallback(async () => {
    setStatus("checking");
    const start = Date.now();
    const healthy = await checkApiHealth();
    const elapsed = Date.now() - start;
    if (elapsed < MIN_SPLASH_MS) {
      await new Promise<void>((r) => setTimeout(r, MIN_SPLASH_MS - elapsed));
    }
    if (healthy) onReady();
    else setStatus("error");
  }, [onReady]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(fly, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(fly, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    runCheck();
  }, [opacity, scale, fly, runCheck]);

  const flyTranslateX = fly.interpolate({ inputRange: [0, 1], outputRange: [-5, 5] });
  const flyTranslateY = fly.interpolate({ inputRange: [0, 1], outputRange: [3, -3] });
  const flyRotate = fly.interpolate({ inputRange: [0, 1], outputRange: ["-6deg", "6deg"] });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.brand, { opacity, transform: [{ scale }] }]}>
        <View style={styles.logoBadge}>
          <Animated.View
            style={{
              transform: [
                { translateX: flyTranslateX },
                { translateY: flyTranslateY },
                { rotate: flyRotate },
              ],
            }}
          >
            <Ionicons name="airplane" size={28} color="#FFF" />
          </Animated.View>
        </View>
        <Text style={styles.title}>My Trips</Text>
        <Text style={styles.subtitle}>Explore the world, one trip at a time</Text>
      </Animated.View>

      {status === "checking" && <ActivityIndicator color="#FFF" style={styles.spinner} />}

      {status === "error" && (
        <View style={styles.errorBox}>
          <Ionicons name="cloud-offline-outline" size={28} color="#FFF" />
          <Text style={styles.errorTitle}>API is not live</Text>
          <Text style={styles.errorSub}>Can't reach the My Trips server. Check your connection and try again.</Text>
          <Pressable style={styles.retryBtn} onPress={runCheck}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  brand: { alignItems: "center" },
  logoBadge: { width: 64, height: 64, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  title: { color: "#FFF", fontSize: 26, fontWeight: "700" },
  subtitle: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 6 },
  spinner: { marginTop: 32 },
  errorBox: { alignItems: "center", marginTop: 40 },
  errorTitle: { color: "#FFF", fontSize: 16, fontWeight: "700", marginTop: 12, marginBottom: 4 },
  errorSub: { color: "rgba(255,255,255,0.7)", fontSize: 12, textAlign: "center", marginBottom: 20, lineHeight: 18 },
  retryBtn: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 },
  retryText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
});
