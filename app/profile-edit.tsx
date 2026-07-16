import { router } from "../utils/navigation";
import React, { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../components/ScreenHeader";
import { GradientButton } from "../components/GradientButton";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { apiFetch } from "../services/api";

const INITIAL = { bio: "", phone: "", gender: "", address: "", nationality: "" };

const FIELDS: { key: keyof typeof INITIAL; label: string; placeholder: string }[] = [
  { key: "bio", label: "Bio", placeholder: "Tell people about your travels" },
  { key: "phone", label: "Phone", placeholder: "+1 555 000 0000" },
  { key: "gender", label: "Gender", placeholder: "e.g. Female" },
  { key: "address", label: "Address", placeholder: "City, Country" },
  { key: "nationality", label: "Nationality", placeholder: "e.g. American" },
];

export default function ProfileEdit() {
  const { colors } = useTheme();
  const { updateUser } = useAuth();
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch("/profile")
      .then((res) => {
        const p = res.profile ?? {};
        setForm({
          bio: p.bio ?? "",
          phone: p.phone ?? "",
          gender: p.gender ?? "",
          address: p.address ?? "",
          nationality: p.nationality ?? "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await apiFetch("/profile", { method: "POST", body: form });
      await updateUser({ bio: form.bio });
      router.back();
    } catch (e: any) {
      Alert.alert("Couldn't save", e?.message ?? "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Personal Information" showBack />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex1}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {!loading &&
            FIELDS.map((f) => (
              <View key={f.key} style={styles.fieldWrap}>
                <Text style={[styles.label, { color: colors.textMuted }]}>{f.label}</Text>
                <TextInput
                  value={form[f.key]}
                  onChangeText={(t) => setForm({ ...form, [f.key]: t })}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.inputPlaceholder}
                  multiline={f.key === "bio"}
                  style={[
                    styles.input,
                    f.key === "bio" && styles.inputMultiline,
                    { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
                  ]}
                />
              </View>
            ))}

          <GradientButton title={saving ? "Saving…" : "Save Changes"} onPress={save} disabled={saving || loading} style={styles.saveBtn} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex1: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 },
  input: { fontSize: 15, padding: 14, borderRadius: 8, borderWidth: 1 },
  inputMultiline: { minHeight: 90, textAlignVertical: "top" },
  saveBtn: { marginTop: 8 },
});
