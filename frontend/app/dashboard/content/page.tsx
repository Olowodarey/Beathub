"use client";

import { ShieldAlert } from "lucide-react";
import { ModerationQueue } from "@/components/content/moderation-queue";
import { EmptyState } from "@/components/empty-state";
import { useCurrentUser } from "@/lib/current-user";

// Admin + Owner only. Members hitting this route see a soft "no access" state
// rather than a hard 404 — matches how the sidebar hides the link for them.
export default function ContentPage() {
  const { currentUser } = useCurrentUser();
  const role = currentUser.membership.role;
  const canModerate = role === "OWNER" || role === "ADMIN";

  if (!canModerate) {
    return (
      <div className="mx-auto max-w-md">
        <EmptyState
          icon={ShieldAlert}
          title="Moderation is admin-only"
          description="Ask an owner or admin to give you access if you need to review uploads."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Content moderation
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review incoming uploads before they go live on the platform.
        </p>
      </div>
      <ModerationQueue />
    </div>
  );
}
