import Ionicons from "react-native-vector-icons/Ionicons";
import { router } from "../utils/navigation";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SkeletonImage } from "./SkeletonImage";
import type { Recommendation } from "../utils/recommend";
import { useTheme } from "../context/ThemeContext";

export function RecommendedTripCard({ recommendation }: { recommendation: Recommendation }) {
  const { colors } = useTheme();
  const { trip, reason } = recommendation;

  return (
    <Pressable
      onPress={() => router.push("PublicTrip", { id: trip.id })}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <SkeletonImage source={{ uri: trip.coverPhoto }} style={styles.image} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{trip.name}</Text>
        <Text style={[styles.dest, { color: colors.textMuted }]} numberOfLines={1}>
          {trip.flag} {trip.destination}
        </Text>
        <View style={[styles.reasonChip, { backgroundColor: colors.accentLight, borderColor: colors.accentMuted }]}>
          <Ionicons name="sparkles" size={10} color={colors.accent} />
          <Text style={[styles.reasonText, { color: colors.accent }]} numberOfLines={1}>{reason}</Text>
        </View>
        <View style={styles.likesRow}>
          <Ionicons name="heart" size={11} color={colors.textMuted} />
          <Text style={[styles.likesText, { color: colors.textMuted }]}>{trip.likes ?? 0} likes</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: 200, borderRadius: 8, borderWidth: 1, overflow: "hidden", marginRight: 12 },
  image: { width: "100%", height: 110 },
  info: { padding: 10 },
  name: { fontSize: 13, fontWeight: "700", marginBottom: 2 },
  dest: { fontSize: 10, marginBottom: 8 },
  reasonChip: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1, marginBottom: 8, maxWidth: "100%" },
  reasonText: { fontSize: 9, fontWeight: "600", flexShrink: 1 },
  likesRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  likesText: { fontSize: 10 },
});
