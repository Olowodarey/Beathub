"use client";

import { useCallback, useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { ModerationQueue } from "@/components/content/moderation-queue";
import { EmptyState } from "@/components/empty-state";
import { useApiClient } from "@/lib/api-client";
import { useCurrentUser } from "@/lib/current-user";
import type { ContentItem } from "@/types";

export default function ContentPage() {
  const { currentUser, activeTeamId } = useCurrentUser();
  const api = useApiClient();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const canModerate =
    currentUser?.membership.role === "OWNER" ||
    currentUser?.membership.role === "ADMIN";

  useEffect(() => {
    if (!activeTeamId || !canModerate) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get<ContentItem[]>(`/teams/${activeTeamId}/content`)
      .then((r) => !cancelled && setItems(r))
      .catch((e) => !cancelled && setError(e as Error))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [activeTeamId, api, canModerate]);

  const handleDecide = useCallback(
    async (id: string, next: "APPROVED" | "REJECTED") => {
      const updated = await api.patch<ContentItem>(`/content/${id}/status`, {
        status: next,
      });
      setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
    },
    [api],
  );

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
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading queue…</p>
      ) : error ? (
        <p className="text-sm text-destructive">
          Couldn&apos;t load content: {error.message}
        </p>
      ) : (
        <ModerationQueue items={items} onDecide={handleDecide} />
      )}
    </div>
  );
}
