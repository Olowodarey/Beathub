import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  trend?: {
    value: string;
    direction: "up" | "down" | "flat";
  };
}

export function StatCard({ label, value, icon: Icon, hint, trend }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px] bg-brand"
      />
      <CardContent className="p-4 sm:p-6 sm:pt-6">
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
              {label}
            </p>
            <p className="mt-2 truncate text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
              {value}
            </p>
            {hint ? (
              <p className="mt-1 truncate text-[11px] text-muted-foreground sm:text-xs">
                {hint}
              </p>
            ) : null}
          </div>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand sm:h-9 sm:w-9">
            <Icon className="h-4 w-4" aria-hidden />
          </div>
        </div>
        {trend ? (
          <p
            className={cn(
              "mt-3 text-xs font-medium",
              trend.direction === "up" && "text-emerald-600 dark:text-emerald-400",
              trend.direction === "down" && "text-red-600 dark:text-red-400",
              trend.direction === "flat" && "text-muted-foreground",
            )}
          >
            {trend.direction === "up" ? "▲" : trend.direction === "down" ? "▼" : "▬"}{" "}
            {trend.value}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
