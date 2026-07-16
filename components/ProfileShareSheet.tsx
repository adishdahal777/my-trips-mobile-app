import Ionicons from "react-native-vector-icons/Ionicons";
import Clipboard from "@react-native-clipboard/clipboard";
import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { getProfileDeepLink, shareProfile } from "../utils/shareProfile";
import { SkeletonImage } from "./SkeletonImage";

interface Props {
  visible: boolean;
  onClose: () => void;
  userId: string;
  name: string;
  avatar: string;
}

export function ProfileShareSheet({ visible, onClose, userId, name, avatar }: Props) {
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);

  const deepLink = getProfileDeepLink(userId);

  const handleCopyLink = () => {
    try {
      Clipboard.setString(deepLink);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    await shareProfile(userId, name);
    onClose();
  };

  const shareOptions = [
    { icon: "share-outline" as const, label: "Share via...", color: colors.accent, onPress: handleNativeShare },
    { icon: "copy-outline" as const, label: copied ? "Link Copied!" : "Copy Link", color: "#8B5CF6", onPress: handleCopyLink },
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

        <View style={[styles.preview, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SkeletonImage source={{ uri: avatar }} style={styles.previewAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.previewName, { color: colors.text }]} numberOfLines={1}>{name}</Text>
            <Text style={[styles.previewSub, { color: colors.textMuted }]}>My Trips profile</Text>
          </View>
        </View>

        <Pressable onPress={handleCopyLink} style={[styles.linkBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="link" size={16} color={colors.textMuted} />
          <Text style={[styles.linkText, { color: colors.textSecondary }]} numberOfLines={1}>{deepLink}</Text>
          <View style={[styles.copyBadge, { backgroundColor: copied ? "#10B981" : colors.accentLight }]}>
            <Ionicons name={copied ? "checkmark" : "copy-outline"} size={14} color={copied ? "#FFF" : colors.accent} />
          </View>
        </Pressable>

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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { borderTopLeftRadius: 12, borderTopRightRadius: 12, paddingHorizontal: 24, paddingBottom: 40 },
  handle: { alignItems: "center", paddingVertical: 12 },
  handleBar: { width: 40, height: 4, borderRadius: 2 },
  preview: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 8, borderWidth: 1, marginTop: 8, marginBottom: 16 },
  previewAvatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  previewName: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  previewSub: { fontSize: 12 },
  linkBox: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 24, gap: 8 },
  linkText: { flex: 1, fontSize: 12 },
  copyBadge: { width: 30, height: 30, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  optionsRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 8 },
  optionItem: { alignItems: "center", width: 72 },
  optionIcon: { width: 56, height: 56, borderRadius: 8, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  optionLabel: { fontSize: 11, fontWeight: "600", textAlign: "center" },
});
