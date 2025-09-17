import { apiRequest } from "../api";

export type DashboardMetrics = {
  totalConversations: number;
  activeConversations: number;
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  totalDocuments: number;
  totalAgents: number;
  activeAgents: number;
  averageResponseTime: number;
  customerSatisfactionScore: number;
  conversationTrends: ConversationTrend[];
  ticketTrends: TicketTrend[];
  documentStats: DocumentStats[];
  agentPerformance: AgentPerformance[];
  recentActivities: RecentActivity[];
};

export type ConversationTrend = {
  date: string;
  count: number;
  resolvedCount: number;
};

export type TicketTrend = {
  date: string;
  createdCount: number;
  resolvedCount: number;
  escalatedCount: number;
};

export type DocumentStats = {
  type: string;
  count: number;
  processedCount: number;
  errorCount: number;
};

export type AgentPerformance = {
  agentId: string;
  agentName: string;
  conversationsHandled: number;
  ticketsResolved: number;
  averageResponseTime: number;
  customerRating: number;
};

export type RecentActivity = {
  timestamp: string;
  type: "conversation" | "ticket" | "document" | "agent";
  description: string;
  userName: string;
  userAvatarUrl?: string | null;
};

export type GetDashboardMetricsRequest = {
  startDate?: string;
  endDate?: string;
  timeRange?: "24h" | "7d" | "30d" | "90d";
};

export type GetDashboardMetricsResponse = {
  metrics: DashboardMetrics;
  generatedAt: string;
  timeRange: string;
};

export const analyticsService = {
  async getDashboardMetrics(
    organizationId: string,
    request: GetDashboardMetricsRequest = {}
  ): Promise<GetDashboardMetricsResponse> {
    const params = new URLSearchParams();
    if (request.startDate) params.append("startDate", request.startDate);
    if (request.endDate) params.append("endDate", request.endDate);
    if (request.timeRange) params.append("timeRange", request.timeRange);

    const queryString = params.toString();
    const url = `/api/organizations/${organizationId}/analytics/dashboard${queryString ? `?${queryString}` : ""}`;
    
    return apiRequest<GetDashboardMetricsResponse>(url);
  },
};
