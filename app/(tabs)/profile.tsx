import Ionicons from "react-native-vector-icons/Ionicons";
import { launchImageLibrary } from "react-native-image-picker";
import React from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "../../utils/navigation";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useTrips } from "../../context/TripContext";
import { calculateUserStats } from "../../utils/calculateStats";
import { apiFetch, uploadAvatar } from "../../services/api";

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const { trips } = useTrips();
  const stats = React.useMemo(() => calculateUserStats(trips), [trips]);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const [followCounts, setFollowCounts] = React.useState({ followers: 0, following: 0 });

  React.useEffect(() => {
    if (!user) return;
    apiFetch(`/users/${user.id}`)
      .then((res) => setFollowCounts({ followers: res.data?.followersCount ?? 0, following: res.data?.followingCount ?? 0 }))
      .catch(() => {});
  }, [user?.id]);

  if (!user) return null;

  const pickAvatar = () => {
    launchImageLibrary({ mediaType: "photo", quality: 0.8 }, async (r) => {
      if (r.didCancel || !r.assets?.[0]?.uri) return;
      setUploadingAvatar(true);
      try {
        const url = await uploadAvatar(r.assets[0].uri);
        console.log("[profile] avatar uploaded ->", url);
        await updateUser({ avatar: url });
      } catch (e: any) {
        Alert.alert("Couldn't update photo", e?.message ?? "Please try again.");
      } finally {
        setUploadingAvatar(false);
      }
    });
  };

  const Row = ({ icon, label, right, onPress, isLast }: any) => (
    <Pressable
      onPress={onPress}
      style={[styles.row, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
    >
      <View style={[styles.rowIcon, { backgroundColor: colors.surface }]}>
        <Ionicons name={icon} size={16} color={colors.textSecondary} />
      </View>
      <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      {right || <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />}
    </Pressable>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.sectionWrap}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: colors.surface }]}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: user.avatar }} style={[styles.avatar, { borderColor: colors.surface }]} />
            <Pressable onPress={pickAvatar} disabled={uploadingAvatar} style={[styles.editBtn, { backgroundColor: colors.accent }]}>
              <Ionicons name={uploadingAvatar ? "hourglass-outline" : "pencil"} size={12} color="white" />
            </Pressable>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
          <Text style={[styles.userEmail, { color: colors.textMuted }]}>{user.email}</Text>
          {!!user.bio && <Text style={[styles.userBio, { color: colors.textSecondary }]}>{user.bio}</Text>}

          <View style={styles.statsRow}>
            {[
              { val: stats.totalTrips, label: "Trips" },
              { val: stats.countriesVisited, label: "Countries" },
              { val: `${(stats.totalKm / 1000).toFixed(1)}k`, label: "KM" },
            ].map((s, i) => (
              <View key={i} style={[styles.statItem, i < 2 && { borderRightWidth: 1, borderRightColor: colors.borderLight }]}>
                <Text style={[styles.statValue, { color: colors.text }]}>{s.val}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.followRow}>
            <Pressable onPress={() => router.push("FollowList", { userId: user.id, mode: "followers" })} style={styles.followItem}>
              <Text style={[styles.followValue, { color: colors.text }]}>{followCounts.followers}</Text>
              <Text style={[styles.followLabel, { color: colors.textMuted }]}>Followers</Text>
            </Pressable>
            <Pressable onPress={() => router.push("FollowList", { userId: user.id, mode: "following" })} style={styles.followItem}>
              <Text style={[styles.followValue, { color: colors.text }]}>{followCounts.following}</Text>
              <Text style={[styles.followLabel, { color: colors.textMuted }]}>Following</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.settingsArea}>
          <Section title="Account Settings">
            <Row icon="person-outline" label="Personal Information" onPress={() => router.push("ProfileEdit")} />
            <Row icon="notifications-outline" label="Notification Settings" onPress={() => router.push("NotificationSettings")} />
            <Row icon="shield-checkmark-outline" label="Privacy & Security" isLast />
          </Section>

          <Section title="Preferences">
            <Row
              icon={isDark ? "moon" : "sunny-outline"}
              label="Dark Mode"
              right={
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor="#fff"
                />
              }
            />
            <Row icon="wallet-outline" label="Payment Methods" />
            <Row
              icon="globe-outline"
              label="Language"
              right={<Text style={[styles.rowRightText, { color: colors.textMuted }]}>English</Text>}
              isLast
            />
          </Section>

          <Section title="Help & Support">
            <Row icon="star-outline" label="Rate MyTrips" onPress={() => router.push("RateApp")} />
            <Row icon="help-circle-outline" label="Help Center" />
            <Row icon="chatbubble-outline" label="Contact Us" />
            <Row icon="document-text-outline" label="Terms of Service" isLast />
          </Section>

          <Pressable
            onPress={async () => {
              await logout();
            }}
            style={[styles.logoutBtn, { backgroundColor: colors.card, borderColor: colors.dangerLight }]}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.danger} />
            <Text style={[styles.logoutText, { color: colors.danger }]}>Log Out</Text>
          </Pressable>

          <Text style={[styles.version, { color: colors.textMuted }]}>Version 2.4.0 (2026)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  profileHeader: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    marginBottom: 24,
  },
  avatarWrap: { position: "relative", marginBottom: 14 },
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 4 },
  editBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  userName: { fontSize: 22, fontWeight: "700", marginBottom: 2 },
  userEmail: { fontSize: 13, marginBottom: 4 },
  userBio: { fontSize: 13, textAlign: "center", marginBottom: 16, paddingHorizontal: 12 },
  followRow: { flexDirection: "row", marginTop: 16, gap: 24 },
  followItem: { alignItems: "center" },
  followValue: { fontSize: 16, fontWeight: "700" },
  followLabel: { fontSize: 11, marginTop: 1 },
  statsRow: { flexDirection: "row", width: "100%", marginTop: 16 },
  statItem: { flex: 1, alignItems: "center", paddingVertical: 4 },
  statValue: { fontSize: 20, fontWeight: "700" },
  statLabel: { fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 },
  settingsArea: { paddingHorizontal: 20, paddingBottom: 130 },
  sectionWrap: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: { borderRadius: 8, paddingHorizontal: 14, borderWidth: 1 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14 },
  rowIcon: { width: 30, height: 30, borderRadius: 6, alignItems: "center", justifyContent: "center", marginRight: 12 },
  rowLabel: { flex: 1, fontSize: 14 },
  rowRightText: { fontSize: 13 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  logoutText: { fontSize: 14, fontWeight: "700", marginLeft: 8 },
  version: { textAlign: "center", marginTop: 24, fontSize: 11 },
});
