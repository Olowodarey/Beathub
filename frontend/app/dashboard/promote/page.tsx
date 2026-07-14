"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CampaignList } from "@/components/promote/campaign-list";
import { CampaignRequestForm } from "@/components/promote/campaign-request-form";
import { CampaignReviewQueue } from "@/components/promote/campaign-review-queue";
import { useApiClient } from "@/lib/api-client";
import { useCurrentUser } from "@/lib/current-user";
import type { Campaign } from "@/types";

export default function PromotePage() {
  const { currentUser, activeTeamId } = useCurrentUser();
  const api = useApiClient();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!activeTeamId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get<Campaign[]>(`/teams/${activeTeamId}/campaigns`)
      .then((r) => !cancelled && setCampaigns(r))
      .catch((e) => !cancelled && setError(e as Error))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [activeTeamId, api]);

  const handleDecide = useCallback(
    async (id: string, next: "APPROVED" | "REJECTED", note: string | null) => {
      const updated = await api.patch<Campaign>(`/campaigns/${id}/review`, {
        status: next,
        reviewerNote: note ?? undefined,
      });
      setCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)));
    },
    [api],
  );

  const handleCreated = useCallback((c: Campaign) => {
    setCampaigns((prev) => [c, ...prev]);
  }, []);

  const role = currentUser?.membership.role;
  const canReview = role === "OWNER" || role === "ADMIN";

  const ownCampaigns = useMemo(
    () =>
      currentUser
        ? campaigns.filter((c) => c.requesterId === currentUser.user.id)
        : [],
    [campaigns, currentUser],
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Promote</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {canReview
            ? "Review campaign requests and manage what runs on the platform."
            : "Request an ad slot and track how your active campaigns are performing."}
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading campaigns…</p>
      ) : error ? (
        <p className="text-sm text-destructive">
          Couldn&apos;t load campaigns: {error.message}
        </p>
      ) : canReview ? (
        <CampaignReviewQueue
          campaigns={campaigns}
          onDecide={handleDecide}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <CampaignRequestForm onCreated={handleCreated} />
          </div>
          <div className="lg:col-span-2">
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">
              Your campaigns
            </h2>
            <CampaignList
              campaigns={ownCampaigns}
              emptyLabel="No campaigns yet"
              emptyDescription="Submit a request on the left to run your first campaign."
            />
          </div>
        </div>
      )}
    </div>
  );
}
