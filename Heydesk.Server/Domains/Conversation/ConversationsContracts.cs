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

public record GetConversationsRequest(int Page = 1, int PageSize = 20);

public record ConversationSummary(
    Guid Id,
    string Title,
    DateTime StartedAt,
    DateTime? LastMessageAt,
    List<MessageResponse> PreviewMessages, // First 2 messages for display
    bool IsTicketTied,
    Guid? TicketId
);

public record GetConversationsResponse(
    List<ConversationSummary> Conversations,
    int TotalCount,
    int Page,
    int PageSize
);

public record GetConversationWithMessagesResponse(
    Guid Id,
    string Title,
    DateTime StartedAt,
    List<MessageResponse> Messages,
    bool IsTicketTied,
    Guid? TicketId
);


