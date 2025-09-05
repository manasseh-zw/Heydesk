using System.Net.Http;
using Heydesk.Server.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace Heydesk.Server.Domains.Document.Workflows;

public class DocumentIngestEventHandler
{
    private readonly Data.RepositoryContext _repository;
    private readonly Data.IVectorStore _vectorStore;
    private readonly Document.Processors.IUrlProcessor _urlProcessor;
    private readonly Document.Processors.IDocProcessor _docProcessor;
    private readonly ILogger<DocumentIngestEventHandler> _logger;
    private readonly IIngestionSseBroker _sseBroker;

    public DocumentIngestEventHandler(
        Data.RepositoryContext repository,
        Data.IVectorStore vectorStore,
        Document.Processors.IUrlProcessor urlProcessor,
        Document.Processors.IDocProcessor docProcessor,
        ILogger<DocumentIngestEventHandler> logger,
        IIngestionSseBroker sseBroker
    )
    {
        _repository = repository;
        _vectorStore = vectorStore;
        _urlProcessor = urlProcessor;
        _docProcessor = docProcessor;
        _logger = logger;
        _sseBroker = sseBroker;
    }

    public async Task HandleIngestAsync(DocumentIngestEvent ingestEvent, CancellationToken ct)
    {
        var document = await _repository.Documents.FindAsync(ingestEvent.DocumentId);
        if (document is null)
        {
            _logger.LogWarning("Document {DocumentId} not found for ingestion", ingestEvent.DocumentId);
            return;
        }

        try
        {
            document.Status = DocumentIngestStatus.Processing;
            await _repository.SaveChangesAsync(ct);

            string content = ingestEvent.Type switch
            {
                IngestEventType.Url => await _urlProcessor.Process(ingestEvent.Url!),
                IngestEventType.Document => await ProcessUploadedFileAsync(ingestEvent, ct),
                IngestEventType.Text => ingestEvent.TextContent ?? string.Empty,
                _ => string.Empty,
            };

            if (!string.IsNullOrWhiteSpace(content))
            {
                await _vectorStore.UpsertAsync(ingestEvent.OrganizationId, content, ingestEvent.Type == IngestEventType.Url ? Data.MimeType.Markdown : Data.MimeType.PlainText);
                document.Content = content;
            }

            document.Status = DocumentIngestStatus.Completed;
            await _repository.SaveChangesAsync(ct);
            await _sseBroker.PublishAsync(new IngestionSseEvent(document.OrganizationId, document.Id, document.Status));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to ingest document {DocumentId}", ingestEvent.DocumentId);
            document.Status = DocumentIngestStatus.Failed;
            await _repository.SaveChangesAsync(ct);
            await _sseBroker.PublishAsync(new IngestionSseEvent(document.OrganizationId, document.Id, document.Status));
        }
    }

    private async Task<string> ProcessUploadedFileAsync(DocumentIngestEvent ingestEvent, CancellationToken ct)
    {
        if (ingestEvent.FileContent is null || ingestEvent.FileContent.Length == 0)
            return string.Empty;

        var ms = new MemoryStream(ingestEvent.FileContent, writable: false);
        return await _docProcessor.Process(ms);
    }
}