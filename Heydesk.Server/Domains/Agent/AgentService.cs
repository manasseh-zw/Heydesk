using Heydesk.Server.Data;
using Heydesk.Server.Data.Models;
using Heydesk.Server.Utils;
using Microsoft.EntityFrameworkCore;

namespace Heydesk.Server.Domains.Agent;

public interface IAgentService
{
    Task<Result<GetAgentResponse>> CreateAgent(Guid organizationId, CreateAgentRequest request);
    Task<Result<List<GetAgentResponse>>> GetAgents(Guid organizationId, int page = 1, int pageSize = 10);
}

public class AgentService : IAgentService
{
    private readonly RepositoryContext _repository;

    public AgentService(RepositoryContext repository)
    {
        _repository = repository;
    }

    public async Task<Result<GetAgentResponse>> CreateAgent(Guid organizationId, CreateAgentRequest request)
    {
        var validation = new CreateAgentValidator().Validate(request);
        if (!validation.IsValid)
            return Result.Fail([.. validation.Errors.Select(e => e.ErrorMessage)]);

        var orgExists = await _repository.Organizations.AnyAsync(o => o.Id == organizationId);
        if (!orgExists)
            return Result.Fail("Organization not found");

        var agent = new AgentModel
        {
            Id = Guid.CreateVersion7(),
            OrganizationId = organizationId,
            Name = request.Name,
            Description = request.Description,
            SystemPrompt = request.SystemPrompt,
            Type = request.Type,
        };

        _repository.Agents.Add(agent);
        await _repository.SaveChangesAsync();

        var response = new GetAgentResponse(
            agent.Id,
            agent.OrganizationId,
            agent.Name,
            agent.Description,
            agent.SystemPrompt,
            agent.Type,
            agent.CreatedAt
        );
        return Result.Ok(response);
    }

    public async Task<Result<List<GetAgentResponse>>> GetAgents(Guid organizationId, int page = 1, int pageSize = 10)
    {
        var orgExists = await _repository.Organizations.AnyAsync(o => o.Id == organizationId);
        if (!orgExists)
            return Result.Fail("Organization not found");

        var agents = await _repository.Agents
            .Where(a => a.OrganizationId == organizationId)
            .OrderBy(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new GetAgentResponse(
                a.Id,
                a.OrganizationId,
                a.Name,
                a.Description,
                a.SystemPrompt,
                a.Type,
                a.CreatedAt
            ))
            .ToListAsync();

        return Result.Ok(agents);
    }
}


