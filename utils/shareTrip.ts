import * as Linking from "expo-linking";
import { Share, Platform } from "react-native";
import type { Trip } from "../data/mockData";

// The custom URL scheme for deep linking
const APP_SCHEME = "mytripsmobileapp";

// In production, replace with your actual web domain
const WEB_DOMAIN = "https://mytrips.app";

/**
 * Generate a deep link URL for a trip.
 * This creates both a custom scheme link (opens app directly)
 * and a web fallback link.
 */
export function getTripDeepLink(tripId: string): string {
  // Custom scheme link — opens the app directly if installed
  return Linking.createURL(`/public-trip`, { queryParams: { id: tripId } });
}

/**
 * Generate a web-compatible share link.
 * When clicked on mobile: opens the app if installed, otherwise opens web fallback.
 * When clicked on desktop: opens the web fallback page.
 */
export function getTripWebLink(tripId: string): string {
  return `${WEB_DOMAIN}/trip/${tripId}`;
}

/**
 * Share a trip via the native share sheet.
 * Generates a rich message with the trip details and a shareable link.
 */
export async function shareTrip(trip: Trip): Promise<void> {
  const user = trip.user || { name: "A traveler" };
  const deepLink = getTripDeepLink(trip.id);
  const webLink = getTripWebLink(trip.id);

  const days = Math.ceil(
    (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000
  );

  const message = [
    `✈️ ${trip.name}`,
    ``,
    `${trip.flag} ${trip.destination} · ${days} days`,
    trip.description ? `"${trip.description}"` : "",
    ``,
    `Shared by ${user.name} on My Trips`,
    ``,
    `📱 Open in app: ${deepLink}`,
    `🌐 View on web: ${webLink}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await Share.share(
      {
        message,
        title: `${trip.name} — My Trips`,
        ...(Platform.OS === "ios" ? { url: deepLink } : {}),
      },
      {
        dialogTitle: `Share "${trip.name}"`,
        subject: `${user.name} shared a trip to ${trip.destination}`,
      }
    );
  } catch (error) {
    // User cancelled or share failed silently
  }
}

/**
 * Parse an incoming deep link URL and extract the trip ID.
 */
export function parseTripFromUrl(url: string): string | null {
  try {
    const parsed = Linking.parse(url);
    if (parsed.path?.includes("public-trip") && parsed.queryParams?.id) {
      return parsed.queryParams.id as string;
    }
    return null;
  } catch {
    return null;
  }
}
