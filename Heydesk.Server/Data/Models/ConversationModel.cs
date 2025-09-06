namespace Heydesk.Server.Data.Models;

public class ConversationModel
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<MessageModel> Messages { get; set; } = [];
}
