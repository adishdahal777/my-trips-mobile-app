import { StyleSheet, Text, View } from "react-native";
import { useTheme, ThemeColors } from "../context/ThemeContext";
import { formatCurrency } from "../utils/formatCurrency";

interface ExpenseFeedItemProps {
  expense: {
    id: string;
    description: string;
    amount: number;
    currency: string;
    date: string;
    category: string;
    icon: string;
    aiSuggested: boolean;
  };
  tripName: string;
  isLast?: boolean;
}

const getCategoryColor = (category: string, colors: ThemeColors) => {
  const map: Record<string, { bg: string; text: string }> = {
    Food: { bg: colors.categoryFoodBg, text: colors.categoryFood },
    Transport: { bg: colors.categoryTransportBg, text: colors.categoryTransport },
    Activities: { bg: colors.categoryActivitiesBg, text: colors.categoryActivities },
    Accommodation: { bg: colors.categoryAccommodationBg, text: colors.categoryAccommodation },
    Shopping: { bg: colors.categoryShoppingBg, text: colors.categoryShopping },
  };
  return map[category] || { bg: colors.categoryOtherBg, text: colors.categoryOther };
};

export function ExpenseFeedItem({ expense, tripName, isLast }: ExpenseFeedItemProps) {
  const { colors } = useTheme();
  const catColor = getCategoryColor(expense.category, colors);

  return (
    <View style={[styles.row, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}>
      <View style={[styles.iconCircle, { backgroundColor: catColor.bg }]}>
        <Text style={styles.emoji}>{expense.icon}</Text>
      </View>

      <View style={styles.middle}>
        <View style={styles.descRow}>
          <Text style={[styles.desc, { color: colors.text }]} numberOfLines={1}>{expense.description}</Text>
          {expense.aiSuggested && (
            <View style={[styles.aiBadge, { backgroundColor: colors.aiBadgeBg, borderColor: colors.aiBadgeBorder }]}>
              <Text style={[styles.aiText, { color: colors.aiBadgeText }]}>AI</Text>
            </View>
          )}
        </View>
        <Text style={[styles.tripLabel, { color: colors.textMuted }]}>{tripName}</Text>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatCurrency(expense.amount, expense.currency)}
        </Text>
        <Text style={[styles.date, { color: colors.textMuted }]}>
          {new Date(expense.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14 },
  iconCircle: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 12 },
  emoji: { fontSize: 18 },
  middle: { flex: 1 },
  descRow: { flexDirection: "row", alignItems: "center", marginBottom: 3 },
  desc: { fontSize: 13, fontFamily: "Inter-Bold", marginRight: 6, flexShrink: 1 },
  aiBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  aiText: { fontSize: 8, fontFamily: "Inter-Bold", textTransform: "uppercase" },
  tripLabel: { fontSize: 10, fontFamily: "Inter-Medium", textTransform: "uppercase", letterSpacing: 0.5 },
  right: { alignItems: "flex-end" },
  amount: { fontSize: 13, fontFamily: "Inter-Bold", marginBottom: 2 },
  date: { fontSize: 10, fontFamily: "Inter-Medium" },
});
