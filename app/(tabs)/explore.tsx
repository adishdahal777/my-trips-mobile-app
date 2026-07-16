import Ionicons from "react-native-vector-icons/Ionicons";
import { Flame } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { PlaneRefreshControl } from "../../components/PlaneRefreshControl";
import { SafeAreaView } from "react-native-safe-area-context";
import { FeedTripCard } from "../../components/FeedTripCard";
import { SkeletonImage } from "../../components/SkeletonImage";
import { Skeleton } from "../../components/Skeleton";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useTrips } from "../../context/TripContext";
import type { Trip } from "../../data/mockData";
import { apiFetch } from "../../services/api";

const FEED_FILTERS = ["All", "Ongoing", "Completed", "Popular"];

export default function Explore() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { trips: myTrips } = useTrips();
  const [filter, setFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [feedTrips, setFeedTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeed = useCallback(async () => {
    try {
      const res = await apiFetch("/feed");
      setFeedTrips(res.data);
    } catch {
      setFeedTrips([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // Merge my public trips + other travelers' public trips
  const allPublicTrips = useMemo(() => {
    const myPublic = myTrips.filter((t) => t.visibility === "public");
    const others = feedTrips.filter((t) => t.user?.id !== user?.id);
    const merged = [...myPublic, ...others];
    return merged.sort((a, b) => new Date(b.createdAt || b.startDate).getTime() - new Date(a.createdAt || a.startDate).getTime());
  }, [myTrips, feedTrips, user]);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<PlaneRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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

        {loading && (
          <View style={styles.feed}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.skeletonHeader}>
                  <Skeleton style={styles.skeletonAvatar} />
                  <View style={{ flex: 1 }}>
                    <Skeleton style={styles.skeletonLine} />
                    <Skeleton style={[styles.skeletonLine, { width: "50%", marginTop: 6 }]} />
                  </View>
                </View>
                <Skeleton style={styles.skeletonImage} />
              </View>
            ))}
          </View>
        )}

        {/* Featured Hero */}
        {!loading && featuredTrip && (
          <View style={styles.featuredSection}>
            <View style={styles.sectionTitleRow}>
              <Flame size={16} color={colors.text} strokeWidth={2} />
              <Text style={[styles.sectionTitle, { color: colors.text, paddingHorizontal: 0, marginBottom: 0 }]}>Featured Trip</Text>
            </View>
            <View style={[styles.featuredCard, { borderColor: colors.border }]}>
              <SkeletonImage source={{ uri: featuredTrip.coverPhoto }} style={styles.featuredImage} />
              <View style={styles.featuredGradient} />
              <View style={styles.featuredContent}>
                <View style={styles.featuredUserRow}>
                  <SkeletonImage source={{ uri: featuredTrip.user?.avatar }} style={styles.featuredAvatar} />
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
        {!loading && <View style={styles.travelersRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.travelersScroll}>
            {allPublicTrips
              .filter((t, i, arr) => arr.findIndex((x) => x.user?.id === t.user?.id) === i)
              .slice(0, 8)
              .map((t) => (
                <View key={t.user?.id || t.id} style={styles.travelerItem}>
                  <View style={[styles.travelerRing, { borderColor: t.status === "ongoing" ? colors.success : colors.border }]}>
                    <SkeletonImage source={{ uri: t.user?.avatar }} style={styles.travelerAvatar} />
                  </View>
                  <Text style={[styles.travelerName, { color: colors.textSecondary }]} numberOfLines={1}>
                    {t.user?.name?.split(" ")[0]}
                  </Text>
                </View>
              ))}
          </ScrollView>
        </View>}

        {/* Filter Chips */}
        {!loading && (
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
        )}

        {/* Feed */}
        <View style={styles.feed}>
          {!loading && filteredTrips.map((trip) => (
            <FeedTripCard key={trip.id} trip={trip} />
          ))}
          {!loading && filteredTrips.length === 0 && (
            <View style={styles.emptyFeed}>
              <Ionicons name="compass-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No trips found</Text>
              <Text style={[styles.emptySub, { color: colors.textMuted }]}>Try a different filter</Text>
            </View>
          )}
        </View>

        <View style={{ height: 130 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 12, marginBottom: 16 },
  headerTag: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 2 },
  headerTitle: { fontSize: 28, fontWeight: "700" },
  headerRight: { flexDirection: "row", gap: 8 },
  headerIcon: { width: 36, height: 36, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "700", paddingHorizontal: 20, marginBottom: 12 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 20, marginBottom: 12 },

  // Featured
  featuredSection: { marginBottom: 20 },
  featuredCard: { marginHorizontal: 20, borderRadius: 8, overflow: "hidden", height: 220, borderWidth: 1 },
  featuredImage: { width: "100%", height: "100%" },
  featuredGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  featuredContent: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16 },
  featuredUserRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  featuredAvatar: { width: 22, height: 22, borderRadius: 11, marginRight: 6, borderWidth: 1.5, borderColor: "#FFF" },
  featuredUserName: { color: "rgba(255,255,255,0.9)", fontSize: 11, fontWeight: "600" },
  featuredName: { color: "#FFF", fontSize: 22, fontWeight: "700", marginBottom: 2 },
  featuredDest: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginBottom: 8 },
  featuredStats: { flexDirection: "row", gap: 12 },
  featuredStat: { flexDirection: "row", alignItems: "center", gap: 4 },
  featuredStatText: { color: "rgba(255,255,255,0.9)", fontSize: 11, fontWeight: "600" },

  // Travelers Row
  travelersRow: { marginBottom: 16 },
  travelersScroll: { paddingHorizontal: 20 },
  travelerItem: { alignItems: "center", marginRight: 14, width: 56 },
  travelerRing: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, padding: 2, marginBottom: 4 },
  travelerAvatar: { width: "100%", height: "100%", borderRadius: 22 },
  travelerName: { fontSize: 10 },

  // Filters
  filterRow: { marginBottom: 16 },
  filterScroll: { paddingHorizontal: 20 },
  filterChip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 6, marginRight: 8, borderWidth: 1 },
  filterText: { fontSize: 12, fontWeight: "600" },

  // Feed
  feed: { paddingHorizontal: 16 },
  card: { borderRadius: 20, borderWidth: 1, marginBottom: 16, overflow: "hidden" },
  skeletonHeader: { flexDirection: "row", alignItems: "center", padding: 14, gap: 10 },
  skeletonAvatar: { width: 38, height: 38, borderRadius: 19 },
  skeletonLine: { height: 10, borderRadius: 4, width: "70%" },
  skeletonImage: { width: "100%", height: 200 },
  emptyFeed: { alignItems: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: "700", marginTop: 12, marginBottom: 4 },
  emptySub: { fontSize: 12 },
});
