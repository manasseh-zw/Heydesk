using System.Collections.Concurrent;
using System.Threading.Channels;
using Heydesk.Server.Data.Models;

namespace Heydesk.Server.Domains.Document.Workflows;

public record IngestionSseEvent(Guid OrganizationId, Guid DocumentId, DocumentIngestStatus Status);

public interface IIngestionSseBroker
{
    IAsyncEnumerable<IngestionSseEvent> Subscribe(Guid organizationId, CancellationToken ct);
    Task PublishAsync(IngestionSseEvent evt);
}

public class IngestionSseBroker : IIngestionSseBroker
{
    private readonly ConcurrentDictionary<Guid, Channel<IngestionSseEvent>> _channels = new();

    public IAsyncEnumerable<IngestionSseEvent> Subscribe(Guid organizationId, CancellationToken ct)
    {
        var channel = _channels.GetOrAdd(organizationId, _ => Channel.CreateUnbounded<IngestionSseEvent>());
        return channel.Reader.ReadAllAsync(ct);
    }

    public Task PublishAsync(IngestionSseEvent evt)
    {
        var channel = _channels.GetOrAdd(evt.OrganizationId, _ => Channel.CreateUnbounded<IngestionSseEvent>());
        return channel.Writer.WriteAsync(evt).AsTask();
    }
}


