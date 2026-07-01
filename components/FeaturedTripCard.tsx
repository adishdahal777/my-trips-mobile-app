import Ionicons from "react-native-vector-icons/Ionicons";
import { router } from "../utils/navigation";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { Trip } from "../data/mockData";
import { useTheme } from "../context/ThemeContext";
import { STATUS_COLORS, STATUS_COLORS_DARK } from "../constants/theme";
import { formatCurrency } from "../utils/formatCurrency";

interface FeaturedTripCardProps {
  trip: Trip;
}

export function FeaturedTripCard({ trip }: FeaturedTripCardProps) {
  const { colors, isDark } = useTheme();
  const statusMap = isDark ? STATUS_COLORS_DARK : STATUS_COLORS;

  const diff = new Date(trip.startDate).getTime() - new Date().getTime();
  const daysAway = Math.ceil(diff / (1000 * 3600 * 24));

  let countdownText = `${Math.abs(daysAway)} days away`;
  if (trip.status === "ongoing") countdownText = "Ongoing";
  else if (daysAway < 0) countdownText = `Ended ${Math.abs(daysAway)}d ago`;

  const pct = Math.min((trip.spent / trip.budget) * 100, 100);
  const barColor = pct > 90 ? colors.danger : pct > 60 ? colors.warning : colors.success;

  const duration = Math.ceil(
    (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 3600 * 24)
  );

  const statusStyle = statusMap[trip.status];

  const quickActions = [
    { icon: "wallet-outline" as const, label: "Expenses" },
    { icon: "camera-outline" as const, label: "Photos" },
    { icon: "document-text-outline" as const, label: "Notes" },
    { icon: "map-outline" as const, label: "Route" },
  ];

  return (
    <Pressable
      onPress={() => router.push("TripDetail", { id: trip.id })}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      {/* Cover image */}
      <Image source={{ uri: trip.coverPhoto }} style={styles.coverImage} />

      {/* Content area */}
      <View style={styles.content}>
        {/* Top row: name + status */}
        <View style={styles.titleRow}>
          <View style={styles.titleWrap}>
            <Text style={[styles.tripName, { color: colors.text }]} numberOfLines={1}>
              {trip.name}
            </Text>
            <Text style={[styles.destination, { color: colors.textMuted }]}>
              {trip.flag} {trip.destination}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{countdownText}</Text>
          </View>
        </View>

        {/* Date row */}
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
          <Text style={[styles.dateText, { color: colors.textMuted }]}>
            {new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
            {new Date(trip.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {duration} days
          </Text>
        </View>

        {/* Budget progress */}
        <View style={styles.budgetSection}>
          <View style={styles.budgetHeader}>
            <Text style={[styles.budgetLabel, { color: colors.textSecondary }]}>Budget</Text>
            <Text style={[styles.budgetValue, { color: colors.textSecondary }]}>
              {formatCurrency(trip.spent, trip.currency)} / {formatCurrency(trip.budget, trip.currency)}
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.surface }]}>
            <View style={[styles.progressFill, { backgroundColor: barColor, width: `${pct}%` }]} />
          </View>
        </View>

        {/* Quick actions */}
        <View style={[styles.actionsRow, { borderTopColor: colors.borderLight }]}>
          {quickActions.map((action) => (
            <Pressable key={action.label} style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: colors.surface }]}>
                <Ionicons name={action.icon} size={16} color={colors.textSecondary} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.textMuted }]}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Counts */}
        <View style={styles.countsRow}>
          <Text style={[styles.countText, { color: colors.textMuted }]}>
            {trip.photos.length} photos · {trip.expenses.length} expenses · {trip.notes.length} notes
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  coverImage: {
    width: "100%",
    height: 160,
  },
  content: { padding: 16 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  titleWrap: { flex: 1, marginRight: 10 },
  tripName: { fontSize: 18, fontFamily: "Inter-Bold", marginBottom: 2 },
  destination: { fontSize: 12, fontFamily: "Inter-Medium" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: "flex-start" },
  statusText: { fontSize: 10, fontFamily: "Inter-Bold", textTransform: "uppercase", letterSpacing: 0.5 },
  dateRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  dateText: { fontSize: 11, fontFamily: "Inter-Medium", marginLeft: 6 },
  budgetSection: { marginBottom: 14 },
  budgetHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  budgetLabel: { fontSize: 12, fontFamily: "Inter-Medium" },
  budgetValue: { fontSize: 11, fontFamily: "Inter-Bold" },
  progressTrack: { height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  actionsRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 14, borderTopWidth: 1, marginBottom: 10 },
  actionItem: { alignItems: "center", flex: 1 },
  actionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  actionLabel: { fontSize: 9, fontFamily: "Inter-Medium", textTransform: "uppercase", letterSpacing: 0.5 },
  countsRow: { alignItems: "center", paddingTop: 6 },
  countText: { fontSize: 10, fontFamily: "Inter-Medium" },
});
