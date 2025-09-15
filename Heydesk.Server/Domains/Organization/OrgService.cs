using Heydesk.Server.Data;
using Heydesk.Server.Data.Models;
using Heydesk.Server.Domains.User;
using Heydesk.Server.Domains.Document.Workflows;
using Heydesk.Server.Domains.Agent;
using Heydesk.Server.Utils;
using Microsoft.EntityFrameworkCore;

namespace Heydesk.Server.Domains.Organization;

public interface IOrgService
{
    Task<Result<GetOrgResponse>> CreateOrganization(Guid UserId, CreateOrgRequest request);
    Task<Result<GetMembersResponse>> GetMembers(Guid OrganizationId, GetMembersRequest request);
    Task<Result<List<GetOrgResponse>>> SearchOrganizations(string query, int limit = 10);
}

public class OrgService : IOrgService
{
    private readonly RepositoryContext _repository;
    private readonly IDocumentsEvents _documentsEvents;
    private readonly IAgentService _agentService;

    public OrgService(RepositoryContext repository, IDocumentsEvents documentsEvents, IAgentService agentService)
    {
        _repository = repository;
        _documentsEvents = documentsEvents;
        _agentService = agentService;
    }

    public async Task<Result<GetOrgResponse>> CreateOrganization(
        Guid userId,
        CreateOrgRequest request
    )
    {
        var validationResult = new CreateOrgValidator().Validate(request);
        if (!validationResult.IsValid)
            return Result.Fail([.. validationResult.Errors.Select(e => e.ErrorMessage)]);

        var slugExists = await _repository.Organizations.AnyAsync(o =>
            o.Slug.ToLower() == request.Slug.ToLower()
        );

        if (slugExists)
            return Result.Fail("Organization slug already exists");

        var user = await _repository.Users.FindAsync(userId);
        if (user == null)
            return Result.Fail("User not found");

        var organization = new OrganizationModel
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Slug = request.Slug.ToLower(),
            Url = request.Url,
            IconUrl = "",
            Members = [user],
        };

        user.OrganizationId = organization.Id;
        user.Onboarding = false;

        _repository.Organizations.Add(organization);

        await _repository.SaveChangesAsync();

        var response = new GetOrgResponse(
            organization.Id,
            organization.Name,
            organization.Slug,
            organization.Url,
            organization.IconUrl
        );

        // Create default Maya agent
        var mayaResult = await _agentService.CreateDefaultAgent(organization.Id, organization.Name);
        if (!mayaResult.Success)
        {
            // Log the error but don't fail the organization creation
            Console.WriteLine($"Warning: Failed to create default Maya agent: {string.Join(", ", mayaResult.Errors)}");
        }

        // Enqueue initial URL ingestion if present
        if (!string.IsNullOrWhiteSpace(organization.Url))
        {
            await _documentsEvents.EnqueueUrl(organization.Id, organization.Url);
        }

        return Result.Ok(response);
    }

    public async Task<Result<GetMembersResponse>> GetMembers(
        Guid organizationId,
        GetMembersRequest request
    )
    {
        var organization = await _repository
            .Organizations.Include(o => o.Members)
            .FirstOrDefaultAsync(o => o.Id == organizationId);

        if (organization == null)
            return Result.Fail("Organization not found");

        var totalCount = organization.Members.Count;
        var members = organization
            .Members.Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(m => new GetUserResponse(
                m.Id,
                m.Username,
                m.Email,
                m.AvatarUrl ?? "",
                m.Onboarding
            ))
            .ToList();

        var response = new GetMembersResponse(members, totalCount);
        return Result.Ok(response);
    }

    public async Task<Result<List<GetOrgResponse>>> SearchOrganizations(string query, int limit = 10)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return Result.Ok(new List<GetOrgResponse>());
        }

        query = query.Trim();
        var qLower = query.ToLower();

        // Simple fuzzy-ish search: prioritize startswith, then contains
        var matches = await _repository.Organizations
            .Select(o => new
            {
                Org = o,
                NameLower = o.Name.ToLower(),
                SlugLower = o.Slug.ToLower()
            })
            .Select(x => new
            {
                x.Org,
                Score =
                    (x.SlugLower.StartsWith(qLower) ? 3 : 0) +
                    (x.NameLower.StartsWith(qLower) ? 2 : 0) +
                    (x.SlugLower.Contains(qLower) ? 1 : 0) +
                    (x.NameLower.Contains(qLower) ? 1 : 0)
            })
            .Where(x => x.Score > 0)
            .OrderByDescending(x => x.Score)
            .ThenBy(x => x.Org.Name)
            .Take(limit)
            .Select(x => new GetOrgResponse(
                x.Org.Id,
                x.Org.Name,
                x.Org.Slug,
                x.Org.Url,
                x.Org.IconUrl
            ))
            .ToListAsync();

        return Result.Ok(matches);
    }
}
