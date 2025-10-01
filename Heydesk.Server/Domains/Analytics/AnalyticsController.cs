using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Heydesk.Server.Domains.Analytics;

[ApiController]
[Route("api/organizations/{organizationId:guid}/analytics")]
[Authorize(AuthenticationSchemes = "UserBearer")]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;
    private readonly ILogger<AnalyticsController> _logger;

    public AnalyticsController(
        IAnalyticsService analyticsService,
        ILogger<AnalyticsController> logger
    )
    {
        _analyticsService = analyticsService;
        _logger = logger;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboardMetrics(
        [FromRoute] Guid organizationId,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string timeRange = "7d"
    )
    {
        Console.WriteLine(
            $"Analytics endpoint hit! OrganizationId: {organizationId}, TimeRange: {timeRange}"
        );

        if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            Console.WriteLine("User not authenticated");
            return Unauthorized("User not authenticated");
        }

        Console.WriteLine($"User ID: {userId}");

        var request = new GetDashboardMetricsRequest(startDate, endDate, timeRange);
        var result = await _analyticsService.GetDashboardMetrics(organizationId, request);

        _logger.LogInformation(
            "Dashboard metrics retrieved for organization {OrganizationId}",
            organizationId
        );
        _logger.LogInformation(
            "Dashboard metrics: {DashboardMetrics}",
            JsonSerializer.Serialize(result.Data)
        );

        if (!result.Success)
            return BadRequest(result.Errors);

        return Ok(result.Data);
    }
}
