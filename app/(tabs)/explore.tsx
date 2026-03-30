import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FeedTripCard } from "../../components/FeedTripCard";
import { useTheme } from "../../context/ThemeContext";
import { useTrips } from "../../context/TripContext";
import { MOCK_PUBLIC_TRIPS } from "../../data/mockData";

const FEED_FILTERS = ["All", "Ongoing", "Completed", "Popular"];

export default function Explore() {
  const { colors } = useTheme();
  const { trips: myTrips } = useTrips();
  const [filter, setFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  // Merge my public trips + other public trips
  const allPublicTrips = useMemo(() => {
    const myPublic = myTrips.filter((t) => t.visibility === "public");
    const merged = [...myPublic, ...MOCK_PUBLIC_TRIPS];
    return merged.sort((a, b) => new Date(b.createdAt || b.startDate).getTime() - new Date(a.createdAt || a.startDate).getTime());
  }, [myTrips]);

  const filteredTrips = useMemo(() => {
    switch (filter) {
      case "Ongoing": return allPublicTrips.filter((t) => t.status === "ongoing");
      case "Completed": return allPublicTrips.filter((t) => t.status === "completed");
      case "Popular": return [...allPublicTrips].sort((a, b) => (b.likes || 0) - (a.likes || 0));
      default: return allPublicTrips;
    }
  }, [allPublicTrips, filter]);

  const featuredTrip = useMemo(() => {
    return [...allPublicTrips].sort((a, b) => (b.likes || 0) - (a.likes || 0))[0];
  }, [allPublicTrips]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTag, { color: colors.textMuted }]}>Community</Text>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Travel Feed</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable style={[styles.headerIcon, { backgroundColor: colors.surface }]}>
              <Ionicons name="search" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* Featured Hero */}
        {featuredTrip && (
          <View style={styles.featuredSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>🔥 Featured Trip</Text>
            <View style={[styles.featuredCard, { borderColor: colors.border }]}>
              <Image source={{ uri: featuredTrip.coverPhoto }} style={styles.featuredImage} />
              <View style={styles.featuredGradient} />
              <View style={styles.featuredContent}>
                <View style={styles.featuredUserRow}>
                  <Image source={{ uri: featuredTrip.user?.avatar }} style={styles.featuredAvatar} />
                  <Text style={styles.featuredUserName}>{featuredTrip.user?.name}</Text>
                </View>
                <Text style={styles.featuredName}>{featuredTrip.name}</Text>
                <Text style={styles.featuredDest}>{featuredTrip.flag} {featuredTrip.destination}</Text>
                <View style={styles.featuredStats}>
                  <View style={styles.featuredStat}>
                    <Ionicons name="heart" size={12} color="#EF4444" />
                    <Text style={styles.featuredStatText}>{featuredTrip.likes}</Text>
                  </View>
                  <View style={styles.featuredStat}>
                    <Ionicons name="location" size={12} color="#FFF" />
                    <Text style={styles.featuredStatText}>{featuredTrip.route.length} stops</Text>
                  </View>
                  <View style={styles.featuredStat}>
                    <Ionicons name="images" size={12} color="#FFF" />
                    <Text style={styles.featuredStatText}>{featuredTrip.photos.length} photos</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Traveler Highlights - Avatars */}
        <View style={styles.travelersRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.travelersScroll}>
            {allPublicTrips
              .filter((t, i, arr) => arr.findIndex((x) => x.user?.id === t.user?.id) === i)
              .slice(0, 8)
              .map((t) => (
                <View key={t.user?.id || t.id} style={styles.travelerItem}>
                  <View style={[styles.travelerRing, { borderColor: t.status === "ongoing" ? colors.success : colors.border }]}>
                    <Image source={{ uri: t.user?.avatar }} style={styles.travelerAvatar} />
                  </View>
                  <Text style={[styles.travelerName, { color: colors.textSecondary }]} numberOfLines={1}>
                    {t.user?.name?.split(" ")[0]}
                  </Text>
                </View>
              ))}
          </ScrollView>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {FEED_FILTERS.map((f) => (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: filter === f ? colors.accent : colors.surface,
                    borderColor: filter === f ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text style={[styles.filterText, { color: filter === f ? "#FFF" : colors.textSecondary }]}>{f}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Feed */}
        <View style={styles.feed}>
          {filteredTrips.map((trip) => (
            <FeedTripCard key={trip.id} trip={trip} isGuest={false} />
          ))}
          {filteredTrips.length === 0 && (
            <View style={styles.emptyFeed}>
              <Ionicons name="compass-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No trips found</Text>
              <Text style={[styles.emptySub, { color: colors.textMuted }]}>Try a different filter</Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 12, marginBottom: 16 },
  headerTag: { fontSize: 11, fontFamily: "Inter-Bold", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 2 },
  headerTitle: { fontSize: 28, fontFamily: "Inter-Bold" },
  headerRight: { flexDirection: "row", gap: 8 },
  headerIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter-Bold", paddingHorizontal: 20, marginBottom: 12 },

  // Featured
  featuredSection: { marginBottom: 20 },
  featuredCard: { marginHorizontal: 20, borderRadius: 20, overflow: "hidden", height: 220, borderWidth: 1 },
  featuredImage: { width: "100%", height: "100%" },
  featuredGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  featuredContent: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16 },
  featuredUserRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  featuredAvatar: { width: 22, height: 22, borderRadius: 11, marginRight: 6, borderWidth: 1.5, borderColor: "#FFF" },
  featuredUserName: { color: "rgba(255,255,255,0.9)", fontSize: 11, fontFamily: "Inter-Bold" },
  featuredName: { color: "#FFF", fontSize: 22, fontFamily: "Inter-Bold", marginBottom: 2 },
  featuredDest: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "Inter-Medium", marginBottom: 8 },
  featuredStats: { flexDirection: "row", gap: 12 },
  featuredStat: { flexDirection: "row", alignItems: "center", gap: 4 },
  featuredStatText: { color: "rgba(255,255,255,0.9)", fontSize: 11, fontFamily: "Inter-Bold" },

  // Travelers Row
  travelersRow: { marginBottom: 16 },
  travelersScroll: { paddingHorizontal: 20 },
  travelerItem: { alignItems: "center", marginRight: 14, width: 56 },
  travelerRing: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, padding: 2, marginBottom: 4 },
  travelerAvatar: { width: "100%", height: "100%", borderRadius: 22 },
  travelerName: { fontSize: 10, fontFamily: "Inter-Medium" },

  // Filters
  filterRow: { marginBottom: 16 },
  filterScroll: { paddingHorizontal: 20 },
  filterChip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1 },
  filterText: { fontSize: 12, fontFamily: "Inter-Bold" },

  // Feed
  feed: { paddingHorizontal: 16 },
  emptyFeed: { alignItems: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontFamily: "Inter-Bold", marginTop: 12, marginBottom: 4 },
  emptySub: { fontSize: 12, fontFamily: "Inter-Medium" },
});
