import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import { registerForPushNotifications, unregisterPushToken } from "../utils/push";

interface User {
  id: string; name: string; email: string; bio?: string;
  avatar: string; memberSince: string; totalTrips: number; countries: number; kmTraveled: number;
}

interface AuthCtx {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOtp: (email: string) => Promise<boolean>;
  login: (email: string, otp: string) => Promise<boolean>;
  register: (name: string, email: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem("mytrips_auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.token) {
          setUser(parsed.user);
          registerForPushNotifications().catch(() => {});
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const sendOtp = async (email: string): Promise<boolean> => {
    try {
      await apiFetch("/auth/otp/send", { method: "POST", body: { email } });
      return true;
    } catch {
      return false;
    }
  };

  const verify = async (email: string, otp: string, name?: string): Promise<boolean> => {
    try {
      const res = await apiFetch("/auth/otp/verify", { method: "POST", body: { email, otp, name } });
      await AsyncStorage.setItem("mytrips_auth", JSON.stringify({ token: res.access_token, user: res.user }));
      setUser(res.user);
      registerForPushNotifications().catch(() => {});
      return true;
    } catch {
      return false;
    }
  };

  const login = (email: string, otp: string) => verify(email, otp);
  const register = (name: string, email: string, otp: string) => verify(email, otp, name);

  const logout = async () => {
    await unregisterPushToken();
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // best-effort: still clear local session
    }
    await AsyncStorage.removeItem("mytrips_auth");
    setUser(null);
  };

  const updateUser = async (patch: Partial<User>) => {
    if (!user) return;
    const merged = { ...user, ...patch };
    setUser(merged);
    const stored = await AsyncStorage.getItem("mytrips_auth");
    const parsed = stored ? JSON.parse(stored) : {};
    await AsyncStorage.setItem("mytrips_auth", JSON.stringify({ ...parsed, user: merged }));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, sendOtp, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
