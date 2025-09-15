using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Heydesk.Server.Domains.Ticket;

[ApiController]
[Route("api/organizations/{organizationId:guid}/tickets")]
[Authorize]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _ticketService;

    public TicketsController(ITicketService ticketService)
    {
        _ticketService = ticketService;
    }

    [HttpGet]
    public async Task<IActionResult> GetTickets([FromRoute] Guid organizationId, [FromQuery] GetTicketsRequest request)
    {
        var result = await _ticketService.GetTickets(organizationId, request);
        if (!result.Success)
            return BadRequest(result.Errors);
        return Ok(result.Data);
    }

    [HttpGet("{ticketId:guid}/with-conversation")]
    public async Task<IActionResult> GetTicketWithConversation([FromRoute] Guid organizationId, [FromRoute] Guid ticketId)
    {
        var result = await _ticketService.GetTicketWithConversation(organizationId, ticketId);
        if (!result.Success)
            return BadRequest(result.Errors);
        return Ok(result.Data);
    }
}


