import Ionicons from "react-native-vector-icons/Ionicons";
import { router } from "../utils/navigation";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SkeletonImage } from "./SkeletonImage";
import type { Trip } from "../data/mockData";
import { useTheme } from "../context/ThemeContext";
import { STATUS_COLORS, STATUS_COLORS_DARK } from "../constants/theme";
import { formatCurrency } from "../utils/formatCurrency";

export function TripCard({ trip }: { trip: Trip }) {
  const { colors, isDark } = useTheme();
  const statusMap = isDark ? STATUS_COLORS_DARK : STATUS_COLORS;
  const statusStyle = statusMap[trip.status];

  return (
    <Pressable
      onPress={() => router.push("TripDetail", { id: trip.id })}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.row}>
        <SkeletonImage source={{ uri: trip.coverPhoto }} style={styles.image} />
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <View style={styles.titleWrap}>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{trip.name}</Text>
              <Text style={[styles.dest, { color: colors.textMuted }]}>{trip.flag} {trip.destination}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>{trip.status}</Text>
            </View>
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={11} color={colors.textMuted} />
              <Text style={[styles.dateText, { color: colors.textMuted }]}>
                {new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </Text>
            </View>
            <Text style={[styles.amount, { color: colors.text }]}>{formatCurrency(trip.spent, trip.currency)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 8, padding: 12, borderWidth: 1, marginBottom: 10 },
  row: { flexDirection: "row" },
  image: { width: 80, height: 80, borderRadius: 6, marginRight: 12 },
  info: { flex: 1, justifyContent: "center" },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  titleWrap: { flex: 1, marginRight: 8 },
  name: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  dest: { fontSize: 11, marginBottom: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  statusText: { fontSize: 9, fontWeight: "700", textTransform: "uppercase" },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dateRow: { flexDirection: "row", alignItems: "center" },
  dateText: { fontSize: 10, marginLeft: 4 },
  amount: { fontSize: 14, fontWeight: "700" },
});
