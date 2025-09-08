namespace Heydesk.Server.Data.Models;

public class ConversationModel
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public List<MessageModel> Messages { get; set; } = [];

    public Guid TicketId { get; set; }
    public required TicketModel Ticket { get; set; }
}
