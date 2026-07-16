import Ionicons from "react-native-vector-icons/Ionicons";
import { router } from "../../utils/navigation";
import { useRef, useState } from "react";
import { Animated, Dimensions, ImageBackground, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GradientButton } from "../../components/GradientButton";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const { height: SH } = Dimensions.get("window");

export default function Login() {
  const { colors } = useTheme();
  const { login, sendOtp } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleSendOtp = async () => {
    if (!email.includes("@")) { setError("Please enter a valid email"); shake(); return; }
    setError(""); setLoading(true);
    const ok = await sendOtp(email);
    setLoading(false);
    if (ok) setStep("otp"); else setError("Failed to send OTP");
  };

  const handleLogin = async () => {
    if (otp.length !== 6) { setError("Please enter 6-digit OTP"); shake(); return; }
    setError(""); setLoading(true);
    const ok = await login(email, otp);
    setLoading(false);
    if (!ok) { setError("Invalid or expired OTP."); shake(); }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Hero Header */}
      <ImageBackground
        source={{ uri: "https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?w=1200" }}
        style={styles.hero}
      >
        <View style={styles.heroOverlay} />
        <SafeAreaView edges={["top"]} style={styles.heroContent}>
          <View style={styles.topNav}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="close" size={24} color="#FFF" />
            </Pressable>
            <View style={styles.logoBadge}>
              <Ionicons name="airplane" size={16} color="#FFF" />
            </View>
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Welcome Back</Text>
            <Text style={styles.heroSub}>Continue your journey with us</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>

      <View style={[styles.formContainer, { backgroundColor: colors.card }]}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex1}>
          <ScrollView
            style={styles.flex1}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[styles.flex1, { transform: [{ translateX: shakeAnim }] }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  {step === "email" ? "Login" : "Verification"}
                </Text>
                <Text style={[styles.cardSub, { color: colors.textMuted }]}>
                  {step === "email" ? "Enter your email to sign in." : `Verification code sent to ${email}`}
                </Text>
              </View>

              {step === "email" ? (
                <View>
                  <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Email address"
                      placeholderTextColor={colors.inputPlaceholder}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={[styles.input, { color: colors.text }]}
                    />
                  </View>
                  {error ? <Text style={styles.error}>{error}</Text> : null}
                  <GradientButton
                    title={loading ? "Sending..." : "Continue"}
                    onPress={handleSendOtp}
                    disabled={loading}
                    style={styles.actionBtn}
                  />
                </View>
              ) : (
                <View>
                  <View style={[styles.otpRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <TextInput
                      value={otp}
                      onChangeText={setOtp}
                      placeholder="000000"
                      placeholderTextColor={colors.inputPlaceholder}
                      keyboardType="number-pad"
                      maxLength={6}
                      style={[styles.otpInput, { color: colors.text }]}
                      autoFocus
                    />
                  </View>
                  {error ? <Text style={styles.error}>{error}</Text> : null}
                  <Pressable
                    onPress={handleLogin}
                    disabled={loading}
                    style={[styles.simpleBtn, { backgroundColor: colors.accent, opacity: loading ? 0.6 : 1 }]}
                  >
                    <Text style={styles.simpleBtnText}>{loading ? "Verifying..." : "Verify & Login"}</Text>
                  </Pressable>
                  <Pressable onPress={() => setStep("email")} style={styles.changeBtn}>
                    <Text style={[styles.changeBtnText, { color: colors.accent }]}>Change Email</Text>
                  </Pressable>
                </View>
              )}

            </Animated.View>

            <Pressable onPress={() => router.push("Auth", { screen: "Register" })} style={styles.footerLink}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                New traveler? <Text style={[styles.footerLinkBold, { color: colors.accent }]}>Create an account</Text>
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex1: { flex: 1 },
  hero: { height: SH * 0.35, justifyContent: "flex-end" },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  heroContent: { flex: 1, padding: 24, justifyContent: "space-between" },
  topNav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  logoBadge: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#FF6B6B", alignItems: "center", justifyContent: "center" },
  heroText: { marginBottom: 30 },
  heroTitle: { color: "#FFF", fontSize: 32 },
  heroSub: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  formContainer: { flex: 1, marginTop: -30, borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: "hidden" },
  scrollContent: { padding: 30, paddingBottom: 50 },
  cardHeader: { marginBottom: 24 },
  cardTitle: { fontSize: 24, marginBottom: 4 },
  cardSub: { fontSize: 13 },
  inputContainer: { flexDirection: "row", alignItems: "center", borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, marginBottom: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 16, fontSize: 15 },
  error: { color: "#FF6B6B", fontSize: 13, marginBottom: 16, textAlign: "center" },
  actionBtn: { marginTop: 8 },
  simpleBtn: { marginTop: 8, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  simpleBtnText: { color: "#FFF", fontSize: 15 },
  otpRow: { borderRadius: 16, paddingVertical: 12, borderWidth: 1, marginBottom: 20, alignItems: "center" },
  otpInput: { fontSize: 28, letterSpacing: 8, paddingHorizontal: 20 },
  changeBtn: { marginTop: 16, alignItems: "center" },
  changeBtnText: { fontSize: 13 },
  footerLink: { marginTop: 32 },
  footerText: { textAlign: "center", fontSize: 14 },
  footerLinkBold: {},
});
