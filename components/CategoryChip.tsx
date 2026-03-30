import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface Props {
  icon: string;
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

export function CategoryChip({ icon, label, isSelected, onPress }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: isSelected ? colors.accent : colors.surface,
          borderColor: isSelected ? colors.accent : colors.border,
        },
      ]}
    >
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={[styles.label, { color: isSelected ? "#FFFFFF" : colors.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1 },
  icon: { marginRight: 4 },
  label: { fontSize: 12, fontFamily: "Inter-Bold" },
});
