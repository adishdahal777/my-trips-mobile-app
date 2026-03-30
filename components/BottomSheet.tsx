import React from "react";
import { Dimensions, Modal, Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

const { height: SCREEN_H } = Dimensions.get("window");

interface Props {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: string;
}

export function BottomSheet({ isVisible, onClose, children, height = "60%" }: Props) {
  const { colors } = useTheme();
  const h = (parseFloat(height) / 100) * SCREEN_H;

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.container}>
        <Pressable onPress={onClose} style={[styles.backdrop, { backgroundColor: colors.overlay }]} />
        <View style={[styles.sheet, { backgroundColor: colors.card, height: h }]}>
          <View style={styles.handleWrap}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  handleWrap: { alignItems: "center", paddingTop: 10, paddingBottom: 6 },
  handle: { width: 36, height: 4, borderRadius: 2 },
});
