import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface Props {
  title: string;
  showBack?: boolean;
  rightIcon?: string;
  onRightPress?: () => void;
}

export function ScreenHeader({ title, showBack, rightIcon, onRightPress }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: colors.borderLight }]}>
      {showBack ? (
        <Pressable onPress={() => router.back()} style={[styles.btn, { backgroundColor: colors.surface }]}>
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </Pressable>
      ) : (
        <View style={styles.spacer} />
      )}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {rightIcon ? (
        <Pressable onPress={onRightPress} style={[styles.btn, { backgroundColor: colors.surface }]}>
          <Ionicons name={rightIcon as any} size={18} color={colors.text} />
        </Pressable>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  btn: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 17, fontFamily: "Inter-Bold", flex: 1, textAlign: "center" },
  spacer: { width: 36 },
});
