namespace Heydesk.Server.Data.Models;

public class ConversationModel
{
    public Guid Id { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public List<MessageModel> Messages { get; set; } = [];

    public string Title { get; set; } = string.Empty;

    // Customer relationship
    public Guid CustomerId { get; set; }
    public CustomerModel Customer { get; set; } = null!;

    // Organization context for team switching
    public Guid OrganizationId { get; set; }
    public OrganizationModel Organization { get; set; } = null!;

    // Optional ticket relationship (for when conversation becomes a ticket)
    public Guid? TicketId { get; set; }
    public TicketModel? Ticket { get; set; }

    // Flag to indicate if this conversation is tied to a ticket
    public bool IsTicketTied => TicketId.HasValue;
}
