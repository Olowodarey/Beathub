"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/lib/auth";
import { useApiClient } from "@/lib/api-client";
import type { MeResponse } from "@/lib/api-types";
import type { CurrentUser, Membership, Team } from "@/types";

const STORAGE_KEY = "beathub:activeTeamId";

interface CurrentUserContextValue {
  currentUser: CurrentUser | null;
  memberships: Membership[];
  teams: Team[];
  activeTeamId: string | null;
  setActiveTeamId: (teamId: string) => void;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const Ctx = createContext<CurrentUserContextValue | null>(null);

export function CurrentUserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const api = useApiClient();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [activeTeamId, setActiveTeamIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<MeResponse>("/me");
      setMe(data);
      const stored =
        typeof window !== "undefined"
          ? window.localStorage.getItem(STORAGE_KEY)
          : null;
      const validStored =
        stored && data.teams.some((t) => t.id === stored) ? stored : null;
      const chosen = validStored ?? data.teams[0]?.id ?? null;
      setActiveTeamIdState(chosen);
    } catch (e) {
      setError(e as Error);
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setMe(null);
      setActiveTeamIdState(null);
      setLoading(false);
      setError(null);
      return;
    }
    void load();
  }, [isLoaded, isSignedIn, load]);

  const setActiveTeamId = useCallback((teamId: string) => {
    setActiveTeamIdState(teamId);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, teamId);
    }
  }, []);

  const value = useMemo<CurrentUserContextValue>(() => {
    const membership =
      me && activeTeamId
        ? me.memberships.find((m) => m.teamId === activeTeamId) ?? null
        : null;
    const team =
      me && activeTeamId
        ? me.teams.find((t) => t.id === activeTeamId) ?? null
        : null;
    const currentUser: CurrentUser | null =
      me && membership && team ? { user: me.user, membership, team } : null;

    return {
      currentUser,
      memberships: me?.memberships ?? [],
      teams: me?.teams ?? [],
      activeTeamId,
      setActiveTeamId,
      loading,
      error,
      refresh: load,
    };
  }, [me, activeTeamId, setActiveTeamId, loading, error, load]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCurrentUser() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error(
      "useCurrentUser must be used inside CurrentUserProvider",
    );
  }
  return ctx;
}
