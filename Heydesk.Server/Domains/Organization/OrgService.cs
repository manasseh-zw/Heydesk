using Heydesk.Server.Data;
using Heydesk.Server.Data.Models;
using Heydesk.Server.Domains.User;
using Heydesk.Server.Utils;
using Microsoft.EntityFrameworkCore;

namespace Heydesk.Server.Domains.Organization;

public interface IOrgService
{
    public Task<Result<GetOrgResponse>> CreateOrganization(Guid UserId, CreateOrgRequest request);
    public Task<Result<GetMembersResponse>> GetMembers(
        Guid OrganizationId,
        GetMembersRequest request
    );
}

public class OrgService : IOrgService
{
    private readonly RepositoryContext _repository;

    public OrgService(RepositoryContext repository)
    {
        _repository = repository;
    }

    public async Task<Result<GetOrgResponse>> CreateOrganization(Guid userId, CreateOrgRequest request)
    {
        var validationResult = new CreateOrgValidator().Validate(request);
        if (!validationResult.IsValid)
            return Result.Fail([.. validationResult.Errors.Select(e => e.ErrorMessage)]);

        var slugExists = await _repository.Organizations
            .AnyAsync(o => o.Slug.Equals(request.Slug, StringComparison.CurrentCultureIgnoreCase));

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
            Members = [user]
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

        return Result.Ok(response);
    }

    public async Task<Result<GetMembersResponse>> GetMembers(
        Guid organizationId,
        GetMembersRequest request)
    {
        var organization = await _repository.Organizations
            .Include(o => o.Members)
            .FirstOrDefaultAsync(o => o.Id == organizationId);

        if (organization == null)
            return Result.Fail("Organization not found");

        var totalCount = organization.Members.Count;
        var members = organization.Members
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(m => new GetUserResponse(m.Id, m.Username, m.Email, m.AvatarUrl ?? "", m.Onboarding))
            .ToList();

        var response = new GetMembersResponse(members, totalCount);
        return Result.Ok(response);
    }
}
