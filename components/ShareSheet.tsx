import Ionicons from "react-native-vector-icons/Ionicons";
import Clipboard from "@react-native-clipboard/clipboard";
import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View, Animated } from "react-native";
import { useTheme } from "../context/ThemeContext";
import type { Trip } from "../data/mockData";
import { getTripDeepLink, shareTrip } from "../utils/shareTrip";

interface Props {
  visible: boolean;
  onClose: () => void;
  trip: Trip;
}

export function ShareSheet({ visible, onClose, trip }: Props) {
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);

  const deepLink = getTripDeepLink(trip.id);
  const user = trip.user || { name: "Traveler" };

  const handleCopyLink = async () => {
    try {
      Clipboard.setString(deepLink);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    await shareTrip(trip);
    onClose();
  };

  const shareOptions = [
    { icon: "share-outline" as const, label: "Share via...", color: colors.accent, onPress: handleNativeShare },
    { icon: "copy-outline" as const, label: copied ? "Link Copied!" : "Copy Link", color: "#8B5CF6", onPress: handleCopyLink },
    { icon: "chatbubble-outline" as const, label: "Message", color: "#10B981", onPress: handleNativeShare },
    { icon: "logo-whatsapp" as const, label: "WhatsApp", color: "#25D366", onPress: handleNativeShare },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View />
      </Pressable>
      <View style={[styles.sheet, { backgroundColor: colors.card }]}>
        <View style={styles.handle}>
          <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
        </View>

        {/* Trip Preview */}
        <View style={[styles.tripPreview, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.tripPreviewLeft}>
            <Text style={styles.tripEmoji}>{trip.flag}</Text>
          </View>
          <View style={styles.tripPreviewInfo}>
            <Text style={[styles.tripPreviewName, { color: colors.text }]} numberOfLines={1}>{trip.name}</Text>
            <Text style={[styles.tripPreviewDest, { color: colors.textMuted }]}>{trip.destination} · by {user.name}</Text>
          </View>
        </View>

        {/* Link Preview */}
        <Pressable onPress={handleCopyLink} style={[styles.linkBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="link" size={16} color={colors.textMuted} />
          <Text style={[styles.linkText, { color: colors.textSecondary }]} numberOfLines={1}>
            {deepLink}
          </Text>
          <View style={[styles.copyBadge, { backgroundColor: copied ? "#10B981" : colors.accentLight }]}>
            <Ionicons name={copied ? "checkmark" : "copy-outline"} size={14} color={copied ? "#FFF" : colors.accent} />
          </View>
        </Pressable>

        {/* Share Options */}
        <View style={styles.optionsRow}>
          {shareOptions.map((opt) => (
            <Pressable key={opt.label} onPress={opt.onPress} style={styles.optionItem}>
              <View style={[styles.optionIcon, { backgroundColor: opt.color + "15" }]}>
                <Ionicons name={opt.icon} size={24} color={opt.color} />
              </View>
              <Text style={[styles.optionLabel, { color: colors.textSecondary }]} numberOfLines={1}>{opt.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Info */}
        <View style={[styles.infoRow, { borderTopColor: colors.borderLight }]}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
          <Text style={[styles.infoText, { color: colors.textMuted }]}>
            Anyone with this link can view the public details of this trip
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { borderTopLeftRadius: 12, borderTopRightRadius: 12, paddingHorizontal: 24, paddingBottom: 40 },
  handle: { alignItems: "center", paddingVertical: 12 },
  handleBar: { width: 40, height: 4, borderRadius: 2 },

  // Trip Preview
  tripPreview: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 8, borderWidth: 1, marginTop: 8, marginBottom: 16 },
  tripPreviewLeft: { width: 44, height: 44, borderRadius: 6, backgroundColor: "rgba(0,0,0,0.05)", alignItems: "center", justifyContent: "center", marginRight: 12 },
  tripEmoji: { fontSize: 22 },
  tripPreviewInfo: { flex: 1 },
  tripPreviewName: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  tripPreviewDest: { fontSize: 12 },

  // Link
  linkBox: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 24, gap: 8 },
  linkText: { flex: 1, fontSize: 12 },
  copyBadge: { width: 30, height: 30, borderRadius: 6, alignItems: "center", justifyContent: "center" },

  // Options
  optionsRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 24 },
  optionItem: { alignItems: "center", width: 72 },
  optionIcon: { width: 56, height: 56, borderRadius: 8, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  optionLabel: { fontSize: 11, fontWeight: "600", textAlign: "center" },

  // Info
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 16, borderTopWidth: 1 },
  infoText: { flex: 1, fontSize: 11, lineHeight: 16 },
});
