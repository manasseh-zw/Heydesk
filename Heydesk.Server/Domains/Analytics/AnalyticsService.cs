using Heydesk.Server.Data;
using Heydesk.Server.Data.Models;
using Heydesk.Server.Utils;
using Microsoft.EntityFrameworkCore;

namespace Heydesk.Server.Domains.Analytics;

public interface IAnalyticsService
{
    Task<Result<GetDashboardMetricsResponse>> GetDashboardMetrics(Guid organizationId, GetDashboardMetricsRequest request);
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

    public async Task<Result<GetDashboardMetricsResponse>> GetDashboardMetrics(Guid organizationId, GetDashboardMetricsRequest request)
    {
        try
        {
            var (startDate, endDate) = GetDateRange(request.TimeRange, request.StartDate, request.EndDate);

            // Get basic counts
            var totalConversations = await _repository.Conversations
                .Where(c => c.OrganizationId == organizationId)
                .CountAsync();

            var activeConversations = await _repository.Conversations
                .Where(c => c.OrganizationId == organizationId &&
                           c.Messages.Any(m => m.Timestamp >= startDate))
                .CountAsync();

            var totalTickets = await _repository.Tickets
                .Where(t => t.OrganizationId == organizationId)
                .CountAsync();

            var openTickets = await _repository.Tickets
                .Where(t => t.OrganizationId == organizationId &&
                           (t.Status == TicketStatus.Open || t.Status == TicketStatus.Escalated))
                .CountAsync();

            var resolvedTickets = await _repository.Tickets
                .Where(t => t.OrganizationId == organizationId && t.Status == TicketStatus.Closed)
                .CountAsync();

            var totalDocuments = await _repository.Documents
                .Where(d => d.OrganizationId == organizationId)
                .CountAsync();

            var totalAgents = await _repository.Agents
                .Where(a => a.OrganizationId == organizationId)
                .CountAsync();

            var activeAgents = await _repository.Agents
                .Where(a => a.OrganizationId == organizationId)
                .CountAsync();

            // Calculate average response time (simplified - time between user message and AI response)
            var averageResponseTime = await CalculateAverageResponseTime(organizationId, startDate, endDate);

            // Calculate customer satisfaction (simplified - based on conversation resolution)
            var customerSatisfactionScore = await CalculateCustomerSatisfaction(organizationId, startDate, endDate);

            // Get trends
            var conversationTrends = await GetConversationTrends(organizationId, startDate, endDate);
            var ticketTrends = await GetTicketTrends(organizationId, startDate, endDate);
            var documentStats = await GetDocumentStats(organizationId);
            var agentPerformance = await GetAgentPerformance(organizationId, startDate, endDate);
            var recentActivities = await GetRecentActivities(organizationId, 10);

            var metrics = new DashboardMetrics(
                totalConversations,
                activeConversations,
                totalTickets,
                openTickets,
                resolvedTickets,
                totalDocuments,
                totalAgents,
                activeAgents,
                averageResponseTime,
                customerSatisfactionScore,
                conversationTrends,
                ticketTrends,
                documentStats,
                agentPerformance,
                recentActivities
            );

            return Result.Ok(new GetDashboardMetricsResponse(
                metrics,
                DateTime.UtcNow,
                request.TimeRange
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving dashboard metrics for organization {OrganizationId}", organizationId);
            return Result.Fail("Failed to retrieve dashboard metrics");
        }
    }

    private static (DateTime startDate, DateTime endDate) GetDateRange(string timeRange, DateTime? startDate, DateTime? endDate)
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
            _ => (now.AddDays(-7), now)
        };
    }

    private async Task<double> CalculateAverageResponseTime(Guid organizationId, DateTime startDate, DateTime endDate)
    {
        try
        {
            var conversations = await _repository.Conversations
                .Where(c => c.OrganizationId == organizationId && c.StartedAt >= startDate && c.StartedAt <= endDate)
                .Include(c => c.Messages)
                .ToListAsync();

            var responseTimes = new List<double>();

            foreach (var conversation in conversations)
            {
                var messages = conversation.Messages.OrderBy(m => m.Timestamp).ToList();
                for (int i = 0; i < messages.Count - 1; i++)
                {
                    if (messages[i].SenderType == SenderType.Customer &&
                        messages[i + 1].SenderType == SenderType.AiAgent)
                    {
                        var responseTime = (messages[i + 1].Timestamp - messages[i].Timestamp).TotalMinutes;
                        responseTimes.Add(responseTime);
                    }
                }
            }

            return responseTimes.Any() ? responseTimes.Average() : 0;
        }
        catch
        {
            return 0;
        }
    }

    private async Task<double> CalculateCustomerSatisfaction(Guid organizationId, DateTime startDate, DateTime endDate)
    {
        try
        {
            var totalConversations = await _repository.Conversations
                .Where(c => c.OrganizationId == organizationId && c.StartedAt >= startDate && c.StartedAt <= endDate)
                .CountAsync();

            var resolvedConversations = await _repository.Conversations
                .Where(c => c.OrganizationId == organizationId &&
                           c.StartedAt >= startDate && c.StartedAt <= endDate &&
                           c.IsTicketTied == false) // Assuming non-ticket conversations are resolved
                .CountAsync();

            return totalConversations > 0 ? (double)resolvedConversations / totalConversations * 100 : 0;
        }
        catch
        {
            return 0;
        }
    }

    private async Task<List<ConversationTrend>> GetConversationTrends(Guid organizationId, DateTime startDate, DateTime endDate)
    {
        var trends = new List<ConversationTrend>();
        var currentDate = startDate.Date;

        while (currentDate <= endDate.Date)
        {
            var nextDate = currentDate.AddDays(1);

            var count = await _repository.Conversations
                .Where(c => c.OrganizationId == organizationId &&
                           c.StartedAt >= currentDate && c.StartedAt < nextDate)
                .CountAsync();

            var resolvedCount = await _repository.Conversations
                .Where(c => c.OrganizationId == organizationId &&
                           c.StartedAt >= currentDate && c.StartedAt < nextDate &&
                           c.IsTicketTied == false)
                .CountAsync();

            trends.Add(new ConversationTrend(currentDate, count, resolvedCount));
            currentDate = nextDate;
        }

        return trends;
    }

    private async Task<List<TicketTrend>> GetTicketTrends(Guid organizationId, DateTime startDate, DateTime endDate)
    {
        var trends = new List<TicketTrend>();
        var currentDate = startDate.Date;

        while (currentDate <= endDate.Date)
        {
            var nextDate = currentDate.AddDays(1);

            var createdCount = await _repository.Tickets
                .Where(t => t.OrganizationId == organizationId &&
                           t.OpenedAt >= currentDate && t.OpenedAt < nextDate)
                .CountAsync();

            var resolvedCount = await _repository.Tickets
                .Where(t => t.OrganizationId == organizationId &&
                           t.OpenedAt >= currentDate && t.OpenedAt < nextDate &&
                           t.Status == TicketStatus.Closed)
                .CountAsync();

            var escalatedCount = await _repository.Tickets
                .Where(t => t.OrganizationId == organizationId &&
                           t.OpenedAt >= currentDate && t.OpenedAt < nextDate &&
                           t.Status == TicketStatus.Escalated)
                .CountAsync();

            trends.Add(new TicketTrend(currentDate, createdCount, resolvedCount, escalatedCount));
            currentDate = nextDate;
        }

        return trends;
    }

    private async Task<List<DocumentStats>> GetDocumentStats(Guid organizationId)
    {
        var documents = await _repository.Documents
            .Where(d => d.OrganizationId == organizationId)
            .GroupBy(d => d.Type)
            .Select(g => new DocumentStats(
                g.Key.ToString(),
                g.Count(),
                g.Count(d => d.Status == DocumentIngestStatus.Processing),
                g.Count(d => d.Status == DocumentIngestStatus.Failed)
            ))
            .ToListAsync();

        return documents;
    }

    private async Task<List<AgentPerformance>> GetAgentPerformance(Guid organizationId, DateTime startDate, DateTime endDate)
    {
        var agents = await _repository.Agents
            .Where(a => a.OrganizationId == organizationId)
            .Select(a => new AgentPerformance(
                a.Id,
                a.Name,
                0, // Will be calculated separately
                0, // Will be calculated separately
                0, // Will be calculated separately
                0  // Will be calculated separately
            ))
            .ToListAsync();

        // For now, return basic agent info. In a real implementation, you'd calculate actual performance metrics
        return agents;
    }

    private async Task<List<RecentActivity>> GetRecentActivities(Guid organizationId, int limit)
    {
        var activities = new List<RecentActivity>();

        // Get recent conversations
        var recentConversations = await _repository.Conversations
            .Where(c => c.OrganizationId == organizationId)
            .OrderByDescending(c => c.StartedAt)
            .Take(limit / 2)
            .Select(c => new RecentActivity(
                c.StartedAt,
                "conversation",
                $"New conversation started: {c.Title}",
                "Customer",
                null
            ))
            .ToListAsync();

        // Get recent tickets
        var recentTickets = await _repository.Tickets
            .Where(t => t.OrganizationId == organizationId)
            .OrderByDescending(t => t.OpenedAt)
            .Take(limit / 2)
            .Select(t => new RecentActivity(
                t.OpenedAt,
                "ticket",
                $"New ticket created: {t.Subject}",
                "System",
                null
            ))
            .ToListAsync();

        activities.AddRange(recentConversations);
        activities.AddRange(recentTickets);

        return activities.OrderByDescending(a => a.Timestamp).Take(limit).ToList();
    }
}
