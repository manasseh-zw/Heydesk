using Heydesk.Server.Data.Models;

namespace Heydesk.Server.Domains.Conversation;

public record MessageResponse(
    Guid Id,
    DateTime Timestamp,
    SenderType SenderType,
    Guid? SenderId,
    string SenderName,
    string? SenderAvatarUrl,
    string Content
);

public record GetConversationResponse(
    Guid Id,
    DateTime StartedAt,
    List<MessageResponse> Messages
);


