import {
  BedDouble, Briefcase, Bus, Calendar, Car, Check, ChevronDown, ChevronLeft,
  ChevronUp, Clock, Footprints, Heart, Home, Hotel, Image as ImageIcon,
  Landmark, Loader, Map, MapPin, Mountain, PiggyBank, Plane, PlusCircle,
  Ruler, Salad, Search, Sparkles, Sun, Tent, TrainFront, Turtle, Umbrella,
  Users, Utensils, UtensilsCrossed, XCircle, Zap,
} from "lucide-react-native";
import { launchImageLibrary } from "react-native-image-picker";
import Geolocation from "@react-native-community/geolocation";
import DatePicker from "react-native-date-picker";
import { router } from "../../../utils/navigation";
import React, { useState } from "react";
import { Alert, Animated, FlatList, Image, ImageBackground, KeyboardAvoidingView, PermissionsAndroid, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomSheet } from "../../../components/BottomSheet";
import { OsmMapView } from "../../../components/OsmMapView";
import { GradientButton } from "../../../components/GradientButton";
import { ScreenHeader } from "../../../components/ScreenHeader";
import { useTheme } from "../../../context/ThemeContext";
import { useTrips } from "../../../context/TripContext";
import type { Trip, TripPreferences } from "../../../data/mockData";
import { PREFERENCE_OPTIONS } from "../../../data/mockData";
import { calculateRouteTime, calculateTotalDistance } from "../../../utils/calculateRoute";

const PREF_ICONS: Record<string, any> = {
  leisure: Sun, adventure: Mountain, cultural: Landmark, business: Briefcase, relaxation: Sparkles, romantic: Heart,
  hotel: Hotel, airbnb: Home, hostel: BedDouble, camping: Tent, resort: Umbrella, friends: Users,
  relaxed: Turtle, moderate: Footprints, packed: Zap,
  local: UtensilsCrossed, finedining: Utensils, budget: PiggyBank, mixed: Salad,
};

function RequiredLabel({ children, color, dangerColor }: { children: string; color: string; dangerColor: string }) {
  return (
    <Text style={styles.inputLabel}>
      <Text style={{ color }}>{children}</Text>
      <Text style={{ color: dangerColor }}> *</Text>
    </Text>
  );
}

export default function CreateTrip() {
  const { colors } = useTheme();
  const { addTrip } = useTrips();
  const [step, setStep] = useState(1);
  const progressAnim = React.useRef(new Animated.Value(0.25)).current;
  const [isMapSheet, setIsMapSheet] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [searchRes, setSearchRes] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [datePicker, setDatePicker] = useState<"start" | "end" | null>(null);

  React.useEffect(() => {
    (async () => {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      }
      Geolocation.getCurrentPosition(
        (pos) => setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: false, timeout: 10000 }
      );
    })();
  }, []);

  const [draft, setDraft] = useState({
    name: "", type: "", transport: "flight",
    coverPhoto: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800",
    route: [] as any[], startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    budget: "", currency: "USD",
    preferences: { purpose: "", accommodation: "", pace: "", foodPriority: "" } as TripPreferences,
  });

  // ── Nominatim search (OSM) ──
  const handleSearch = async (q: string) => {
    setSearchQ(q);
    if (q.length > 2) {
      setSearchLoading(true);
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1`,
          { headers: { "User-Agent": "MyTripsApp/1.0" } }
        );
        const data = await r.json();
        setSearchRes(data);
      } catch { setSearchRes([]); }
      setSearchLoading(false);
    } else setSearchRes([]);
  };

  const addStop = (loc: any) => {
    const displayName = loc.display_name.split(",")[0];
    const stop = {
      id: Math.random().toString(),
      label: String.fromCharCode(65 + draft.route.length),
      name: displayName,
      fullAddress: loc.display_name,
      lat: parseFloat(loc.lat),
      lng: parseFloat(loc.lon),
      color: draft.route.length === 0 ? "green" : "blue",
    };
    let route = [...draft.route, stop];
    if (route.length > 1) {
      route[route.length - 1].color = "coral";
      for (let i = 1; i < route.length - 1; i++) route[i].color = "blue";
    }
    setDraft({ ...draft, route });
    setSearchQ("");
    setSearchRes([]);
  };

  const removeStop = (id: string) => {
    let r = draft.route
      .filter((s) => s.id !== id)
      .map((s, i, arr) => ({
        ...s,
        label: String.fromCharCode(65 + i),
        color: i === 0 ? "green" : i === arr.length - 1 ? "coral" : "blue",
      }));
    setDraft({ ...draft, route: r });
  };

  const reorderStop = (id: string, dir: "up" | "down") => {
    const idx = draft.route.findIndex((s) => s.id === id);
    if ((dir === "up" && idx === 0) || (dir === "down" && idx === draft.route.length - 1)) return;
    const newRoute = [...draft.route];
    const swap = dir === "up" ? idx - 1 : idx + 1;
    [newRoute[idx], newRoute[swap]] = [newRoute[swap], newRoute[idx]];
    const relabeled = newRoute.map((s, i, arr) => ({
      ...s,
      label: String.fromCharCode(65 + i),
      color: i === 0 ? "green" : i === arr.length - 1 ? "coral" : "blue",
    }));
    setDraft({ ...draft, route: relabeled });
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: "photo", quality: 0.8 }, (r) => {
      if (!r.didCancel && r.assets?.[0]?.uri) {
        setCustomPhoto(r.assets[0].uri);
        setDraft({ ...draft, coverPhoto: r.assets[0].uri });
      }
    });
  };

  const updatePref = (key: keyof TripPreferences, val: string) => {
    setDraft({ ...draft, preferences: { ...draft.preferences, [key]: val } });
  };

  const stepError = (s: number): string | null => {
    if (s === 1) {
      if (!draft.name.trim()) return "Trip name is required.";
      if (!customPhoto) return "Please upload a cover photo.";
    }
    if (s === 2) {
      if (!draft.transport) return "Please choose a transport method.";
      if (draft.route.length === 0) return "Add at least one stop to your route.";
    }
    if (s === 3) {
      if (!draft.budget.trim() || isNaN(parseFloat(draft.budget))) return "Please enter a budget.";
      if (!draft.preferences.purpose) return "Please select a trip purpose.";
      if (!draft.preferences.accommodation) return "Please select an accommodation.";
      if (!draft.preferences.pace) return "Please select a travel pace.";
      if (!draft.preferences.foodPriority) return "Please select a food priority.";
    }
    return null;
  };

  const next = () => {
    if (isCreating) return;
    const error = stepError(step);
    if (error) {
      Alert.alert("Almost there", error);
      return;
    }
    if (step < 4) {
      const n = step + 1;
      Animated.timing(progressAnim, { toValue: n * 0.25, duration: 300, useNativeDriver: false }).start();
      setStep(n);
    } else create();
  };

  const back = () => {
    if (step > 1) {
      const n = step - 1;
      Animated.timing(progressAnim, { toValue: n * 0.25, duration: 300, useNativeDriver: false }).start();
      setStep(n);
    }
  };

  const create = async () => {
    const trip: Trip = {
      id: "t" + Date.now(), name: draft.name || "My Trip",
      destination: draft.route[draft.route.length - 1]?.name || "Unknown",
      flag: "🗺️", status: "upcoming", startDate: draft.startDate, endDate: draft.endDate,
      budget: parseFloat(draft.budget) || 1000, spent: 0, currency: draft.currency,
      coverPhoto: draft.coverPhoto,
      description: `${draft.preferences.purpose} trip, ${draft.preferences.pace} pace`,
      transport: draft.transport, route: draft.route, expenses: [], photos: [], notes: [],
      preferences: draft.preferences,
      visibility: "private",
      privacySettings: { photos: false, notes: false, expenses: false },
    };
    setIsCreating(true);
    try {
      await addTrip(trip);
      router.replace("Main");
    } catch (e: any) {
      Alert.alert("Couldn't create trip", e?.message ?? "Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const stopColor = (c: string) => c === "green" ? colors.success : c === "coral" ? colors.coral : colors.accent;

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Create Trip" showBack />

      {/* Progress bar */}
      <View style={[styles.progressBar, { backgroundColor: colors.surface }]}>
        <Animated.View style={[styles.progressFill, { backgroundColor: colors.accent, width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }]} />
      </View>

      {/* Step indicator */}
      <View style={styles.stepIndicator}>
        {["Basics", "Route", "Details", "Review"].map((label, i) => (
          <View key={label} style={styles.stepDot}>
            <View style={[styles.dot, { backgroundColor: step > i ? colors.accent : step === i + 1 ? colors.accent : colors.border }]}>
              {step > i + 1 ? <Check size={10} color="#FFF" /> : <Text style={[styles.dotText, { color: step === i + 1 ? "#FFF" : colors.textMuted }]}>{i + 1}</Text>}
            </View>
            <Text style={[styles.stepLabel, { color: step === i + 1 ? colors.accent : colors.textMuted }]}>{label}</Text>
          </View>
        ))}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex1}>
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>

          {/* ═══════ STEP 1: BASICS ═══════ */}
          {step === 1 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Let's start with the basics</Text>

              <RequiredLabel color={colors.textMuted} dangerColor={colors.danger}>Trip Name</RequiredLabel>
              <TextInput value={draft.name} onChangeText={(t) => setDraft({ ...draft, name: t })} placeholder="e.g. Summer in Tokyo" placeholderTextColor={colors.inputPlaceholder} style={[styles.textInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]} />

              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Who's going?</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                {["Solo", "Couple", "Family", "Friends", "Business"].map((t) => (
                  <Pressable key={t} onPress={() => setDraft({ ...draft, type: t })} style={[styles.typeChip, { backgroundColor: draft.type === t ? colors.accent : colors.surface, borderColor: draft.type === t ? colors.accent : colors.border }]}>
                    <Text style={[styles.typeText, { color: draft.type === t ? "#FFF" : colors.textSecondary }]}>{t}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              <RequiredLabel color={colors.textMuted} dangerColor={colors.danger}>Cover Photo</RequiredLabel>
              <Pressable onPress={pickImage} style={[styles.photoPicker, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                {customPhoto ? (
                  <Image source={{ uri: customPhoto }} style={styles.photoPreview} />
                ) : (
                  <>
                    <ImageIcon size={28} color={colors.textMuted} />
                    <Text style={[styles.photoPickerText, { color: colors.textMuted }]}>Tap to upload cover photo</Text>
                  </>
                )}
              </Pressable>
            </View>
          )}

          {/* ═══════ STEP 2: ROUTE (OSM) ═══════ */}
          {step === 2 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Map your route</Text>

              <RequiredLabel color={colors.textMuted} dangerColor={colors.danger}>Route (add at least one stop)</RequiredLabel>

              {/* Inline search bar */}
              <View style={[styles.inlineSearch, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Search size={16} color={colors.textMuted} />
                <TextInput
                  value={searchQ}
                  onChangeText={handleSearch}
                  placeholder="Search for a place..."
                  placeholderTextColor={colors.inputPlaceholder}
                  style={[styles.inlineSearchInput, { color: colors.text }]}
                />
                {searchLoading && <Loader size={16} color={colors.textMuted} />}
              </View>

              {/* Search results dropdown */}
              {searchRes.length > 0 && (
                <View style={[styles.searchDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {searchRes.map((r: any, i: number) => (
                    <Pressable
                      key={i}
                      onPress={() => addStop(r)}
                      style={[styles.searchResultRow, i < searchRes.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
                    >
                      <View style={[styles.resultIcon, { backgroundColor: colors.accentLight }]}>
                        <MapPin size={14} color={colors.accent} />
                      </View>
                      <View style={styles.flex1}>
                        <Text style={[styles.resultName, { color: colors.text }]} numberOfLines={1}>{r.display_name.split(",")[0]}</Text>
                        <Text style={[styles.resultAddr, { color: colors.textMuted }]} numberOfLines={1}>{r.display_name.split(",").slice(1, 3).join(",")}</Text>
                      </View>
                      <PlusCircle size={20} color={colors.accent} />
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Map */}
              <View style={[styles.mapContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <OsmMapView
                  style={styles.flex1}
                  strokeColor={colors.accent}
                  stops={draft.route.map((s: any) => ({ id: s.id, lat: s.lat, lng: s.lng, color: s.color, label: s.label }))}
                  center={draft.route.length === 0 ? currentLocation ?? undefined : undefined}
                />
                {draft.route.length === 0 && !currentLocation && (
                  <View style={styles.emptyMap} pointerEvents="none">
                    <Map size={40} color={colors.textMuted} />
                    <Text style={[styles.emptyMapText, { color: colors.textMuted }]}>Search above to add stops</Text>
                  </View>
                )}
              </View>

              {/* Stops list inline */}
              {draft.route.length > 0 && (
                <View style={[styles.stopsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.stopsHeader}>
                    <Text style={[styles.stopsTitle, { color: colors.text }]}>Route Stops</Text>
                    <Text style={[styles.stopsCount, { color: colors.textMuted }]}>{draft.route.length} stops</Text>
                  </View>
                  {draft.route.map((s: any, idx: number) => (
                    <View key={s.id} style={[styles.stopRow, idx < draft.route.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}>
                      <View style={styles.stopLeft}>
                        <View style={[styles.stopMarker, { backgroundColor: stopColor(s.color) }]}>
                          <Text style={styles.stopMarkerLabel}>{s.label}</Text>
                        </View>
                        {idx < draft.route.length - 1 && <View style={[styles.stopLine, { backgroundColor: colors.border }]} />}
                      </View>
                      <View style={styles.stopCenter}>
                        <Text style={[styles.stopName, { color: colors.text }]} numberOfLines={1}>{s.name}</Text>
                        <Text style={[styles.stopType, { color: colors.textMuted }]}>
                          {idx === 0 ? "Starting point" : idx === draft.route.length - 1 ? "Final destination" : `Stop ${idx}`}
                        </Text>
                      </View>
                      <View style={styles.stopActions}>
                        <Pressable onPress={() => reorderStop(s.id, "up")} style={styles.stopActionBtn}>
                          <ChevronUp size={14} color={idx === 0 ? colors.border : colors.textMuted} />
                        </Pressable>
                        <Pressable onPress={() => reorderStop(s.id, "down")} style={styles.stopActionBtn}>
                          <ChevronDown size={14} color={idx === draft.route.length - 1 ? colors.border : colors.textMuted} />
                        </Pressable>
                        <Pressable onPress={() => removeStop(s.id)} style={styles.stopActionBtn}>
                          <XCircle size={16} color={colors.danger} />
                        </Pressable>
                      </View>
                    </View>
                  ))}
                  {draft.route.length > 1 && (
                    <View style={[styles.routeStats, { backgroundColor: colors.accentLight }]}>
                      <View style={styles.routeStatItem}>
                        <Ruler size={14} color={colors.accent} />
                        <Text style={[styles.routeStatValue, { color: colors.text }]}>{calculateTotalDistance(draft.route).toFixed(0)} km</Text>
                      </View>
                      <View style={styles.routeStatItem}>
                        <Clock size={14} color={colors.accent} />
                        <Text style={[styles.routeStatValue, { color: colors.text }]}>{calculateRouteTime(draft.route, draft.transport)}</Text>
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* Transport */}
              <View style={{ marginTop: 16 }}>
                <RequiredLabel color={colors.textMuted} dangerColor={colors.danger}>Transport</RequiredLabel>
              </View>
              <View style={styles.transportRow}>
                {[
                  { id: "flight", icon: Plane, label: "Flight" },
                  { id: "car", icon: Car, label: "Car" },
                  { id: "train", icon: TrainFront, label: "Train" },
                  { id: "bus", icon: Bus, label: "Bus" },
                ].map((m) => (
                  <Pressable key={m.id} onPress={() => setDraft({ ...draft, transport: m.id })} style={[styles.transportBtn, { backgroundColor: draft.transport === m.id ? colors.accentLight : colors.surface, borderColor: draft.transport === m.id ? colors.accent : colors.border }]}>
                    <m.icon size={22} color={draft.transport === m.id ? colors.accent : colors.textMuted} />
                    <Text style={[styles.transportLabel, { color: draft.transport === m.id ? colors.accent : colors.textMuted }]}>{m.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* ═══════ STEP 3: DATES, BUDGET & PREFERENCES (MCQ) ═══════ */}
          {step === 3 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Dates & Details</Text>

              <View style={styles.dateRow}>
                <View style={styles.flex1}>
                  <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Start Date</Text>
                  <Pressable onPress={() => setDatePicker("start")} style={[styles.textInput, styles.dateBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={{ color: colors.text, fontSize: 16 }}>
                      {new Date(draft.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </Text>
                    <Calendar size={18} color={colors.textMuted} />
                  </Pressable>
                </View>
                <View style={{ width: 10 }} />
                <View style={styles.flex1}>
                  <Text style={[styles.inputLabel, { color: colors.textMuted }]}>End Date</Text>
                  <Pressable onPress={() => setDatePicker("end")} style={[styles.textInput, styles.dateBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={{ color: colors.text, fontSize: 16 }}>
                      {new Date(draft.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </Text>
                    <Calendar size={18} color={colors.textMuted} />
                  </Pressable>
                </View>
              </View>

              <DatePicker
                modal
                open={datePicker !== null}
                date={new Date(datePicker === "start" ? draft.startDate : draft.endDate)}
                mode="date"
                minimumDate={datePicker === "end" ? new Date(draft.startDate) : undefined}
                onConfirm={(date) => {
                  const iso = date.toISOString().split("T")[0];
                  if (datePicker === "start") {
                    setDraft({ ...draft, startDate: iso, endDate: iso > draft.endDate ? iso : draft.endDate });
                  } else {
                    setDraft({ ...draft, endDate: iso });
                  }
                  setDatePicker(null);
                }}
                onCancel={() => setDatePicker(null)}
              />

              <RequiredLabel color={colors.textMuted} dangerColor={colors.danger}>Budget</RequiredLabel>
              <View style={[styles.budgetInput, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.budgetSign, { color: colors.textMuted }]}>Nrs</Text>
                <TextInput value={draft.budget} onChangeText={(t) => setDraft({ ...draft, budget: t })} placeholder="2000" placeholderTextColor={colors.inputPlaceholder} keyboardType="numeric" style={[styles.budgetText, { color: colors.text }]} />
              </View>

              {/* ── MCQ: Trip Purpose ── */}
              <Text style={[styles.mcqTitle, { color: colors.text }]}>Trip Purpose <Text style={{ color: colors.danger }}>*</Text></Text>
              <Text style={[styles.mcqSubtitle, { color: colors.textMuted }]}>What's the main goal of this trip?</Text>
              <View style={styles.mcqGrid}>
                {PREFERENCE_OPTIONS.purpose.map((opt) => (
                  <Pressable
                    key={opt.id}
                    onPress={() => updatePref("purpose", opt.id)}
                    style={[
                      styles.mcqOption,
                      {
                        backgroundColor: draft.preferences.purpose === opt.id ? colors.accentLight : colors.surface,
                        borderColor: draft.preferences.purpose === opt.id ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    {React.createElement(PREF_ICONS[opt.id], { size: 18, color: draft.preferences.purpose === opt.id ? colors.accent : colors.textMuted, style: styles.mcqIcon })}
                    <Text style={[styles.mcqLabel, { color: draft.preferences.purpose === opt.id ? colors.accent : colors.textSecondary }]}>{opt.label}</Text>
                    {draft.preferences.purpose === opt.id && (
                      <View style={[styles.mcqCheck, { backgroundColor: colors.accent }]}>
                        <Check size={10} color="#FFF" />
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>

              {/* ── MCQ: Accommodation ── */}
              <Text style={[styles.mcqTitle, { color: colors.text }]}>Accommodation <Text style={{ color: colors.danger }}>*</Text></Text>
              <Text style={[styles.mcqSubtitle, { color: colors.textMuted }]}>Where will you stay?</Text>
              <View style={styles.mcqGrid}>
                {PREFERENCE_OPTIONS.accommodation.map((opt) => (
                  <Pressable
                    key={opt.id}
                    onPress={() => updatePref("accommodation", opt.id)}
                    style={[
                      styles.mcqOption,
                      {
                        backgroundColor: draft.preferences.accommodation === opt.id ? colors.accentLight : colors.surface,
                        borderColor: draft.preferences.accommodation === opt.id ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    {React.createElement(PREF_ICONS[opt.id], { size: 18, color: draft.preferences.accommodation === opt.id ? colors.accent : colors.textMuted, style: styles.mcqIcon })}
                    <Text style={[styles.mcqLabel, { color: draft.preferences.accommodation === opt.id ? colors.accent : colors.textSecondary }]}>{opt.label}</Text>
                    {draft.preferences.accommodation === opt.id && (
                      <View style={[styles.mcqCheck, { backgroundColor: colors.accent }]}>
                        <Check size={10} color="#FFF" />
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>

              {/* ── MCQ: Pace ── */}
              <Text style={[styles.mcqTitle, { color: colors.text }]}>Travel Pace <Text style={{ color: colors.danger }}>*</Text></Text>
              <Text style={[styles.mcqSubtitle, { color: colors.textMuted }]}>How packed is your schedule?</Text>
              <View style={styles.paceRow}>
                {PREFERENCE_OPTIONS.pace.map((opt) => (
                  <Pressable
                    key={opt.id}
                    onPress={() => updatePref("pace", opt.id)}
                    style={[
                      styles.paceOption,
                      {
                        backgroundColor: draft.preferences.pace === opt.id ? colors.accentLight : colors.surface,
                        borderColor: draft.preferences.pace === opt.id ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    {React.createElement(PREF_ICONS[opt.id], { size: 22, color: draft.preferences.pace === opt.id ? colors.accent : colors.textMuted, style: styles.paceIcon })}
                    <Text style={[styles.paceLabel, { color: draft.preferences.pace === opt.id ? colors.accent : colors.textSecondary }]}>{opt.label}</Text>
                  </Pressable>
                ))}
              </View>

              {/* ── MCQ: Food Priority ── */}
              <Text style={[styles.mcqTitle, { color: colors.text }]}>Food Priority <Text style={{ color: colors.danger }}>*</Text></Text>
              <Text style={[styles.mcqSubtitle, { color: colors.textMuted }]}>What's your dining style?</Text>
              <View style={styles.mcqGrid}>
                {PREFERENCE_OPTIONS.foodPriority.map((opt) => (
                  <Pressable
                    key={opt.id}
                    onPress={() => updatePref("foodPriority", opt.id)}
                    style={[
                      styles.mcqOption,
                      {
                        backgroundColor: draft.preferences.foodPriority === opt.id ? colors.accentLight : colors.surface,
                        borderColor: draft.preferences.foodPriority === opt.id ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    {React.createElement(PREF_ICONS[opt.id], { size: 18, color: draft.preferences.foodPriority === opt.id ? colors.accent : colors.textMuted, style: styles.mcqIcon })}
                    <Text style={[styles.mcqLabel, { color: draft.preferences.foodPriority === opt.id ? colors.accent : colors.textSecondary }]}>{opt.label}</Text>
                    {draft.preferences.foodPriority === opt.id && (
                      <View style={[styles.mcqCheck, { backgroundColor: colors.accent }]}>
                        <Check size={10} color="#FFF" />
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* ═══════ STEP 4: REVIEW ═══════ */}
          {step === 4 && (
            <View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Review & Create</Text>
              <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ImageBackground source={{ uri: draft.coverPhoto }} style={styles.reviewImage}>
                  <View style={styles.reviewOverlay} />
                  <Text style={styles.reviewName}>{draft.name || "Untitled Trip"}</Text>
                </ImageBackground>
                <View style={styles.reviewInfo}>
                  {[
                    { l: "Dates", v: `${draft.startDate} → ${draft.endDate}` },
                    { l: "Budget", v: `${draft.currency} ${draft.budget || "0"}` },
                    { l: "Transport", v: draft.transport },
                    { l: "Stops", v: `${draft.route.length} locations` },
                    { l: "Purpose", v: PREFERENCE_OPTIONS.purpose.find(p => p.id === draft.preferences.purpose)?.label || "—" },
                    { l: "Stay", v: PREFERENCE_OPTIONS.accommodation.find(p => p.id === draft.preferences.accommodation)?.label || "—" },
                    { l: "Pace", v: PREFERENCE_OPTIONS.pace.find(p => p.id === draft.preferences.pace)?.label || "—" },
                    { l: "Food", v: PREFERENCE_OPTIONS.foodPriority.find(p => p.id === draft.preferences.foodPriority)?.label || "—" },
                  ].map((r) => (
                    <View key={r.l} style={[styles.reviewRow, { borderBottomColor: colors.borderLight }]}>
                      <Text style={[styles.reviewLabel, { color: colors.textMuted }]}>{r.l}</Text>
                      <Text style={[styles.reviewValue, { color: colors.text }]}>{r.v}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Nav buttons */}
          <View style={styles.navRow}>
            {step > 1 && (
              <Pressable onPress={back} style={[styles.backButton, { borderColor: colors.border }]}>
                <ChevronLeft size={18} color={colors.textSecondary} />
                <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>Back</Text>
              </Pressable>
            )}
            <View style={styles.flex1}>
              <GradientButton
                title={isCreating ? "Creating…" : step === 4 ? "Create Trip 🚀" : "Next →"}
                onPress={next}
                disabled={isCreating}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex1: { flex: 1 },
  progressBar: { height: 3 },
  progressFill: { height: "100%" },
  stepIndicator: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 24, paddingVertical: 16 },
  stepDot: { alignItems: "center" },
  dot: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  dotText: { fontSize: 10, fontWeight: "700" },
  stepLabel: { fontSize: 9, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  scrollContent: { flex: 1, paddingHorizontal: 20 },
  stepTitle: { fontSize: 24, fontWeight: "700", marginBottom: 20 },
  inputLabel: { fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 },
  textInput: { fontSize: 16, padding: 14, borderRadius: 6, borderWidth: 1, marginBottom: 16 },
  dateBtn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  typeChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6, marginRight: 8, borderWidth: 1 },
  typeText: { fontSize: 13, fontWeight: "600" },
  photoPicker: { width: "100%", height: 140, borderRadius: 8, borderWidth: 1.5, borderStyle: "dashed", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  photoPickerText: { fontSize: 12, marginTop: 8 },
  photoPreview: { width: "100%", height: "100%" },

  // Step 2: Route
  inlineSearch: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 11, borderRadius: 6, borderWidth: 1, marginBottom: 8 },
  inlineSearchInput: { flex: 1, marginLeft: 10, fontSize: 14 },
  searchDropdown: { borderRadius: 6, borderWidth: 1, marginBottom: 12, overflow: "hidden" },
  searchResultRow: { flexDirection: "row", alignItems: "center", padding: 12 },
  resultIcon: { width: 30, height: 30, borderRadius: 6, alignItems: "center", justifyContent: "center", marginRight: 10 },
  resultName: { fontSize: 13, fontWeight: "600" },
  resultAddr: { fontSize: 10 },
  mapContainer: { height: 220, borderRadius: 8, overflow: "hidden", borderWidth: 1, marginBottom: 12 },
  emptyMap: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  emptyMapText: { fontSize: 12, marginTop: 8 },
  stopsCard: { borderRadius: 8, borderWidth: 1, padding: 14, marginBottom: 4 },
  stopsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  stopsTitle: { fontSize: 15, fontWeight: "700" },
  stopsCount: { fontSize: 11 },
  stopRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  stopLeft: { alignItems: "center", width: 30, marginRight: 10 },
  stopMarker: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  stopMarkerLabel: { color: "#FFF", fontSize: 9, fontWeight: "700" },
  stopLine: { width: 2, height: 20, marginTop: 4 },
  stopCenter: { flex: 1 },
  stopName: { fontSize: 13, fontWeight: "600" },
  stopType: { fontSize: 10 },
  stopActions: { flexDirection: "row", alignItems: "center", gap: 4 },
  stopActionBtn: { padding: 4 },
  routeStats: { flexDirection: "row", justifyContent: "space-around", padding: 12, borderRadius: 6, marginTop: 8 },
  routeStatItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  routeStatValue: { fontSize: 13, fontWeight: "700" },
  transportRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  transportBtn: { width: "23%", borderRadius: 6, alignItems: "center", justifyContent: "center", borderWidth: 1, paddingVertical: 14 },
  transportLabel: { fontSize: 9, marginTop: 4, textTransform: "uppercase" },

  // Step 3: MCQ
  mcqTitle: { fontSize: 16, fontWeight: "700", marginTop: 16, marginBottom: 2 },
  mcqSubtitle: { fontSize: 11, marginBottom: 12 },
  mcqGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 4 },
  mcqOption: { width: "48%", flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 6, borderWidth: 1, marginBottom: 8, position: "relative" },
  mcqIcon: { marginRight: 8 },
  mcqLabel: { fontSize: 12, fontWeight: "600", flex: 1 },
  mcqCheck: { position: "absolute", top: 6, right: 6, width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  paceRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  paceOption: { flex: 1, alignItems: "center", paddingVertical: 16, borderRadius: 6, borderWidth: 1, marginHorizontal: 4 },
  paceIcon: { marginBottom: 4 },
  paceLabel: { fontSize: 11, fontWeight: "700" },

  // Step 3: Budget
  dateRow: { flexDirection: "row", marginBottom: 4 },
  budgetInput: { flexDirection: "row", alignItems: "center", borderRadius: 6, borderWidth: 1, paddingHorizontal: 14, marginBottom: 8 },
  budgetSign: { fontSize: 20, fontWeight: "700" },
  budgetText: { flex: 1, fontSize: 20, fontWeight: "700", padding: 14, marginLeft: 8 },

  // Step 4: Review
  reviewCard: { borderRadius: 8, overflow: "hidden", borderWidth: 1, marginBottom: 8 },
  reviewImage: { height: 120, justifyContent: "flex-end", padding: 16 },
  reviewOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  reviewName: { color: "#FFF", fontSize: 22, fontWeight: "700", zIndex: 1 },
  reviewInfo: { padding: 14 },
  reviewRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1 },
  reviewLabel: { fontSize: 13 },
  reviewValue: { fontSize: 13, fontWeight: "700" },

  // Nav
  navRow: { flexDirection: "row", alignItems: "center", marginTop: 16, gap: 10 },
  backButton: { flexDirection: "row", alignItems: "center", paddingVertical: 15, paddingHorizontal: 16, borderRadius: 6, borderWidth: 1 },
  backButtonText: { fontSize: 14, fontWeight: "600", marginLeft: 4 },
});
