namespace Heydesk.Server.Data.Models;

public class MessageModel
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public SenderType SenderType { get; set; }
    public Guid? SenderId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string? SenderAvatarUrl { get; set; }
    public string Content { get; set; } = string.Empty;

    public Guid ConversationId { get; set; }
}

public enum SenderType
{
    Customer,
    HumanAgent,
    AiAgent,
}
