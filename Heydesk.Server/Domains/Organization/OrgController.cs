using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Heydesk.Server.Domains.Organization;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrgController : ControllerBase
{
    private readonly IOrgService _orgService;

    public OrgController(IOrgService orgService)
    {
        _orgService = orgService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrganization([FromBody] CreateOrgRequest request)
    {
        if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Unauthorized("User not authenticated");
        }

        var result = await _orgService.CreateOrganization(userId, request);

        if (!result.Success)
            return BadRequest(result.Errors);

        return Ok(result.Data);
    }

    [HttpGet("{organizationId}/members")]
    public async Task<IActionResult> GetMembers(
        Guid organizationId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var request = new GetMembersRequest(page, pageSize);
        var result = await _orgService.GetMembers(organizationId, request);

        if (!result.Success)
            return BadRequest(result.Errors);

        return Ok(result.Data);
    }

    [HttpGet("search")]
    [AllowAnonymous]
    public async Task<IActionResult> SearchOrganizations([FromQuery] string q, [FromQuery] int limit = 10)
    {
        var result = await _orgService.SearchOrganizations(q, limit);
        if (!result.Success)
            return BadRequest(result.Errors);

        return Ok(result.Data);
    }
}
