using Heydesk.Server.Data.Models;

namespace Heydesk.Server.Domains.Analytics;

public record DashboardMetrics(
    int TotalConversations,
    int ActiveConversations,
    int TotalTickets,
    int OpenTickets,
    int ResolvedTickets,
    int TotalDocuments,
    int TotalAgents,
    int ActiveAgents,
    double AverageResponseTime,
    double CustomerSatisfactionScore,
    List<ConversationTrend> ConversationTrends,
    List<TicketTrend> TicketTrends,
    List<DocumentStats> DocumentStats,
    List<AgentPerformance> AgentPerformance,
    List<RecentActivity> RecentActivities
);

public record ConversationTrend(
    DateTime Date,
    int Count,
    int ResolvedCount
);

public record TicketTrend(
    DateTime Date,
    int CreatedCount,
    int ResolvedCount,
    int EscalatedCount
);

public record DocumentStats(
    string Type,
    int Count,
    int ProcessedCount,
    int ErrorCount
);

public record AgentPerformance(
    Guid AgentId,
    string AgentName,
    int ConversationsHandled,
    int TicketsResolved,
    double AverageResponseTime,
    double CustomerRating
);

public record RecentActivity(
    DateTime Timestamp,
    string Type, // "conversation", "ticket", "document", "agent"
    string Description,
    string UserName,
    string? UserAvatarUrl
);

public record GetDashboardMetricsRequest(
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    string? TimeRange = "7d" // "24h", "7d", "30d", "90d"
);

public record GetDashboardMetricsResponse(
    DashboardMetrics Metrics,
    DateTime GeneratedAt,
    string TimeRange
);
