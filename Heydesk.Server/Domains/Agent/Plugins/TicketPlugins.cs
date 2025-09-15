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
    [Description(
        "Creates a support ticket from the current conversation when the issue requires escalation or tracking. Use this when the customer's issue cannot be resolved immediately through knowledge base or requires follow-up."
    )]
    public async Task<string> CreateTicket(
        [Description("A brief subject line summarizing the customer's issue")] string subject,
        [Description(
            "Additional context about the issue, including any troubleshooting steps already attempted"
        )]
            string context = ""
    )
    {
        try
        {
            // Check if conversation exists and doesn't already have a ticket
            var conversation = await _repository
                .Conversations.Include(c => c.Customer)
                .FirstOrDefaultAsync(c => c.Id == _conversationId);

            if (conversation == null)
            {
                return "Error: Conversation not found. Cannot create ticket.";
            }

            if (conversation.IsTicketTied)
            {
                return "Error: This conversation already has an associated ticket.";
            }

            // Find the first user in the organization to assign the ticket to
            var assignedUser = await _repository.Users.FirstOrDefaultAsync(u =>
                u.OrganizationId == _organizationId
            );

            if (assignedUser == null)
            {
                return "Error: No human agents available in this organization. Please contact support directly.";
            }

            var ticket = new TicketModel
            {
                Subject = subject,
                Context = context,
                Status = TicketStatus.Escalated,
                OrganizationId = _organizationId,
                CustomerId = conversation.CustomerId,
                ConversationId = _conversationId,
                AssignedTo = assignedUser.Id,
            };

            _repository.Tickets.Add(ticket);

            // Update conversation to link to ticket
            conversation.TicketId = ticket.Id;

            await _repository.SaveChangesAsync();

            return $"Ticket created and escalated successfully with ID: {ticket.Id}. Assigned to {assignedUser.Username}. You will receive updates via email. Reference number: {ticket.Id.ToString()[..8]}.";
        }
        catch (Exception ex)
        {
            return $"Error creating ticket: {ex.Message}. Please contact our support team directly.";
        }
    }

    [KernelFunction]
    [Description(
        "Retrieves the current status and details of an existing ticket. Use this when customers ask about their ticket status or need updates."
    )]
    public async Task<string> GetTicketStatus(
        [Description("The unique identifier of the ticket to check")] string ticketId
    )
    {
        try
        {
            var ticketGuid = Guid.Parse(ticketId);

            var ticket = await _repository
                .Tickets.Include(t => t.Customer)
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
                assignedUser = await _repository.Users.FirstOrDefaultAsync(u =>
                    u.Id == ticket.AssignedTo
                );
            }

            var statusMessage = ticket.Status switch
            {
                TicketStatus.Open => "Your ticket is open and being processed by our AI assistant.",
                TicketStatus.Escalated => assignedUser != null
                    ? $"Your ticket has been escalated to our human support team and assigned to {assignedUser.Username}."
                    : "Your ticket has been escalated to our human support team for specialized assistance.",
                TicketStatus.Closed =>
                    $"Your ticket was resolved and closed on {ticket.ClosedAt:yyyy-MM-dd HH:mm}.",
                _ => "Unknown status",
            };

            return $"Ticket #{ticketId[..8]}\n"
                + $"Subject: {ticket.Subject}\n"
                + $"Status: {ticket.Status}\n"
                + $"Opened: {ticket.OpenedAt:yyyy-MM-dd HH:mm}\n"
                + $"{statusMessage}\n"
                + (
                    !string.IsNullOrEmpty(ticket.Context)
                        ? $"\nAdditional Context: {ticket.Context}"
                        : ""
                );
        }
        catch (Exception ex)
        {
            return $"Error retrieving ticket status: {ex.Message}. Please try again or contact support.";
        }
    }

}
