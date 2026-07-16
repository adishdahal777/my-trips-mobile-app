import React, { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../components/ScreenHeader";
import { useTheme } from "../context/ThemeContext";
import { apiFetch } from "../services/api";

interface Prefs {
  newFollower: boolean;
  tripLiked: boolean;
  tripCommented: boolean;
  followedUserTrip: boolean;
}

const ROWS: { key: keyof Prefs; label: string; desc: string }[] = [
  { key: "newFollower", label: "New Followers", desc: "When someone starts following you" },
  { key: "tripLiked", label: "Likes", desc: "When someone likes one of your trips" },
  { key: "tripCommented", label: "Comments", desc: "When someone comments on your trip" },
  { key: "followedUserTrip", label: "New Trips", desc: "When someone you follow shares a new trip" },
];

export default function NotificationSettings() {
  const { colors } = useTheme();
  const [prefs, setPrefs] = useState<Prefs | null>(null);

  useEffect(() => {
    apiFetch("/notification-settings")
      .then((res) => setPrefs(res.data))
      .catch(() => setPrefs({ newFollower: true, tripLiked: true, tripCommented: true, followedUserTrip: true }));
  }, []);

  const toggle = (key: keyof Prefs) => {
    if (!prefs) return;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    apiFetch("/notification-settings", { method: "PUT", body: { [key]: next[key] } }).catch(() => {
      setPrefs(prefs);
    });
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Notification Settings" showBack />
      <View style={styles.content}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Notify me about</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {ROWS.map((row, i) => (
            <View
              key={row.key}
              style={[styles.row, i < ROWS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: colors.text }]}>{row.label}</Text>
                <Text style={[styles.rowDesc, { color: colors.textMuted }]}>{row.desc}</Text>
              </View>
              <Switch
                value={prefs?.[row.key] ?? true}
                onValueChange={() => toggle(row.key)}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  sectionLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  card: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 16 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14 },
  rowLabel: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  rowDesc: { fontSize: 12 },
});
