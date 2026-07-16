import { Pressable, StyleSheet, Text, View } from "react-native";
import { SkeletonImage } from "./SkeletonImage";
import { useTheme } from "../context/ThemeContext";
import type { Destination } from "../utils/destinationRecommend";

export function DestinationCard({ destination, onPress }: { destination: Destination; onPress?: () => void }) {
  const { colors } = useTheme();

  return (
    <Pressable onPress={onPress} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <SkeletonImage source={{ uri: destination.coverImage }} style={styles.image} />
      <View style={styles.overlay} />
      <View style={styles.body}>
        <Text style={styles.flag}>{destination.flag}</Text>
        <Text style={styles.name} numberOfLines={1}>{destination.name}</Text>
        <Text style={styles.count}>{destination.tripCount.toLocaleString()} trips</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: 130, height: 150, borderRadius: 8, borderWidth: 1, overflow: "hidden", marginRight: 12 },
  image: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.25)" },
  body: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 10 },
  flag: { fontSize: 16, marginBottom: 2 },
  name: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  count: { color: "rgba(255,255,255,0.8)", fontSize: 10, marginTop: 1 },
});
