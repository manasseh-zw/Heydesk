using Heydesk.Server.Data;
using Heydesk.Server.Utils;
using Microsoft.EntityFrameworkCore;

namespace Heydesk.Server.Domains.Conversation;

public interface IConversationsService
{
    Task<Result<GetConversationsResponse>> GetConversations(Guid customerId, Guid organizationId, int page, int pageSize);
    Task<Result<GetConversationWithMessagesResponse>> GetConversationWithMessages(Guid customerId, Guid organizationId, Guid conversationId);
}

public class ConversationsService : IConversationsService
{
    private readonly RepositoryContext _repository;
    private readonly ILogger<ConversationsService> _logger;

    public ConversationsService(RepositoryContext repository, ILogger<ConversationsService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Result<GetConversationsResponse>> GetConversations(Guid customerId, Guid organizationId, int page, int pageSize)
    {
        try
        {
            var query = _repository.Conversations
                .Where(c => c.CustomerId == customerId && c.OrganizationId == organizationId)
                .OrderByDescending(c => c.StartedAt);

            var totalCount = await query.CountAsync();

            var conversations = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new ConversationSummary(
                    c.Id,
                    c.Title,
                    c.StartedAt,
                    c.Messages.OrderByDescending(m => m.Timestamp).FirstOrDefault()!.Timestamp,
                    c.Messages
                        .OrderBy(m => m.Timestamp)
                        .Take(2)
                        .Select(m => new MessageResponse(
                            m.Id,
                            m.Timestamp,
                            m.SenderType,
                            m.SenderId,
                            m.SenderName,
                            m.SenderAvatarUrl,
                            m.Content
                        ))
                        .ToList(),
                    c.IsTicketTied,
                    c.TicketId
                ))
                .ToListAsync();

            return Result.Ok(new GetConversationsResponse(
                conversations,
                totalCount,
                page,
                pageSize
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving conversations for customer {CustomerId} in organization {OrganizationId}", customerId, organizationId);
            return Result.Fail("Failed to retrieve conversations");
        }
    }

    public async Task<Result<GetConversationWithMessagesResponse>> GetConversationWithMessages(Guid customerId, Guid organizationId, Guid conversationId)
    {
        try
        {
            var conversation = await _repository.Conversations
                .Where(c => c.Id == conversationId && c.CustomerId == customerId && c.OrganizationId == organizationId)
                .FirstOrDefaultAsync();

            if (conversation == null)
                return Result.Fail("Conversation not found");

            var messages = await _repository.Messages
                .Where(m => m.ConversationId == conversationId)
                .OrderBy(m => m.Timestamp)
                .Select(m => new MessageResponse(
                    m.Id,
                    m.Timestamp,
                    m.SenderType,
                    m.SenderId,
                    m.SenderName,
                    m.SenderAvatarUrl,
                    m.Content
                ))
                .ToListAsync();

            return Result.Ok(new GetConversationWithMessagesResponse(
                conversation.Id,
                conversation.Title,
                conversation.StartedAt,
                messages,
                conversation.IsTicketTied,
                conversation.TicketId
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving conversation {ConversationId} for customer {CustomerId} in organization {OrganizationId}", conversationId, customerId, organizationId);
            return Result.Fail("Failed to retrieve conversation");
        }
    }
}
