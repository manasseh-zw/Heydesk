using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Heydesk.Server.Domains.Analytics;

[ApiController]
[Route("api/organizations/{organizationId:guid}/analytics")]
[Authorize(AuthenticationSchemes = "CustomerBearer")]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;
    private readonly ILogger<AnalyticsController> _logger;

    public AnalyticsController(IAnalyticsService analyticsService, ILogger<AnalyticsController> logger)
    {
        _analyticsService = analyticsService;
        _logger = logger;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboardMetrics(
        [FromRoute] Guid organizationId,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string timeRange = "7d")
    {
        if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var customerId))
        {
            return Unauthorized("Customer not authenticated");
        }

        var request = new GetDashboardMetricsRequest(startDate, endDate, timeRange);
        var result = await _analyticsService.GetDashboardMetrics(organizationId, request);

        if (!result.Success)
            return BadRequest(result.Errors);

        return Ok(result.Data);
    }
}
