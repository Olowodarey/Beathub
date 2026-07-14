"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SubscriptionShare } from "@/types";

const COLORS: Record<string, string> = {
  Free: "var(--chart-4)",
  Plus: "var(--chart-2)",
  Family: "var(--brand)",
};

export function SubscriptionDistribution({
  data,
}: {
  data: SubscriptionShare[];
}) {
  const total = data.reduce((acc, tier) => acc + tier.value, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Subscription distribution
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Share of listeners on each tier
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {data.length === 0 || total === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No subscription data yet.
          </p>
        ) : (
          <>
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
              {data.map((tier) => (
                <div
                  key={tier.tier}
                  style={{
                    width: `${(tier.value / total) * 100}%`,
                    background: COLORS[tier.tier] ?? "var(--chart-3)",
                  }}
                  aria-hidden
                />
              ))}
            </div>
            <ul className="mt-6 space-y-4">
              {data.map((tier) => (
                <li
                  key={tier.tier}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{
                        background: COLORS[tier.tier] ?? "var(--chart-3)",
                      }}
                    />
                    <span className="text-sm font-medium">{tier.tier}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium tabular-nums">
                      {tier.value}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tier.tier === "Free"
                        ? "No cost"
                        : tier.tier === "Plus"
                          ? "$8.99 / mo"
                          : "$14.99 / mo"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
