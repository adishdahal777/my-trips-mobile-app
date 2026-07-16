import LinearGradient from "react-native-linear-gradient";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface Props {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export function GradientButton({ title, onPress, style, disabled }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.pressable, style, disabled && styles.disabled]}>
      <LinearGradient
        colors={[colors.accent, "#6366F1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { paddingVertical: 15, borderRadius: 14, alignItems: "center", overflow: "hidden" },
  disabled: { opacity: 0.5 },
  text: { color: "#FFFFFF", fontSize: 15 },
});
