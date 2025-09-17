import { LabelList, Pie, PieChart } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { TicketTrend } from "@/lib/services/analytics.service";

interface RoundedPieChartProps {
  data?: TicketTrend[];
}

const chartConfig = {
  visitors: {
    label: "Count",
  },
  created: {
    label: "Created",
    color: "var(--chart-1)",
  },
  resolved: {
    label: "Resolved",
    color: "var(--chart-2)",
  },
  escalated: {
    label: "Escalated",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function RoundedPieChart({ data }: RoundedPieChartProps) {
  // Transform data for the chart
  const totalCreated =
    data?.reduce((sum, trend) => sum + trend.createdCount, 0) || 0;
  const totalResolved =
    data?.reduce((sum, trend) => sum + trend.resolvedCount, 0) || 0;
  const totalEscalated =
    data?.reduce((sum, trend) => sum + trend.escalatedCount, 0) || 0;

  const chartData = [
    { browser: "Created", visitors: totalCreated, fill: "#84CC16" },
    { browser: "Resolved", visitors: totalResolved, fill: "#22c55e" },
    { browser: "Escalated", visitors: totalEscalated, fill: "#ef4444" },
  ].filter((item) => item.visitors > 0); // Only show non-zero values

  const resolutionRate =
    totalCreated > 0 ? (totalResolved / totalCreated) * 100 : 0;
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>
          Ticket Status
          <Badge
            variant="outline"
            className={`${
              resolutionRate > 70
                ? "text-green-500 bg-green-500/10 border-none"
                : "text-red-500 bg-red-500/10 border-none"
            } ml-2`}
          >
            {resolutionRate > 70 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{Math.round(resolutionRate)}%</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="visitors" hideLabel />}
            />
            <Pie
              data={chartData}
              innerRadius={30}
              dataKey="visitors"
              radius={10}
              cornerRadius={8}
              paddingAngle={4}
            >
              <LabelList
                dataKey="visitors"
                stroke="none"
                fontSize={12}
                fontWeight={500}
                fill="currentColor"
                formatter={(value: number) => value.toString()}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
