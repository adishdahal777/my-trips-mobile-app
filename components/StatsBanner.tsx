import Ionicons from "react-native-vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface StatsBannerProps {
  totalTrips: number;
  countriesVisited: number;
  totalSpent: number;
  currentMonthSpent: number;
  totalKm: number;
  countryFlags: string[];
  onTripsPress?: () => void;
  onSpendPress?: () => void;
}

export function StatsBanner({
  totalTrips,
  countriesVisited,
  totalSpent,
  totalKm,
  onTripsPress,
  onSpendPress,
}: StatsBannerProps) {
  const { colors } = useTheme();

  const stats = [
    {
      icon: "briefcase-outline" as const,
      value: totalTrips.toString(),
      label: "Trips",
      iconColor: colors.accent,
      onPress: onTripsPress,
    },
    {
      icon: "globe-outline" as const,
      value: countriesVisited.toString(),
      label: "Countries",
      iconColor: colors.success,
    },
    {
      icon: "wallet-outline" as const,
      value: `$${totalSpent.toLocaleString()}`,
      label: "Spent",
      iconColor: colors.coral,
      onPress: onSpendPress,
    },
  ];

  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <Pressable
          key={stat.label}
          onPress={stat.onPress}
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
            index < stats.length - 1 && styles.cardSpacing,
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: colors.surface }]}>
            <Ionicons name={stat.icon} size={18} color={stat.iconColor} />
          </View>
          <Text style={[styles.value, { color: colors.text }]}>{stat.value}</Text>
          <Text style={[styles.label, { color: colors.textMuted }]}>{stat.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  cardSpacing: { marginRight: 10 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  value: { fontSize: 20, fontWeight: "700", marginBottom: 2 },
  label: { fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },
});
