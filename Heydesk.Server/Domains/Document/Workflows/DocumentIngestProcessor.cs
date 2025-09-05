namespace Heydesk.Server.Domains.Document.Workflows;

public class DocumentIngestProcessor : BackgroundService
{
    private readonly IDocumentIngestEventsQueue<DocumentIngestEvent> _queue;
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly ILogger<DocumentIngestProcessor> _logger;

    public DocumentIngestProcessor(
        IDocumentIngestEventsQueue<DocumentIngestEvent> queue,
        IServiceScopeFactory serviceScopeFactory,
        ILogger<DocumentIngestProcessor> logger
    )
    {
        _queue = queue;
        _serviceScopeFactory = serviceScopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var ingestEvent in _queue.Reader.ReadAllAsync(stoppingToken))
        {
            try
            {
                _logger.LogInformation(
                    "Processing ingest event for document {DocumentId}",
                    ingestEvent.DocumentId
                );

                using var scope = _serviceScopeFactory.CreateScope();
                var handler = scope.ServiceProvider.GetRequiredService<DocumentIngestEventHandler>();
                await handler.HandleIngestAsync(ingestEvent, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error processing ingest event for document {DocumentId}: {Message}",
                    ingestEvent.DocumentId,
                    ex.Message
                );
            }
        }
    }
}
