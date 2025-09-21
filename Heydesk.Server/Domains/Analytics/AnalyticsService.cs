using Heydesk.Server.Data;
using Heydesk.Server.Data.Models;
using Heydesk.Server.Utils;
using Microsoft.EntityFrameworkCore;

namespace Heydesk.Server.Domains.Analytics;

public interface IAnalyticsService
{
    Task<Result<GetDashboardMetricsResponse>> GetDashboardMetrics(
        Guid organizationId,
        GetDashboardMetricsRequest request
    );
}

public class AnalyticsService : IAnalyticsService
{
    private readonly RepositoryContext _repository;
    private readonly ILogger<AnalyticsService> _logger;

    public AnalyticsService(RepositoryContext repository, ILogger<AnalyticsService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Result<GetDashboardMetricsResponse>> GetDashboardMetrics(
        Guid organizationId,
        GetDashboardMetricsRequest request
    )
    {
        try
        {
            var (startDate, endDate) = GetDateRange(
                request.TimeRange ?? "7d",
                request.StartDate,
                request.EndDate
            );

            // Execute queries sequentially to avoid DbContext concurrency issues
            var basicMetrics = await GetBasicMetrics(organizationId, startDate);
            var trendsData = await GetTrendsData(organizationId, startDate, endDate);
            var documentStats = await GetDocumentStats(organizationId);
            var agentPerformance = await GetAgentPerformance(organizationId, startDate, endDate);
            var recentActivities = await GetRecentActivities(organizationId, 10);

            var metrics = new DashboardMetrics(
                basicMetrics.TotalConversations,
                basicMetrics.ActiveConversations,
                basicMetrics.TotalTickets,
                basicMetrics.OpenTickets,
                basicMetrics.ResolvedTickets,
                basicMetrics.TotalDocuments,
                basicMetrics.TotalAgents,
                basicMetrics.ActiveAgents,
                basicMetrics.AverageResponseTime,
                basicMetrics.CustomerSatisfactionScore,
                trendsData.ConversationTrends,
                trendsData.TicketTrends,
                documentStats,
                agentPerformance,
                recentActivities
            );

            return Result.Ok(
                new GetDashboardMetricsResponse(metrics, DateTime.UtcNow, request.TimeRange ?? "7d")
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error retrieving dashboard metrics for organization {OrganizationId}",
                organizationId
            );
            return Result.Fail("Failed to retrieve dashboard metrics");
        }
    }

    private static (DateTime startDate, DateTime endDate) GetDateRange(
        string timeRange,
        DateTime? startDate,
        DateTime? endDate
    )
    {
        if (startDate.HasValue && endDate.HasValue)
            return (startDate.Value, endDate.Value);

        var now = DateTime.UtcNow;
        return timeRange switch
        {
            "24h" => (now.AddDays(-1), now),
            "7d" => (now.AddDays(-7), now),
            "30d" => (now.AddDays(-30), now),
            "90d" => (now.AddDays(-90), now),
            _ => (now.AddDays(-7), now),
        };
    }

    private async Task<BasicMetrics> GetBasicMetrics(Guid organizationId, DateTime startDate)
    {
        // Single optimized query using raw SQL for maximum performance
        var result = await _repository.Database.SqlQueryRaw<BasicMetricsResult>(
            @"
            SELECT 
                (SELECT COUNT(*) FROM ""Conversations"" WHERE ""OrganizationId"" = {0}) as totalconversations,
                (SELECT COUNT(*) FROM ""Conversations"" WHERE ""OrganizationId"" = {0} AND ""StartedAt"" >= {1}) as activeconversations,
                (SELECT COUNT(*) FROM ""Tickets"" WHERE ""OrganizationId"" = {0}) as totaltickets,
                (SELECT COUNT(*) FROM ""Tickets"" WHERE ""OrganizationId"" = {0} AND ""Status"" IN (0, 1)) as opentickets,
                (SELECT COUNT(*) FROM ""Tickets"" WHERE ""OrganizationId"" = {0} AND ""Status"" = 2) as resolvedtickets,
                (SELECT COUNT(*) FROM ""Documents"" WHERE ""OrganizationId"" = {0}) as totaldocuments,
                (SELECT COUNT(*) FROM ""AgentModel"" WHERE ""OrganizationId"" = {0}) as totalagents",
            organizationId, startDate
        ).FirstOrDefaultAsync();

        return new BasicMetrics(
            result?.totalconversations ?? 0,
            result?.activeconversations ?? 0,
            result?.totaltickets ?? 0,
            result?.opentickets ?? 0,
            result?.resolvedtickets ?? 0,
            result?.totaldocuments ?? 0,
            result?.totalagents ?? 0,
            result?.totalagents ?? 0, // Active agents same as total for now
            0, // No response time calculation for now
            0  // No satisfaction score calculation for now
        );
    }

    private Task<TrendsData> GetTrendsData(Guid organizationId, DateTime startDate, DateTime endDate)
    {
        // Return empty trends for now to avoid expensive queries
        // In a real implementation, you could use a single SQL query with date grouping
        var conversationTrends = new List<ConversationTrend>();
        var ticketTrends = new List<TicketTrend>();

        // Generate mock data for the last 7 days to show the chart structure
        var currentDate = startDate.Date;
        var random = new Random();

        while (currentDate <= endDate.Date)
        {
            // Generate some sample data for demonstration
            var conversationCount = random.Next(5, 25);
            var resolvedCount = random.Next(3, conversationCount);
            var ticketCreated = random.Next(2, 15);
            var ticketResolved = random.Next(1, ticketCreated);
            var ticketEscalated = random.Next(0, 3);

            conversationTrends.Add(new ConversationTrend(currentDate, conversationCount, resolvedCount));
            ticketTrends.Add(new TicketTrend(currentDate, ticketCreated, ticketResolved, ticketEscalated));

            currentDate = currentDate.AddDays(1);
        }

        return Task.FromResult(new TrendsData(conversationTrends, ticketTrends));
    }



    private Task<List<DocumentStats>> GetDocumentStats(Guid organizationId)
    {
        // Simplified document stats - return empty for now to avoid complex queries
        return Task.FromResult(new List<DocumentStats>());
    }

    private Task<List<AgentPerformance>> GetAgentPerformance(
        Guid organizationId,
        DateTime startDate,
        DateTime endDate
    )
    {
        // Simplified agent performance - return empty for now to avoid complex queries
        return Task.FromResult(new List<AgentPerformance>());
    }

    private Task<List<RecentActivity>> GetRecentActivities(Guid organizationId, int limit)
    {
        // Simplified recent activities - return empty for now to avoid complex queries
        return Task.FromResult(new List<RecentActivity>());
    }
}

// Data structures for optimized queries
public record BasicMetrics(
    int TotalConversations,
    int ActiveConversations,
    int TotalTickets,
    int OpenTickets,
    int ResolvedTickets,
    int TotalDocuments,
    int TotalAgents,
    int ActiveAgents,
    double AverageResponseTime,
    double CustomerSatisfactionScore
);

public record BasicMetricsResult(
    int totalconversations,
    int activeconversations,
    int totaltickets,
    int opentickets,
    int resolvedtickets,
    int totaldocuments,
    int totalagents
);

public record TrendsData(
    List<ConversationTrend> ConversationTrends,
    List<TicketTrend> TicketTrends
);
