"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { platformShare } from "@/lib/mock-data";

const COLORS = [
  "var(--brand)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];

export function DeviceDonut() {
  const total = platformShare.reduce((acc, slice) => acc + slice.value, 0);
  const dominant = [...platformShare].sort((a, b) => b.value - a.value)[0];
  const dominantShare = Math.round((dominant.value / total) * 100);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Device usage
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Share of listening sessions this month
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative flex items-center justify-center">
          <div className="h-56 w-full max-w-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v) => `${Number(v)}%`}
                />
                <Pie
                  data={platformShare}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={64}
                  outerRadius={92}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {platformShare.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs text-muted-foreground">Top platform</p>
            <p className="text-lg font-semibold">{dominant.name}</p>
            <p className="text-xs text-muted-foreground">{dominantShare}%</p>
          </div>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {platformShare.map((slice, index) => (
            <li key={slice.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ background: COLORS[index % COLORS.length] }}
                />
                <span>{slice.name}</span>
              </div>
              <span className="font-medium tabular-nums">{slice.value}%</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
