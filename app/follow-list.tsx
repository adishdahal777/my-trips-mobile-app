import Ionicons from "react-native-vector-icons/Ionicons";
import { router } from "../utils/navigation";
import { useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../components/ScreenHeader";
import { useTheme } from "../context/ThemeContext";
import { apiFetch } from "../services/api";

interface PublicUser {
  id: string; name: string; avatar: string; bio?: string;
}

export default function FollowList() {
  const { colors } = useTheme();
  const route = useRoute<any>();
  const userId = route.params?.userId as string;
  const mode = route.params?.mode as "followers" | "following";

  const [users, setUsers] = useState<PublicUser[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async (p: number) => {
    const res = await apiFetch(`/users/${userId}/${mode}?page=${p}`);
    setUsers((prev) => (p === 1 ? res.data : [...prev, ...res.data]));
    setLastPage(res.meta.lastPage);
    setPage(p);
  };

  useEffect(() => {
    setLoading(true);
    load(1).finally(() => setLoading(false));
  }, [userId, mode]);

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={mode === "followers" ? "Followers" : "Following"} showBack />
      <FlatList
        data={users}
        keyExtractor={(u) => u.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push("UserProfile", { userId: item.id })} style={[styles.row, { borderBottomColor: colors.borderLight }]}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.info}>
              <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
              {!!item.bio && <Text style={[styles.bio, { color: colors.textMuted }]} numberOfLines={1}>{item.bio}</Text>}
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                {mode === "followers" ? "No followers yet" : "Not following anyone yet"}
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          page < lastPage ? (
            <Pressable onPress={() => load(page + 1)} style={[styles.loadMore, { borderColor: colors.border }]}>
              <Text style={[styles.loadMoreText, { color: colors.accent }]}>Load more</Text>
            </Pressable>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingBottom: 40 },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: "600" },
  bio: { fontSize: 12, marginTop: 1 },
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 12, marginTop: 8 },
  loadMore: { margin: 20, paddingVertical: 12, borderRadius: 8, borderWidth: 1, alignItems: "center" },
  loadMoreText: { fontSize: 13, fontWeight: "600" },
});
