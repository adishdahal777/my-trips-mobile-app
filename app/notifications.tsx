import Ionicons from "react-native-vector-icons/Ionicons";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../components/ScreenHeader";
import { SkeletonImage } from "../components/SkeletonImage";
import { useNotifications } from "../context/NotificationContext";
import { useTheme } from "../context/ThemeContext";
import { apiFetch } from "../services/api";
import { router } from "../utils/navigation";
import { timeAgo } from "../utils/timeAgo";

interface NotificationItem {
  id: string;
  type: string;
  status: "unread" | "read";
  message: string;
  actor: { id: string; name: string; avatar: string } | null;
  trip: { id: string; name: string } | null;
  createdAt: string;
}

const ICONS: Record<string, string> = {
  new_follower: "person-add-outline",
  trip_liked: "heart-outline",
  trip_commented: "chatbubble-outline",
  followed_user_trip: "map-outline",
  test: "notifications-outline",
};

export default function Notifications() {
  const { colors } = useTheme();
  const { refresh: refreshUnreadCount, decrement: decrementUnreadCount, reset: resetUnreadCount } = useNotifications();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch("/notifications");
      setItems(res.data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    refreshUnreadCount();
  }, [load, refreshUnreadCount]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, status: "read" })));
    resetUnreadCount();
    try {
      await apiFetch("/notifications/read-all", { method: "POST" });
    } catch {
      // best-effort
    }
  };

  const handlePress = async (item: NotificationItem) => {
    if (item.status === "unread") {
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, status: "read" } : n)));
      decrementUnreadCount();
      apiFetch(`/notifications/${item.id}/read`, { method: "POST" }).catch(() => {});
    }

    if (item.type === "new_follower" && item.actor) {
      router.push("UserProfile", { userId: item.actor.id });
    } else if (item.trip) {
      router.push("PublicTrip", { id: item.trip.id });
    }
  };

  const hasUnread = items.some((n) => n.status === "unread");

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Notifications"
        showBack
        rightIcon="settings-outline"
        onRightPress={() => router.push("NotificationSettings")}
      />

      {hasUnread && (
        <Pressable onPress={markAllRead} style={styles.markAllRow}>
          <Text style={[styles.markAllText, { color: colors.accent }]}>Mark all as read</Text>
        </Pressable>
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handlePress(item)}
            style={[
              styles.row,
              {
                backgroundColor: item.status === "unread" ? colors.accentLight : colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            {item.actor ? (
              <SkeletonImage source={{ uri: item.actor.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.iconAvatar, { backgroundColor: colors.surface }]}>
                <Ionicons name={(ICONS[item.type] ?? "notifications-outline") as any} size={18} color={colors.accent} />
              </View>
            )}
            <View style={styles.middle}>
              <Text style={[styles.message, { color: colors.text }]}>{item.message}</Text>
              <Text style={[styles.time, { color: colors.textMuted }]}>{timeAgo(item.createdAt)}</Text>
            </View>
            {item.status === "unread" && <View style={[styles.dot, { backgroundColor: colors.accent }]} />}
          </Pressable>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No notifications yet</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  markAllRow: { alignItems: "flex-end", paddingHorizontal: 20, paddingTop: 12 },
  markAllText: { fontSize: 13, fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  iconAvatar: { alignItems: "center", justifyContent: "center" },
  middle: { flex: 1 },
  message: { fontSize: 13, lineHeight: 18 },
  time: { fontSize: 11, marginTop: 3 },
  dot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 13, marginTop: 8 },
});
