"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { InviteMemberDialog } from "@/components/settings/invite-member-dialog";
import { MemberList } from "@/components/settings/member-list";
import { PendingInvitationsTable } from "@/components/settings/pending-invitations-table";
import type { DirectoryEntry } from "@/components/users/user-table";
import { useApiClient } from "@/lib/api-client";
import { useCurrentUser } from "@/lib/current-user";
import type { TeamUserRow } from "@/lib/api-types";
import type { Invitation } from "@/types";

export default function SettingsTeamPage() {
  const { currentUser, activeTeamId } = useCurrentUser();
  const api = useApiClient();

  const [members, setMembers] = useState<TeamUserRow[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const canManageTeam =
    currentUser?.membership.role === "OWNER" ||
    currentUser?.membership.role === "ADMIN";
  const canInvite = currentUser?.membership.role === "OWNER";

  const load = useCallback(async () => {
    if (!activeTeamId || !canManageTeam) return;
    setLoading(true);
    setError(null);
    try {
      const [m, i] = await Promise.all([
        api.get<TeamUserRow[]>(`/teams/${activeTeamId}/users`),
        api.get<Invitation[]>(
          `/teams/${activeTeamId}/invitations?status=PENDING`,
        ),
      ]);
      setMembers(m);
      setInvitations(i);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [activeTeamId, api, canManageTeam]);

  useEffect(() => {
    void load();
  }, [load]);

  if (currentUser && !canManageTeam) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Team settings are admin-only"
        description="Ask an owner or admin if you need to invite people or manage members."
      />
    );
  }

  const entries = useMemo<DirectoryEntry[]>(
    () =>
      members.map((r) => ({
        ...r.user,
        role: r.membership.role,
        personaType: r.membership.personaType,
      })),
    [members],
  );

  const handleInvited = useCallback((invitation: Invitation) => {
    setInvitations((prev) => [invitation, ...prev]);
  }, []);

  const handleRevoke = useCallback(
    async (id: string) => {
      if (!activeTeamId) return;
      await api.delete(`/teams/${activeTeamId}/invitations/${id}`);
      setInvitations((prev) => prev.filter((inv) => inv.id !== id));
    },
    [activeTeamId, api],
  );

  if (!currentUser) return null;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Members</h2>
            <p className="text-sm text-muted-foreground">
              Everyone with access to the workspace.
            </p>
          </div>
          {canInvite ? (
            <InviteMemberDialog onInvited={handleInvited} />
          ) : null}
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading members…</p>
        ) : error ? (
          <p className="text-sm text-destructive">
            Couldn&apos;t load members: {error.message}
          </p>
        ) : (
          <MemberList entries={entries} />
        )}
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Pending invitations</h2>
          <p className="text-sm text-muted-foreground">
            Sent invitations that haven&apos;t been accepted yet.
          </p>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading invitations…</p>
        ) : (
          <PendingInvitationsTable
            invitations={invitations}
            onRevoke={handleRevoke}
          />
        )}
      </section>
    </div>
  );
}
