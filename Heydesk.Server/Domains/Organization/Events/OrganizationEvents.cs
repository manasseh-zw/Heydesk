namespace Heydesk.Server.Domains.Organization.Events;

public record OrganizationCreated(Guid OrganizationId, string? Url);

public interface IOrganizationEvents
{
    Task OrganizationCreated(OrganizationCreated evt, CancellationToken ct = default);
}


