import { LabelList, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

export const description = "A pie chart with a label list";

const chartData = [
  { browser: "Open", visitors: 42, fill: "#84CC16" },
  { browser: "Escalated", visitors: 7, fill: "var(--color-safari)" },
  { browser: "Closed", visitors: 70, fill: "#FCA070" },
  { browser: "Unassigned", visitors: 9, fill: "#2196f3" },
  { browser: "Other", visitors: 12, fill: "#fca311" },
];

const chartConfig = {
  visitors: {
    label: "Count",
  },
  chrome: {
    label: "Open",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Escalated",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Closed",
    color: "var(--chart-3)",
  },
  edge: {
    label: "Unassigned",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export function RoundedPieChart() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>
          Ticket distribution
          <Badge
            variant="outline"
            className="text-green-500 bg-green-500/10 border-none ml-2"
          >
            <TrendingUp className="h-4 w-4" />
            <span>5.2%</span>
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
