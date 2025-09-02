using Heydesk.Server.Domains.User;

namespace Heydesk.Server.Domains.Organization;

public record CreateOrgRequest(string Name, string Slug, string Url);

public record GetOrgResponse(Guid Id, string Name, string Slug, string Url, string IconUrl);

public record GetMembersResponse(List<GetUserResponse> Members, int TotalCount);

public record GetMembersRequest(int Page = 1, int PageSize = 10);
