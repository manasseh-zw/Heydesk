using Microsoft.AspNetCore.Mvc;

namespace Heydesk.Server.Domains.Document;

[ApiController]
[Route("api/[controller]")]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;
    private readonly ILogger<DocumentsController> _logger;

    public DocumentsController(
        IDocumentService documentService,
        ILogger<DocumentsController> logger
    )
    {
        _documentService = documentService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetDocuments(
        [FromHeader(Name = "X-Organization-Id")] Guid organizationId,
        [FromQuery] GetDocumentsRequest request
    )
    {
        var result = await _documentService.GetDocuments(organizationId, request);

        if (!result.Success)
        {
            return BadRequest(result.Errors);
        }

        return Ok(result.Data);
    }

    [HttpPost("ingest/url")]
    public async Task<IActionResult> IngestUrl(
        [FromHeader(Name = "X-Organization-Id")] Guid organizationId,
        [FromBody] IngestUrlRequest request,
        [FromHeader(Name = "X-SignalR-ConnectionId")] string? connectionId = null
    )
    {
        var result = await _documentService.IngestUrl(organizationId, request, connectionId);

        if (!result.Success)
        {
            return BadRequest(result.Errors);
        }

        return Ok(result.Data);
    }

    [HttpPost("ingest/document")]
    public async Task<IActionResult> IngestDocument(
        [FromHeader(Name = "X-Organization-Id")] Guid organizationId,
        [FromForm] IngestDocumentRequest request,
        [FromHeader(Name = "X-SignalR-ConnectionId")] string? connectionId = null
    )
    {
        var result = await _documentService.IngestDocument(organizationId, request, connectionId);

        if (!result.Success)
        {
            return BadRequest(result.Errors);
        }

        return Ok(result.Data);
    }

    [HttpPost("ingest/text")]
    public async Task<IActionResult> IngestText(
        [FromHeader(Name = "X-Organization-Id")] Guid organizationId,
        [FromBody] IngestTextRequest request,
        [FromHeader(Name = "X-SignalR-ConnectionId")] string? connectionId = null
    )
    {
        var result = await _documentService.IngestText(organizationId, request, connectionId);

        if (!result.Success)
        {
            return BadRequest(result.Errors);
        }

        return Ok(result.Data);
    }
}
