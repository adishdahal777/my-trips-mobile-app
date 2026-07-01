import Ionicons from "react-native-vector-icons/Ionicons";
import { router } from "../utils/navigation";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { Trip } from "../data/mockData";
import { useTheme } from "../context/ThemeContext";
import { formatCurrency } from "../utils/formatCurrency";
import { ShareSheet } from "./ShareSheet";
import { shareTrip } from "../utils/shareTrip";

interface Props {
  trip: Trip;
  isGuest?: boolean;
}

export function FeedTripCard({ trip, isGuest }: Props) {
  const { colors } = useTheme();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(trip.likes || 0);
  const [shareVisible, setShareVisible] = useState(false);

  const user = trip.user || { id: "?", name: "Traveler", avatar: "https://i.pravatar.cc/150?img=1" };
  const days = Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000);
  const pct = trip.budget > 0 ? Math.min((trip.spent / trip.budget) * 100, 100) : 0;

  const timeAgo = () => {
    if (!trip.createdAt) return "";
    const diff = Date.now() - new Date(trip.createdAt).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return "Just now";
    if (hrs < 24) return `${hrs}h ago`;
    const d = Math.floor(hrs / 24);
    if (d < 30) return `${d}d ago`;
    return `${Math.floor(d / 30)}mo ago`;
  };

  const handleLike = () => {
    if (isGuest) return;
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const handleShare = () => {
    setShareVisible(true);
  };

  const handlePress = () => {
    if (isGuest) {
      router.push("PublicTrip", { id: trip.id });
    } else {
      router.push("TripDetail", { id: trip.id });
    }
  };

  const privacy = trip.privacySettings || { photos: false, notes: false, expenses: false };

  const publicPhotos = privacy.photos
    ? trip.photos.filter((p) => !p.isPrivate).slice(0, 3)
    : [];

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* User Header */}
      <View style={styles.header}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
          <View style={styles.headerMeta}>
            <Text style={[styles.timeAgo, { color: colors.textMuted }]}>{timeAgo()}</Text>
            <Text style={[styles.dot, { color: colors.textMuted }]}>·</Text>
            <Text style={[styles.destination, { color: colors.textMuted }]}>{trip.flag} {trip.destination}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: trip.status === "ongoing" ? colors.successLight : trip.status === "upcoming" ? colors.accentLight : colors.surfaceAlt }]}>
          <Text style={[styles.statusText, { color: trip.status === "ongoing" ? colors.success : trip.status === "upcoming" ? colors.accent : colors.textSecondary }]}>{trip.status}</Text>
        </View>
      </View>

      {/* Cover Image */}
      <Pressable onPress={handlePress}>
        <Image source={{ uri: trip.coverPhoto }} style={styles.coverImage} />
        <View style={styles.coverOverlay}>
          <Text style={styles.tripName}>{trip.name}</Text>
          <View style={styles.dateChip}>
            <Ionicons name="calendar-outline" size={10} color="rgba(255,255,255,0.8)" />
            <Text style={styles.dateText}>
              {new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {new Date(trip.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </Text>
          </View>
        </View>
      </Pressable>

      {/* Stats Row */}
      <View style={[styles.statsRow, { borderBottomColor: colors.borderLight }]}>
        {[
          { icon: "location-outline" as const, val: `${trip.route.length} stops`, show: true },
          { icon: "time-outline" as const, val: `${days} days`, show: true },
          { icon: "wallet-outline" as const, val: privacy.expenses ? `${pct.toFixed(0)}% spent` : "—", show: true },
        ].map((s, i) => (
          <View key={i} style={[styles.statItem, i < 2 && { borderRightWidth: 1, borderRightColor: colors.borderLight }]}>
            <Ionicons name={s.icon} size={14} color={colors.accent} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>{s.val}</Text>
          </View>
        ))}
      </View>

      {/* Photo Strip */}
      {publicPhotos.length > 0 && (
        <View style={styles.photoStrip}>
          {publicPhotos.map((p, i) => (
            <Image key={p.id} source={{ uri: p.url }} style={[styles.photoThumb, i < publicPhotos.length - 1 && { marginRight: 6 }]} />
          ))}
          {trip.photos.length > 3 && trip.privacySettings.photos && (
            <View style={[styles.photoMore, { backgroundColor: colors.surface }]}>
              <Text style={[styles.photoMoreText, { color: colors.textSecondary }]}>+{trip.photos.length - 3}</Text>
            </View>
          )}
        </View>
      )}

      {/* Description */}
      {trip.description ? (
        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>{trip.description}</Text>
      ) : null}

      {/* Action Bar */}
      <View style={[styles.actionBar, { borderTopColor: colors.borderLight }]}>
        {!isGuest && (
          <>
            <Pressable onPress={handleLike} style={styles.actionBtn}>
              <Ionicons name={liked ? "heart" : "heart-outline"} size={20} color={liked ? "#EF4444" : colors.textMuted} />
              <Text style={[styles.actionText, { color: liked ? "#EF4444" : colors.textMuted }]}>{likeCount}</Text>
            </Pressable>
            <Pressable style={styles.actionBtn}>
              <Ionicons name="chatbubble-outline" size={18} color={colors.textMuted} />
              <Text style={[styles.actionText, { color: colors.textMuted }]}>{trip.comments || 0}</Text>
            </Pressable>
          </>
        )}
        <Pressable onPress={handleShare} style={styles.actionBtn}>
          <Ionicons name="share-outline" size={18} color={colors.textMuted} />
          <Text style={[styles.actionText, { color: colors.textMuted }]}>Share</Text>
        </Pressable>
        <Pressable onPress={handlePress} style={[styles.viewBtn, { backgroundColor: colors.accentLight }]}>
          <Text style={[styles.viewBtnText, { color: colors.accent }]}>View Trip</Text>
          <Ionicons name="arrow-forward" size={12} color={colors.accent} />
        </Pressable>
      </View>

      {/* Share Sheet */}
      <ShareSheet visible={shareVisible} onClose={() => setShareVisible(false)} trip={trip} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, marginBottom: 16, overflow: "hidden" },
  header: { flexDirection: "row", alignItems: "center", padding: 14, paddingBottom: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, marginRight: 10 },
  headerInfo: { flex: 1 },
  userName: { fontSize: 14, fontFamily: "Inter-Bold" },
  headerMeta: { flexDirection: "row", alignItems: "center", marginTop: 1 },
  timeAgo: { fontSize: 11, fontFamily: "Inter-Medium" },
  dot: { fontSize: 11, marginHorizontal: 4 },
  destination: { fontSize: 11, fontFamily: "Inter-Medium" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 9, fontFamily: "Inter-Bold", textTransform: "uppercase" },
  coverImage: { width: "100%", height: 200 },
  coverOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 14, paddingTop: 50, backgroundColor: "rgba(0,0,0,0.4)" },
  tripName: { color: "#FFF", fontSize: 20, fontFamily: "Inter-Bold", textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  dateChip: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  dateText: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontFamily: "Inter-Medium", marginLeft: 4 },
  statsRow: { flexDirection: "row", paddingVertical: 10, borderBottomWidth: 1 },
  statItem: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  statText: { fontSize: 11, fontFamily: "Inter-Bold" },
  photoStrip: { flexDirection: "row", padding: 12, paddingBottom: 4 },
  photoThumb: { width: 70, height: 70, borderRadius: 10 },
  photoMore: { width: 70, height: 70, borderRadius: 10, alignItems: "center", justifyContent: "center", marginLeft: 6 },
  photoMoreText: { fontSize: 13, fontFamily: "Inter-Bold" },
  description: { paddingHorizontal: 14, paddingVertical: 8, fontSize: 13, fontFamily: "Inter-Medium", lineHeight: 19 },
  actionBar: { flexDirection: "row", alignItems: "center", padding: 10, paddingHorizontal: 14, borderTopWidth: 1 },
  actionBtn: { flexDirection: "row", alignItems: "center", marginRight: 16, gap: 4 },
  actionText: { fontSize: 12, fontFamily: "Inter-Bold" },
  viewBtn: { marginLeft: "auto", flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 4 },
  viewBtnText: { fontSize: 11, fontFamily: "Inter-Bold" },
});
