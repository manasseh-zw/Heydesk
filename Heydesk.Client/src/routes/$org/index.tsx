import { createFileRoute } from "@tanstack/react-router";
import { SectionCards } from "@/components/org/dashboard/section-cards";
import { ClippedAreaChart } from "@/components/org/dashboard/clipped-area-chart";
import { RoundedPieChart } from "@/components/org/dashboard/rounded-pie-chart";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@tanstack/react-store";
import { customerAuthState } from "@/lib/state/customer.state";
import { useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardMetricsQueryOptions } from "@/lib/services/analytics.service";
import { authState } from "@/lib/state/auth.state";

export const Route = createFileRoute("/$org/")({
  loader: async ({ context, params }) => {
    console.log("Loader params:", params);

    // Get organization ID from auth state
    const orgId = authState.state.organization?.id;
    console.log("Organization ID from auth state:", orgId);

    if (!orgId) {
      console.log("No organization ID found in auth state");
      return null;
    }

    const query = dashboardMetricsQueryOptions(orgId, { timeRange: "7d" });
    console.log("Prefetching query:", query);

    try {
      await context.queryClient.ensureQueryData(query);
      console.log("Query data prefetched successfully");
    } catch (error) {
      console.error("Error prefetching query data:", error);
    }

    return null;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const params = useParams({ from: "/$org/" });
  const queryClient = useQueryClient();
  const [customer] = useStore(customerAuthState, (state) => [state.customer]);

  // Find the active organization by slug
  const activeOrganization = customer?.organizations?.find(
    (org) => org.slug === params.org
  );

  console.log("Active organization:", activeOrganization);
  console.log("Organization ID:", activeOrganization?.id);

  // Use organization ID from active organization or fallback to auth state
  const organizationId =
    activeOrganization?.id || authState.state.organization?.id;
  console.log("Final organization ID to use:", organizationId);

  if (!organizationId) {
    console.error("No organization ID available for analytics query");
  }

  // Get query options for the dashboard metrics
  const queryOptions = dashboardMetricsQueryOptions(organizationId || "", {
    timeRange: "7d",
  });

  console.log("Query options:", queryOptions);

  // Debug: Show all queries in the query client
  const allQueries = queryClient.getQueryCache().getAll();
  console.log(
    "All queries in cache:",
    allQueries.map((q) => ({
      queryKey: q.queryKey,
      state: q.state.status,
      data: q.state.data,
    }))
  );

  // Try to get data from query client first (prefetched in loader)
  const prefetchedData = queryClient.getQueryData(queryOptions.queryKey);
  console.log("Prefetched data from query client:", prefetchedData);

  // Load dashboard metrics using query options (data is prefetched in loader)
  const {
    data: analyticsData,
    isLoading,
    error,
    isFetching,
    isStale,
    isError,
  } = useQuery({
    ...queryOptions,
    enabled: !!organizationId, // Only run query if we have an organization ID
  });

  console.log("Query state:", {
    analyticsData,
    isLoading,
    error,
    isFetching,
    isStale,
    isError,
    queryKey: queryOptions.queryKey,
    enabled: !!organizationId,
  });

  // Use prefetched data if available, otherwise use query data
  const finalData = prefetchedData || analyticsData;
  console.log("Final analytics data:", finalData);

  const metrics = (finalData as any)?.metrics;
  console.log("Metrics extracted:", metrics);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-muted-foreground">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error || isError) {
    console.error("Dashboard error details:", error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-destructive">
          Failed to load dashboard data: {error?.message || "Unknown error"}
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
