"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:4000";

const TOKEN_KEY = "beathub:token";

interface AuthedUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface AuthContextValue {
  /** True once we've read any persisted token from storage. */
  isLoaded: boolean;
  /** True when a session token is present. */
  isSignedIn: boolean;
  /** Returns the current session token (or null). Async to mirror the old API. */
  getToken: () => Promise<string | null>;
  register: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signOut: () => void;
}

const Ctx = createContext<AuthContextValue | null>(null);

interface AuthResponse {
  token: string;
  user: AuthedUser;
}

async function postAuth(
  path: string,
  body: unknown,
): Promise<AuthResponse> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = (await res.json()) as { message?: string | string[] };
      if (Array.isArray(data.message)) message = data.message[0];
      else if (data.message) message = data.message;
    } catch {}
    throw new Error(message);
  }
  return res.json() as Promise<AuthResponse>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem(TOKEN_KEY)
        : null;
    setToken(stored);
    setIsLoaded(true);
  }, []);

  const persist = useCallback((next: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOKEN_KEY, next);
    }
    setToken(next);
  }, []);

  const getToken = useCallback(async () => token, [token]);

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      const { token: next } = await postAuth("/auth/register", {
        email,
        password,
        name,
      });
      persist(next);
    },
    [persist],
  );

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      const { token: next } = await postAuth("/auth/login", {
        email,
        password,
      });
      persist(next);
    },
    [persist],
  );

  const signInWithGoogle = useCallback(
    async (idToken: string) => {
      const { token: next } = await postAuth("/auth/google", { idToken });
      persist(next);
    },
    [persist],
  );

  const signOut = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_KEY);
    }
    setToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoaded,
      isSignedIn: !!token,
      getToken,
      register,
      signInWithPassword,
      signInWithGoogle,
      signOut,
    }),
    [
      isLoaded,
      token,
      getToken,
      register,
      signInWithPassword,
      signInWithGoogle,
      signOut,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
