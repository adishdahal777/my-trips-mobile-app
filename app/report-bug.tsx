import Ionicons from "react-native-vector-icons/Ionicons";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GradientButton } from "../components/GradientButton";
import { ScreenHeader } from "../components/ScreenHeader";
import { useTheme } from "../context/ThemeContext";
import { apiFetch } from "../services/api";
import { router } from "../utils/navigation";

export default function ReportBug() {
  const { colors } = useTheme();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Missing info", "Please fill in both a title and a description.");
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch("/bug-reports", { method: "POST", body: { title, description } });
      Alert.alert("Thanks!", "Your report has been sent — we'll look into it.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Couldn't send report", e?.message ?? "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Report a Bug" showBack />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex1}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.introCard, { backgroundColor: colors.accentLight }]}>
            <Ionicons name="bug-outline" size={20} color={colors.accent} />
            <Text style={[styles.introText, { color: colors.text }]}>
              Found something broken or confusing? Describe it below and our team will take a look.
            </Text>
          </View>

          <Text style={[styles.label, { color: colors.textMuted }]}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. App crashes when adding a photo"
            placeholderTextColor={colors.inputPlaceholder}
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          />

          <Text style={[styles.label, { color: colors.textMuted }]}>What happened?</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Steps to reproduce, what you expected, what happened instead..."
            placeholderTextColor={colors.inputPlaceholder}
            multiline
            numberOfLines={6}
            style={[styles.textarea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          />

          <GradientButton
            title={submitting ? "Sending..." : "Send Report"}
            onPress={submit}
            disabled={submitting}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex1: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  introCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 12, marginBottom: 24 },
  introText: { flex: 1, fontSize: 13, lineHeight: 19 },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 8, marginTop: 4 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginBottom: 16 },
  textarea: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginBottom: 24, minHeight: 120, textAlignVertical: "top" },
  submitBtn: { marginTop: 8 },
});
