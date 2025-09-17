import { useQuery } from "@tanstack/react-query";
import { 
  analyticsService, 
  type GetDashboardMetricsRequest 
} from "../services/analytics.service";

export function useDashboardMetrics(
  organizationId: string | undefined,
  request: GetDashboardMetricsRequest = {}
) {
  return useQuery({
    queryKey: ["dashboard-metrics", organizationId, request.timeRange, request.startDate, request.endDate],
    queryFn: () => analyticsService.getDashboardMetrics(organizationId!, request),
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes for real-time updates
  });
}
