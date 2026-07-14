import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { overviewStats } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/format";

export function AdRevenueWidget() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Ad revenue
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-2xl font-semibold tracking-tight">
            {formatCurrency(overviewStats.adRevenueUsd)}
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-3 w-3" aria-hidden />+
            {overviewStats.adRevenueTrendPct.toFixed(1)}%
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Rolling 30 days · promoted slots and playlist placements
        </p>
      </CardContent>
    </Card>
  );
}
