import {
  CheckCircle2,
  Coins,
  Megaphone,
  UserPlus,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/format";
import type { ActivityItem, ActivityKind } from "@/types";
import { cn } from "@/lib/utils";

const iconFor: Record<ActivityKind, LucideIcon> = {
  USER_JOINED: UserPlus,
  CONTENT_APPROVED: CheckCircle2,
  CONTENT_REJECTED: XCircle,
  CAMPAIGN_REQUESTED: Megaphone,
  CAMPAIGN_APPROVED: Megaphone,
  PAYOUT_SENT: Coins,
};

const tintFor: Record<ActivityKind, string> = {
  USER_JOINED: "bg-brand/10 text-brand",
  CONTENT_APPROVED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  CONTENT_REJECTED: "bg-red-500/10 text-red-600 dark:text-red-400",
  CAMPAIGN_REQUESTED: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  CAMPAIGN_APPROVED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  PAYOUT_SENT: "bg-muted text-muted-foreground",
};

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Recent activity
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {items.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No recent activity.
          </p>
        ) : (
        <ol className="space-y-4">
          {items.map((item) => {
            const Icon = iconFor[item.kind];
            return (
              <li key={item.id} className="flex gap-3">
                <div
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    tintFor[item.kind],
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="leading-snug">
                    <span className="font-medium">{item.actorName}</span>{" "}
                    <span className="text-muted-foreground">{item.target}</span>
                  </p>
                  {/* Relative time depends on Date.now() — hydration mismatch is expected and safe. */}
                  <p
                    className="mt-0.5 text-xs text-muted-foreground"
                    suppressHydrationWarning
                  >
                    {formatRelativeTime(item.timestamp)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
        )}
      </CardContent>
    </Card>
  );
}
