using Heydesk.Server.Data;
using Heydesk.Server.Data.Models;
using Heydesk.Server.Domains.Document.Workflows;
using Heydesk.Server.Utils;
using Microsoft.EntityFrameworkCore;

namespace Heydesk.Server.Domains.Document;

public interface IDocumentService
{
    Task<Result<GetDocumentsResponse>> GetDocuments(
        Guid OrganizationId,
        GetDocumentsRequest request
    );
    Task<Result<GetDocumentResponse>> IngestDocument(
        Guid OrganizationId,
        IngestDocumentRequest request
    );
    Task<Result<GetDocumentResponse>> IngestUrl(Guid OrganizationId, IngestUrlRequest request);
    Task<Result<GetDocumentResponse>> IngestText(Guid OrganizationId, IngestTextRequest request);
}

public class DocumentService : IDocumentService
{
    private readonly RepositoryContext _repository;
    private readonly ILogger<DocumentService> _logger;
    private readonly IDocumentsEvents _docEvents;

    public DocumentService(
        RepositoryContext repository,
        ILogger<DocumentService> logger,
        IDocumentsEvents docEvents
    )
    {
        _repository = repository;
        _logger = logger;
        _docEvents = docEvents;
    }

    public async Task<Result<GetDocumentsResponse>> GetDocuments(
        Guid OrganizationId,
        GetDocumentsRequest request
    )
    {
        try
        {
            var query = _repository
                .Documents.Where(d => d.OrganizationId == OrganizationId)
                .OrderByDescending(d => d.Id);

            var totalCount = await query.CountAsync();

            var documents = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(d => new GetDocumentResponse(
                    d.Id,
                    d.Name,
                    d.Type,
                    d.SourceUrl ?? string.Empty,
                    d.Status,
                    d.Content
                ))
                .ToListAsync();

            var response = new GetDocumentsResponse(documents, totalCount);
            return Result.Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error retrieving documents for organization {OrganizationId}",
                OrganizationId
            );
            return Result.Fail("Failed to retrieve documents");
        }
    }

    public async Task<Result<GetDocumentResponse>> IngestDocument(
        Guid OrganizationId,
        IngestDocumentRequest request
    )
    {
        try
        {
            // Validate PDF content (MIME, extension, magic header)
            if (
                !string.Equals(
                    request.File.ContentType,
                    "application/pdf",
                    StringComparison.OrdinalIgnoreCase
                )
            )
            {
                return Result.Fail("Only PDF files are supported");
            }
            if (
                !Path.GetExtension(request.File.FileName)
                    .Equals(".pdf", StringComparison.OrdinalIgnoreCase)
            )
            {
                return Result.Fail("Only .pdf files are supported");
            }

            byte[] bytes;
            await using (var ms = new MemoryStream())
            {
                await request.File.CopyToAsync(ms);
                bytes = ms.ToArray();
            }

            // Validate PDF magic header %PDF-
            if (
                bytes.Length < 5
                || bytes[0] != 0x25
                || bytes[1] != 0x50
                || bytes[2] != 0x44
                || bytes[3] != 0x46
                || bytes[4] != 0x2D
            )
            {
                return Result.Fail("Invalid PDF file");
            }

            return await _docEvents.EnqueueDocument(OrganizationId, request.Name, bytes);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error queuing document ingestion for org {OrganizationId}",
                OrganizationId
            );
            return Result.Fail("Failed to queue document ingestion");
        }
    }

    public async Task<Result<GetDocumentResponse>> IngestUrl(
        Guid OrganizationId,
        IngestUrlRequest request
    )
    {
        try
        {
            return await _docEvents.EnqueueUrl(OrganizationId, request.Url);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error queuing URL ingestion for org {OrganizationId}",
                OrganizationId
            );
            return Result.Fail("Failed to queue URL ingestion");
        }
    }

    public async Task<Result<GetDocumentResponse>> IngestText(
        Guid OrganizationId,
        IngestTextRequest request
    )
    {
        try
        {
            return await _docEvents.EnqueueText(OrganizationId, request.Name, request.Content);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error queuing text ingestion for org {OrganizationId}",
                OrganizationId
            );
            return Result.Fail("Failed to queue text ingestion");
        }
    }
}
