"use client";

import { CampaignList } from "@/components/promote/campaign-list";
import { CampaignRequestForm } from "@/components/promote/campaign-request-form";
import { CampaignReviewQueue } from "@/components/promote/campaign-review-queue";
import { useCurrentUser } from "@/lib/current-user";
import { campaigns as allCampaigns } from "@/lib/mock-data";

export default function PromotePage() {
  const { currentUser } = useCurrentUser();
  const { user, membership } = currentUser;
  const role = membership.role;
  const canReview = role === "OWNER" || role === "ADMIN";

  const ownCampaigns = allCampaigns.filter(
    (campaign) => campaign.requesterId === user.id,
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

      {canReview ? (
        <CampaignReviewQueue />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <CampaignRequestForm />
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
