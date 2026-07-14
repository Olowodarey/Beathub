"use client";

import { DollarSign, Music2, Sparkles, Users } from "lucide-react";
import { RevenueBarChart } from "@/components/charts/revenue-bar-chart";
import { PlatformDonut } from "@/components/charts/platform-donut";
import { UserGrowthChart } from "@/components/charts/user-growth-chart";
import { AdRevenueWidget } from "@/components/dashboard/ad-revenue-widget";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { StatCard } from "@/components/dashboard/stat-card";
import { RoleGate } from "@/components/role-gate";
import { useCurrentUser } from "@/lib/current-user";
import { formatCompactNumber, formatCurrency } from "@/lib/format";
import { overviewStats } from "@/lib/mock-data";

export default function DashboardOverview() {
  const { currentUser } = useCurrentUser();
  const { role, personaType } = currentUser.membership;
  const isCreator = role === "MEMBER" && personaType === "CREATOR";

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isCreator ? "Your dashboard" : "Overview"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isCreator
            ? `Welcome back, ${currentUser.user.name.split(" ")[0]}. Here's how your catalog is doing.`
            : `Welcome back, ${currentUser.user.name.split(" ")[0]}. Here's what's happening across ${currentUser.team.name}.`}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isCreator ? (
          <>
            <StatCard
              label="Streams (30d)"
              value={formatCompactNumber(214_820)}
              icon={Sparkles}
              trend={{ value: "+12.4% vs last 30d", direction: "up" }}
            />
            <StatCard
              label="Followers"
              value={formatCompactNumber(8_412)}
              icon={Users}
              trend={{ value: "+186 this month", direction: "up" }}
            />
            <StatCard
              label="Revenue share"
              value={formatCurrency(1_842)}
              icon={DollarSign}
              hint="Payable on the 1st"
            />
            <StatCard
              label="Uploads"
              value="14"
              icon={Music2}
              hint="3 pending review"
            />
          </>
        ) : (
          <>
            <StatCard
              label="Total users"
              value={formatCompactNumber(overviewStats.totalUsers)}
              icon={Users}
              trend={{ value: "+3.8% MoM", direction: "up" }}
            />
            <StatCard
              label="Active creators"
              value={formatCompactNumber(overviewStats.activeCreators)}
              icon={Sparkles}
              hint={`${formatCompactNumber(overviewStats.totalCreators)} total`}
            />
            <StatCard
              label="Total revenue"
              value={formatCurrency(overviewStats.totalRevenueUsd)}
              icon={DollarSign}
              trend={{ value: "+8.1% MoM", direction: "up" }}
            />
            <StatCard
              label="Content uploads"
              value={formatCompactNumber(overviewStats.contentUploadsThisWeek)}
              icon={Music2}
              hint="This week"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <UserGrowthChart />
        <RevenueBarChart />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PlatformDonut />
        </div>
        <div className="flex flex-col gap-4">
          <RoleGate allow={["OWNER"]}>
            <AdRevenueWidget />
          </RoleGate>
          <RecentActivity />
        </div>
      </div>

      <QuickActions />
    </div>
  );
}
