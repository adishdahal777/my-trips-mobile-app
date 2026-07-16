import Ionicons from "react-native-vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import { FlatList, Image, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import type { Comment } from "../data/mockData";
import { apiFetch } from "../services/api";
import { timeAgo } from "../utils/timeAgo";

interface Props {
  visible: boolean;
  onClose: () => void;
  tripId: string;
  onCountChange: (count: number) => void;
}

export function CommentSheet({ visible, onClose, tripId, onCountChange }: Props) {
  const { colors } = useTheme();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    apiFetch(`/trips/${tripId}/comments`)
      .then((res) => setComments(res.data))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [visible, tripId]);

  const send = async () => {
    const text = body.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const res = await apiFetch(`/trips/${tripId}/comments`, { method: "POST", body: { body: text } });
      setComments((prev) => [res.comment, ...prev]);
      onCountChange(res.comments);
      setBody("");
    } catch {
      // best-effort
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View />
      </Pressable>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={[styles.sheet, { backgroundColor: colors.card }]}>
        <View style={styles.handle}>
          <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Comments</Text>

        <FlatList
          data={comments}
          keyExtractor={(c) => c.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
              <View style={styles.rowInfo}>
                <Text style={[styles.rowName, { color: colors.text }]}>{item.user.name}</Text>
                <Text style={[styles.rowBody, { color: colors.textSecondary }]}>{item.body}</Text>
                <Text style={[styles.rowTime, { color: colors.textMuted }]}>{timeAgo(item.createdAt)}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <Ionicons name="chatbubble-outline" size={32} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>Be the first to comment</Text>
              </View>
            ) : null
          }
        />

        <View style={[styles.composer, { borderTopColor: colors.borderLight }]}>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Add a comment..."
            placeholderTextColor={colors.inputPlaceholder}
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            multiline
          />
          <Pressable onPress={send} disabled={sending || !body.trim()} style={[styles.sendBtn, { backgroundColor: colors.accent, opacity: sending || !body.trim() ? 0.5 : 1 }]}>
            <Ionicons name="send" size={16} color="#FFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { height: "75%", borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  handle: { alignItems: "center", paddingVertical: 12 },
  handleBar: { width: 40, height: 4, borderRadius: 2 },
  title: { fontSize: 15, fontWeight: "700", textAlign: "center", marginBottom: 12 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 12 },
  row: { flexDirection: "row", marginBottom: 16 },
  avatar: { width: 34, height: 34, borderRadius: 17, marginRight: 10 },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 13, fontWeight: "700" },
  rowBody: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  rowTime: { fontSize: 10, marginTop: 4 },
  empty: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 12, marginTop: 8 },
  composer: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, gap: 10 },
  input: { flex: 1, fontSize: 14, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1, maxHeight: 100 },
  sendBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
});
