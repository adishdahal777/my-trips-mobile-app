import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { MOCK_USER } from "../data/mockData";

interface User {
  id: string; name: string; email: string;
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
        if (parsed.token) setUser(parsed.user);
      }
      setIsLoading(false);
    })();
  }, []);

  const sendOtp = async (email: string): Promise<boolean> => {
    console.log(`[MOCK] Sending OTP 123456 to ${email}`);
    return true;
  };

  const login = async (email: string, otp: string): Promise<boolean> => {
    if (otp === "123456") {
      // For mock purposes, we'll just use the MOCK_USER or create a session
      const userData = (email === MOCK_USER.email) ? MOCK_USER : { ...MOCK_USER, email };
      await AsyncStorage.setItem("mytrips_auth", JSON.stringify({ token: "mock-jwt-token", user: userData }));
      setUser(userData as User);
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, otp: string): Promise<boolean> => {
    if (otp === "123456") {
      const newUser: User = { ...MOCK_USER, id: "u" + Date.now(), name, email };
      await AsyncStorage.setItem("mytrips_auth", JSON.stringify({ token: "mock-jwt-token", user: newUser }));
      setUser(newUser);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await AsyncStorage.removeItem("mytrips_auth");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, sendOtp, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
