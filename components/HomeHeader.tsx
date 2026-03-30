import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface HomeHeaderProps {
  user: { name: string; avatar: string };
  onSearchPress: () => void;
  notifCount?: number;
}

export function HomeHeader({ user, onSearchPress, notifCount = 0 }: HomeHeaderProps) {
  const { colors } = useTheme();
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const firstName = user.name.split(" ")[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topRow}>
        <Pressable onPress={() => router.push("/(tabs)/profile")} style={styles.avatarRow}>
          <Image source={{ uri: user.avatar }} style={[styles.avatar, { borderColor: colors.border }]} />
          <View style={styles.greetingWrap}>
            <Text style={[styles.greetingLabel, { color: colors.textMuted }]}>{greeting}</Text>
            <Text style={[styles.userName, { color: colors.text }]}>{firstName}</Text>
          </View>
        </Pressable>

        <View style={styles.iconRow}>
          <Pressable onPress={onSearchPress} style={[styles.iconBtn, { backgroundColor: colors.surface }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
          </Pressable>
          <Pressable style={[styles.iconBtn, { backgroundColor: colors.surface }]}>
            <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
            {notifCount > 0 && <View style={styles.badge} />}
          </Pressable>
        </View>
      </View>

      <View style={[styles.dateChip, { backgroundColor: colors.surface }]}>
        <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
        <Text style={[styles.dateText, { color: colors.textMuted }]}>{formattedDate}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  avatarRow: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 1 },
  greetingWrap: { marginLeft: 12 },
  greetingLabel: { fontSize: 11, fontFamily: "Inter-Medium", textTransform: "uppercase", letterSpacing: 1 },
  userName: { fontSize: 18, fontFamily: "Inter-Bold", marginTop: 1 },
  iconRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: 10, right: 10, width: 7, height: 7, borderRadius: 4, backgroundColor: "#EF4444", borderWidth: 1.5, borderColor: "#FFFFFF" },
  dateChip: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  dateText: { fontSize: 11, fontFamily: "Inter-Medium", marginLeft: 6 },
});
