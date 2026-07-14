"use client";

import { useEffect, useMemo, useState } from "react";
import { UserTable, type DirectoryEntry } from "@/components/users/user-table";
import { useApiClient } from "@/lib/api-client";
import { useCurrentUser } from "@/lib/current-user";
import type { TeamUserRow } from "@/lib/api-types";

export default function UsersPage() {
  const { activeTeamId } = useCurrentUser();
  const api = useApiClient();
  const [rows, setRows] = useState<TeamUserRow[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeTeamId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get<TeamUserRow[]>(`/teams/${activeTeamId}/users`)
      .then((r) => !cancelled && setRows(r))
      .catch((e) => !cancelled && setError(e as Error))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [activeTeamId, api]);

  const entries = useMemo<DirectoryEntry[]>(
    () =>
      rows?.map((r) => ({
        ...r.user,
        role: r.membership.role,
        personaType: r.membership.personaType,
      })) ?? [],
    [rows],
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          People with access to the workspace and creators on the platform.
        </p>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading members…</p>
      ) : error ? (
        <p className="text-sm text-destructive">
          Couldn&apos;t load members: {error.message}
        </p>
      ) : (
        <UserTable entries={entries} />
      )}
    </div>
  );
}
