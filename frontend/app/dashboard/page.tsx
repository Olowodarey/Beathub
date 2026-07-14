"use client";

import { useEffect, useState } from "react";
import { DollarSign, Music2, Play, Sparkles, Users } from "lucide-react";
import { RevenueBarChart } from "@/components/charts/revenue-bar-chart";
import { PlatformDonut } from "@/components/charts/platform-donut";
import { UserGrowthChart } from "@/components/charts/user-growth-chart";
import { AdRevenueWidget } from "@/components/dashboard/ad-revenue-widget";
import { CreatorApplicationCard } from "@/components/dashboard/creator-application-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { StatCard } from "@/components/dashboard/stat-card";
import { RoleGate } from "@/components/role-gate";
import { useApiClient } from "@/lib/api-client";
import { useCurrentUser } from "@/lib/current-user";
import { formatCompactNumber, formatCurrency } from "@/lib/format";
import type {
  AnalyticsResponse,
  DashboardResponse,
} from "@/lib/api-types";

export default function DashboardOverview() {
  const { currentUser, activeTeamId, loading: userLoading, error: userError } =
    useCurrentUser();
  const api = useApiClient();

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!activeTeamId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      api.get<DashboardResponse>(`/teams/${activeTeamId}/dashboard`),
      api.get<AnalyticsResponse>(`/teams/${activeTeamId}/analytics`),
    ])
      .then(([d, a]) => {
        if (cancelled) return;
        setDashboard(d);
        setAnalytics(a);
      })
      .catch((e) => !cancelled && setError(e as Error))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [activeTeamId, api]);

  if (userLoading || (!currentUser && !userError)) {
    return <PageMessage>Loading…</PageMessage>;
  }
  if (userError || !currentUser) {
    return (
      <PageMessage tone="error">
        Couldn&apos;t load your account. Try refreshing.
      </PageMessage>
    );
  }

  const { role, personaType } = currentUser.membership;
  const isCreator = role === "MEMBER" && personaType === "CREATOR";
  const isListener = role === "MEMBER" && personaType === "LISTENER";
  const firstName = currentUser.user.name.split(" ")[0];
  const stats = dashboard?.stats;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isCreator ? "Your dashboard" : isListener ? "Welcome" : "Overview"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isCreator
            ? `Welcome back, ${firstName}. Here's how your catalog is doing.`
            : isListener
            ? `Welcome, ${firstName}. Head to Library to start listening.`
            : `Welcome back, ${firstName}. Here's what's happening across ${currentUser.team.name}.`}
        </p>
      </div>

      {isListener ? <CreatorApplicationCard /> : null}

      {error ? (
        <PageMessage tone="error">
          Couldn&apos;t load dashboard data. {error.message}
        </PageMessage>
      ) : null}

      {isListener ? null : (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isCreator ? (
          <>
            <StatCard
              label="Plays"
              value={
                loading || !dashboard
                  ? "—"
                  : formatCompactNumber(dashboard.viewer.plays)
              }
              icon={Play}
              hint="Across your approved tracks"
            />
            <StatCard
              label="Estimated earnings"
              value={
                loading || !dashboard
                  ? "—"
                  : formatCurrency(dashboard.viewer.earningsUsd)
              }
              icon={DollarSign}
              hint="$0.004 per play"
            />
            <StatCard
              label="Uploads"
              value={
                loading || !dashboard
                  ? "—"
                  : formatCompactNumber(dashboard.viewer.uploadCount)
              }
              icon={Music2}
            />
            <StatCard
              label="Team library plays"
              value={
                loading || !stats ? "—" : formatCompactNumber(stats.totalPlays)
              }
              icon={Sparkles}
              hint={
                stats
                  ? `${formatCurrency(stats.totalRevenueUsd)} paid out`
                  : undefined
              }
            />
          </>
        ) : (
          <>
            <StatCard
              label="Total users"
              value={loading || !stats ? "—" : formatCompactNumber(stats.totalUsers)}
              icon={Users}
            />
            <StatCard
              label="Total plays"
              value={
                loading || !stats ? "—" : formatCompactNumber(stats.totalPlays)
              }
              icon={Play}
              hint={
                stats
                  ? `${formatCompactNumber(stats.activeCreators)} active creators`
                  : undefined
              }
            />
            <StatCard
              label="Creator payouts"
              value={
                loading || !stats ? "—" : formatCurrency(stats.totalRevenueUsd)
              }
              icon={DollarSign}
              hint="$0.004 per play"
            />
            <StatCard
              label="Content uploads"
              value={
                loading || !stats
                  ? "—"
                  : formatCompactNumber(stats.contentUploadsThisWeek)
              }
              icon={Music2}
              hint="This week"
            />
          </>
        )}
      </div>
      )}

      {isListener ? null : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <UserGrowthChart data={analytics?.userGrowthSeries ?? []} />
            <RevenueBarChart data={analytics?.revenueSeries ?? []} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PlatformDonut data={analytics?.platformShare ?? []} />
            </div>
            <div className="flex flex-col gap-4">
              <RoleGate allow={["OWNER"]}>
                <AdRevenueWidget
                  adRevenueUsd={stats?.adRevenueUsd ?? 0}
                  adRevenueTrendPct={stats?.adRevenueTrendPct ?? 0}
                />
              </RoleGate>
              <RecentActivity items={dashboard?.recentActivity ?? []} />
            </div>
          </div>

          <QuickActions />
        </>
      )}
    </div>
  );
}

function PageMessage({
  children,
  tone = "info",
}: {
  children: React.ReactNode;
  tone?: "info" | "error";
}) {
  return (
    <div
      className={`rounded-md border p-4 text-sm ${
        tone === "error"
          ? "border-destructive/40 bg-destructive/5 text-destructive"
          : "border-border bg-muted/30 text-muted-foreground"
      }`}
    >
      {children}
    </div>
  );
}
