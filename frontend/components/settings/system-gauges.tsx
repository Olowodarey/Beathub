import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { systemGauges } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const intentColor: Record<"good" | "warn" | "bad", string> = {
  good: "var(--brand)",
  warn: "oklch(0.75 0.16 75)",
  bad: "var(--destructive)",
};

const intentText: Record<"good" | "warn" | "bad", string> = {
  good: "text-emerald-600 dark:text-emerald-400",
  warn: "text-amber-600 dark:text-amber-400",
  bad: "text-red-600 dark:text-red-400",
};

export function SystemGauges() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {systemGauges.map((gauge) => {
        const clamped = Math.min(100, Math.max(0, gauge.value));
        const percent = gauge.unit === "%" ? clamped : Math.min(100, gauge.value / 3);
        return (
          <Card key={gauge.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {gauge.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Gauge percent={percent} color={intentColor[gauge.intent]} />
              <div className="mt-3 flex items-baseline justify-between">
                <p className="text-2xl font-semibold tracking-tight tabular-nums">
                  {gauge.value}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    {gauge.unit}
                  </span>
                </p>
                <span
                  className={cn(
                    "text-xs font-medium capitalize",
                    intentText[gauge.intent],
                  )}
                >
                  {gauge.intent}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function Gauge({ percent, color }: { percent: number; color: string }) {
  const radius = 42;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = Math.PI * normalizedRadius; // half circle
  const dashOffset = circumference * (1 - percent / 100);

  return (
    <div className="relative flex items-end justify-center">
      <svg
        viewBox="0 0 100 60"
        className="h-20 w-full"
        preserveAspectRatio="xMidYMax meet"
      >
        <path
          d={`M ${stroke / 2} 50 A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${100 - stroke / 2} 50`}
          stroke="var(--muted)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M ${stroke / 2} 50 A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${100 - stroke / 2} 50`}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
    </div>
  );
}
