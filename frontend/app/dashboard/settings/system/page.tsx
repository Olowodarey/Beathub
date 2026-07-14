"use client";

import { ShieldAlert } from "lucide-react";
import { SystemGauges } from "@/components/settings/system-gauges";
import { EmptyState } from "@/components/empty-state";
import { useCurrentUser } from "@/lib/current-user";

// Owner only.
export default function SettingsSystemPage() {
  const { currentUser } = useCurrentUser();
  if (!currentUser) return null;
  const isOwner = currentUser.membership.role === "OWNER";

  if (!isOwner) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="System settings are owner-only"
        description="Health metrics and infra controls are limited to workspace owners."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">System health</h2>
        <p className="text-sm text-muted-foreground">
          Live infrastructure metrics for the Beathub platform.
        </p>
      </div>
      <SystemGauges />
    </div>
  );
}
