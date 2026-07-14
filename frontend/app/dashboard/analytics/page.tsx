import { Headphones, Sparkles, Users2, Wallet } from "lucide-react";
import { DeviceDonut } from "@/components/charts/device-donut";
import { RegionBar } from "@/components/charts/region-bar";
import { RevenueArea } from "@/components/charts/revenue-area";
import { SubscriptionDistribution } from "@/components/charts/subscription-distribution";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatCompactNumber, formatCurrency } from "@/lib/format";

export default function AnalyticsPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Where listeners are, what they&apos;re on, and how they pay.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Monthly listeners"
          value={formatCompactNumber(53_420)}
          icon={Headphones}
          trend={{ value: "+6.2% MoM", direction: "up" }}
        />
        <StatCard
          label="Avg. session length"
          value="27m"
          icon={Sparkles}
          hint="Steady week over week"
        />
        <StatCard
          label="Paying subscribers"
          value={formatCompactNumber(20_512)}
          icon={Users2}
          trend={{ value: "+3.1% MoM", direction: "up" }}
        />
        <StatCard
          label="ARPU"
          value={formatCurrency(3.6)}
          icon={Wallet}
          hint="Avg. revenue per user"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DeviceDonut />
        <div className="lg:col-span-2">
          <RegionBar />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SubscriptionDistribution />
        <div className="lg:col-span-2">
          <RevenueArea />
        </div>
      </div>
    </div>
  );
}
