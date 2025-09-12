using System.Collections.Concurrent;
using System.Text;
using Heydesk.Server.Config;
using Heydesk.Server.Data;
using Heydesk.Server.Data.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Agents;
using Microsoft.SemanticKernel.ChatCompletion;

namespace Heydesk.Server.Domains.Agent.Chat;

public class ChatAgent
{
    private readonly ChatCompletionAgent _agent;
    private readonly IMemoryCache _cache;
    private readonly IHubContext<ChatHub, IChatClient> _hubContext;
    private readonly RepositoryContext _context;
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly Timer _pruneTimer;

    private const int MaxSessions = 1000;
    private const int MaxHistoryMessagesPerSession = 100;
    private static readonly TimeSpan SessionIdleTtl = TimeSpan.FromMinutes(30);

    public ChatAgent(
        IHubContext<ChatHub, IChatClient> hubContext,
        RepositoryContext context,
        IServiceScopeFactory serviceScopeFactory,
        IMemoryCache cache
    )
    {
        _hubContext = hubContext;
        _context = context;
        _serviceScopeFactory = serviceScopeFactory;
        _cache = cache;

        var kernel = Kernel
            .CreateBuilder()
            .AddAzureOpenAIChatCompletion(
                apiKey: AppConfig.AzureAI.ApiKey,
                endpoint: AppConfig.AzureAI.Endpoint,
                deploymentName: "gpt-4.1"
            )
            .Build();

        _agent = new ChatCompletionAgent()
        {
            Name = "SupportAgent",
            Instructions =
                "You are a helpful customer support agent. You have access to the organization's knowledge base to help customers with their questions and issues. Be friendly, professional, and helpful. If you cannot resolve an issue, you can escalate it to a human agent.",
            Kernel = kernel,
        };

        _pruneTimer = new Timer(
            _ => PruneExpiredSessions(),
            null,
            TimeSpan.FromMinutes(5),
            TimeSpan.FromMinutes(5)
        );
    }

    public async Task<Guid> StartChat(StartChatRequest request)
    {
        var conversationId = Guid.NewGuid();
        var session = new ChatSession(request.OrganizationId, request.Sender, [], conversationId);

        var cacheKey = $"chat_session_{conversationId}";
        _cache.Set(cacheKey, session, TimeSpan.FromHours(1)); // Cache for 1 hour

        // Persist conversation to database in background (non-blocking)
        _ = Task.Run(async () =>
        {
            await PersistConversationToDatabase(
                conversationId,
                request.OrganizationId,
                request.Sender
            );
        });

        return conversationId;
    }

    public async Task ContinueChat(
        ContinueChatRequest request,
        CancellationToken cancellationToken = default
    )
    {
        var cacheKey = $"chat_session_{request.ConversationId}";
        if (!_cache.TryGetValue(cacheKey, out ChatSession? session) || session == null)
            throw new Exception("session does not exist");

        await session!.Gate.WaitAsync(cancellationToken);
        try
        {
            session.LastAccessUtc = DateTimeOffset.UtcNow;

            // Add user message to history
            session.History.Add(new ChatMessageContent(AuthorRole.User, request.Message));
            session.History = BuildTrimmedHistory(session.History);

            var promptHistory = session.History;
            var messageBuffer = new StringBuilder();

            await foreach (var chunk in _agent.InvokeStreamingAsync(promptHistory))
            {
                var token = chunk.Message.Content ?? string.Empty;
                if (token.Length == 0)
                    continue;

                await _hubContext.Clients.Group($"conv-{request.ConversationId}").Token(token);
                messageBuffer.Append(token);
            }

            var assistantResponse = messageBuffer.ToString();
            session.History.Add(new ChatMessageContent(AuthorRole.Assistant, assistantResponse));
            session.History = BuildTrimmedHistory(session.History);

            _cache.Set(cacheKey, session, TimeSpan.FromHours(1));
            messageBuffer.Clear();
            session.LastAccessUtc = DateTimeOffset.UtcNow;

            var assistantMsg = new ChatMessageDto(
                Guid.NewGuid().ToString(),
                request.ConversationId.ToString(),
                "assistant",
                assistantResponse,
                DateTimeOffset.UtcNow,
                new SenderInfoDto("ai-agent", "AI Assistant", null, "ai-agent")
            );
            await _hubContext
                .Clients.Group($"conv-{request.ConversationId}")
                .MessageAppended(assistantMsg);

            // Persist messages to database in background (non-blocking)
            _ = Task.Run(async () =>
            {
                await PersistMessagesToDatabase(
                    request.ConversationId,
                    request.Message,
                    assistantResponse,
                    session.Sender
                );
            });
        }
        finally
        {
            session.Gate.Release();
        }

        EvictIfOverCapacity();
    }

    public Task<bool> EndChat(Guid conversationId)
    {
        var cacheKey = $"chat_session_{conversationId}";
        if (_cache.TryGetValue(cacheKey, out ChatSession? session))
        {
            session?.Dispose();
            _cache.Remove(cacheKey);
            return Task.FromResult(true);
        }
        return Task.FromResult(false);
    }

    public SenderInfo? GetSenderInfo(Guid conversationId)
    {
        var cacheKey = $"chat_session_{conversationId}";
        return _cache.TryGetValue(cacheKey, out ChatSession? session) ? session?.Sender : null;
    }

    private void PruneExpiredSessions()
    {
        // Memory cache handles expiration automatically based on the TTL we set
        // No need for manual pruning since we set 1-hour expiration on sessions
    }

    private void EvictIfOverCapacity()
    {
        // Memory cache handles capacity management automatically
        // No need for manual eviction
    }

    private static ChatHistory BuildTrimmedHistory(ChatHistory history)
    {
        if (history.Count <= MaxHistoryMessagesPerSession)
            return history;
        var trimmed = new ChatHistory();
        var start = history.Count - MaxHistoryMessagesPerSession;
        for (int i = start; i < history.Count; i++)
        {
            trimmed.Add(history[i]);
        }
        return trimmed;
    }

    private async Task PersistConversationToDatabase(
        Guid conversationId,
        Guid organizationId,
        SenderInfo sender
    )
    {
        try
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<RepositoryContext>();

            // Create conversation in database
            var conversation = new ConversationModel
            {
                Id = conversationId,
                CustomerId = Guid.Parse(sender.SenderId),
                OrganizationId = organizationId,
                StartedAt = DateTime.UtcNow,
            };

            context.Conversations.Add(conversation);
            await context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            // Log the error but don't throw to avoid affecting the user experience
            Console.WriteLine($"Error persisting conversation to database: {ex.Message}");
        }
    }

    private async Task PersistMessagesToDatabase(
        Guid conversationId,
        string userMessage,
        string assistantResponse,
        SenderInfo sender
    )
    {
        try
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<RepositoryContext>();

            // Persist user message to database
            var userMessageModel = new MessageModel
            {
                Id = Guid.NewGuid(),
                ConversationId = conversationId,
                SenderType = SenderType.Customer,
                SenderId = Guid.Parse(sender.SenderId),
                SenderName = sender.SenderName,
                SenderAvatarUrl = sender.SenderAvatarUrl,
                Content = userMessage,
                Timestamp = DateTime.UtcNow,
            };
            context.Messages.Add(userMessageModel);

            // Persist assistant message to database
            var assistantMessage = new MessageModel
            {
                Id = Guid.NewGuid(),
                ConversationId = conversationId,
                SenderType = SenderType.AiAgent,
                SenderId = null, // AI agent doesn't have a specific ID
                SenderName = "AI Assistant",
                SenderAvatarUrl = null,
                Content = assistantResponse,
                Timestamp = DateTime.UtcNow,
            };
            context.Messages.Add(assistantMessage);

            // Save all changes to database
            await context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            // Log the error but don't throw to avoid affecting the user experience
            // In a production environment, you'd want to use a proper logging framework
            Console.WriteLine($"Error persisting messages to database: {ex.Message}");
        }
    }

    public void Dispose()
    {
        _pruneTimer?.Dispose();
        // Memory cache cleanup is handled automatically
    }

    private sealed class ChatSession : IDisposable
    {
        public Guid OrganizationId { get; set; }
        public SenderInfo Sender { get; set; }
        public ChatHistory History { get; set; }
        public DateTimeOffset LastAccessUtc { get; set; }
        public Guid ConversationId { get; set; }
        public SemaphoreSlim Gate { get; }

        public ChatSession(
            Guid organizationId,
            SenderInfo sender,
            ChatHistory history,
            Guid conversationId
        )
        {
            OrganizationId = organizationId;
            Sender = sender;
            History = history;
            ConversationId = conversationId;
            LastAccessUtc = DateTimeOffset.UtcNow;
            Gate = new SemaphoreSlim(1, 1);
        }

        public void Dispose()
        {
            Gate.Dispose();
        }
    }
}

public record StartChatRequest(Guid OrganizationId, SenderInfo Sender);

public record ContinueChatRequest(Guid ConversationId, string Message);

public record SenderInfo(string SenderId, string SenderName, string SenderAvatarUrl);
