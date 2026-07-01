import LinearGradient from "react-native-linear-gradient";
import { router } from "../utils/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GradientButton } from "../components/GradientButton";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    emoji: "🗺️",
    tag: "NAVIGATE",
    title: "Plan Your\nRoute",
    desc: "Map out stops, estimate distances, and orchestrate your entire journey with precision.",
    accent: "#6EE7F7",
  },
  {
    id: "2",
    emoji: "💰",
    tag: "BUDGET",
    title: "Track Every\nExpense",
    desc: "AI-powered categorisation keeps your wallet on track across any currency, anywhere.",
    accent: "#A78BFA",
  },
  {
    id: "3",
    emoji: "📸",
    tag: "MEMORIES",
    title: "Capture Every\nMoment",
    desc: "Geo-tag photos, write travel notes, and relive adventures long after you're home.",
    accent: "#FCD34D",
  },
];

function FloatingOrb({
  size,
  color,
  style,
}: {
  size: number;
  color: string;
  style?: object;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: 0.18,
          transform: [{ translateY }],
        },
        style,
      ]}
    />
  );
}

function SlideCard({ item, index, activeIdx }: { item: typeof slides[0]; index: number; activeIdx: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (activeIdx === index) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 9, useNativeDriver: true }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(30);
      scaleAnim.setValue(0.92);
    }
  }, [activeIdx]);

  return (
    <View style={{ width, paddingHorizontal: 24, alignItems: "center", justifyContent: "center" }}>
      {/* Glass card */}
      <Animated.View
        style={[
          styles.glassCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            borderColor: item.accent + "30",
          },
        ]}
      >
        {/* Top accent line */}
        <View style={[styles.accentLine, { backgroundColor: item.accent }]} />

        {/* Tag */}
        <View style={[styles.tagBadge, { backgroundColor: item.accent + "20", borderColor: item.accent + "50" }]}>
          <Text style={[styles.tagText, { color: item.accent }]}>{item.tag}</Text>
        </View>

        {/* Emoji with glow */}
        <View style={styles.emojiContainer}>
          <View style={[styles.emojiGlow, { backgroundColor: item.accent + "30" }]} />
          <Text style={styles.emoji}>{item.emoji}</Text>
        </View>

        {/* Title */}
        <Text style={styles.slideTitle}>{item.title}</Text>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: item.accent + "40" }]} />

        {/* Description */}
        <Text style={styles.slideDesc}>{item.desc}</Text>
      </Animated.View>
    </View>
  );
}

export default function Onboarding() {
  const [activeIdx, setActiveIdx] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const footerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(headerFade, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(headerSlide, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
      Animated.timing(footerFade, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      {/* Deep layered background */}
      <LinearGradient
        colors={["#040B1A", "#0C1A3A", "#111827"]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      />

      {/* Floating ambient orbs */}
      <FloatingOrb size={280} color="#6366F1" style={{ top: -60, right: -80 }} />
      <FloatingOrb size={200} color="#06B6D4" style={{ top: height * 0.3, left: -70 }} />
      <FloatingOrb size={160} color="#8B5CF6" style={{ bottom: 100, right: -40 }} />

      {/* Subtle grid overlay */}
      <View style={styles.gridOverlay} pointerEvents="none" />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          { opacity: headerFade, transform: [{ translateY: headerSlide }] },
        ]}
      >
        <View style={styles.logoRow}>
          <View style={styles.logoIconWrap}>
            <Text style={{ fontSize: 20 }}>✈️</Text>
          </View>
          <View>
            <Text style={styles.logoText}>MyTrips</Text>
            <Text style={styles.logoSub}>YOUR SMART TRAVEL COMPANION</Text>
          </View>
        </View>
      </Animated.View>

      {/* Slides */}
      <View style={{ flex: 1, justifyContent: "center" }}>
        <FlatList
          ref={flatListRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(i) => i.id}
          onMomentumScrollEnd={(e) =>
            setActiveIdx(Math.round(e.nativeEvent.contentOffset.x / width))
          }
          renderItem={({ item, index }) => (
            <SlideCard item={item} index={index} activeIdx={activeIdx} />
          )}
        />
      </View>

      {/* Dot indicators */}
      <View style={styles.dotsRow}>
        {slides.map((s, i) => (
          <Pressable
            key={i}
            onPress={() => {
              setActiveIdx(i);
              flatListRef.current?.scrollToIndex({ index: i, animated: true });
            }}
          >
            <Animated.View
              style={[
                styles.dot,
                i === activeIdx
                  ? [styles.dotActive, { backgroundColor: slides[activeIdx].accent }]
                  : styles.dotInactive,
              ]}
            />
          </Pressable>
        ))}
      </View>

      {/* Footer CTA */}
      <Animated.View style={[styles.footer, { opacity: footerFade }]}>
        <GradientButton title="Begin Your Journey" onPress={() => router.push("Auth", { screen: "Register" })} />

        <Pressable
          onPress={() => router.push("Auth", { screen: "Login" })}
          style={styles.signInBtn}
        >
          <Text style={styles.signInText}>
            Already a traveller?{"  "}
            <Text style={[styles.signInHighlight, { color: slides[activeIdx].accent }]}>
              Sign In
            </Text>
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#040B1A",
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
    backgroundColor: "transparent",
    // Subtle dot grid feel via repeating — use a PNG texture in production
  },

  // Header
  header: {
    paddingTop: 60,
    paddingHorizontal: 28,
    paddingBottom: 8,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(99,102,241,0.25)",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  logoSub: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 2,
    marginTop: 1,
  },

  // Glass card
  glassCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 28,
    borderWidth: 1,
    padding: 32,
    overflow: "hidden",
    // Shadow
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 20,
  },
  accentLine: {
    position: "absolute",
    top: 0,
    left: 32,
    right: 32,
    height: 2,
    borderRadius: 2,
  },
  tagBadge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 20,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2.5,
  },
  emojiContainer: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  emojiGlow: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    top: -8,
    left: -8,
  },
  emoji: {
    fontSize: 52,
  },
  slideTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 38,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    marginBottom: 16,
    borderRadius: 1,
  },
  slideDesc: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "400",
  },

  // Dots
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 20,
  },
  dot: {
    borderRadius: 10,
    height: 6,
  },
  dotActive: {
    width: 28,
  },
  dotInactive: {
    width: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  // Footer
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 48,
  },
  signInBtn: {
    marginTop: 16,
    alignItems: "center",
  },
  signInText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    fontWeight: "500",
  },
  signInHighlight: {
    fontWeight: "700",
  },
});