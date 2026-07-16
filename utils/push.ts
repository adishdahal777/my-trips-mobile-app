import messaging from "@react-native-firebase/messaging";
import { Platform } from "react-native";
import { showForegroundToast } from "../components/ForegroundNotificationToast";
import { bumpUnreadFromOutsideReact } from "../context/NotificationContext";
import { apiFetch } from "../services/api";
import { router } from "./navigation";

// Maps a notification's `data` payload to where tapping it should navigate.
function routeForNotification(data: Record<string, string | undefined>) {
  switch (data.type) {
    case "new_follower":
      return data.actorId ? { screen: "UserProfile", params: { userId: data.actorId } } : null;
    case "trip_liked":
    case "trip_commented":
    case "followed_user_trip":
      return data.tripId ? { screen: "PublicTrip", params: { id: data.tripId } } : null;
    default:
      return null;
  }
}

export function handleNotificationOpen(data: Record<string, string | undefined>) {
  const target = routeForNotification(data);
  if (target) router.push(target.screen, target.params);
}

export async function registerForPushNotifications() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) return;

  const token = await messaging().getToken();
  try {
    await apiFetch("/device-tokens", {
      method: "POST",
      body: { token, platform: Platform.OS },
    });
  } catch {
    // best-effort — retried on next app open/token refresh
  }

  return token;
}

export async function unregisterPushToken() {
  try {
    const token = await messaging().getToken();
    await apiFetch("/device-tokens", { method: "DELETE", body: { token } });
  } catch {
    // best-effort
  }
}

// Wires all three "app state" notification paths. Call once near app root.
export function setupNotificationListeners() {
  const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
    // iOS only shows the native banner while foregrounded if the app registers a
    // UNUserNotificationCenterDelegate (native side) — this in-app toast + badge
    // bump guarantees visible feedback regardless of that native wiring.
    bumpUnreadFromOutsideReact();

    const data = (remoteMessage.data ?? {}) as Record<string, string>;
    showForegroundToast({
      title: remoteMessage.notification?.title ?? "New notification",
      body: remoteMessage.notification?.body ?? "",
      onPress: () => handleNotificationOpen(data),
    });
  });

  const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (token) => {
    try {
      await apiFetch("/device-tokens", { method: "POST", body: { token, platform: Platform.OS } });
    } catch {
      // best-effort
    }
  });

  // Tapped while app was backgrounded (not killed).
  messaging().onNotificationOpenedApp((remoteMessage) => {
    if (remoteMessage?.data) handleNotificationOpen(remoteMessage.data as Record<string, string>);
  });

  // App was killed and opened by tapping a notification.
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage?.data) handleNotificationOpen(remoteMessage.data as Record<string, string>);
    });

  return () => {
    unsubscribeForeground();
    unsubscribeTokenRefresh();
  };
}
