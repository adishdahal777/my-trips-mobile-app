import { router } from "../utils/navigation";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../components/ScreenHeader";
import { GradientButton } from "../components/GradientButton";
import { useTheme } from "../context/ThemeContext";
import { apiFetch } from "../services/api";

export default function SuggestDestination() {
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [flag, setFlag] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!name.trim() || !country.trim()) {
      Alert.alert("Almost there", "Destination name and country are required.");
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch("/destinations", {
        method: "POST",
        body: { name: name.trim(), country: country.trim(), flag: flag.trim() || undefined, cover_image: coverImage.trim() || undefined },
      });
      Alert.alert("Thanks!", "Your destination was submitted for review.", [{ text: "OK", onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert("Couldn't submit", e?.message ?? "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Suggest a Destination" showBack />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex1}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            Know a great place other travelers should explore? Suggest it here — an admin will review it before it appears on the site.
          </Text>

          <Text style={[styles.label, { color: colors.textMuted }]}>Destination Name *</Text>
          <TextInput value={name} onChangeText={setName} placeholder="e.g. Kyoto" placeholderTextColor={colors.inputPlaceholder} style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]} />

          <Text style={[styles.label, { color: colors.textMuted }]}>Country *</Text>
          <TextInput value={country} onChangeText={setCountry} placeholder="e.g. Japan" placeholderTextColor={colors.inputPlaceholder} style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]} />

          <Text style={[styles.label, { color: colors.textMuted }]}>Flag Emoji</Text>
          <TextInput value={flag} onChangeText={setFlag} placeholder="e.g. 🇯🇵" placeholderTextColor={colors.inputPlaceholder} style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]} />

          <Text style={[styles.label, { color: colors.textMuted }]}>Cover Image URL</Text>
          <TextInput value={coverImage} onChangeText={setCoverImage} placeholder="https://..." placeholderTextColor={colors.inputPlaceholder} autoCapitalize="none" style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]} />

          <GradientButton title={submitting ? "Submitting…" : "Submit for Review"} onPress={submit} disabled={submitting} style={styles.submitBtn} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex1: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  hint: { fontSize: 13, lineHeight: 19, marginBottom: 20 },
  label: { fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 },
  input: { fontSize: 15, padding: 14, borderRadius: 8, borderWidth: 1, marginBottom: 16 },
  submitBtn: { marginTop: 8 },
});
