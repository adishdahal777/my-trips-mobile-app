import Ionicons from "react-native-vector-icons/Ionicons";
import React, { useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PlaneRefreshControl } from "../../../components/PlaneRefreshControl";
import { TripCard } from "../../../components/TripCard";
import { useTheme } from "../../../context/ThemeContext";
import { useTrips } from "../../../context/TripContext";

const FILTERS = ["All", "Ongoing", "Upcoming", "Completed"];

export default function TripsIndex() {
  const { colors } = useTheme();
  const { trips, refreshTrips } = useTrips();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshTrips();
    setRefreshing(false);
  };

  const filteredTrips = trips.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || t.status === filter.toLowerCase();
    return matchSearch && matchFilter;
  });

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>My Trips</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>Explore your journeys</Text>
          </View>
          <Pressable style={[styles.filterBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="filter-outline" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search trips..."
            placeholderTextColor={colors.inputPlaceholder}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: filter === f ? colors.accent : colors.surface,
                  borderColor: filter === f ? colors.accent : colors.border,
                },
              ]}
            >
              <Text
                style={[styles.filterText, { color: filter === f ? "#FFFFFF" : colors.textSecondary }]}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={filteredTrips}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<PlaneRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => <TripCard trip={item} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="map-outline" size={50} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No trips found</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { fontSize: 12, marginTop: 2 },
  filterBtn: { width: 36, height: 36, borderRadius: 6, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14 },
  filtersScroll: { flexGrow: 0 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, marginRight: 8, borderWidth: 1 },
  filterText: { fontSize: 12, fontWeight: "600" },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 16, fontWeight: "600", marginTop: 12 },
});
