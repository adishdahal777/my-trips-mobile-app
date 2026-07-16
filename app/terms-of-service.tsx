import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../components/ScreenHeader";
import { useTheme } from "../context/ThemeContext";

const SECTIONS = [
  {
    title: "1. Using MyTrips",
    body: "MyTrips lets you plan trips, log expenses, capture photos and notes, and optionally share public trips with other travelers. You must be at least 13 years old to use the app.",
  },
  {
    title: "2. Your Content",
    body: "You own everything you create in the app. By marking a trip public, you grant other users permission to view the fields you've chosen to share (photos, notes, expenses).",
  },
  {
    title: "3. Acceptable Use",
    body: "Don't post content that is illegal, abusive, or infringes on others' rights. We may remove content or suspend accounts that violate these terms.",
  },
  {
    title: "4. Availability",
    body: "We aim to keep MyTrips available at all times but don't guarantee uninterrupted service. Features may change or be removed as the app evolves.",
  },
  {
    title: "5. Liability",
    body: "MyTrips is provided as-is. We're not liable for travel decisions made using data logged in the app, or for third-party content shared by other users.",
  },
  {
    title: "6. Changes",
    body: "We may update these terms occasionally. Continued use of the app after a change means you accept the updated terms.",
  },
];

export default function TermsOfService() {
  const { colors } = useTheme();

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Terms of Service" showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {SECTIONS.map((s) => (
          <View key={s.title} style={styles.section}>
            <Text style={[styles.title, { color: colors.text }]}>{s.title}</Text>
            <Text style={[styles.body, { color: colors.textSecondary }]}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  section: { marginBottom: 22 },
  title: { fontSize: 15, fontWeight: "700", marginBottom: 6 },
  body: { fontSize: 13, lineHeight: 20 },
});
