import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Intent = "neutral" | "success" | "warning" | "danger" | "info";

const intentClass: Record<Intent, string> = {
  neutral:
    "bg-muted text-muted-foreground border-transparent",
  success:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-transparent",
  warning:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-transparent",
  danger:
    "bg-red-500/10 text-red-600 dark:text-red-400 border-transparent",
  info:
    "bg-brand/10 text-brand border-transparent",
};

interface StatusBadgeProps {
  status: string;
  intent?: Intent;
  className?: string;
}

const inferIntent = (status: string): Intent => {
  const s = status.toUpperCase();
  if (["APPROVED", "ACTIVE", "PAID", "ACCEPTED"].includes(s)) return "success";
  if (["PENDING", "OPEN", "INVITED"].includes(s)) return "warning";
  if (["REJECTED", "SUSPENDED", "VOID", "EXPIRED", "REVOKED"].includes(s))
    return "danger";
  if (["ENDED"].includes(s)) return "neutral";
  return "info";
};

export function StatusBadge({ status, intent, className }: StatusBadgeProps) {
  const resolved = intent ?? inferIntent(status);
  const label = status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        intentClass[resolved],
        className,
      )}
    >
      {label}
    </Badge>
  );
}
