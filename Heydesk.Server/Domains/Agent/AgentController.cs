using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Heydesk.Server.Domains.Agent;

[ApiController]
[Route("api/organizations/{organizationId:guid}/agents")]
[Authorize]
public class AgentController : ControllerBase
{
    private readonly IAgentService _agentService;

    public AgentController(IAgentService agentService)
    {
        _agentService = agentService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateAgent([FromRoute] Guid organizationId, [FromBody] CreateAgentRequest request)
    {
        var result = await _agentService.CreateAgent(organizationId, request);
        if (!result.Success)
            return BadRequest(result.Errors);
        return Ok(result.Data);
    }
}


