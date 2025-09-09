using Heydesk.Server.Domains.Document;

namespace Heydesk.Server.Domains.Organization.Events;

public class OrganizationEventsHandler : IOrganizationEvents
{
    private readonly IDocumentService _documentService;
    private readonly ILogger<OrganizationEventsHandler> _logger;

    public OrganizationEventsHandler(
        IDocumentService documentService,
        ILogger<OrganizationEventsHandler> logger
    )
    {
        _documentService = documentService;
        _logger = logger;
    }

    public async Task OrganizationCreated(OrganizationCreated evt, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(evt.Url))
            return;

        try
        {
            _logger.LogInformation("Org {OrgId} created; triggering URL ingest {Url}", evt.OrganizationId, evt.Url);
            var result = await _documentService.IngestUrl(evt.OrganizationId, new IngestUrlRequest(evt.Url));
            if (!result.Success)
            {
                _logger.LogWarning("IngestUrl failed for org {OrgId}: {Errors}", evt.OrganizationId, string.Join(", ", result.Errors));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling OrganizationCreated for {OrgId}", evt.OrganizationId);
        }
    }
}


