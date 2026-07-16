import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { apiFetch } from "../services/api";

interface NotificationCtx {
  unreadCount: number;
  refresh: () => Promise<void>;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

const NotificationContext = createContext<NotificationCtx>({} as NotificationCtx);

// Module-level ref so code outside the React tree (the push listener registered
// once at app root) can bump the badge without prop-drilling or a re-render loop.
let bumpUnread: (() => void) | null = null;

export function bumpUnreadFromOutsideReact() {
  bumpUnread?.();
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const res = await apiFetch("/notifications");
      if (mounted.current) setUnreadCount(res.unreadCount ?? 0);
    } catch {
      // keep last known count
    }
  }, []);

  const increment = useCallback(() => setUnreadCount((c) => c + 1), []);
  const decrement = useCallback(() => setUnreadCount((c) => Math.max(0, c - 1)), []);
  const reset = useCallback(() => setUnreadCount(0), []);

  bumpUnread = increment;

  return (
    <NotificationContext.Provider value={{ unreadCount, refresh, increment, decrement, reset }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
