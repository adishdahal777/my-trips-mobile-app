import Ionicons from "react-native-vector-icons/Ionicons";
import { router } from "../utils/navigation";
import { useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Dimensions, Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OsmMapView } from "../components/OsmMapView";
import { ShareSheet } from "../components/ShareSheet";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import type { Trip } from "../data/mockData";
import { apiFetch } from "../services/api";
import { formatCurrency } from "../utils/formatCurrency";

const { width: SW } = Dimensions.get("window");

export default function PublicTrip() {
  const { colors } = useTheme();
  const { isAuthenticated } = useAuth();
  const route = useRoute<any>();
  const id = route.params?.id as string;

  const [trip, setTrip] = useState<Trip | null | undefined>(undefined);
  const [shareVisible, setShareVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch(`/public-trips/${id}`);
        setTrip(res.data);
      } catch {
        setTrip(null);
      }
    })();
  }, [id]);

  if (trip === undefined) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="hourglass-outline" size={48} color={colors.textMuted} />
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
        <Text style={[styles.notFoundTitle, { color: colors.text }]}>Trip not found</Text>
        <Pressable onPress={() => router.back()} style={[styles.backBtnLarge, { backgroundColor: colors.accent }]}>
          <Text style={styles.backBtnLargeText}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const user = trip.user || { id: "?", name: "Traveler", avatar: "https://i.pravatar.cc/150?img=1" };
  const days = Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000);
  const privacy = trip.privacySettings || { photos: false, notes: false, expenses: false };

  const publicPhotos = privacy.photos ? trip.photos.filter((p) => !p.isPrivate) : [];
  const publicNotes = privacy.notes ? trip.notes.filter((n) => !n.isPrivate) : [];
  const publicExpenses = privacy.expenses ? trip.expenses.filter((e) => !e.isPrivate) : [];

  const stopColor = (c: string) => {
    const map: Record<string, string> = { green: "#22C55E", blue: colors.accent, coral: "#FF6B6B" };
    return map[c] || colors.accent;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <ImageBackground source={{ uri: trip.coverPhoto }} style={styles.hero}>
          <View style={styles.heroOverlay} />
          <SafeAreaView edges={["top"]} style={styles.heroContent}>
            <View style={styles.topNav}>
              <Pressable onPress={() => router.back()} style={styles.navBtn}>
                <Ionicons name="arrow-back" size={22} color="#FFF" />
              </Pressable>
              <Pressable onPress={() => setShareVisible(true)} style={styles.navBtn}>
                <Ionicons name="share-outline" size={20} color="#FFF" />
              </Pressable>
            </View>
            <View style={styles.heroBottom}>
              <View style={styles.heroUserRow}>
                <Image source={{ uri: user.avatar }} style={styles.heroAvatar} />
                <Text style={styles.heroUserName}>{user.name}</Text>
              </View>
              <Text style={styles.heroTitle}>{trip.name}</Text>
              <Text style={styles.heroDest}>{trip.flag} {trip.destination}</Text>
            </View>
          </SafeAreaView>
        </ImageBackground>

        {/* Stats Bar */}
        <View style={[styles.statsBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { icon: "location-outline" as const, val: `${trip.route.length} stops` },
            { icon: "time-outline" as const, val: `${days} days` },
            { icon: "heart" as const, val: `${trip.likes || 0} likes` },
          ].map((s, i) => (
            <View key={i} style={[styles.statItem, i < 2 && { borderRightWidth: 1, borderRightColor: colors.borderLight }]}>
              <Ionicons name={s.icon} size={16} color={colors.accent} />
              <Text style={[styles.statVal, { color: colors.text }]}>{s.val}</Text>
            </View>
          ))}
        </View>

        {/* Description */}
        {trip.description ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About this trip</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>{trip.description}</Text>
          </View>
        ) : null}

        {/* Route Map */}
        {trip.route.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Route</Text>
            <View style={[styles.mapWrap, { borderColor: colors.border }]}>
              <OsmMapView
                style={styles.map}
                strokeColor={colors.accent}
                scrollEnabled={false}
                zoomEnabled={false}
                stops={trip.route.map((s) => ({ id: s.id, lat: s.lat, lng: s.lng, color: s.color, label: s.label }))}
              />
            </View>
            <View style={styles.routeList}>
              {trip.route.map((s, i) => (
                <View key={s.id} style={styles.routeRow}>
                  <View style={styles.routeMarkerCol}>
                    <View style={[styles.routeMarker, { backgroundColor: stopColor(s.color) }]}>
                      <Text style={styles.routeMarkerText}>{s.label}</Text>
                    </View>
                    {i < trip.route.length - 1 && <View style={[styles.routeLine, { backgroundColor: colors.borderLight }]} />}
                  </View>
                  <View style={styles.routeInfo}>
                    <Text style={[styles.routeName, { color: colors.text }]}>{s.name}</Text>
                    <Text style={[styles.routeSub, { color: colors.textMuted }]}>Stop {i + 1}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Public Photos */}
        {publicPhotos.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Photos ({publicPhotos.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoScroll}>
              {publicPhotos.map((p) => (
                <View key={p.id} style={[styles.photoCard, { borderColor: colors.border }]}>
                  <Image source={{ uri: p.url }} style={styles.photoImage} />
                  {p.caption ? (
                    <View style={styles.photoCaptionWrap}>
                      <Text style={styles.photoCaption} numberOfLines={1}>{p.caption}</Text>
                    </View>
                  ) : null}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Public Notes */}
        {publicNotes.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Travel Notes ({publicNotes.length})</Text>
            {publicNotes.map((n) => (
              <View key={n.id} style={[styles.noteCard, { backgroundColor: n.color || colors.card, borderColor: colors.border }]}>
                <View style={styles.noteHeader}>
                  <Text style={styles.noteMood}>{n.mood}</Text>
                  <Text style={[styles.noteTitle, { color: colors.text }]}>{n.title}</Text>
                </View>
                <Text style={[styles.noteBody, { color: colors.textSecondary }]} numberOfLines={3}>{n.body}</Text>
                <Text style={[styles.noteDate, { color: colors.textMuted }]}>
                  {new Date(n.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Public Expenses */}
        {publicExpenses.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Expenses ({publicExpenses.length})</Text>
            <View style={[styles.expenseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {publicExpenses.map((e, i) => (
                <View key={e.id} style={[styles.expenseRow, i < publicExpenses.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}>
                  <View style={[styles.expenseIcon, { backgroundColor: colors.surface }]}>
                    <Text style={{ fontSize: 16 }}>{e.icon}</Text>
                  </View>
                  <View style={styles.expenseMiddle}>
                    <Text style={[styles.expenseDesc, { color: colors.text }]} numberOfLines={1}>{e.description}</Text>
                    <Text style={[styles.expenseCat, { color: colors.textMuted }]}>{e.category}</Text>
                  </View>
                  <Text style={[styles.expenseAmt, { color: colors.text }]}>{formatCurrency(e.amount, trip.currency)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* CTA Banner */}
        {!isAuthenticated && (
          <View style={[styles.ctaBanner, { backgroundColor: colors.accent }]}>
            <Ionicons name="airplane-outline" size={24} color="#FFF" />
            <Text style={styles.ctaTitle}>Inspired? Plan your own trip!</Text>
            <Text style={styles.ctaSub}>Sign up free and start tracking your adventures</Text>
            <Pressable onPress={() => router.push("Auth", { screen: "Register" })} style={styles.ctaBtn}>
              <Text style={[styles.ctaBtnText, { color: colors.accent }]}>Create Free Account</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.accent} />
            </Pressable>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Share Sheet */}
      <ShareSheet visible={shareVisible} onClose={() => setShareVisible(false)} trip={trip} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundTitle: { fontSize: 18, fontFamily: "Inter-Bold", marginTop: 12, marginBottom: 20 },
  backBtnLarge: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
  backBtnLargeText: { color: "#FFF", fontSize: 14, fontFamily: "Inter-Bold" },

  // Hero
  hero: { height: 320, justifyContent: "flex-end" },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  heroContent: { flex: 1, padding: 20, justifyContent: "space-between" },
  topNav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  navBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  heroBottom: { marginBottom: 24 },
  heroUserRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  heroAvatar: { width: 28, height: 28, borderRadius: 14, marginRight: 8, borderWidth: 2, borderColor: "#FFF" },
  heroUserName: { color: "rgba(255,255,255,0.9)", fontSize: 13, fontFamily: "Inter-Bold" },
  heroTitle: { color: "#FFF", fontSize: 28, fontFamily: "Inter-Bold", marginBottom: 4 },
  heroDest: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontFamily: "Inter-Medium" },

  // Stats
  statsBar: { flexDirection: "row", marginHorizontal: 20, marginTop: -24, borderRadius: 16, borderWidth: 1, paddingVertical: 14 },
  statItem: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  statVal: { fontSize: 13, fontFamily: "Inter-Bold" },

  // Sections
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter-Bold", marginBottom: 12 },
  description: { fontSize: 14, fontFamily: "Inter-Medium", lineHeight: 22 },

  // Map
  mapWrap: { height: 200, borderRadius: 16, overflow: "hidden", borderWidth: 1, marginBottom: 16 },
  map: { flex: 1 },

  // Route
  routeList: { marginTop: 4 },
  routeRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 2 },
  routeMarkerCol: { alignItems: "center", width: 32, marginRight: 12 },
  routeMarker: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  routeMarkerText: { color: "#FFF", fontSize: 11, fontFamily: "Inter-Bold" },
  routeLine: { width: 2, height: 24 },
  routeInfo: { flex: 1, paddingVertical: 4 },
  routeName: { fontSize: 14, fontFamily: "Inter-Bold", marginBottom: 2 },
  routeSub: { fontSize: 11, fontFamily: "Inter-Medium" },

  // Photos
  photoScroll: { paddingRight: 20 },
  photoCard: { width: 180, height: 140, borderRadius: 14, overflow: "hidden", marginRight: 12, borderWidth: 1 },
  photoImage: { width: "100%", height: "100%" },
  photoCaptionWrap: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 10, paddingVertical: 6 },
  photoCaption: { color: "#FFF", fontSize: 11, fontFamily: "Inter-Medium" },

  // Notes
  noteCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  noteHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  noteMood: { fontSize: 18, marginRight: 8 },
  noteTitle: { fontSize: 15, fontFamily: "Inter-Bold", flex: 1 },
  noteBody: { fontSize: 13, fontFamily: "Inter-Medium", lineHeight: 20, marginBottom: 8 },
  noteDate: { fontSize: 10, fontFamily: "Inter-Medium" },

  // Expenses
  expenseCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden", padding: 4 },
  expenseRow: { flexDirection: "row", alignItems: "center", padding: 12 },
  expenseIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center", marginRight: 12 },
  expenseMiddle: { flex: 1 },
  expenseDesc: { fontSize: 13, fontFamily: "Inter-Bold", marginBottom: 2 },
  expenseCat: { fontSize: 10, fontFamily: "Inter-Medium" },
  expenseAmt: { fontSize: 14, fontFamily: "Inter-Bold" },

  // CTA
  ctaBanner: { marginHorizontal: 20, marginTop: 28, padding: 24, borderRadius: 24, alignItems: "center" },
  ctaTitle: { color: "#FFF", fontSize: 18, fontFamily: "Inter-Bold", marginTop: 8, marginBottom: 4 },
  ctaSub: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter-Medium", textAlign: "center", marginBottom: 16 },
  ctaBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16, gap: 6 },
  ctaBtnText: { fontSize: 13, fontFamily: "Inter-Bold" },
});
