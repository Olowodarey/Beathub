"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlatformShare } from "@/types";

const COLORS = [
  "var(--brand)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];

export function PlatformDonut({ data }: { data: PlatformShare[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Platform distribution
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Share of listening by device platform
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No platform data yet.
          </p>
        ) : (
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-stretch">
            <div className="h-44 w-full sm:h-48 sm:w-1/2">
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
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {data.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="grid flex-1 grid-cols-2 gap-3 self-center sm:grid-cols-1">
              {data.map((slice, index) => (
                <li
                  key={slice.name}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ background: COLORS[index % COLORS.length] }}
                    />
                    <span>{slice.name}</span>
                  </div>
                  <span className="font-medium tabular-nums">
                    {slice.value}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
