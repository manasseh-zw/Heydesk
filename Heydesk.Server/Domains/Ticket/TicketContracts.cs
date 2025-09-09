using Heydesk.Server.Data.Models;

namespace Heydesk.Server.Domains.Ticket;

public enum AssignedEntityType
{
    HumanAgent,
    AiAgent,
}

public record AssignedToInfo(
    Guid Id,
    string Name,
    string? AvatarUrl,
    AssignedEntityType Type
);

public record GetTicketsRequest(int Page = 1, int PageSize = 10);

public record GetTicketResponse(
    Guid Id,
    string Subject,
    string? Context,
    TicketStatus Status,
    DateTime OpenedAt,
    DateTime? ClosedAt,
    AssignedToInfo? AssignedTo
);

public record GetTicketsResponse(List<GetTicketResponse> Tickets, int TotalCount);

public record CreateTicketRequest(
    Guid CustomerId,
    string Subject,
    string? Context
);


