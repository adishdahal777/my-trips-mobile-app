import Ionicons from "react-native-vector-icons/Ionicons";
import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

interface FABProps {
  onPressItem: (type: string) => void;
}

export function FloatingActionButton({ onPressItem }: FABProps) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const ACTIONS = [
    { id: "trip", label: "New Trip", icon: "briefcase-outline" as const, color: colors.accent },
    { id: "expense", label: "Add Expense", icon: "wallet-outline" as const, color: colors.warning },
    { id: "note", label: "Quick Note", icon: "document-text-outline" as const, color: colors.success },
    { id: "photo", label: "Upload Photo", icon: "camera-outline" as const, color: colors.danger },
  ];

  return (
    <>
      <View style={[styles.fabWrap, { bottom: insets.bottom > 0 ? 80 : 40 }]}>
        <Pressable
          onLongPress={() => setOpen(true)}
          onPress={() => setOpen(!open)}
          style={[styles.fab, { backgroundColor: colors.coral, shadowColor: colors.coral }]}
        >
          <Ionicons name={open ? "close" : "add"} size={28} color="#FFFFFF" />
        </Pressable>
      </View>

      <Modal visible={open} transparent animationType="fade">
        <Pressable style={[styles.modalBg, { backgroundColor: colors.overlay }]} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, { backgroundColor: colors.card }]}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              {ACTIONS.map((action) => (
                <Pressable
                  key={action.id}
                  onPress={() => {
                    setOpen(false);
                    onPressItem(action.id);
                  }}
                  style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={[styles.actionIconWrap, { backgroundColor: action.color + "18" }]}>
                    <Ionicons name={action.icon} size={20} color={action.color} />
                  </View>
                  <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fabWrap: { position: "absolute", right: 20, zIndex: 50 },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  modalBg: { flex: 1, justifyContent: "flex-end", paddingHorizontal: 20, paddingBottom: 100 },
  sheet: { borderRadius: 24, padding: 24, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 20, elevation: 20 },
  sheetTitle: { fontSize: 18, fontFamily: "Inter-Bold", textAlign: "center", marginBottom: 20 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  actionCard: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  actionIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  actionLabel: { fontSize: 12, fontFamily: "Inter-Bold" },
});
