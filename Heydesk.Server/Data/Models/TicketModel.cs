namespace Heydesk.Server.Data.Models;

public class TicketModel
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public string Subject { get; set; } = string.Empty;

    public string? Context { get; set; }

    public TicketStatus Status { get; set; } = TicketStatus.Open;

    public DateTime OpenedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ClosedAt { get; set; }

    public Guid OrganizationId { get; set; }
    public OrganizationModel Organization { get; set; } = null!;

    public Guid CustomerId { get; set; }
    public CustomerModel Customer { get; set; } = null!;

    public Guid AssignedTo { get; set; }

    // Required conversation (ticket is always created from a conversation)
    public Guid ConversationId { get; set; }
    public ConversationModel Conversation { get; set; } = null!;
}

public enum TicketStatus
{
    Open,
    Escalated,
    Closed,
}
