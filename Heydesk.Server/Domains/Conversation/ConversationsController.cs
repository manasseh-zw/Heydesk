using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Heydesk.Server.Domains.Conversation;

[ApiController]
[Route("api/organizations/{organizationId:guid}/conversations")]
[Authorize(AuthenticationSchemes = "CustomerBearer")]
public class ConversationsController : ControllerBase
{
    private readonly IConversationsService _conversationsService;
    private readonly ILogger<ConversationsController> _logger;

    public ConversationsController(IConversationsService conversationsService, ILogger<ConversationsController> logger)
    {
        _conversationsService = conversationsService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetConversations(
        [FromRoute] Guid organizationId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var customerId))
        {
            return Unauthorized("Customer not authenticated");
        }

        var result = await _conversationsService.GetConversations(customerId, organizationId, page, pageSize);

        if (!result.Success)
            return BadRequest(result.Errors);

        return Ok(result.Data);
    }

    [HttpGet("{conversationId:guid}")]
    public async Task<IActionResult> GetConversationWithMessages(
        [FromRoute] Guid organizationId,
        [FromRoute] Guid conversationId)
    {
        if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var customerId))
        {
            return Unauthorized("Customer not authenticated");
        }

        var result = await _conversationsService.GetConversationWithMessages(customerId, organizationId, conversationId);

        if (!result.Success)
            return BadRequest(result.Errors);

        return Ok(result.Data);
    }
}
