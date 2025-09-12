using Microsoft.AspNetCore.SignalR;

namespace Heydesk.Server.Domains.Agent.Chat;

public class ChatHub : Hub<IChatClient>
{
    private readonly ChatAgent _agent;

    public ChatHub(ChatAgent agent)
    {
        _agent = agent;
    }

    public async Task<Guid> StartChat(StartChatRequest request)
    {
        var conversationId = await _agent.StartChat(request);
        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(conversationId.ToString()));
        return conversationId;
    }

    public async Task JoinConversation(Guid conversationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(conversationId.ToString()));
    }

    public async Task LeaveConversation(Guid conversationId)
    {
        await Groups.RemoveFromGroupAsync(
            Context.ConnectionId,
            GroupName(conversationId.ToString())
        );
    }

    public async Task SendUserMessage(ContinueChatRequest request)
    {
        // Get sender info from the session
        var senderInfo = _agent.GetSenderInfo(request.ConversationId);
        if (senderInfo == null)
        {
            throw new InvalidOperationException("Conversation not found");
        }

        var userMessage = new ChatMessageDto(
            Guid.NewGuid().ToString(),
            request.ConversationId.ToString(),
            "user",
            request.Message,
            DateTimeOffset.UtcNow,
            new SenderInfoDto(
                senderInfo.SenderId,
                senderInfo.SenderName,
                senderInfo.SenderAvatarUrl,
                "customer"
            )
        );

        await Clients
            .Group(GroupName(request.ConversationId.ToString()))
            .MessageAppended(userMessage);
        await _agent.ContinueChat(request);
    }

    public async Task EndChat(Guid conversationId)
    {
        await _agent.EndChat(conversationId);
        await Groups.RemoveFromGroupAsync(
            Context.ConnectionId,
            GroupName(conversationId.ToString())
        );
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }

    private static string GroupName(string conversationId) => $"conv-{conversationId}";
}

public interface IChatClient
{
    Task Token(string token);
    Task MessageAppended(ChatMessageDto message);
    Task ConversationStateChanged(ConversationStateDto state);
}

public sealed record ChatMessageDto(
    string Id,
    string ConversationId,
    string Role,
    string Content,
    DateTimeOffset CreatedAt,
    SenderInfoDto Sender
);

public sealed record SenderInfoDto(
    string Id,
    string Name,
    string? AvatarUrl,
    string Type // "customer", "ai-agent", "human-agent"
);

public sealed record ConversationStateDto(
    string ConversationId,
    string State,
    string? AssignedAgentId,
    string? AssignedAgentName,
    SenderInfoDto? Customer,
    DateTimeOffset UpdatedAt
);
