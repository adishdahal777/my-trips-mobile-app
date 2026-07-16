import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://mytrips.ratoguras.com/api";

async function getToken(): Promise<string | null> {
  const stored = await AsyncStorage.getItem("mytrips_auth");
  if (!stored) return null;
  return JSON.parse(stored).token ?? null;
}

export async function apiFetch(path: string, options: { method?: string; body?: any } = {}) {
  const token = await getToken();
  const headers: Record<string, string> = { Accept: "application/json" };
  let body: any;

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { method: options.method ?? "GET", headers, body });
  const text = await res.text();
  const parsed = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const message = typeof parsed.error === "string" ? parsed.error : parsed.message ?? "Request failed";
    throw new Error(message);
  }

  return parsed;
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(`${API_BASE_URL}/feed`, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

export async function uploadImage(uri: string): Promise<string> {
  if (uri.startsWith("http")) return uri;

  const token = await getToken();
  const form = new FormData();
  form.append("image", { uri, name: "upload.jpg", type: "image/jpeg" } as any);

  const res = await fetch(`${API_BASE_URL}/uploads/image`, {
    method: "POST",
    headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: form,
  });
  const parsed = await res.json();

  if (!res.ok) throw new Error(parsed.error ?? "Upload failed");

  return parsed.url as string;
}

export async function uploadAvatar(uri: string): Promise<string> {
  const token = await getToken();
  const form = new FormData();
  form.append("avatar", { uri, name: "avatar.jpg", type: "image/jpeg" } as any);

  const res = await fetch(`${API_BASE_URL}/profile/avatar`, {
    method: "POST",
    headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: form,
  });
  const parsed = await res.json();

  if (!res.ok) throw new Error(parsed.error ?? "Avatar upload failed");

  return parsed.avatar_url as string;
}
