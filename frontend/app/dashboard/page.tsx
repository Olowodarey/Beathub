"use client";

import { useEffect, useState } from "react";
import { DollarSign, Music2, Play, Sparkles, Users } from "lucide-react";
import { RevenueBarChart } from "@/components/charts/revenue-bar-chart";
import { PlatformDonut } from "@/components/charts/platform-donut";
import { UserGrowthChart } from "@/components/charts/user-growth-chart";
import { AdRevenueWidget } from "@/components/dashboard/ad-revenue-widget";
import { CreatorHome } from "@/components/dashboard/creator-home";
import { LabelHome } from "@/components/dashboard/label-home";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { StatCard } from "@/components/dashboard/stat-card";
import { ListenerHome } from "@/components/library/listener-home";
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

  const membershipRole = currentUser?.membership.role ?? null;
  const membershipPersona = currentUser?.membership.personaType ?? null;
  const isListenerRole =
    membershipRole === "MEMBER" && membershipPersona === "LISTENER";
  const isCreatorRole =
    membershipRole === "MEMBER" && membershipPersona === "CREATOR";
  const isLabelRole =
    membershipRole === "MEMBER" && membershipPersona === "LABEL_REP";
  // The listener/creator/label homes fetch their own data — the admin dashboard
  // endpoints aren't relevant for them.
  const skipAdminFetch = isListenerRole || isCreatorRole || isLabelRole;

  useEffect(() => {
    if (!activeTeamId || skipAdminFetch) {
      setLoading(false);
      return;
    }
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
  }, [activeTeamId, api, skipAdminFetch]);

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
  const isLabel = role === "MEMBER" && personaType === "LABEL_REP";
  const firstName = currentUser.user.name.split(" ")[0];
  const stats = dashboard?.stats;

  if (isListener && activeTeamId) {
    return <ListenerHome teamId={activeTeamId} firstName={firstName} />;
  }

  if (isCreator && activeTeamId) {
    return (
      <CreatorHome
        teamId={activeTeamId}
        userId={currentUser.user.id}
        firstName={firstName}
      />
    );
  }

  if (isLabel) {
    return <LabelHome firstName={firstName} />;
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back, {firstName}. Here&apos;s what&apos;s happening across{" "}
          {currentUser.team.name}.
        </p>
      </div>

      {error ? (
        <PageMessage tone="error">
          Couldn&apos;t load dashboard data. {error.message}
        </PageMessage>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      </div>

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
