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
    public required OrganizationModel Organization { get; set; }

    public Guid CustomerId { get; set; }
    public required CustomerModel Customer { get; set; }

    public Guid AssignedTo { get; set; }

    public ConversationModel? Conversation { get; set; }
}

public enum TicketStatus
{
    Open,
    Escalated,
    Closed,
}
