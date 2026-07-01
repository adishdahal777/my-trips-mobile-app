import Ionicons from "react-native-vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { formatCurrency } from "../utils/formatCurrency";

interface Props {
  expense: {
    id: string;
    description: string;
    amount: number;
    currency: string;
    date: string;
    category: string;
    icon: string;
    aiSuggested: boolean;
    isPrivate?: boolean;
  };
  tripCurrency: string;
  onTogglePrivacy?: () => void;
}

export function ExpenseItem({ expense, tripCurrency, onTogglePrivacy }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.row, { borderBottomColor: colors.borderLight }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.surface }]}>
        <Text style={styles.icon}>{expense.icon}</Text>
      </View>
      <View style={styles.middle}>
        <View style={styles.descRow}>
          <Text style={[styles.desc, { color: colors.text }]} numberOfLines={1}>{expense.description}</Text>
          {expense.isPrivate && (
            <Ionicons name="lock-closed" size={12} color={colors.textMuted} style={{ marginLeft: 4 }} />
          )}
        </View>
        <Text style={[styles.category, { color: colors.textMuted }]}>{expense.category}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: colors.text }]}>{formatCurrency(expense.amount, tripCurrency)}</Text>
        <Text style={[styles.date, { color: colors.textMuted }]}>
          {new Date(expense.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </Text>
      </View>
      {onTogglePrivacy && (
        <Pressable onPress={onTogglePrivacy} style={[styles.privacyBtn, { backgroundColor: expense.isPrivate ? colors.surfaceAlt : colors.accentLight }]}>
          <Ionicons name={expense.isPrivate ? "lock-closed" : "globe-outline"} size={14} color={expense.isPrivate ? colors.textMuted : colors.accent} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1 },
  iconWrap: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center", marginRight: 12 },
  icon: { fontSize: 16 },
  middle: { flex: 1 },
  descRow: { flexDirection: "row", alignItems: "center" },
  desc: { fontSize: 13, fontFamily: "Inter-Bold", marginBottom: 2 },
  category: { fontSize: 10, fontFamily: "Inter-Medium" },
  right: { alignItems: "flex-end", marginRight: 4 },
  amount: { fontSize: 13, fontFamily: "Inter-Bold", marginBottom: 2 },
  date: { fontSize: 10, fontFamily: "Inter-Medium" },
  privacyBtn: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center", marginLeft: 8 },
});

