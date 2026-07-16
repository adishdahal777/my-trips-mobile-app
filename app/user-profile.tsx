import Ionicons from "react-native-vector-icons/Ionicons";
import { router } from "../utils/navigation";
import { useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FeedTripCard } from "../components/FeedTripCard";
import { NoteCard } from "../components/NoteCard";
import { ProfileShareSheet } from "../components/ProfileShareSheet";
import { ScreenHeader } from "../components/ScreenHeader";
import { SkeletonImage } from "../components/SkeletonImage";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import type { Note, Trip } from "../data/mockData";
import { apiFetch } from "../services/api";
import { formatCurrency } from "../utils/formatCurrency";
import { getCategoryIcon } from "../utils/categoryIcon";

interface PublicUser {
  id: string; name: string; avatar: string; bio?: string;
  totalTrips: number; countries: number; kmTraveled: number;
  followersCount: number; followingCount: number; isFollowing: boolean;
}

export default function UserProfile() {
  const { colors } = useTheme();
  const { user: me } = useAuth();
  const route = useRoute<any>();
  const userId = route.params?.userId as string;

  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [followBusy, setFollowBusy] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);

  useEffect(() => {
    apiFetch(`/users/${userId}`).then((res) => setProfile(res.data)).catch(() => setProfile(null));
    apiFetch(`/feed?user=${userId}`).then((res) => setTrips(res.data)).catch(() => setTrips([]));
  }, [userId]);

  const currency = trips[0]?.currency ?? "";
  const totalNotes = trips.reduce((sum, t) => sum + (t.notes?.length || 0), 0);

  const categoryTotals = trips
    .flatMap((t) => t.expenses || [])
    .reduce((acc: Record<string, number>, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});
  const totalExpenses = Object.values(categoryTotals).reduce((s, v) => s + v, 0);
  const categoryList = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  const allNotes: (Note & { tripName: string })[] = trips.flatMap((t) =>
    (t.notes || []).map((n) => ({ ...n, tripName: t.name }))
  );

  const toggleFollow = async () => {
    if (!profile || followBusy) return;
    setFollowBusy(true);
    const prev = profile;
    setProfile({ ...profile, isFollowing: !profile.isFollowing, followersCount: profile.followersCount + (profile.isFollowing ? -1 : 1) });
    try {
      const res = await apiFetch(`/users/${userId}/follow`, { method: "POST" });
      setProfile((p) => (p ? { ...p, isFollowing: res.following, followersCount: res.followers } : p));
    } catch {
      setProfile(prev);
    } finally {
      setFollowBusy(false);
    }
  };

  if (!profile) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title="Profile" showBack />
      </SafeAreaView>
    );
  }

  const isSelf = me?.id === userId;

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={profile.name}
        showBack
        rightIcon="share-outline"
        onRightPress={() => setShareVisible(true)}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <SkeletonImage source={{ uri: profile.avatar }} style={styles.avatar} />
          <Text style={[styles.name, { color: colors.text }]}>{profile.name}</Text>
          {!!profile.bio && <Text style={[styles.bio, { color: colors.textSecondary }]}>{profile.bio}</Text>}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{profile.totalTrips ?? 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Trips</Text>
            </View>
            <Pressable onPress={() => router.push("FollowList", { userId, mode: "followers" })} style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{profile.followersCount ?? 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Followers</Text>
            </Pressable>
            <Pressable onPress={() => router.push("FollowList", { userId, mode: "following" })} style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{profile.followingCount ?? 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Following</Text>
            </Pressable>
          </View>

          <View style={styles.headerActions}>
            {!isSelf && (
              <Pressable
                onPress={toggleFollow}
                disabled={followBusy}
                style={[
                  styles.followBtn,
                  profile.isFollowing
                    ? { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }
                    : { backgroundColor: colors.accent },
                ]}
              >
                <Text style={[styles.followBtnText, { color: profile.isFollowing ? colors.text : "#FFF" }]}>
                  {profile.isFollowing ? "Unfollow" : "Follow"}
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => setShareVisible(true)}
              style={[styles.shareProfileBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Ionicons name="share-social-outline" size={15} color={colors.text} />
              <Text style={[styles.shareProfileText, { color: colors.text }]}>Share</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.dashGrid}>
          <View style={[styles.dashCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.dashIcon, { backgroundColor: colors.accentLight }]}>
              <Ionicons name="map-outline" size={16} color={colors.accent} />
            </View>
            <Text style={[styles.dashValue, { color: colors.text }]}>{trips.length}</Text>
            <Text style={[styles.dashLabel, { color: colors.textMuted }]}>Public Trips</Text>
          </View>
          <View style={[styles.dashCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.dashIcon, { backgroundColor: "#10B98120" }]}>
              <Ionicons name="wallet-outline" size={16} color="#10B981" />
            </View>
            <Text style={[styles.dashValue, { color: colors.text }]} numberOfLines={1}>
              {totalExpenses > 0 ? formatCurrency(totalExpenses, currency) : "—"}
            </Text>
            <Text style={[styles.dashLabel, { color: colors.textMuted }]}>Public Expenses</Text>
          </View>
          <View style={[styles.dashCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.dashIcon, { backgroundColor: "#F59E0B20" }]}>
              <Ionicons name="pencil-outline" size={16} color="#F59E0B" />
            </View>
            <Text style={[styles.dashValue, { color: colors.text }]}>{totalNotes}</Text>
            <Text style={[styles.dashLabel, { color: colors.textMuted }]}>Public Notes</Text>
          </View>
        </View>

        {categoryList.length > 0 && (
          <View style={styles.categorySection}>
            <Text style={[styles.sectionTitle, { paddingHorizontal: 0, color: colors.text }]}>Expense Breakdown</Text>
            <View style={styles.categoryRow}>
              {categoryList.map(([category, amount]) => (
                <View key={category} style={[styles.categoryChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name={getCategoryIcon(category) as any} size={14} color={colors.accent} />
                  <Text style={[styles.categoryLabel, { color: colors.text }]}>{category}</Text>
                  <Text style={[styles.categoryAmount, { color: colors.textMuted }]}>{formatCurrency(amount, currency)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {allNotes.length > 0 && (
          <View style={styles.notesSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Public Notes</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.notesScroll}>
              {allNotes.map((n) => (
                <View key={n.id} style={styles.noteWrap}>
                  <NoteCard note={n} />
                  <Text style={[styles.noteTrip, { color: colors.textMuted }]} numberOfLines={1}>{n.tripName}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Public Trips</Text>
        <View style={styles.tripsList}>
          {trips.map((trip) => (
            <FeedTripCard key={trip.id} trip={trip} />
          ))}
          {trips.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="map-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No public trips yet</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <ProfileShareSheet
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        userId={userId}
        name={profile.name}
        avatar={profile.avatar}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 60 },
  header: { alignItems: "center", padding: 24 },
  avatar: { width: 88, height: 88, borderRadius: 44, marginBottom: 12 },
  name: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  bio: { fontSize: 13, textAlign: "center", marginBottom: 16, paddingHorizontal: 12 },
  statsRow: { flexDirection: "row", gap: 28, marginBottom: 16 },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 16, fontWeight: "700" },
  statLabel: { fontSize: 11, marginTop: 1 },
  headerActions: { flexDirection: "row", gap: 10 },
  followBtn: { paddingHorizontal: 28, paddingVertical: 10, borderRadius: 8 },
  followBtnText: { fontSize: 13, fontWeight: "700" },
  shareProfileBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  shareProfileText: { fontSize: 13, fontWeight: "700" },
  dashGrid: { flexDirection: "row", paddingHorizontal: 20, gap: 10, marginBottom: 24 },
  dashCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 12, alignItems: "flex-start" },
  dashIcon: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  dashValue: { fontSize: 15, fontWeight: "700" },
  dashLabel: { fontSize: 10, marginTop: 2 },
  categorySection: { paddingHorizontal: 20, marginBottom: 24 },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  categoryChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  categoryLabel: { fontSize: 11, fontWeight: "600" },
  categoryAmount: { fontSize: 11 },
  notesSection: { marginBottom: 24 },
  notesScroll: { paddingHorizontal: 20, gap: 12 },
  noteWrap: { width: 200 },
  noteTrip: { fontSize: 10, marginTop: 6, textAlign: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "700", paddingHorizontal: 20, marginBottom: 12 },
  tripsList: { paddingHorizontal: 20 },
  emptyState: { width: "100%", alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 12, marginTop: 8 },
});
