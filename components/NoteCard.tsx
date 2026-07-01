import Ionicons from "react-native-vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface Props {
  note: {
    id: string;
    title: string;
    body: string;
    mood: string;
    date: string;
    color: string;
    isPrivate?: boolean;
  };
  onPress?: () => void;
}

export function NoteCard({ note, onPress }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable onPress={onPress} style={[styles.card, { backgroundColor: note.color, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.mood}>{note.mood}</Text>
        {note.isPrivate && <Ionicons name="lock-closed" size={14} color="rgba(15,23,42,0.4)" />}
      </View>
      <Text style={styles.title} numberOfLines={2}>{note.title}</Text>
      <Text style={styles.body} numberOfLines={3}>{note.body}</Text>
      <Text style={styles.date}>
        {new Date(note.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, padding: 14, borderWidth: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  mood: { fontSize: 20 },
  title: { fontSize: 13, fontFamily: "Inter-Bold", color: "#0F172A", marginBottom: 4 },
  body: { fontSize: 11, fontFamily: "Inter-Medium", color: "rgba(15,23,42,0.6)", marginBottom: 8, lineHeight: 16 },
  date: { fontSize: 9, fontFamily: "Inter-Medium", color: "rgba(15,23,42,0.4)" },
});
