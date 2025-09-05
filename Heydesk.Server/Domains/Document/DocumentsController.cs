using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Runtime.CompilerServices;
using Heydesk.Server.Domains.Document.Workflows;

namespace Heydesk.Server.Domains.Document;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;
    private readonly ILogger<DocumentsController> _logger;
    private readonly IIngestionSseBroker _sseBroker;

    public DocumentsController(
        IDocumentService documentService,
        ILogger<DocumentsController> logger,
        IIngestionSseBroker sseBroker
    )
    {
        _documentService = documentService;
        _logger = logger;
        _sseBroker = sseBroker;
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
        [FromBody] IngestUrlRequest request
    )
    {
        var result = await _documentService.IngestUrl(organizationId, request);

        if (!result.Success)
        {
            return BadRequest(result.Errors);
        }

        return Ok(result.Data);
    }

    [HttpPost("ingest/document")]
    public async Task<IActionResult> IngestDocument(
        [FromHeader(Name = "X-Organization-Id")] Guid organizationId,
        [FromForm] IngestDocumentRequest request
    )
    {
        var result = await _documentService.IngestDocument(organizationId, request);

        if (!result.Success)
        {
            return BadRequest(result.Errors);
        }

        return Ok(result.Data);
    }

    [HttpPost("ingest/text")]
    public async Task<IActionResult> IngestText(
        [FromHeader(Name = "X-Organization-Id")] Guid organizationId,
        [FromBody] IngestTextRequest request
    )
    {
        var result = await _documentService.IngestText(organizationId, request);

        if (!result.Success)
        {
            return BadRequest(result.Errors);
        }

        return Ok(result.Data);
    }

    [HttpGet("ingest/stream")]
    public async Task StreamIngestion(
        [FromHeader(Name = "X-Organization-Id")] Guid organizationId,
        CancellationToken ct
    )
    {
        Response.Headers.Append("Content-Type", "text/event-stream");
        Response.Headers.Append("Cache-Control", "no-cache");
        Response.Headers.Append("X-Accel-Buffering", "no");
        Response.StatusCode = StatusCodes.Status200OK;
        await Response.StartAsync(ct);
        await foreach (var evt in _sseBroker.Subscribe(organizationId, ct))
        {
            await Response.WriteAsync($"event: ingest\n", ct);
            await Response.WriteAsync($"data: {{ \"documentId\": \"{evt.DocumentId}\", \"status\": \"{evt.Status}\" }}\n\n", ct);
            await Response.Body.FlushAsync(ct);
        }
    }
}
