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
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {value}
            </p>
            {hint ? (
              <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            ) : null}
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand/10 text-brand">
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
