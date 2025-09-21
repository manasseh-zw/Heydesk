import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useRef, useState } from "react";
import { useSpring, useMotionValueEvent } from "motion/react";
import type { ConversationTrend } from "@/lib/services/analytics.service";

interface ClippedAreaChartProps {
  data?: ConversationTrend[];
}

const chartConfig = {
  conversations: {
    label: "Conversations",
    color: "#84cc16",
  },
  resolved: {
    label: "Resolved",
    color: "#22c55e",
  },
} satisfies ChartConfig;

export function ClippedAreaChart({ data }: ClippedAreaChartProps) {
  // Transform data for the chart
  const chartData =
    data?.map((trend) => ({
      date: new Date(trend.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      conversations: trend.count,
      resolved: trend.resolvedCount,
    })) || [];
  const chartRef = useRef<HTMLDivElement>(null);
  const [axis, setAxis] = useState(0);

  // motion values
  const springX = useSpring(0, {
    damping: 30,
    stiffness: 100,
  });
  const springY = useSpring(0, {
    damping: 30,
    stiffness: 100,
  });

  useMotionValueEvent(springX, "change", (latest) => {
    setAxis(latest);
  });

  // Calculate trend
  const totalConversations = chartData.reduce(
    (sum, item) => sum + item.conversations,
    0
  );
  const totalResolved = chartData.reduce((sum, item) => sum + item.resolved, 0);
  const resolutionRate =
    totalConversations > 0 ? (totalResolved / totalConversations) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Conversations Last 7 Days
          <Badge variant="outline" className="ml-2">
            {resolutionRate > 70 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{Math.round(resolutionRate)}%</span>
          </Badge>
        </CardTitle>
        <CardDescription>
          Conversation trends and resolution rates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          ref={chartRef}
          className="h-54 w-full"
          config={chartConfig}
        >
          <AreaChart
            className="overflow-visible"
            accessibilityLayer
            data={chartData}
            onMouseMove={(state) => {
              const x = state.activeCoordinate?.x;
              const dataValue = state.activePayload?.[0]?.value;
              if (x && dataValue !== undefined) {
                springX.set(x);
                springY.set(dataValue);
              }
            }}
            onMouseLeave={() => {
              springX.set(chartRef.current?.getBoundingClientRect().width || 0);
              springY.jump(chartData[chartData.length - 1]?.conversations || 0);
            }}
            margin={{
              right: 0,
              left: 0,
            }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              horizontalCoordinatesGenerator={(props) => {
                const { height } = props;
                return [0, height - 30];
              }}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <Area
              dataKey="conversations"
              type="monotone"
              fill="url(#gradient-cliped-area-conversations)"
              fillOpacity={0.4}
              stroke="var(--color-conversations)"
              clipPath={`inset(0 ${
                Number(chartRef.current?.getBoundingClientRect().width) - axis
              } 0 0)`}
            />
            <line
              x1={axis}
              y1={0}
              x2={axis}
              y2={"85%"}
              stroke="var(--color-conversations)"
              strokeDasharray="3 3"
              strokeLinecap="round"
              strokeOpacity={0.2}
            />
            <rect
              x={axis - 50}
              y={0}
              width={50}
              height={18}
              fill="var(--color-conversations)"
            />
            <text
              x={axis - 25}
              fontWeight={600}
              y={13}
              textAnchor="middle"
              fill="var(--primary-foreground)"
            >
              {springY.get()?.toFixed(0) || "0"}
            </text>
            {/* this is a ghost line behind graph */}
            <Area
              dataKey="conversations"
              type="monotone"
              fill="none"
              stroke="var(--color-conversations)"
              strokeOpacity={0.1}
            />
            <defs>
              <linearGradient
                id="gradient-cliped-area-conversations"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-conversations)"
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-conversations)"
                  stopOpacity={0}
                />
                <mask id="mask-cliped-area-chart">
                  <rect
                    x={0}
                    y={0}
                    width={"50%"}
                    height={"100%"}
                    fill="white"
                  />
                </mask>
              </linearGradient>
            </defs>
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
