import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { MOCK_TRIPS } from "../../data/mockData";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const tripCount = MOCK_TRIPS.length;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: 85 + (insets.bottom > 0 ? insets.bottom - 20 : 0),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 20,
          paddingTop: 12,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: colors.shadowOpacity,
          shadowRadius: 12,
          elevation: 20,
        },
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: {
          fontFamily: "Inter-Bold",
          fontSize: 10,
          fontWeight: "700",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
          ),
          tabBarLabel: ({ focused, color }) =>
            focused ? <Text style={{ color, fontSize: 10, fontWeight: "700", marginTop: 4 }}>Home</Text> : null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Feed",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "earth" : "earth-outline"} size={22} color={color} />
          ),
          tabBarLabel: ({ focused, color }) =>
            focused ? <Text style={{ color, fontSize: 10, fontWeight: "700", marginTop: 4 }}>Feed</Text> : null,
        }}
      />
      <Tabs.Screen
        name="trips/create"
        options={{
          title: "",
          tabBarIcon: () => (
            <View style={[styles.centerBtn, { backgroundColor: colors.coral, shadowColor: colors.coral, borderColor: colors.tabBar }]}>
              <Ionicons name="add" size={32} color="white" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="trips/index"
        options={{
          title: "Trips",
          tabBarBadge: tripCount > 0 ? tripCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.coral,
            color: "white",
            fontSize: 10,
            fontWeight: "bold",
          },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "map" : "map-outline"} size={22} color={color} />
          ),
          tabBarLabel: ({ focused, color }) =>
            focused ? <Text style={{ color, fontSize: 10, fontWeight: "700", marginTop: 4 }}>Trips</Text> : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={22} color={color} />
          ),
          tabBarLabel: ({ focused, color }) =>
            focused ? <Text style={{ color, fontSize: 10, fontWeight: "700", marginTop: 4 }}>Profile</Text> : null,
        }}
      />
      {/* Hidden Screens */}
      <Tabs.Screen name="trips/[id]" options={{ href: null, tabBarStyle: { display: "none" } }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centerBtn: {
    marginTop: -24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
});
