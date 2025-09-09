using System.Text.Json;
using Heydesk.Server.Domains.Document.Workflows;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Heydesk.Server.Domains.Document;

[ApiController]
[Route("api/organizations/{organizationId:guid}/documents")]
[Authorize]
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
        [FromRoute] Guid organizationId,
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
        [FromRoute] Guid organizationId,
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
        [FromRoute] Guid organizationId,
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
        [FromRoute] Guid organizationId,
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


}
