using Heydesk.Server.Data;
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

    public DocumentService(RepositoryContext repository, ILogger<DocumentService> logger)
    {
        _repository = repository;
        _logger = logger;
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
        // return await _orchestrator.IngestDocumentAsync(docid, request);
    }

    public async Task<Result<GetDocumentResponse>> IngestUrl(
        Guid OrganizationId,
        IngestUrlRequest request
    )
    {
        // return await _orchestrator.IngestUrlAsync(docid, request);
    }

    public async Task<Result<GetDocumentResponse>> IngestText(
        Guid OrganizationId,
        IngestTextRequest request
    )
    {
        // return await _orchestrator.IngestTextAsync(docid, request);
    }
}
