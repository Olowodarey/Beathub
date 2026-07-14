"use client";

import { useEffect, useState } from "react";
import { Headphones, Sparkles, Users2, Wallet } from "lucide-react";
import { DeviceDonut } from "@/components/charts/device-donut";
import { RegionBar } from "@/components/charts/region-bar";
import { RevenueArea } from "@/components/charts/revenue-area";
import { SubscriptionDistribution } from "@/components/charts/subscription-distribution";
import { StatCard } from "@/components/dashboard/stat-card";
import { useApiClient } from "@/lib/api-client";
import { useCurrentUser } from "@/lib/current-user";
import type { AnalyticsResponse } from "@/lib/api-types";

export default function AnalyticsPage() {
  const { activeTeamId } = useCurrentUser();
  const api = useApiClient();
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!activeTeamId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get<AnalyticsResponse>(`/teams/${activeTeamId}/analytics`)
      .then((r) => !cancelled && setAnalytics(r))
      .catch((e) => !cancelled && setError(e as Error))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [activeTeamId, api]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Where listeners are, what they&apos;re on, and how they pay.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">
          Couldn&apos;t load analytics: {error.message}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Monthly listeners" value="—" icon={Headphones} />
        <StatCard label="Avg. session length" value="—" icon={Sparkles} />
        <StatCard label="Paying subscribers" value="—" icon={Users2} />
        <StatCard label="ARPU" value="—" icon={Wallet} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DeviceDonut data={analytics?.platformShare ?? []} />
        <div className="lg:col-span-2">
          <RegionBar data={analytics?.regionShare ?? []} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SubscriptionDistribution data={analytics?.subscriptionShare ?? []} />
        <div className="lg:col-span-2">
          <RevenueArea data={analytics?.revenueSeries ?? []} />
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-muted-foreground">Loading analytics…</p>
      ) : null}
    </div>
  );
}
