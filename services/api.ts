import AsyncStorage from "@react-native-async-storage/async-storage";

// Dev backend runs on the same machine, port 8000. Which host reaches it depends on
// how the device connects — try each candidate and cache whichever actually answers,
// instead of guessing from unreliable device/emulator detection.
//   - LAN IP: works for a physical device on the same Wi-Fi (and usually the emulator too)
//   - 10.0.2.2: Android emulator's alias for the host machine
//   - localhost: iOS simulator, or a USB device with `adb reverse tcp:8000 tcp:8000`
const DEV_LAN_IP = "192.168.1.58";
const CANDIDATE_HOSTS = [DEV_LAN_IP, "10.0.2.2", "localhost"];
const PORT = 8000;

let cachedBaseUrl: string | null = null;
let resolving: Promise<string> | null = null;

async function resolveApiBaseUrl(): Promise<string> {
  if (cachedBaseUrl) return cachedBaseUrl;
  if (resolving) return resolving;

  resolving = (async () => {
    for (const host of CANDIDATE_HOSTS) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1500);
      try {
        await fetch(`http://${host}:${PORT}/api/feed`, { signal: controller.signal });
        cachedBaseUrl = `http://${host}:${PORT}/api`;
        return cachedBaseUrl;
      } catch {
        // try the next candidate
      } finally {
        clearTimeout(timeout);
      }
    }
    cachedBaseUrl = `http://${DEV_LAN_IP}:${PORT}/api`;
    return cachedBaseUrl;
  })();

  return resolving;
}

async function getToken(): Promise<string | null> {
  const stored = await AsyncStorage.getItem("mytrips_auth");
  if (!stored) return null;
  return JSON.parse(stored).token ?? null;
}

export async function apiFetch(path: string, options: { method?: string; body?: any } = {}) {
  const [baseUrl, token] = await Promise.all([resolveApiBaseUrl(), getToken()]);
  const headers: Record<string, string> = { Accept: "application/json" };
  let body: any;

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}${path}`, { method: options.method ?? "GET", headers, body });
  const text = await res.text();
  const parsed = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const message = typeof parsed.error === "string" ? parsed.error : parsed.message ?? "Request failed";
    throw new Error(message);
  }

  return parsed;
}

export async function uploadImage(uri: string): Promise<string> {
  if (uri.startsWith("http")) return uri;

  const [baseUrl, token] = await Promise.all([resolveApiBaseUrl(), getToken()]);
  const form = new FormData();
  form.append("image", { uri, name: "upload.jpg", type: "image/jpeg" } as any);

  const res = await fetch(`${baseUrl}/uploads/image`, {
    method: "POST",
    headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: form,
  });
  const parsed = await res.json();

  if (!res.ok) throw new Error(parsed.error ?? "Upload failed");

  return parsed.url as string;
}
