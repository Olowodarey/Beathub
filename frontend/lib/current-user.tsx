"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  buildCurrentUser,
  type CurrentUserKey,
} from "@/lib/mock-data";
import type { CurrentUser } from "@/types";

// Dev-only role switcher. Persists selection to localStorage so page
// refreshes hold the chosen role. Rip out and replace with real Clerk data
// once auth is wired.

const STORAGE_KEY = "beathub:mockRole";
const DEFAULT_ROLE: CurrentUserKey = "owner";

interface RoleContextValue {
  currentUser: CurrentUser;
  activeKey: CurrentUserKey;
  setActiveKey: (key: CurrentUserKey) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

const isValidKey = (key: string | null): key is CurrentUserKey =>
  key === "owner" || key === "admin" || key === "creator" || key === "labelRep";

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [activeKey, setActiveKeyState] = useState<CurrentUserKey>(DEFAULT_ROLE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isValidKey(stored)) setActiveKeyState(stored);
    setHydrated(true);
  }, []);

  const setActiveKey = useCallback((key: CurrentUserKey) => {
    setActiveKeyState(key);
    window.localStorage.setItem(STORAGE_KEY, key);
  }, []);

  const value = useMemo<RoleContextValue>(
    () => ({
      currentUser: buildCurrentUser(activeKey),
      activeKey,
      setActiveKey,
    }),
    [activeKey, setActiveKey],
  );

  // Avoid a flash of the wrong role before localStorage read.
  if (!hydrated) {
    return (
      <RoleContext.Provider value={value}>
        <div aria-hidden className="opacity-0">
          {children}
        </div>
      </RoleContext.Provider>
    );
  }

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useCurrentUser() {
  const ctx = useContext(RoleContext);
  if (!ctx)
    throw new Error("useCurrentUser must be used inside a RoleProvider");
  return ctx;
}
