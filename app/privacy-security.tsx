import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../components/ScreenHeader";
import { useTheme } from "../context/ThemeContext";

const SECTIONS = [
  {
    title: "Data We Collect",
    body: "We store the trips, routes, expenses, photos, and notes you create, along with basic account info (name, email, avatar). Location data you add to a trip is only used to render your route and stats.",
  },
  {
    title: "Who Can See Your Data",
    body: "Trips are private by default. When you mark a trip public, only the fields you explicitly enable (photos, notes, expenses) become visible to other users — everything else stays private, even on a public trip.",
  },
  {
    title: "Your Rights",
    body: "You can edit or delete any trip, photo, note, or expense at any time from within the app. Deleting your account removes all associated data from our servers.",
  },
  {
    title: "Account Deletion",
    body: "To permanently delete your account and all data, use the Report a Bug form and mention \"account deletion\" — our team will process it within a few days.",
  },
  {
    title: "Security Practices",
    body: "Passwords are never stored — we use one-time email codes for login. All traffic between the app and our servers is encrypted over HTTPS.",
  },
];

export default function PrivacySecurity() {
  const { colors } = useTheme();

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Privacy & Security" showBack />
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
