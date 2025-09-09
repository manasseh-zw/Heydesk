using Heydesk.Server.Data;
using Heydesk.Server.Data.Models;
using Heydesk.Server.Utils;
using Heydesk.Server.Domains.Document;
using Heydesk.Server.Domains.Document.Workflows;

namespace Heydesk.Server.Domains.Document.Workflows;

public interface IDocumentsEvents
{
    Task<Result<GetDocumentResponse>> EnqueueUrl(Guid organizationId, string url);
    Task<Result<GetDocumentResponse>> EnqueueText(Guid organizationId, string name, string content);
    Task<Result<GetDocumentResponse>> EnqueueDocument(Guid organizationId, string name, byte[] fileBytes);
}

public class DocumentsEvents : IDocumentsEvents
{
    private readonly RepositoryContext _repository;
    private readonly IDocumentIngestEventsQueue<DocumentIngestEvent> _queue;
    private readonly ILogger<DocumentsEvents> _logger;

    public DocumentsEvents(
        RepositoryContext repository,
        IDocumentIngestEventsQueue<DocumentIngestEvent> queue,
        ILogger<DocumentsEvents> logger
    )
    {
        _repository = repository;
        _queue = queue;
        _logger = logger;
    }

    public async Task<Result<GetDocumentResponse>> EnqueueUrl(Guid organizationId, string url)
    {
        try
        {
            var document = new DocumentModel
            {
                Id = Guid.CreateVersion7(),
                Name = url,
                Type = DocumentType.Url,
                OrganizationId = organizationId,
                Status = DocumentIngestStatus.Pending,
                SourceUrl = url,
            };

            _repository.Documents.Add(document);
            await _repository.SaveChangesAsync();

            await _queue.Writer.WriteAsync(
                new DocumentIngestEvent(
                    document.Id,
                    organizationId,
                    IngestEventType.Url,
                    Url: url
                )
            );

            return Result.Ok(
                new GetDocumentResponse(
                    document.Id,
                    document.Name,
                    document.Type,
                    document.SourceUrl ?? string.Empty,
                    document.Status,
                    document.Content
                )
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to enqueue URL ingestion for org {OrgId}", organizationId);
            return Result.Fail("Failed to queue URL ingestion");
        }
    }

    public async Task<Result<GetDocumentResponse>> EnqueueText(Guid organizationId, string name, string content)
    {
        try
        {
            var document = new DocumentModel
            {
                Id = Guid.CreateVersion7(),
                Name = name,
                Type = DocumentType.Text,
                OrganizationId = organizationId,
                Status = DocumentIngestStatus.Pending,
                SourceUrl = string.Empty,
            };

            _repository.Documents.Add(document);
            await _repository.SaveChangesAsync();

            await _queue.Writer.WriteAsync(
                new DocumentIngestEvent(
                    document.Id,
                    organizationId,
                    IngestEventType.Text,
                    TextContent: content
                )
            );

            return Result.Ok(
                new GetDocumentResponse(
                    document.Id,
                    document.Name,
                    document.Type,
                    document.SourceUrl ?? string.Empty,
                    document.Status,
                    document.Content
                )
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to enqueue text ingestion for org {OrgId}", organizationId);
            return Result.Fail("Failed to queue text ingestion");
        }
    }

    public async Task<Result<GetDocumentResponse>> EnqueueDocument(Guid organizationId, string name, byte[] fileBytes)
    {
        try
        {
            var document = new DocumentModel
            {
                Id = Guid.CreateVersion7(),
                Name = name,
                Type = DocumentType.Document,
                OrganizationId = organizationId,
                Status = DocumentIngestStatus.Pending,
                SourceUrl = string.Empty,
            };

            _repository.Documents.Add(document);
            await _repository.SaveChangesAsync();

            await _queue.Writer.WriteAsync(
                new DocumentIngestEvent(
                    document.Id,
                    organizationId,
                    IngestEventType.Document,
                    FileContent: fileBytes
                )
            );

            return Result.Ok(
                new GetDocumentResponse(
                    document.Id,
                    document.Name,
                    document.Type,
                    document.SourceUrl ?? string.Empty,
                    document.Status,
                    document.Content
                )
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to enqueue document ingestion for org {OrgId}", organizationId);
            return Result.Fail("Failed to queue document ingestion");
        }
    }
}


