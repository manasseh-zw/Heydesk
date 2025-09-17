using System.Text;
using Heydesk.Server.Config;
using Heydesk.Server.Data;
using Heydesk.Server.Data.Models;
using Heydesk.Server.Domains.Agent.Plugins;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Agents;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using Microsoft.EntityFrameworkCore;

namespace Heydesk.Server.Domains.Agent.Chat;

public class ChatAgent
{
    private readonly ChatCompletionAgent _agent;
    private readonly IMemoryCache _cache;
    private readonly IHubContext<ChatHub, IChatClient> _hubContext;
    private readonly RepositoryContext _context;
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly IVectorStore _vectorStore;

    private readonly IChatCompletionService _chatCompletionService;

    private const int MaxSessions = 1000;
    private const int MaxHistoryMessagesPerSession = 100;
    private static readonly TimeSpan SessionIdleTtl = TimeSpan.FromMinutes(30);

    public ChatAgent(
        IHubContext<ChatHub, IChatClient> hubContext,
        RepositoryContext context,
        IServiceScopeFactory serviceScopeFactory,
        IMemoryCache cache,
        IVectorStore vectorStore
    )
    {
        _hubContext = hubContext;
        _context = context;
        _serviceScopeFactory = serviceScopeFactory;
        _cache = cache;
        _vectorStore = vectorStore;

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
            Name = "Maya",
            Instructions =
                "You are Maya, the AI customer support assistant. You help customers with their questions, issues, and provide excellent support.\n\n" +
                "Your capabilities include:\n" +
                "- Answering questions about the organization’s products and services\n" +
                "- Helping with account-related issues\n" +
                "- Providing troubleshooting assistance\n" +
                "- Escalating complex issues to human agents when needed\n" +
                "- Being friendly, professional, and helpful at all times\n\n" +
                "Guidelines:\n" +
                "- Always be polite and empathetic\n" +
                "- Ask clarifying questions when needed\n" +
                "- Provide clear, step-by-step instructions\n" +
                "- If you cannot resolve an issue, explain that you will escalate it to a human agent\n" +
                "- Keep responses concise but comprehensive\n" +
                "- Use the customer’s name when available\n\n" +
                "Tools & Behavior:\n" +
                "- You can search the organization’s knowledge base to find relevant information\n" +
                "- You can create support tickets with detailed context when issues need tracking\n" +
                "- Always attempt to resolve using available knowledge before escalating\n\n" +
                "When you create a ticket, write the Context as a short (~60 words) handoff note to a human agent. Use this style: 'CustomerName and I discussed X. They want Y. I suggested Z. Next: do A/B/C.' Keep it concise, actionable, and friendly. Avoid fluff, focus on what was tried and what is needed next.\n\n" +
                "Remember: You represent the organization and should always maintain a positive, helpful attitude that reflects well on the company.",
            Kernel = kernel,
        };

        _chatCompletionService = kernel.GetRequiredService<IChatCompletionService>();

    }

    public async Task<Guid> StartChat(StartChatRequest request)
    {
        var conversationId = Guid.NewGuid();
        // Resolve organization metadata (cached)
        var orgMetaCacheKey = $"org_meta_{request.OrganizationId}";
        var orgMeta = await _cache.GetOrCreateAsync(orgMetaCacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15);
            var meta = await _context.Organizations
                .Where(o => o.Id == request.OrganizationId)
                .Select(o => new { o.Name, o.Slug })
                .FirstOrDefaultAsync();
            return meta ?? new { Name = "Your Organization", Slug = "org" };
        });

        var session = new ChatSession(request.OrganizationId, request.Sender, [], conversationId)
        {
            OrganizationName = orgMeta?.Name ?? "Your Organization",
            OrganizationSlug = orgMeta?.Slug ?? "org",
        };

        // Seed system prompt customized per organization
        var mayaPrompt = BuildMayaSystemPrompt(session.OrganizationName);
        session.History.Add(new ChatMessageContent(AuthorRole.System, mayaPrompt));

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

            // Create a temporary kernel with plugins for this session
            var sessionKernel = Kernel
                .CreateBuilder()
                .AddAzureOpenAIChatCompletion(
                    apiKey: AppConfig.AzureAI.ApiKey,
                    endpoint: AppConfig.AzureAI.Endpoint,
                    deploymentName: "gpt-4.1"
                )
                .Build();

            // Create plugins with session context
            var knowledgeBasePlugin = new KnowledgeBasePlugins(
                _vectorStore,
                session.OrganizationId.ToString()
            );
            var ticketPlugin = new TicketPlugins(
                _context,
                session.ConversationId,
                session.OrganizationId
            );

            // Add plugins to the session kernel
            sessionKernel.Plugins.AddFromObject(knowledgeBasePlugin, "KnowledgeBase");
            sessionKernel.Plugins.AddFromObject(ticketPlugin, "Tickets");

            // Create execution settings with auto function calling
            var executionSettings = new OpenAIPromptExecutionSettings
            {
                FunctionChoiceBehavior = FunctionChoiceBehavior.Auto(),
            };

            // Get chat completion service and invoke with function calling
            var chatService = sessionKernel.GetRequiredService<IChatCompletionService>();

            // Use streaming with function calling enabled
            await foreach (
                var chunk in chatService.GetStreamingChatMessageContentsAsync(
                    promptHistory,
                    executionSettings,
                    sessionKernel
                )
            )
            {
                var token = chunk.Content ?? string.Empty;
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
            }, cancellationToken);

            // Update conversation title in background (non-blocking) - only for first message
            if (session.History.Count <= 3) // System prompt + user message + assistant response
            {
                _ = Task.Run(async () =>
                {
                    await UpdateConversationTitle(request.ConversationId, request.Message, session.OrganizationId);
                }, cancellationToken);
            }
        }
        finally
        {
            session.Gate.Release();
        }
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
                Title = "new_conversation", // Default title to indicate it needs updating
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

    private async Task UpdateConversationTitle(Guid conversationId, string initialQuery, Guid organizationId)
    {
        try
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<RepositoryContext>();

            var conversation = await context.Conversations.FindAsync(conversationId);
            if (conversation == null)
                throw new Exception("Conversation not found");

            // Only update title if it's still the default "new_conversation"
            if (conversation.Title != "new_conversation")
                return;

            var title = await _chatCompletionService.GetChatMessageContentAsync(
                $"Generate a short, descriptive title (max 50 characters) for this user initial query: \"{initialQuery}\"."
            );

            conversation.Title = title.Content?.Trim() ?? "Support Conversation";
            await context.SaveChangesAsync();

            // Notify all clients in the organization group that conversations have been updated
            await _hubContext.Clients.Group($"org-{organizationId}").ConversationsUpdated();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error updating conversation title: {ex.Message}");
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
                SenderName = "Maya",
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

    private sealed class ChatSession : IDisposable
    {
        public Guid OrganizationId { get; set; }
        public SenderInfo Sender { get; set; }
        public ChatHistory History { get; set; }
        public DateTimeOffset LastAccessUtc { get; set; }
        public Guid ConversationId { get; set; }
        public SemaphoreSlim Gate { get; }
        public string OrganizationName { get; set; } = string.Empty;
        public string OrganizationSlug { get; set; } = string.Empty;

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

    private static string BuildMayaSystemPrompt(string organizationName)
    {
        return "You are Maya, the AI customer support assistant for " + organizationName + ". You help customers with their questions, issues, and provide excellent support.\n\n" +
               "Your capabilities include:\n" +
               "- Answering questions about " + organizationName + "’s products and services\n" +
               "- Helping with account-related issues\n" +
               "- Providing troubleshooting assistance\n" +
               "- Escalating complex issues to human agents when needed\n" +
               "- Being friendly, professional, and helpful at all times\n\n" +
               "Guidelines:\n" +
               "- Always be polite and empathetic\n" +
               "- Ask clarifying questions when needed\n" +
               "- Provide clear, step-by-step instructions\n" +
               "- If you cannot resolve an issue, explain that you will escalate it to a human agent\n" +
               "- Keep responses concise but comprehensive\n" +
               "- Use the customer’s name when available\n\n" +
               "Tools & Behavior:\n" +
               "- You can search the organization’s knowledge base to find relevant information\n" +
               "- You can create support tickets with detailed context when issues need tracking\n" +
               "- Always attempt to resolve using available knowledge before escalating\n\n" +
               "Remember: You represent " + organizationName + " and should always maintain a positive, helpful attitude that reflects well on the company.";
    }
}

public record StartChatRequest(Guid OrganizationId, SenderInfo Sender);

public record ContinueChatRequest(Guid ConversationId, string Message);

public record SenderInfo(string SenderId, string SenderName, string SenderAvatarUrl);
