using Heydesk.Server.Data;
using Heydesk.Server.Data.Models;
using Heydesk.Server.Utils;
using Microsoft.EntityFrameworkCore;

namespace Heydesk.Server.Domains.Ticket;

public interface ITicketService
{
    Task<Result<GetTicketsResponse>> GetTickets(Guid organizationId, GetTicketsRequest request);

    // Internal methods for AI agent usage (not exposed via controller)
    Task<Result<GetTicketResponse>> CreateTicket(Guid organizationId, CreateTicketRequest request);
    Task<Result<GetTicketResponse>> EscalateTicket(Guid organizationId, Guid ticketId);
    Task<Result<GetTicketResponse>> CloseTicket(Guid organizationId, Guid ticketId);
}

public class TicketService : ITicketService
{
    private readonly RepositoryContext _repository;
    private readonly ILogger<TicketService> _logger;

    public TicketService(RepositoryContext repository, ILogger<TicketService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Result<GetTicketsResponse>> GetTickets(Guid organizationId, GetTicketsRequest request)
    {
        try
        {
            var query = _repository.Tickets
                .Where(t => t.OrganizationId == organizationId)
                .OrderByDescending(t => t.OpenedAt);

            var totalCount = await query.CountAsync();

            var tickets = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(t => new GetTicketResponse(
                    t.Id,
                    t.Subject,
                    t.Context,
                    t.Status,
                    t.OpenedAt,
                    t.ClosedAt,
                    null // AssignedTo computed below
                ))
                .ToListAsync();

            // Post-process to compute AssignedTo info for the current page only
            var pageTicketIds = tickets.Select(t => t.Id).ToList();
            var ticketMap = await _repository.Tickets
                .Where(t => pageTicketIds.Contains(t.Id))
                .Select(t => new { t.Id, t.Status, t.AssignedTo })
                .ToDictionaryAsync(t => t.Id, t => t);

            var assignedIds = ticketMap.Values
                .Where(v => v.AssignedTo != Guid.Empty)
                .Select(v => v.AssignedTo)
                .Distinct()
                .ToList();

            var users = await _repository.Users
                .Where(u => assignedIds.Contains(u.Id))
                .Select(u => new { u.Id, Name = u.Username, u.AvatarUrl })
                .ToDictionaryAsync(u => u.Id, u => u);

            var agents = await _repository.Agents
                .Where(a => assignedIds.Contains(a.Id))
                .Select(a => new { a.Id, a.Name })
                .ToDictionaryAsync(a => a.Id, a => a);

            var resultList = tickets.Select(tr =>
            {
                if (!ticketMap.TryGetValue(tr.Id, out var core))
                    return tr;

                AssignedToInfo? assigned = null;
                if (core.AssignedTo != Guid.Empty)
                {
                    if (users.TryGetValue(core.AssignedTo, out var user))
                    {
                        assigned = new AssignedToInfo(user.Id, user.Name, user.AvatarUrl, AssignedEntityType.HumanAgent);
                    }
                    else if (agents.TryGetValue(core.AssignedTo, out var agent))
                    {
                        assigned = new AssignedToInfo(agent.Id, agent.Name, null, AssignedEntityType.AiAgent);
                    }
                }

                return tr with { AssignedTo = assigned };
            }).ToList();

            return Result.Ok(new GetTicketsResponse(resultList, totalCount));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tickets for organization {OrganizationId}", organizationId);
            return Result.Fail("Failed to retrieve tickets");
        }
    }

    public async Task<Result<GetTicketResponse>> CreateTicket(Guid organizationId, CreateTicketRequest request)
    {
        try
        {
            var orgExists = await _repository.Organizations.AnyAsync(o => o.Id == organizationId);
            if (!orgExists)
                return Result.Fail("Organization not found");

            var customerExists = await _repository.Customers.AnyAsync(c => c.Id == request.CustomerId);
            if (!customerExists)
                return Result.Fail("Customer not found");

            // For now, assign to first AI agent in organization if exists
            var aiAgentId = await _repository.Agents
                .Where(a => a.OrganizationId == organizationId)
                .OrderBy(a => a.CreatedAt)
                .Select(a => a.Id)
                .FirstOrDefaultAsync();

            var ticket = new TicketModel
            {
                Id = Guid.CreateVersion7(),
                Subject = request.Subject,
                Context = request.Context,
                Status = TicketStatus.Open,
                OpenedAt = DateTime.UtcNow,
                OrganizationId = organizationId,
                CustomerId = request.CustomerId,
                AssignedTo = aiAgentId,
            };

            _repository.Tickets.Add(ticket);
            await _repository.SaveChangesAsync();

            AssignedToInfo? assigned = null;
            if (ticket.AssignedTo != Guid.Empty)
            {
                var agent = await _repository.Agents.Where(a => a.Id == ticket.AssignedTo)
                    .Select(a => new { a.Id, a.Name }).FirstOrDefaultAsync();
                if (agent != null)
                    assigned = new AssignedToInfo(agent.Id, agent.Name, null, AssignedEntityType.AiAgent);
            }

            var response = new GetTicketResponse(
                ticket.Id,
                ticket.Subject,
                ticket.Context,
                ticket.Status,
                ticket.OpenedAt,
                ticket.ClosedAt,
                assigned
            );

            return Result.Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating ticket for organization {OrganizationId}", organizationId);
            return Result.Fail("Failed to create ticket");
        }
    }

    public async Task<Result<GetTicketResponse>> EscalateTicket(Guid organizationId, Guid ticketId)
    {
        try
        {
            var ticket = await _repository.Tickets.FirstOrDefaultAsync(t => t.Id == ticketId && t.OrganizationId == organizationId);
            if (ticket == null)
                return Result.Fail("Ticket not found");

            // Assign to the first user in the organization
            var user = await _repository.Users
                .Where(u => u.OrganizationId == organizationId)
                .OrderBy(u => u.CreatedAt)
                .FirstOrDefaultAsync();

            if (user == null)
                return Result.Fail("No users available to assign in organization");

            ticket.Status = TicketStatus.Escalated;
            ticket.AssignedTo = user.Id;

            await _repository.SaveChangesAsync();

            var assigned = new AssignedToInfo(user.Id, user.Username, user.AvatarUrl, AssignedEntityType.HumanAgent);

            var response = new GetTicketResponse(
                ticket.Id,
                ticket.Subject,
                ticket.Context,
                ticket.Status,
                ticket.OpenedAt,
                ticket.ClosedAt,
                assigned
            );

            return Result.Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error escalating ticket {TicketId} for org {OrganizationId}", ticketId, organizationId);
            return Result.Fail("Failed to escalate ticket");
        }
    }

    public async Task<Result<GetTicketResponse>> CloseTicket(Guid organizationId, Guid ticketId)
    {
        try
        {
            var ticket = await _repository.Tickets.FirstOrDefaultAsync(t => t.Id == ticketId && t.OrganizationId == organizationId);
            if (ticket == null)
                return Result.Fail("Ticket not found");

            ticket.Status = TicketStatus.Closed;
            ticket.ClosedAt = DateTime.UtcNow;

            await _repository.SaveChangesAsync();

            AssignedToInfo? assigned = null;
            if (ticket.AssignedTo != Guid.Empty)
            {
                if (ticket.Status == TicketStatus.Escalated)
                {
                    var u = await _repository.Users.Where(u => u.Id == ticket.AssignedTo)
                        .Select(u => new { u.Id, Name = u.Username, u.AvatarUrl }).FirstOrDefaultAsync();
                    if (u != null)
                        assigned = new AssignedToInfo(u.Id, u.Name, u.AvatarUrl, AssignedEntityType.HumanAgent);
                }
                else
                {
                    var a = await _repository.Agents.Where(a => a.Id == ticket.AssignedTo)
                        .Select(a => new { a.Id, a.Name }).FirstOrDefaultAsync();
                    if (a != null)
                        assigned = new AssignedToInfo(a.Id, a.Name, null, AssignedEntityType.AiAgent);
                }
            }

            var response = new GetTicketResponse(
                ticket.Id,
                ticket.Subject,
                ticket.Context,
                ticket.Status,
                ticket.OpenedAt,
                ticket.ClosedAt,
                assigned
            );

            return Result.Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error closing ticket {TicketId} for org {OrganizationId}", ticketId, organizationId);
            return Result.Fail("Failed to close ticket");
        }
    }
}


