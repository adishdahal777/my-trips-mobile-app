import Ionicons from "react-native-vector-icons/Ionicons";
import { launchImageLibrary } from "react-native-image-picker";
import { router } from "../../../../utils/navigation";
import { useRoute } from "@react-navigation/native";
import { useState } from "react";
import { Alert, Dimensions, Image, ImageBackground, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { PieChart } from "react-native-svg-charts";
import { BottomSheet } from "../../../../components/BottomSheet";
import { ExpenseItem } from "../../../../components/ExpenseItem";
import { GradientButton } from "../../../../components/GradientButton";
import { NoteCard } from "../../../../components/NoteCard";
import { OsmMapView } from "../../../../components/OsmMapView";
import { useTheme } from "../../../../context/ThemeContext";
import { useTrips } from "../../../../context/TripContext";
import { calculateRouteTime, calculateTotalDistance } from "../../../../utils/calculateRoute";
import { categorize } from "../../../../utils/categorize";
import { getCategoryIcon } from "../../../../utils/categoryIcon";
import { analyzeBudget } from "../../../../utils/budgetInsight";
import { optimizeRoute } from "../../../../utils/optimizeRoute";
import { suggestMood } from "../../../../utils/moodSuggest";
import { formatCurrency } from "../../../../utils/formatCurrency";
import { ShareSheet } from "../../../../components/ShareSheet";

const { width: SW } = Dimensions.get("window");
const TABS = ["Overview", "Route", "Expenses", "Photos", "Notes"];

export default function TripDetail() {
  const { colors } = useTheme();
  const route = useRoute<any>();
  const id = route.params?.id as string;
  const { getTripById, addExpense, addPhoto, addNote, updateNote, deleteNote, updateTrip, updateTripVisibility, updateTripPrivacy, togglePhotoPrivacy, toggleExpensePrivacy } = useTrips();
  const trip = getTripById(id!);
  const [tab, setTab] = useState(0);

  const [expSheet, setExpSheet] = useState(false);
  const [expAmt, setExpAmt] = useState(""); const [expDesc, setExpDesc] = useState("");
  const aiPred = expDesc.length > 2 ? categorize(expDesc) : null;

  const [photoModal, setPhotoModal] = useState(false); const [tempUri, setTempUri] = useState<string | null>(null); const [caption, setCaption] = useState(""); const [photoPrivate, setPhotoPrivate] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);

  const [noteModal, setNoteModal] = useState(false); const [editNote, setEditNote] = useState<any>(null);
  const [noteTitle, setNoteTitle] = useState(""); const [noteBody, setNoteBody] = useState(""); const [noteMood, setNoteMood] = useState("😊"); const [noteColor, setNoteColor] = useState("#FFF3E0"); const [notePrivate, setNotePrivate] = useState(false); const [moodTouched, setMoodTouched] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  if (!trip) return <View style={[styles.center, { backgroundColor: colors.background }]}><Text style={{ color: colors.text }}>Trip not found</Text></View>;

  const dur = Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000);
  const pct = Math.min((trip.spent / trip.budget) * 100, 100);

  const catTotals = trip.expenses.reduce((a, e) => { a[e.category] = (a[e.category] || 0) + e.amount; return a; }, {} as Record<string, number>);
  const pieColors = [colors.accent, "#60A5FA", "#93C5FD", "#BFDBFE", "#DBEAFE"];
  const pieData = Object.entries(catTotals).map(([key, val], i) => ({ key, value: val, svg: { fill: pieColors[i % 5] }, arc: { cornerRadius: 4 } }));
  const insight = analyzeBudget(trip);

  const optimize = async () => {
    if (trip.route.length < 3 || optimizing) return;
    const optimized = optimizeRoute(trip.route);
    const before = calculateTotalDistance(trip.route);
    const after = calculateTotalDistance(optimized);
    setOptimizing(true);
    try {
      await updateTrip(id!, { route: optimized });
      Alert.alert("Route optimized", `Distance: ${Math.round(before)} km → ${Math.round(after)} km`);
    } catch (e: any) {
      Alert.alert("Couldn't optimize route", e?.message ?? "Please try again.");
    }
    setOptimizing(false);
  };

  const saveExpense = async () => {
    if (!expAmt || !expDesc) return;
    const cat = aiPred?.category !== "Other" ? aiPred! : categorize(expDesc);
    try {
      await addExpense(id!, { id: "e" + Date.now(), description: expDesc, amount: parseFloat(expAmt), currency: trip.currency, date: new Date().toISOString().split("T")[0], category: cat.category, icon: cat.icon, aiSuggested: !!aiPred && aiPred.category !== "Other" });
      setExpAmt(""); setExpDesc(""); setExpSheet(false);
    } catch (e: any) {
      Alert.alert("Couldn't add expense", e?.message ?? "Please try again.");
    }
  };

  const pickPhoto = () => {
    launchImageLibrary({ mediaType: "photo", quality: 0.8 }, (r) => {
      if (!r.didCancel && r.assets?.[0]?.uri) { setTempUri(r.assets[0].uri); setPhotoModal(true); }
    });
  };
  const savePhoto = async () => {
    if (!tempUri) return;
    try {
      await addPhoto(id!, { id: "p" + Date.now(), url: tempUri, caption: caption || "Trip memory", lat: trip.route[0]?.lat || 0, lng: trip.route[0]?.lng || 0, date: new Date().toISOString().split("T")[0], isPrivate: photoPrivate });
      setTempUri(null); setCaption(""); setPhotoPrivate(false); setPhotoModal(false);
    } catch (e: any) {
      Alert.alert("Couldn't upload photo", e?.message ?? "Please try again.");
    }
  };

  const openNoteEditor = (note?: any) => {
    if (note) { setEditNote(note); setNoteTitle(note.title); setNoteBody(note.body); setNoteMood(note.mood); setNoteColor(note.color); setNotePrivate(!!note.isPrivate); setMoodTouched(true); }
    else { setEditNote(null); setNoteTitle(""); setNoteBody(""); setNoteMood("😊"); setNoteColor("#FFF3E0"); setNotePrivate(false); setMoodTouched(false); }
    setNoteModal(true);
  };
  const saveNote = async () => {
    try {
      if (editNote) await updateNote(id!, editNote.id, { title: noteTitle, body: noteBody, mood: noteMood, color: noteColor, isPrivate: notePrivate });
      else await addNote(id!, { id: "n" + Date.now(), title: noteTitle || "Untitled", body: noteBody, mood: noteMood, date: new Date().toISOString().split("T")[0], color: noteColor, isPrivate: notePrivate });
      setNoteModal(false);
    } catch (e: any) {
      Alert.alert("Couldn't save note", e?.message ?? "Please try again.");
    }
  };

  const handleShare = () => {
    setShareVisible(true);
  };

  const stopColor = (c: string) => c === "green" ? colors.success : c === "coral" ? colors.coral : colors.accent;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hero Header */}
      <ImageBackground source={{ uri: trip.coverPhoto }} style={styles.hero}>
        <View style={styles.heroOverlay} />
        <View style={styles.heroTop}>
          <Pressable onPress={() => router.back()} style={styles.heroBtn}><Ionicons name="chevron-back" size={22} color="white" /></Pressable>
          <Pressable onPress={handleShare} style={styles.heroBtn}><Ionicons name="share-outline" size={18} color="white" /></Pressable>
        </View>
        <View style={styles.heroBottom}>
          <View style={styles.heroTitleRow}>
            <Text style={styles.heroName}>{trip.name}</Text>
            <View style={styles.heroStatus}><Text style={styles.heroStatusText}>{trip.status}</Text></View>
          </View>
          <Text style={styles.heroDest}>{trip.flag} {trip.destination}</Text>
          <View style={styles.heroDateRow}>
            <Ionicons name="calendar-outline" size={11} color="rgba(255,255,255,0.7)" />
            <Text style={styles.heroDate}>{new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} — {new Date(trip.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</Text>
          </View>
        </View>
      </ImageBackground>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {TABS.map((t, i) => (
            <Pressable key={t} onPress={() => setTab(i)} style={[styles.tabItem, tab === i && { borderBottomColor: colors.accent, borderBottomWidth: 2 }]}>
              <Text style={[styles.tabText, { color: tab === i ? colors.accent : colors.textMuted }]}>{t}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.flex1} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
        {tab === 0 && (
          <View>
            <View style={styles.statsGrid}>
              {[
                { v: `${dur}d`, l: "Duration", ic: "calendar" as const, c: colors.accent },
                { v: formatCurrency(trip.budget, trip.currency), l: "Budget", ic: "wallet" as const, c: colors.success },
                { v: formatCurrency(trip.spent, trip.currency), l: "Spent", ic: "cash" as const, c: colors.coral },
                { v: formatCurrency(Math.max(0, trip.budget - trip.spent), trip.currency), l: "Balance", ic: "trending-down" as const, c: colors.textSecondary },
              ].map((s) => (
                <View key={s.l} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.statIcon, { backgroundColor: colors.surface }]}><Ionicons name={s.ic} size={14} color={s.c} /></View>
                  <Text style={[styles.statValue, { color: colors.text }]}>{s.v}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>{s.l}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.budgetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.budgetHeader}><Text style={[styles.budgetTitle, { color: colors.text }]}>Budget Utilization</Text><Text style={[styles.budgetPct, { color: colors.accent }]}>{pct.toFixed(0)}%</Text></View>
              <View style={[styles.budgetTrack, { backgroundColor: colors.surface }]}><View style={[styles.budgetFill, { backgroundColor: pct > 90 ? colors.danger : colors.accent, width: `${pct}%` }]} /></View>
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>The Route</Text>
            <View style={[styles.routeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {trip.route.map((s, i) => (
                <View key={s.id} style={styles.routeRow}>
                  <View style={styles.routeMarkerCol}>
                    <View style={[styles.routeMarker, { backgroundColor: stopColor(s.color) }]}><Text style={styles.routeMarkerText}>{s.label}</Text></View>
                    {i < trip.route.length - 1 && <View style={[styles.routeLine, { backgroundColor: colors.borderLight }]} />}
                  </View>
                  <View style={styles.routeInfo}><Text style={[styles.routeName, { color: colors.text }]}>{s.name}</Text><Text style={[styles.routeSub, { color: colors.textMuted }]}>Stop {i + 1}</Text></View>
                </View>
              ))}
            </View>

            {/* Privacy & Sharing */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy & Sharing</Text>
            <View style={[styles.privacyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.privacyRow, { borderBottomColor: colors.borderLight }]}>
                <View style={styles.privacyLeft}>
                  <View style={[styles.privacyIcon, { backgroundColor: (trip?.visibility || "private") === "public" ? colors.successLight : colors.surfaceAlt }]}>
                    <Ionicons name={(trip?.visibility || "private") === "public" ? "globe-outline" : "lock-closed-outline"} size={16} color={(trip?.visibility || "private") === "public" ? colors.success : colors.textMuted} />
                  </View>
                  <View>
                    <Text style={[styles.privacyLabel, { color: colors.text }]}>Trip Visibility</Text>
                    <Text style={[styles.privacySub, { color: colors.textMuted }]}>{(trip?.visibility || "private") === "public" ? "Visible on the Travel Feed" : "Only you can see this trip"}</Text>
                  </View>
                </View>
                <Switch
                  value={(trip?.visibility || "private") === "public"}
                  onValueChange={(v) => updateTripVisibility(id!, v ? "public" : "private")}
                  trackColor={{ false: colors.border, true: colors.accent + "60" }}
                  thumbColor={(trip?.visibility || "private") === "public" ? colors.accent : colors.textMuted}
                />
              </View>
              {(trip?.visibility || "private") === "public" && (
                <>
                  {[
                    { key: "photos" as const, label: "Show Photos", sub: "Others can see your trip photos", icon: "images-outline" as const },
                    { key: "notes" as const, label: "Show Notes", sub: "Share your travel notes publicly", icon: "document-text-outline" as const },
                    { key: "expenses" as const, label: "Show Expenses", sub: "Display spending breakdown", icon: "receipt-outline" as const },
                  ].map((item, idx) => {
                    const privacyVal = trip?.privacySettings?.[item.key] ?? false;
                    return (
                      <View key={item.key} style={[styles.privacyRow, idx < 2 && { borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}>
                        <View style={styles.privacyLeft}>
                          <View style={[styles.privacyIcon, { backgroundColor: privacyVal ? colors.accentLight : colors.surfaceAlt }]}>
                            <Ionicons name={item.icon} size={14} color={privacyVal ? colors.accent : colors.textMuted} />
                          </View>
                          <View>
                            <Text style={[styles.privacySubLabel, { color: colors.text }]}>{item.label}</Text>
                            <Text style={[styles.privacySub, { color: colors.textMuted }]}>{item.sub}</Text>
                          </View>
                        </View>
                        <Switch
                          value={privacyVal}
                          onValueChange={(v) => updateTripPrivacy(id!, { [item.key]: v })}
                          trackColor={{ false: colors.border, true: colors.accent + "60" }}
                          thumbColor={privacyVal ? colors.accent : colors.textMuted}
                        />
                      </View>
                    );
                  })}
                </>
              )}
            </View>
          </View>
        )}

        {tab === 1 && (
          <View>
            <View style={[styles.mapWrap, { borderColor: colors.border }]}>
              {trip.route.length > 0 ? (
                <OsmMapView
                  style={styles.flex1}
                  strokeColor={colors.accent}
                  stops={trip.route.map((s) => ({ id: s.id, lat: s.lat, lng: s.lng, color: s.color, label: s.label }))}
                />
              ) : <View style={[styles.center, { backgroundColor: colors.surface }]}><Text style={{ color: colors.textMuted }}>No route data</Text></View>}
            </View>
            <View style={styles.pathHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Detailed Path</Text>
              {trip.route.length >= 3 && (
                <Pressable onPress={optimize} disabled={optimizing} style={[styles.optimizeBtn, { backgroundColor: colors.accentLight, opacity: optimizing ? 0.5 : 1 }]}>
                  <Ionicons name="sparkles-outline" size={13} color={colors.accent} />
                  <Text style={[styles.optimizeBtnText, { color: colors.accent }]}>{optimizing ? "Optimizing…" : "Optimize"}</Text>
                </Pressable>
              )}
            </View>
            <View style={[styles.routeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {trip.route.map((s, i) => (
                <View key={s.id} style={styles.pathRow}>
                  <View style={[styles.pathIcon, { backgroundColor: stopColor(s.color) + "18" }]}><Text style={[styles.pathLabel, { color: stopColor(s.color) }]}>{s.label}</Text></View>
                  <View style={styles.flex1}><Text style={[styles.routeName, { color: colors.text }]}>{s.name}</Text><Text style={[styles.routeSub, { color: colors.textMuted }]}>{i === 0 ? "Departure Point" : `Waypoint via ${trip.transport}`}</Text></View>
                </View>
              ))}
            </View>
          </View>
        )}

        {tab === 2 && (
          <View>
            <View style={[styles.totalSpentCard, { backgroundColor: colors.accent }]}>
              <Text style={styles.totalSpentLabel}>Total Spent</Text>
              <Text style={styles.totalSpentValue}>{formatCurrency(trip.spent, trip.currency)}</Text>
              <View style={styles.totalSpentRemaining}><Text style={styles.totalSpentRemainingText}>REMAINING: {formatCurrency(Math.max(0, trip.budget - trip.spent), trip.currency)}</Text></View>
            </View>
            {trip.spent > 0 && (
              <View style={[styles.insightCard, { backgroundColor: colors.card, borderColor: insight.overBudget ? colors.danger : colors.border }]}>
                <View style={styles.insightHeader}>
                  <Ionicons name={insight.overBudget ? "warning-outline" : "trending-up-outline"} size={16} color={insight.overBudget ? colors.danger : colors.success} />
                  <Text style={[styles.insightTitle, { color: colors.text }]}>Spending Insight</Text>
                </View>
                <Text style={[styles.insightSummary, { color: colors.textSecondary }]}>{insight.summary}</Text>
                <View style={styles.insightMetrics}>
                  <View style={styles.insightMetric}><Text style={[styles.insightMetricVal, { color: colors.text }]}>{formatCurrency(Math.round(insight.dailyBurn), trip.currency)}</Text><Text style={[styles.insightMetricLabel, { color: colors.textMuted }]}>Per Day</Text></View>
                  <View style={styles.insightMetric}><Text style={[styles.insightMetricVal, { color: colors.text }]}>{formatCurrency(insight.projectedTotal, trip.currency)}</Text><Text style={[styles.insightMetricLabel, { color: colors.textMuted }]}>Projected</Text></View>
                  {insight.topCategory && <View style={styles.insightMetric}><Text style={[styles.insightMetricVal, { color: colors.text }]}>{insight.topCategory}</Text><Text style={[styles.insightMetricLabel, { color: colors.textMuted }]}>{Math.round(insight.topCategoryPct * 100)}% Top</Text></View>}
                </View>
                {insight.anomalies.length > 0 && (
                  <Text style={[styles.insightAnomaly, { color: colors.danger }]}>⚡ {insight.anomalies.length} unusually large {insight.anomalies.length === 1 ? "expense" : "expenses"} flagged</Text>
                )}
              </View>
            )}
            {pieData.length > 0 && (
              <View style={[styles.pieCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.pieRow}>
                  <View style={styles.pieWrap}>
                    <PieChart style={styles.pieChart} data={pieData} innerRadius="70%" outerRadius="100%" padAngle={0.05} />
                    <View style={styles.pieCenter}><Text style={[styles.pieCenterVal, { color: colors.text }]}>{trip.expenses.length}</Text><Text style={[styles.pieCenterLabel, { color: colors.textMuted }]}>Items</Text></View>
                  </View>
                  <View style={styles.pieLegend}>
                    {Object.entries(catTotals).slice(0, 4).map(([k, v], i) => (
                      <View key={k} style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: pieColors[i % 5] }]} />
                        <View style={styles.legendInfo}><Text style={[styles.legendName, { color: colors.text }]}>{k}</Text><Text style={[styles.legendPct, { color: colors.textMuted }]}>{Math.round((v / trip.spent) * 100)}%</Text></View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaction History</Text>
            {trip.expenses.length > 0 ? (
              <View style={[styles.txCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {trip.expenses.slice().reverse().map((e) => <ExpenseItem key={e.id} expense={e} tripCurrency={trip.currency} onTogglePrivacy={() => toggleExpensePrivacy(id!, e.id)} />)}
              </View>
            ) : (
              <Pressable onPress={() => setExpSheet(true)} style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.emptyIconWrap, { backgroundColor: colors.accentLight }]}><Ionicons name="receipt-outline" size={28} color={colors.accent} /></View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No expenses yet</Text>
                <Text style={[styles.emptySub, { color: colors.textMuted }]}>Tap here or the + button below to log your first expense</Text>
              </Pressable>
            )}
          </View>
        )}

        {tab === 3 && (
          <View>
            {trip.photos.length > 0 ? (
              <View style={styles.photosGrid}>
                {trip.photos.map((p, i) => (
                  <Pressable key={p.id} onPress={() => setSelectedPhoto(p)} style={[styles.photoItem, { borderColor: colors.border }]}>
                    <Image source={{ uri: p.url }} style={{ width: "100%", height: i % 3 === 0 ? 180 : 140 }} />
                    {p.isPrivate && (
                      <View style={styles.photoPrivateBadge}>
                        <Ionicons name="lock-closed" size={14} color="white" />
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            ) : (
              <Pressable onPress={pickPhoto} style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.emptyIconWrap, { backgroundColor: colors.accentLight }]}><Ionicons name="camera-outline" size={28} color={colors.accent} /></View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Capture memories</Text>
                <Text style={[styles.emptySub, { color: colors.textMuted }]}>Tap here or the 📷 button below to add your first photo</Text>
              </Pressable>
            )}
          </View>
        )}

        {tab === 4 && (
          <View>
            {trip.notes.length > 0 ? (
              <View style={styles.notesGrid}>
                {trip.notes.map((n) => <View key={n.id} style={styles.noteItem}><NoteCard note={n} onPress={() => openNoteEditor(n)} /></View>)}
              </View>
            ) : (
              <Pressable onPress={() => openNoteEditor()} style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.emptyIconWrap, { backgroundColor: colors.accentLight }]}><Ionicons name="create-outline" size={28} color={colors.accent} /></View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Write your first note</Text>
                <Text style={[styles.emptySub, { color: colors.textMuted }]}>Tap here or the ✏️ button below to start writing</Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>

      {/* FABs */}
      {(tab === 2 || tab === 3 || tab === 4) && (
        <Pressable
          onPress={() => { if (tab === 2) setExpSheet(true); if (tab === 3) pickPhoto(); if (tab === 4) openNoteEditor(); }}
          style={[styles.fab, { backgroundColor: colors.accent, shadowColor: colors.accent }]}
        >
          <Ionicons name={tab === 3 ? "camera" : tab === 4 ? "pencil" : "add"} size={20} color="white" />
          <Text style={styles.fabLabel}>{tab === 2 ? "Add Expense" : tab === 3 ? "Add Photo" : "Add Note"}</Text>
        </Pressable>
      )}

      {/* Add Expense Sheet */}
      <BottomSheet isVisible={expSheet} onClose={() => setExpSheet(false)} height="75%">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.expSheetContent}>
          <Text style={[styles.expSheetTitle, { color: colors.text }]}>Add Expense</Text>
          <View style={styles.expAmtWrap}>
            <View style={[styles.expAmtInput, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.expAmtSign, { color: colors.textMuted }]}>Rs</Text>
              <TextInput value={expAmt} onChangeText={setExpAmt} placeholder="0.00" placeholderTextColor={colors.inputPlaceholder} keyboardType="numeric" style={[styles.expAmtText, { color: colors.text }]} autoFocus />
            </View>
          </View>
          <View style={{ marginBottom: 16 }}>
            <Text style={[styles.expLabel, { color: colors.textMuted }]}>What was it for?</Text>
            <TextInput value={expDesc} onChangeText={setExpDesc} placeholder="e.g. Dinner at Locavore" placeholderTextColor={colors.inputPlaceholder} style={[styles.expDescInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]} />
          </View>
          {aiPred && aiPred.category !== "Other" && (
            <View style={[styles.aiPredCard, { backgroundColor: colors.aiBadgeBg, borderColor: colors.aiBadgeBorder }]}>
              <Ionicons name={getCategoryIcon(aiPred.category) as any} size={18} color={colors.aiBadgeText} style={{ marginRight: 8 }} />
              <View><Text style={[styles.aiPredCat, { color: colors.aiBadgeText }]}>{aiPred.category}</Text><Text style={[styles.aiPredLabel, { color: colors.aiBadgeText }]}>AI Suggestion</Text></View>
            </View>
          )}
          <View style={styles.flex1} />
          <GradientButton title="Save Transaction" onPress={saveExpense} />
        </KeyboardAvoidingView>
      </BottomSheet>

      {/* Photo modals */}
      <Modal visible={photoModal} animationType="slide" transparent>
        <View style={styles.photoModalBg}>
          <View style={[styles.photoModalSheet, { backgroundColor: colors.card }]}>
            <View style={styles.photoModalHeader}>
              <Text style={[styles.photoModalTitle, { color: colors.text }]}>Add Memory</Text>
              <Pressable onPress={() => { setPhotoModal(false); setTempUri(null); }} style={[styles.photoModalClose, { backgroundColor: colors.surface }]}><Ionicons name="close" size={18} color={colors.textSecondary} /></Pressable>
            </View>
            {tempUri && <Image source={{ uri: tempUri }} style={styles.photoModalPreview} />}
            <View style={styles.photoModalOptions}>
              <Text style={[styles.photoModalLabel, { color: colors.text }]}>Private Photo</Text>
              <Switch value={photoPrivate} onValueChange={setPhotoPrivate} trackColor={{ false: colors.border, true: colors.accent + "60" }} thumbColor={photoPrivate ? colors.accent : colors.textMuted} />
            </View>
            <TextInput value={caption} onChangeText={setCaption} placeholder="Write a memory..." placeholderTextColor={colors.inputPlaceholder} style={[styles.photoModalInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]} autoFocus />
            <GradientButton title="Save Photo" onPress={savePhoto} />
          </View>
        </View>
      </Modal>

      <Modal visible={!!selectedPhoto} transparent animationType="fade">
        {selectedPhoto && (
          <View style={styles.fullPhotoWrap}>
            <View style={styles.fullPhotoHeader}>
              <Pressable onPress={() => setSelectedPhoto(null)} style={styles.fullPhotoClose}><Ionicons name="close" size={24} color="white" /></Pressable>
              <Pressable onPress={() => { togglePhotoPrivacy(id!, selectedPhoto.id); setSelectedPhoto({ ...selectedPhoto, isPrivate: !selectedPhoto.isPrivate }); }} style={styles.fullPhotoPrivacy}>
                <Ionicons name={selectedPhoto.isPrivate ? "lock-closed" : "lock-open-outline"} size={20} color="white" />
                <Text style={styles.fullPhotoPrivacyText}>{selectedPhoto.isPrivate ? "Private" : "Public"}</Text>
              </Pressable>
            </View>
            <View style={styles.center}><Image source={{ uri: selectedPhoto.url }} style={{ width: SW, height: "70%" }} resizeMode="contain" /></View>
            <View style={styles.fullPhotoInfo}><Text style={styles.fullPhotoCaption}>{selectedPhoto.caption}</Text><Text style={styles.fullPhotoDate}>{new Date(selectedPhoto.date).toDateString()}</Text></View>
          </View>
        )}
      </Modal>

      {/* Note editor */}
      <Modal visible={noteModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={[styles.flex1, { backgroundColor: noteColor }]}>
          <View style={styles.noteHeader}>
            <Pressable onPress={() => setNoteModal(false)} style={styles.noteCloseBtn}><Ionicons name="close" size={22} color="#0F172A" /></Pressable>
            <View style={styles.noteHeaderRight}>
              <Pressable onPress={() => setNotePrivate(!notePrivate)} style={[styles.notePrivacyBtn, { backgroundColor: notePrivate ? "rgba(0,0,0,0.1)" : "rgba(0,0,0,0.05)" }]}>
                <Ionicons name={notePrivate ? "lock-closed" : "lock-open-outline"} size={16} color="#0F172A" />
                <Text style={styles.notePrivacyText}>{notePrivate ? "Private" : "Public"}</Text>
              </Pressable>
              {editNote && <Pressable onPress={async () => { await deleteNote(id!, editNote.id); setNoteModal(false); }} style={styles.noteDeleteBtn}><Ionicons name="trash-outline" size={18} color={colors.danger} /></Pressable>}
              <Pressable onPress={saveNote} style={styles.noteSaveBtn}><Text style={styles.noteSaveText}>Save ✓</Text></Pressable>
            </View>
          </View>
          <ScrollView style={styles.noteBody}>
            <TextInput value={noteTitle} onChangeText={setNoteTitle} placeholder="Trip Note Title" placeholderTextColor="rgba(15,23,42,0.3)" style={styles.noteTitleInput} multiline />
            <TextInput value={noteBody} onChangeText={(t) => { setNoteBody(t); if (!moodTouched) setNoteMood(suggestMood(t)); }} placeholder="What's on your mind?..." placeholderTextColor="rgba(15,23,42,0.3)" style={styles.noteBodyInput} multiline autoFocus={!editNote} />
          </ScrollView>
          <View style={styles.noteToolbar}>
            <View style={styles.noteColors}>
              {["#FFF3E0", "#E8F5E9", "#E3F2FD", "#FCE4EC", "#F3E5F5"].map((c) => <Pressable key={c} onPress={() => setNoteColor(c)} style={[styles.noteColorDot, { backgroundColor: c, borderColor: noteColor === c ? "#0F172A" : "transparent" }]} />)}
            </View>
            <View style={styles.noteMoods}>
              {["😊", "😍", "🤩", "❤️"].map((m) => <Pressable key={m} onPress={() => { setNoteMood(m); setMoodTouched(true); }} style={[styles.noteMoodBtn, noteMood === m && styles.noteMoodActive]}><Text style={styles.noteMoodText}>{m}</Text></Pressable>)}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex1: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: { height: 240, justifyContent: "space-between", paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.3)" },
  heroTop: { flexDirection: "row", justifyContent: "space-between", zIndex: 10 },
  heroBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  heroBottom: { zIndex: 10 },
  heroTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  heroName: { color: "#FFF", fontSize: 26, fontWeight: "700", marginRight: 8 },
  heroStatus: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  heroStatusText: { color: "#FFF", fontSize: 9, fontWeight: "700", textTransform: "uppercase" },
  heroDest: { color: "rgba(255,255,255,0.9)", fontSize: 14, marginBottom: 4 },
  heroDateRow: { flexDirection: "row", alignItems: "center" },
  heroDate: { color: "rgba(255,255,255,0.7)", fontSize: 11, marginLeft: 4 },
  tabBar: { paddingHorizontal: 20, borderBottomWidth: 1 },
  tabItem: { paddingVertical: 14, marginRight: 20, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabText: { fontSize: 13, fontWeight: "600" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 16 },
  statCard: { width: "48%", marginBottom: 10, padding: 14, borderRadius: 8, borderWidth: 1, alignItems: "center" },
  statIcon: { width: 30, height: 30, borderRadius: 6, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  statValue: { fontSize: 16, fontWeight: "700", marginBottom: 1 },
  statLabel: { fontSize: 9, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  budgetCard: { padding: 16, borderRadius: 8, borderWidth: 1, marginBottom: 20 },
  budgetHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  budgetTitle: { fontSize: 14, fontWeight: "700" },
  budgetPct: { fontSize: 14, fontWeight: "700" },
  budgetTrack: { height: 5, borderRadius: 3, overflow: "hidden" },
  budgetFill: { height: "100%", borderRadius: 3 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  routeCard: { padding: 16, borderRadius: 8, borderWidth: 1, marginBottom: 20 },
  routeRow: { flexDirection: "row", alignItems: "flex-start" },
  routeMarkerCol: { alignItems: "center", marginRight: 12 },
  routeMarker: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  routeMarkerText: { color: "#FFF", fontSize: 10, fontWeight: "700" },
  routeLine: { width: 2, height: 24 },
  routeInfo: { flex: 1, paddingTop: 2, marginBottom: 12 },
  routeName: { fontSize: 13, fontWeight: "600" },
  routeSub: { fontSize: 10 },
  mapWrap: { height: 260, borderRadius: 8, overflow: "hidden", borderWidth: 1, marginBottom: 16 },
  pathHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  optimizeBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 6 },
  optimizeBtnText: { fontSize: 12, fontWeight: "600" },
  insightCard: { padding: 16, borderRadius: 8, borderWidth: 1, marginBottom: 20 },
  insightHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  insightTitle: { fontSize: 14, fontWeight: "700" },
  insightSummary: { fontSize: 12, lineHeight: 18, marginBottom: 12 },
  insightMetrics: { flexDirection: "row", justifyContent: "space-between" },
  insightMetric: { flex: 1 },
  insightMetricVal: { fontSize: 14, fontWeight: "700" },
  insightMetricLabel: { fontSize: 9, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 1 },
  insightAnomaly: { fontSize: 11, fontWeight: "600", marginTop: 12 },
  pathRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  pathIcon: { width: 36, height: 36, borderRadius: 6, alignItems: "center", justifyContent: "center", marginRight: 12 },
  pathLabel: { fontSize: 11, fontWeight: "600" },
  totalSpentCard: { padding: 28, borderRadius: 8, alignItems: "center", marginBottom: 20 },
  totalSpentLabel: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 },
  totalSpentValue: { color: "#FFF", fontSize: 36, fontWeight: "700" },
  totalSpentRemaining: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, marginTop: 12 },
  totalSpentRemainingText: { color: "rgba(255,255,255,0.8)", fontSize: 10, fontWeight: "600" },
  pieCard: { padding: 20, borderRadius: 8, borderWidth: 1, marginBottom: 20 },
  pieRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pieWrap: { height: 120, width: 120, position: "relative", justifyContent: "center", alignItems: "center" },
  pieChart: { height: 110, width: 110, position: "absolute" },
  pieCenter: { alignItems: "center" },
  pieCenterVal: { fontSize: 16, fontWeight: "700" },
  pieCenterLabel: { fontSize: 8, textTransform: "uppercase" },
  pieLegend: { flex: 1, marginLeft: 20 },
  legendRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  legendInfo: { flex: 1, flexDirection: "row", justifyContent: "space-between" },
  legendName: { fontSize: 10, fontWeight: "600" },
  legendPct: { fontSize: 10, fontWeight: "700" },
  txCard: { paddingHorizontal: 16, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  empty: { textAlign: "center", paddingVertical: 40, fontSize: 14 },
  photosGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  photoItem: { width: "48%", marginBottom: 10, borderRadius: 8, overflow: "hidden", borderWidth: 1 },
  notesGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  noteItem: { width: "48%", marginBottom: 8 },
  fab: { position: "absolute", bottom: 100, right: 20, flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, borderRadius: 28, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4, zIndex: 20 },
  fabLabel: { color: "#FFF", fontSize: 14, fontWeight: "700", marginLeft: 8 },
  emptyCard: { alignItems: "center", padding: 32, borderRadius: 8, borderWidth: 1, borderStyle: "dashed" },
  emptyIconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  emptyTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  emptySub: { fontSize: 12, textAlign: "center", lineHeight: 18 },
  expSheetContent: { flex: 1, padding: 24 },
  expSheetTitle: { fontSize: 20, fontWeight: "700", textAlign: "center", marginBottom: 24 },
  expAmtWrap: { alignItems: "center", marginBottom: 24 },
  expAmtInput: { flexDirection: "row", alignItems: "center", borderRadius: 8, borderWidth: 1, paddingHorizontal: 20, paddingVertical: 12, width: 220 },
  expAmtSign: { fontSize: 28, fontWeight: "700", marginRight: 8 },
  expAmtText: { flex: 1, fontSize: 32, fontWeight: "700" },
  expLabel: { fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, marginLeft: 2 },
  expDescInput: { fontSize: 14, padding: 16, borderRadius: 8, borderWidth: 1 },
  aiPredCard: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6, borderWidth: 1, marginBottom: 16 },
  aiPredIcon: { fontSize: 18, marginRight: 8 },
  aiPredCat: { fontSize: 12, fontWeight: "700" },
  aiPredLabel: { fontSize: 8, textTransform: "uppercase", opacity: 0.7 },
  photoModalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  photoModalSheet: { borderTopLeftRadius: 12, borderTopRightRadius: 12, padding: 24, paddingBottom: 40 },
  photoModalHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  photoModalTitle: { fontSize: 20, fontWeight: "700" },
  photoModalClose: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  photoModalPreview: { width: "100%", height: 180, borderRadius: 8, marginBottom: 16 },
  photoModalInput: { fontSize: 14, padding: 16, borderRadius: 6, borderWidth: 1, marginBottom: 16 },
  fullPhotoWrap: { flex: 1, backgroundColor: "#0F172A" },
  fullPhotoInfo: { position: "absolute", bottom: 48, left: 20, right: 20, backgroundColor: "rgba(255,255,255,0.1)", padding: 20, borderRadius: 8 },
  fullPhotoCaption: { color: "#FFF", fontSize: 16, fontWeight: "700", marginBottom: 4 },
  fullPhotoDate: { color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 },
  noteHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.05)" },
  noteCloseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.05)", alignItems: "center", justifyContent: "center" },
  noteHeaderRight: { flexDirection: "row", alignItems: "center" },
  noteDeleteBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FEF2F2", alignItems: "center", justifyContent: "center", marginRight: 10 },
  noteSaveBtn: { backgroundColor: "#0F172A", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6 },
  noteSaveText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  noteBody: { flex: 1, paddingHorizontal: 28, paddingTop: 24 },
  noteTitleInput: { color: "#0F172A", fontSize: 26, fontWeight: "700", marginBottom: 16 },
  noteBodyInput: { color: "rgba(15,23,42,0.8)", fontSize: 16, lineHeight: 28 },
  noteToolbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginHorizontal: 20, marginBottom: 36, backgroundColor: "rgba(255,255,255,0.6)", padding: 12, borderRadius: 8 },
  noteColors: { flexDirection: "row" },
  noteColorDot: { width: 28, height: 28, borderRadius: 14, marginHorizontal: 3, borderWidth: 2 },
  noteMoods: { flexDirection: "row", backgroundColor: "rgba(0,0,0,0.05)", padding: 3, borderRadius: 8 },
  noteMoodBtn: { width: 30, height: 30, borderRadius: 6, alignItems: "center", justifyContent: "center", marginHorizontal: 1 },
  noteMoodActive: { backgroundColor: "#FFF", borderWidth: 1, borderColor: "rgba(0,0,0,0.08)" },
  noteMoodText: { fontSize: 14 },
  // Privacy
  privacyCard: { borderRadius: 8, borderWidth: 1, overflow: "hidden" },
  privacyRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderBottomWidth: 1 },
  privacyLeft: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 10 },
  privacyIcon: { width: 34, height: 34, borderRadius: 6, alignItems: "center", justifyContent: "center", marginRight: 10 },
  privacyLabel: { fontSize: 14, fontWeight: "600" },
  privacySubLabel: { fontSize: 13, fontWeight: "600" },
  privacySub: { fontSize: 10, marginTop: 1 },
  photoPrivateBadge: { position: "absolute", top: 8, right: 8, backgroundColor: "rgba(0,0,0,0.5)", width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  photoModalOptions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingHorizontal: 4 },
  photoModalLabel: { fontSize: 14, fontWeight: "600" },
  fullPhotoHeader: { position: "absolute", top: 56, left: 20, right: 20, zIndex: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  fullPhotoClose: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  fullPhotoPrivacy: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, gap: 6 },
  fullPhotoPrivacyText: { color: "white", fontSize: 12, fontWeight: "600" },
  notePrivacyBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, marginRight: 10 },
  notePrivacyText: { color: "#0F172A", fontSize: 12, fontWeight: "600" },
});
