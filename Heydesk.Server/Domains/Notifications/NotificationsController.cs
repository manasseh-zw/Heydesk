using Heydesk.Server.Data;
using Heydesk.Server.Integrations;
using Heydesk.Server.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Heydesk.Server.Domains.Notifications;

[ApiController]
[Route("api/organizations/{organizationId:guid}/notifications")]
public class NotificationsController : ControllerBase
{
    private readonly RepositoryContext _repository;
    private readonly IEmailService _emailService;
    private readonly ILogger<NotificationsController> _logger;
    private readonly Heydesk.Server.Domains.Ticket.ITicketService _ticketService;

    public NotificationsController(RepositoryContext repository, IEmailService emailService, Heydesk.Server.Domains.Ticket.ITicketService ticketService, ILogger<NotificationsController> logger)
    {
        _repository = repository;
        _emailService = emailService;
        _ticketService = ticketService;
        _logger = logger;
    }

    [HttpPost("send-support-email")]
    [Authorize(AuthenticationSchemes = "UserBearer")] // Only org users send emails
    public async Task<ActionResult<SendSupportEmailResponse>> SendSupportEmail(
        Guid organizationId,
        [FromBody] SendSupportEmailRequest request,
        CancellationToken cancellationToken
    )
    {
        if (organizationId != request.OrganizationId)
            return BadRequest(Result.Fail("Organization mismatch"));

        var org = await _repository.Organizations.FirstOrDefaultAsync(o => o.Id == organizationId, cancellationToken);
        if (org == null)
            return NotFound(Result.Fail("Organization not found"));

        var ticket = await _repository.Tickets.Include(t => t.Customer)
            .FirstOrDefaultAsync(t => t.Id == request.TicketId && t.OrganizationId == organizationId, cancellationToken);
        if (ticket == null)
            return NotFound(Result.Fail("Ticket not found"));

        var html = EmailTemplates.SupportResponseTemplate(
            org.Name,
            org.Slug,
            request.CustomerName,
            request.HtmlBody
        );

        try
        {
            await _emailService.SendSupportEmailAsync(org.Slug, request.To, request.Subject, html, cancellationToken);

            // Close the ticket after successful email send
            var closeResult = await _ticketService.CloseTicket(organizationId, request.TicketId);
            if (!closeResult.Success)
            {
                _logger.LogWarning("Email sent but failed to close ticket {TicketId}: {Errors}", request.TicketId, string.Join(", ", closeResult.Errors ?? new List<string>()));
            }

            return Ok(new SendSupportEmailResponse(true));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send support email for org {OrgId} ticket {TicketId}", organizationId, request.TicketId);
            return StatusCode(500, Result.Fail("Failed to send email"));
        }
    }
}


