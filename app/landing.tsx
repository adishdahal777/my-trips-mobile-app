import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef } from "react";
import { Animated, Dimensions, Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { MOCK_PUBLIC_TRIPS, MOCK_DESTINATIONS } from "../data/mockData";

const { width: SW } = Dimensions.get("window");

export default function Landing() {
  const { colors } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;

  const topTrips = [...MOCK_PUBLIC_TRIPS].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 4);
  const topDests = MOCK_DESTINATIONS.slice(0, 4);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        {/* Hero Section */}
        <ImageBackground
          source={{ uri: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200" }}
          style={styles.hero}
        >
          <View style={styles.heroOverlay} />
          <SafeAreaView edges={["top"]} style={styles.heroContent}>
            <View style={styles.logoRow}>
              <View style={styles.logoBadge}>
                <Ionicons name="airplane" size={18} color="#FFF" />
              </View>
              <Text style={styles.logoText}>My Trips</Text>
            </View>

            <View style={styles.heroCenter}>
              <Text style={styles.heroTagline}>Explore the world,</Text>
              <Text style={styles.heroTitle}>One trip at a time</Text>
              <Text style={styles.heroSub}>
                Plan routes, track expenses, capture memories — and share your adventures with fellow travelers.
              </Text>
            </View>

            <View style={styles.heroCTAs}>
              <Pressable
                onPress={() => router.push("/(auth)/register")}
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryBtnText}>Start Your Journey</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFF" />
              </Pressable>
              <Pressable
                onPress={() => router.push("/(auth)/login")}
                style={[styles.secondaryBtn, { borderColor: "rgba(255,255,255,0.3)" }]}
              >
                <Text style={styles.secondaryBtnText}>Sign In</Text>
              </Pressable>
            </View>

            {/* Social proof */}
            <View style={styles.socialProof}>
              <View style={styles.avatarStack}>
                {MOCK_PUBLIC_TRIPS.slice(0, 4).map((t, i) => (
                  <Image
                    key={t.id}
                    source={{ uri: t.user?.avatar }}
                    style={[styles.stackAvatar, { left: i * 20, zIndex: 10 - i }]}
                  />
                ))}
              </View>
              <Text style={styles.socialText}>Join 2,400+ travelers sharing their stories</Text>
            </View>
          </SafeAreaView>
        </ImageBackground>

        {/* Stats Bar */}
        <View style={[styles.statsBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { val: "2.4K", label: "Travelers", icon: "people" as const },
            { val: "8.5K", label: "Trips", icon: "map" as const },
            { val: "142", label: "Countries", icon: "globe" as const },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Ionicons name={s.icon} size={16} color={colors.accent} />
              <Text style={[styles.statVal, { color: colors.text }]}>{s.val}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Popular Trips */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTag, { color: colors.textMuted }]}>Trending</Text>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Trips</Text>
            </View>
            <View style={[styles.seeAllBtn, { backgroundColor: colors.accentLight }]}>
              <Text style={[styles.seeAllText, { color: colors.accent }]}>See all</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {topTrips.map((trip) => (
              <View key={trip.id} style={[styles.tripCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Image source={{ uri: trip.coverPhoto }} style={styles.tripImage} />
                <View style={styles.tripCardOverlay} />
                <View style={styles.tripCardContent}>
                  <View style={styles.tripUserRow}>
                    <Image source={{ uri: trip.user?.avatar }} style={styles.tripUserAvatar} />
                    <Text style={styles.tripUserName}>{trip.user?.name}</Text>
                  </View>
                  <Text style={styles.tripCardName}>{trip.name}</Text>
                  <Text style={styles.tripCardDest}>{trip.flag} {trip.destination}</Text>
                  <View style={styles.tripCardStats}>
                    <View style={styles.tripCardStat}>
                      <Ionicons name="heart" size={10} color="#EF4444" />
                      <Text style={styles.tripCardStatText}>{trip.likes}</Text>
                    </View>
                    <View style={styles.tripCardStat}>
                      <Ionicons name="location" size={10} color="#FFF" />
                      <Text style={styles.tripCardStatText}>{trip.route.length} stops</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Featured Destinations */}
        <View style={[styles.section, { paddingHorizontal: 20 }]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTag, { color: colors.textMuted }]}>Discover</Text>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Destinations</Text>
            </View>
          </View>
          <View style={styles.destGrid}>
            {topDests.map((d) => (
              <View key={d.id} style={[styles.destCard, { borderColor: colors.border }]}>
                <Image source={{ uri: d.photo }} style={styles.destImage} />
                <View style={styles.destOverlay} />
                <View style={styles.destContent}>
                  <Text style={styles.destCity}>{d.city}</Text>
                  <Text style={styles.destCountry}>{d.flag} {d.country}</Text>
                  <View style={styles.destCostChip}>
                    <Text style={styles.destCostText}>{d.estimatedCost}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Features Showcase */}
        <View style={[styles.section, { paddingHorizontal: 20, marginBottom: 8 }]}>
          <Text style={[styles.sectionTag, { color: colors.textMuted, marginBottom: 4 }]}>Why My Trips?</Text>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>Everything you need</Text>
          {[
            { icon: "map-outline" as const, title: "Route Planning", desc: "Plot stops on a map and visualize your entire journey", color: "#3B82F6" },
            { icon: "wallet-outline" as const, title: "Expense Tracking", desc: "AI-powered categorization keeps your budget in check", color: "#10B981" },
            { icon: "camera-outline" as const, title: "Photo Memories", desc: "Capture and organize photos by location and date", color: "#F59E0B" },
            { icon: "globe-outline" as const, title: "Social Feed", desc: "Share public trips and discover inspiring travel stories", color: "#8B5CF6" },
          ].map((f, i) => (
            <View key={i} style={[styles.featureRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.featureIcon, { backgroundColor: f.color + "15" }]}>
                <Ionicons name={f.icon} size={22} color={f.color} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>{f.title}</Text>
                <Text style={[styles.featureDesc, { color: colors.textMuted }]}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Bottom CTA */}
        <View style={[styles.bottomCTA, { backgroundColor: colors.accent }]}>
          <Text style={styles.ctaTitle}>Ready to explore?</Text>
          <Text style={styles.ctaSub}>Browse public trips from travelers around the world</Text>
          <Pressable onPress={() => router.push("/public-feed")} style={styles.ctaBtn}>
            <Text style={[styles.ctaBtnText, { color: colors.accent }]}>Browse Trips</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.accent} />
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Hero
  hero: { height: 520, justifyContent: "flex-end" },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  heroContent: { flex: 1, justifyContent: "space-between", padding: 24, paddingBottom: 30 },
  logoRow: { flexDirection: "row", alignItems: "center" },
  logoBadge: { width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginRight: 8 },
  logoText: { color: "#FFF", fontSize: 18, fontFamily: "Inter-Bold" },
  heroCenter: { marginBottom: 10 },
  heroTagline: { color: "rgba(255,255,255,0.7)", fontSize: 16, fontFamily: "Inter-Medium", marginBottom: 4 },
  heroTitle: { color: "#FFF", fontSize: 36, fontFamily: "Inter-Bold", lineHeight: 42, marginBottom: 10 },
  heroSub: { color: "rgba(255,255,255,0.7)", fontSize: 14, fontFamily: "Inter-Medium", lineHeight: 22 },
  heroCTAs: { flexDirection: "row", gap: 10, marginBottom: 20 },
  primaryBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#FF6B6B", paddingVertical: 16, borderRadius: 16, gap: 6 },
  primaryBtnText: { color: "#FFF", fontSize: 15, fontFamily: "Inter-Bold" },
  secondaryBtn: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 16, borderWidth: 1 },
  secondaryBtnText: { color: "#FFF", fontSize: 15, fontFamily: "Inter-Bold" },
  socialProof: { flexDirection: "row", alignItems: "center" },
  avatarStack: { flexDirection: "row", marginRight: 10, width: 90, height: 28 },
  stackAvatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: "rgba(0,0,0,0.3)", position: "absolute" },
  socialText: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontFamily: "Inter-Medium", flex: 1 },

  // Stats
  statsBar: { flexDirection: "row", marginHorizontal: 20, marginTop: -20, borderRadius: 16, borderWidth: 1, paddingVertical: 16 },
  statItem: { flex: 1, alignItems: "center" },
  statVal: { fontSize: 18, fontFamily: "Inter-Bold", marginTop: 4 },
  statLabel: { fontSize: 10, fontFamily: "Inter-Medium" },

  // Sections
  section: { marginTop: 28 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 20, marginBottom: 14 },
  sectionTag: { fontSize: 10, fontFamily: "Inter-Bold", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 2 },
  sectionTitle: { fontSize: 20, fontFamily: "Inter-Bold" },
  seeAllBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  seeAllText: { fontSize: 11, fontFamily: "Inter-Bold" },
  horizontalScroll: { paddingHorizontal: 20 },

  // Trip Cards
  tripCard: { width: 240, height: 300, borderRadius: 20, overflow: "hidden", marginRight: 14, borderWidth: 1 },
  tripImage: { width: "100%", height: "100%" },
  tripCardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.3)" },
  tripCardContent: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16 },
  tripUserRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  tripUserAvatar: { width: 20, height: 20, borderRadius: 10, marginRight: 6, borderWidth: 1.5, borderColor: "#FFF" },
  tripUserName: { color: "rgba(255,255,255,0.8)", fontSize: 10, fontFamily: "Inter-Bold" },
  tripCardName: { color: "#FFF", fontSize: 18, fontFamily: "Inter-Bold", marginBottom: 2 },
  tripCardDest: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "Inter-Medium", marginBottom: 8 },
  tripCardStats: { flexDirection: "row", gap: 12 },
  tripCardStat: { flexDirection: "row", alignItems: "center", gap: 4 },
  tripCardStatText: { color: "rgba(255,255,255,0.8)", fontSize: 10, fontFamily: "Inter-Bold" },

  // Destinations
  destGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  destCard: { width: "48%", height: 160, borderRadius: 16, overflow: "hidden", marginBottom: 10, borderWidth: 1 },
  destImage: { width: "100%", height: "100%" },
  destOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.25)" },
  destContent: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 12 },
  destCity: { color: "#FFF", fontSize: 16, fontFamily: "Inter-Bold" },
  destCountry: { color: "rgba(255,255,255,0.7)", fontSize: 10, fontFamily: "Inter-Medium", marginBottom: 6 },
  destCostChip: { backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  destCostText: { color: "#FFF", fontSize: 10, fontFamily: "Inter-Bold" },

  // Features
  featureRow: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  featureIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 14 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 14, fontFamily: "Inter-Bold", marginBottom: 2 },
  featureDesc: { fontSize: 11, fontFamily: "Inter-Medium", lineHeight: 16 },

  // Bottom CTA
  bottomCTA: { marginHorizontal: 20, padding: 24, borderRadius: 24, alignItems: "center", marginTop: 20 },
  ctaTitle: { color: "#FFF", fontSize: 22, fontFamily: "Inter-Bold", marginBottom: 6 },
  ctaSub: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter-Medium", textAlign: "center", marginBottom: 16, lineHeight: 18 },
  ctaBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16, gap: 6 },
  ctaBtnText: { fontSize: 14, fontFamily: "Inter-Bold" },
});
