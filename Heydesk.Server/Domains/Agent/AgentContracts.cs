using Heydesk.Server.Data.Models;

namespace Heydesk.Server.Domains.Agent;

public record CreateAgentRequest(
    string Name,
    string Description,
    string SystemPrompt,
    AgentType Type
);

public record GetAgentResponse(
    Guid Id,
    Guid OrganizationId,
    string Name,
    string Description,
    string SystemPrompt,
    AgentType Type,
    DateTime CreatedAt
);


