import { Share } from "react-native";

const WEB_DOMAIN = "https://mytrips.ratoguras.com";

export function getProfileDeepLink(userId: string): string {
  return `mytripsmobileapp://user-profile?id=${userId}`;
}

export function getProfileWebLink(userId: string): string {
  return `${WEB_DOMAIN}/u/${userId}`;
}

export async function shareProfile(userId: string, name: string): Promise<void> {
  const deepLink = getProfileDeepLink(userId);
  const webLink = getProfileWebLink(userId);

  const message = [
    `Check out ${name}'s travels on My Trips`,
    ``,
    `Open in app: ${deepLink}`,
    `View on web: ${webLink}`,
  ].join("\n");

  try {
    await Share.share({ message, title: `${name} — My Trips` });
  } catch {
    // user cancelled or share failed silently
  }
}
