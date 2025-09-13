using System.ComponentModel;
using Heydesk.Server.Data;
using Heydesk.Server.Data.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.SemanticKernel;

namespace Heydesk.Server.Domains.Agent.Plugins;

public class TicketPlugins
{
    private readonly RepositoryContext _repository;
    private readonly Guid _conversationId;
    private readonly Guid _organizationId;

    public TicketPlugins(RepositoryContext repository, Guid conversationId, Guid organizationId)
    {
        _repository = repository;
        _conversationId = conversationId;
        _organizationId = organizationId;
    }

    [KernelFunction]
    [Description("Creates a support ticket from the current conversation when the issue requires escalation or tracking. Use this when the customer's issue cannot be resolved immediately through knowledge base or requires follow-up.")]
    public async Task<string> CreateTicket(
        [Description("A brief subject line summarizing the customer's issue")] string subject,
        [Description("Additional context about the issue, including any troubleshooting steps already attempted")] string context = ""
    )
    {
        try
        {
            // Check if conversation exists and doesn't already have a ticket
            var conversation = await _repository.Conversations
                .Include(c => c.Customer)
                .FirstOrDefaultAsync(c => c.Id == _conversationId);

            if (conversation == null)
            {
                return "Error: Conversation not found. Cannot create ticket.";
            }

            if (conversation.IsTicketTied)
            {
                return "Error: This conversation already has an associated ticket.";
            }

            var ticket = new TicketModel
            {
                Subject = subject,
                Context = context,
                Status = TicketStatus.Open,
                OrganizationId = _organizationId,
                CustomerId = conversation.CustomerId,
                ConversationId = _conversationId,
                AssignedTo = Guid.Empty // Will be assigned to a human agent later
            };

            _repository.Tickets.Add(ticket);

            // Update conversation to link to ticket
            conversation.TicketId = ticket.Id;

            await _repository.SaveChangesAsync();

            return $"Ticket created successfully with ID: {ticket.Id}. The ticket has been assigned to our support team and you will receive updates via email. Reference number: {ticket.Id.ToString()[..8]}.";
        }
        catch (Exception ex)
        {
            return $"Error creating ticket: {ex.Message}. Please contact our support team directly.";
        }
    }

    [KernelFunction]
    [Description("Escalates an existing ticket to a human agent when the AI cannot resolve the customer's issue. Use this when the issue is complex, requires human judgment, or the customer specifically requests human assistance.")]
    public async Task<string> EscalateTicket(
        [Description("The unique identifier of the ticket to escalate")] string ticketId,
        [Description("Reason for escalation and summary of what has been attempted so far")] string escalationReason
    )
    {
        try
        {
            var ticketGuid = Guid.Parse(ticketId);

            var ticket = await _repository.Tickets
                .Include(t => t.Customer)
                .Include(t => t.Organization)
                .FirstOrDefaultAsync(t => t.Id == ticketGuid);

            if (ticket == null)
            {
                return "Error: Ticket not found. Cannot escalate.";
            }

            if (ticket.Status == TicketStatus.Escalated)
            {
                return "This ticket has already been escalated to our human support team.";
            }

            // Find the first user in the organization to assign the ticket to
            var assignedUser = await _repository.Users
                .FirstOrDefaultAsync(u => u.OrganizationId == _organizationId);

            if (assignedUser == null)
            {
                return "Error: No human agents available in this organization. Please contact support directly.";
            }

            // Update ticket status to escalated and assign to human agent
            ticket.Status = TicketStatus.Escalated;
            ticket.AssignedTo = assignedUser.Id;

            // Update context with escalation reason
            ticket.Context = string.IsNullOrEmpty(ticket.Context)
                ? $"Escalated: {escalationReason}"
                : $"{ticket.Context}\n\nEscalated: {escalationReason}";

            await _repository.SaveChangesAsync();

            return $"Ticket {ticketId[..8]} has been escalated to our human support team and assigned to {assignedUser.Username}. A specialist will review your case and respond within 24 hours. You will be notified via email when there are updates.";
        }
        catch (Exception ex)
        {
            return $"Error escalating ticket: {ex.Message}. Your issue is important to us - please contact our support team directly.";
        }
    }

    [KernelFunction]
    [Description("Retrieves the current status and details of an existing ticket. Use this when customers ask about their ticket status or need updates.")]
    public async Task<string> GetTicketStatus(
        [Description("The unique identifier of the ticket to check")] string ticketId
    )
    {
        try
        {
            var ticketGuid = Guid.Parse(ticketId);

            var ticket = await _repository.Tickets
                .Include(t => t.Customer)
                .Include(t => t.Organization)
                .FirstOrDefaultAsync(t => t.Id == ticketGuid);

            if (ticket == null)
            {
                return "Ticket not found. Please check the ticket ID and try again.";
            }

            // Get assigned user if ticket is escalated
            UserModel? assignedUser = null;
            if (ticket.Status == TicketStatus.Escalated && ticket.AssignedTo != Guid.Empty)
            {
                assignedUser = await _repository.Users
                    .FirstOrDefaultAsync(u => u.Id == ticket.AssignedTo);
            }

            var statusMessage = ticket.Status switch
            {
                TicketStatus.Open => "Your ticket is open and being processed by our AI assistant.",
                TicketStatus.Escalated => assignedUser != null
                    ? $"Your ticket has been escalated to our human support team and assigned to {assignedUser.Username}."
                    : "Your ticket has been escalated to our human support team for specialized assistance.",
                TicketStatus.Closed => $"Your ticket was resolved and closed on {ticket.ClosedAt:yyyy-MM-dd HH:mm}.",
                _ => "Unknown status"
            };

            return $"Ticket #{ticketId[..8]}\n" +
                   $"Subject: {ticket.Subject}\n" +
                   $"Status: {ticket.Status}\n" +
                   $"Opened: {ticket.OpenedAt:yyyy-MM-dd HH:mm}\n" +
                   $"{statusMessage}\n" +
                   (!string.IsNullOrEmpty(ticket.Context) ? $"\nAdditional Context: {ticket.Context}" : "");
        }
        catch (Exception ex)
        {
            return $"Error retrieving ticket status: {ex.Message}. Please try again or contact support.";
        }
    }
}
