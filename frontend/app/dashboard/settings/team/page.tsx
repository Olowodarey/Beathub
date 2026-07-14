"use client";

import { InviteMemberDialog } from "@/components/settings/invite-member-dialog";
import { MemberList } from "@/components/settings/member-list";
import { PendingInvitationsTable } from "@/components/settings/pending-invitations-table";
import { useCurrentUser } from "@/lib/current-user";

export default function SettingsTeamPage() {
  const { currentUser } = useCurrentUser();
  const canInvite = currentUser.membership.role === "OWNER";

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
          {canInvite ? <InviteMemberDialog /> : null}
        </div>
        <MemberList />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Pending invitations</h2>
          <p className="text-sm text-muted-foreground">
            Sent invitations that haven&apos;t been accepted yet.
          </p>
        </div>
        <PendingInvitationsTable />
      </section>
    </div>
  );
}
