"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompactNumber, formatCurrency } from "@/lib/format";
import type { RevenuePoint } from "@/types";

export function RevenueBarChart({ data }: { data: RevenuePoint[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Revenue analytics
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Subscription vs. ad revenue, USD
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-56 w-full sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 12, right: 4, left: -12, bottom: 0 }}
              barCategoryGap={16}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={42}
                tickFormatter={(v: number) => `$${formatCompactNumber(v)}`}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v) => formatCurrency(Number(v))}
              />
              <Legend
                iconType="square"
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              <Bar
                dataKey="subscriptions"
                name="Subscriptions"
                fill="var(--brand)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="ads"
                name="Ads"
                fill="var(--chart-3)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
