import Ionicons from "react-native-vector-icons/Ionicons";
import { router } from "../utils/navigation";
import React, { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../components/ScreenHeader";
import { GradientButton } from "../components/GradientButton";
import { useTheme } from "../context/ThemeContext";
import { apiFetch } from "../services/api";

export default function RateApp() {
  const { colors } = useTheme();
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch("/ratings/mine")
      .then((res) => {
        if (res.data) {
          setStars(res.data.stars);
          setComment(res.data.comment ?? "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    if (stars === 0) {
      Alert.alert("Pick a rating", "Tap a star to rate MyTrips.");
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch("/ratings", { method: "POST", body: { stars, comment: comment.trim() || undefined } });
      Alert.alert("Thank you!", "Your rating helps other travelers discover MyTrips.", [{ text: "OK", onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert("Couldn't submit", e?.message ?? "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Rate MyTrips" showBack />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex1}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: colors.text }]}>How's your experience?</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Your review may be featured on our website.</Text>

          {!loading && (
            <>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Pressable key={n} onPress={() => setStars(n)} hitSlop={8}>
                    <Ionicons name={n <= stars ? "star" : "star-outline"} size={40} color={n <= stars ? "#F59E0B" : colors.textMuted} style={styles.star} />
                  </Pressable>
                ))}
              </View>

              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Tell us what you think (optional)"
                placeholderTextColor={colors.inputPlaceholder}
                multiline
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              />

              <GradientButton title={submitting ? "Submitting…" : "Submit Rating"} onPress={submit} disabled={submitting} style={styles.submitBtn} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex1: { flex: 1 },
  content: { padding: 20, paddingBottom: 60, alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700", marginTop: 8 },
  subtitle: { fontSize: 13, marginTop: 4, marginBottom: 24, textAlign: "center" },
  starsRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  star: {},
  input: { width: "100%", fontSize: 14, padding: 14, borderRadius: 8, borderWidth: 1, minHeight: 100, textAlignVertical: "top", marginBottom: 20 },
  submitBtn: { width: "100%" },
});
