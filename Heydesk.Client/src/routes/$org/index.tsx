import { createFileRoute } from "@tanstack/react-router";
import { SectionCards } from "@/components/org/dashboard/section-cards";
import { ClippedAreaChart } from "@/components/org/dashboard/clipped-area-chart";
import { RoundedPieChart } from "@/components/org/dashboard/rounded-pie-chart";
import { Badge } from "@/components/ui/badge";
import { useDashboardMetrics } from "@/lib/hooks/use-analytics";
import { useStore } from "@tanstack/react-store";
import { customerAuthState } from "@/lib/state/customer.state";
import { useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/$org/")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = useParams({ from: "/$org/" });
  const [customer] = useStore(customerAuthState, (state) => [state.customer]);

  // Find the active organization by slug
  const activeOrganization = customer?.organizations?.find(
    (org) => org.slug === params.org
  );

  // Load dashboard metrics
  const {
    data: analyticsData,
    isLoading,
    error,
  } = useDashboardMetrics(activeOrganization?.id, { timeRange: "7d" });

  const metrics = analyticsData?.metrics;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-muted-foreground">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-destructive">
          Failed to load dashboard data
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex justify-between items-center px-4 lg:px-6 mb-2">
        <div className="ml-1">
          <div className="text-sm text-gray-500 mb-2">My Workspace</div>
          <h1 className="text-3xl">
            Good {getGreeting()}, {customer?.username || "User"}
          </h1>
        </div>
        <div>
          <Badge className="h-10" variant="outline">
            <span className="inline-block h-2 w-2 rounded-full bg-primary"></span>
            Active conversations: {metrics?.activeConversations || 0}
          </Badge>
        </div>
      </div>

      <SectionCards metrics={metrics} />
      <div className="px-4 lg:px-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <ClippedAreaChart data={metrics?.conversationTrends} />
        </div>
        <div>
          <RoundedPieChart data={metrics?.ticketTrends} />
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
