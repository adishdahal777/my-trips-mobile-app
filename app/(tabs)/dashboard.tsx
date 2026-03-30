import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ExpenseFeedItem } from "../../components/ExpenseFeedItem";
import { FeaturedTripCard } from "../../components/FeaturedTripCard";
import { FloatingActionButton } from "../../components/FloatingActionButton";
import { HomeHeader } from "../../components/HomeHeader";
import { StatsBanner } from "../../components/StatsBanner";
import { TripSmallCard } from "../../components/TripSmallCard";
import { useTheme } from "../../context/ThemeContext";
import { MOCK_TRIPS, MOCK_USER } from "../../data/mockData";
import { calculateUserStats } from "../../utils/calculateStats";

export default function Dashboard() {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const stats = useMemo(() => calculateUserStats(MOCK_TRIPS), []);

  const featuredTrip = useMemo(() => {
    return (
      MOCK_TRIPS.find((t) => t.status === "ongoing") ||
      MOCK_TRIPS.find((t) => t.status === "upcoming") ||
      MOCK_TRIPS[0]
    );
  }, []);

  const recentExpenses = useMemo(() => {
    const all = MOCK_TRIPS.flatMap((t) => t.expenses.map((e) => ({ ...e, tripName: t.name })));
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, []);

  const handleQuickAction = (type: string) => {
    switch (type) {
      case "trip":
        router.push("/(tabs)/trips/create");
        break;
      case "expense":
        if (featuredTrip) router.push(`/(tabs)/trips/${featuredTrip.id}`);
        break;
      case "photo":
        if (featuredTrip) router.push(`/(tabs)/trips/${featuredTrip.id}`);
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        stickyHeaderIndices={isSearching ? [0] : []}
      >
        {/* Zone 1: Header */}
        {!isSearching ? (
          <HomeHeader user={MOCK_USER} onSearchPress={() => setIsSearching(true)} notifCount={1} />
        ) : (
          <View style={[styles.searchBar, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
            <Pressable onPress={() => setIsSearching(false)} style={styles.searchClose}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
            <View style={[styles.searchInput, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="search" size={16} color={colors.textMuted} />
              <TextInput
                autoFocus
                value={search}
                onChangeText={setSearch}
                placeholder="Search trips, expenses, places..."
                placeholderTextColor={colors.inputPlaceholder}
                style={[styles.searchText, { color: colors.text }]}
              />
            </View>
          </View>
        )}

        {/* Zone 2: Stats Banner */}
        <View style={styles.sectionGap}>
          <StatsBanner
            totalTrips={stats.totalTrips}
            countriesVisited={stats.countriesVisited}
            totalSpent={stats.totalSpent}
            currentMonthSpent={stats.currentMonthSpent}
            totalKm={stats.totalKm}
            countryFlags={stats.countryList.map(() => "🌍")}
            onTripsPress={() => router.push("/(tabs)/trips")}
          />
        </View>

        {/* Zone 3: Featured Trip */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Adventure</Text>
            <Pressable onPress={() => router.push(`/(tabs)/trips/${featuredTrip.id}`)}>
              <Text style={[styles.sectionLink, { color: colors.accent }]}>Details →</Text>
            </Pressable>
          </View>
          <FeaturedTripCard trip={featuredTrip} />
        </View>

        {/* Zone 4: Trips Scroll */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>My Journeys</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tripsScrollContent}>
            {MOCK_TRIPS.map((trip) => (
              <TripSmallCard key={trip.id} trip={trip} />
            ))}
            <TripSmallCard isAddButton />
          </ScrollView>
        </View>

        {/* Zone 5: Recent Expenses */}
        <View style={[styles.section, { paddingHorizontal: 20 }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Expenses</Text>
            <Pressable style={[styles.viewAllBtn, { backgroundColor: colors.surface }]}>
              <Text style={[styles.viewAllText, { color: colors.textMuted }]}>View All</Text>
            </Pressable>
          </View>
          <View style={[styles.expenseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {recentExpenses.map((exp, i) => (
              <ExpenseFeedItem
                key={`${exp.id}-${i}`}
                expense={exp}
                tripName={exp.tripName}
                isLast={i === recentExpenses.length - 1}
              />
            ))}
          </View>
        </View>

        {/* Zone 6: Memory card */}
        <View style={{ paddingHorizontal: 20, marginBottom: 120 }}>
          <View style={[styles.memoryCard, { backgroundColor: colors.accent }]}>
            <View style={styles.memoryOrb} />
            <Ionicons name="camera-outline" size={22} color="white" style={{ marginBottom: 10 }} />
            <Text style={styles.memoryTitle}>On this day in 2023...</Text>
            <Text style={styles.memorySub}>You were exploring the streets of Tokyo! 🗼</Text>
            <Pressable style={[styles.memoryBtn, { backgroundColor: colors.card }]}>
              <Text style={[styles.memoryBtnText, { color: colors.accent }]}>View Memory</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Zone 6: FAB */}
      <FloatingActionButton onPressItem={handleQuickAction} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  sectionGap: { marginTop: 8 },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontFamily: "Inter-Bold" },
  sectionLink: { fontSize: 12, fontFamily: "Inter-Bold" },
  tripsScrollContent: { paddingHorizontal: 20 },
  viewAllBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  viewAllText: { fontSize: 10, fontFamily: "Inter-Bold", textTransform: "uppercase", letterSpacing: 0.5 },
  expenseCard: { borderRadius: 16, paddingHorizontal: 16, borderWidth: 1 },
  searchBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  searchClose: { marginRight: 12 },
  searchInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchText: { flex: 1, marginLeft: 10, fontSize: 14, fontFamily: "Inter-Medium" },
  memoryCard: {
    borderRadius: 20,
    padding: 24,
    overflow: "hidden",
    marginTop: 8,
  },
  memoryOrb: {
    position: "absolute",
    right: -20,
    top: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  memoryTitle: { color: "#FFF", fontFamily: "Inter-Bold", fontSize: 16, marginBottom: 4 },
  memorySub: { color: "rgba(255,255,255,0.7)", fontFamily: "Inter-Medium", fontSize: 12, marginBottom: 16 },
  memoryBtn: { alignSelf: "flex-start", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  memoryBtnText: { fontFamily: "Inter-Bold", fontSize: 12 },
});
