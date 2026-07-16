import Ionicons from "react-native-vector-icons/Ionicons";
import { router } from "../utils/navigation";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SkeletonImage } from "./SkeletonImage";
import type { Trip } from "../data/mockData";
import { useTheme } from "../context/ThemeContext";
import { STATUS_COLORS, STATUS_COLORS_DARK } from "../constants/theme";
import { formatCurrency } from "../utils/formatCurrency";

interface TripSmallCardProps {
  trip?: Trip;
  isAddButton?: boolean;
}

export function TripSmallCard({ trip, isAddButton }: TripSmallCardProps) {
  const { colors, isDark } = useTheme();
  const statusMap = isDark ? STATUS_COLORS_DARK : STATUS_COLORS;

  if (isAddButton) {
    return (
      <Pressable
        onPress={() => router.push("CreateTrip")}
        style={[styles.card, styles.addCard, { borderColor: colors.border, backgroundColor: colors.surface }]}
      >
        <View style={[styles.addIconWrap, { backgroundColor: colors.card }]}>
          <Ionicons name="add" size={24} color={colors.textMuted} />
        </View>
        <Text style={[styles.addText, { color: colors.textSecondary }]}>New Trip</Text>
        <Text style={[styles.addSubText, { color: colors.textMuted }]}>Plan a journey</Text>
      </Pressable>
    );
  }

  if (!trip) return null;

  const isOverBudget = trip.spent > trip.budget;
  const statusStyle = statusMap[trip.status];

  return (
    <Pressable
      onPress={() => router.push("TripDetail", { id: trip.id })}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      {/* Image */}
      <SkeletonImage source={{ uri: trip.coverPhoto }} style={styles.image} />
      
      {/* Status pill on image */}
      <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
        <Text style={[styles.statusLabel, { color: statusStyle.text }]}>{trip.status}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{trip.name}</Text>
        <Text style={[styles.dest, { color: colors.textMuted }]} numberOfLines={1}>
          {trip.flag} {trip.destination.split(",")[1]?.trim() || trip.destination}
        </Text>
        <Text style={[styles.dates, { color: colors.textMuted }]}>
          {new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
          {new Date(trip.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </Text>

        {/* Expense chip */}
        <View
          style={[
            styles.expenseChip,
            {
              backgroundColor: isOverBudget ? colors.dangerLight : colors.successLight,
              borderColor: isOverBudget ? colors.danger + "30" : colors.success + "30",
            },
          ]}
        >
          <Ionicons name="wallet-outline" size={11} color={isOverBudget ? colors.danger : colors.success} />
          <Text
            style={[
              styles.expenseText,
              { color: isOverBudget ? colors.danger : colors.success },
            ]}
          >
            {formatCurrency(trip.spent, trip.currency)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 156,
    height: 230,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
    marginRight: 12,
  },
  addCard: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderStyle: "dashed",
    borderWidth: 1.5,
  },
  addIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  addText: { fontSize: 13, fontWeight: "600", marginBottom: 2 },
  addSubText: { fontSize: 10 },
  image: { width: "100%", height: 110 },
  statusPill: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusLabel: { fontSize: 8, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  info: { padding: 10, flex: 1, justifyContent: "space-between" },
  name: { fontSize: 13, fontWeight: "700", marginBottom: 2 },
  dest: { fontSize: 10, marginBottom: 2 },
  dates: { fontSize: 9, marginBottom: 6 },
  expenseChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  expenseText: { fontSize: 10, fontWeight: "700", marginLeft: 4 },
});
