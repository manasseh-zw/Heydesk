using System.Threading.Channels;

namespace Heydesk.Server.Domains.Document.Workflows;

public enum IngestEventType
{
    Url,
    Document,
    Text,
}

public record DocumentIngestEvent(
    Guid DocumentId,
    Guid OrganizationId,
    IngestEventType Type,
    string? Url = null,
    string? TextContent = null,
    byte[]? FileContent = null,
    string? FileName = null,
    string? ContentType = null
);

public interface IDocumentIngestEventsQueue<T>
{
    ChannelReader<T> Reader { get; }
    ChannelWriter<T> Writer { get; }
}

public class DocumentIngestEventsQueue<T> : IDocumentIngestEventsQueue<T>
    where T : class
{
    private readonly Channel<T> _channel;

    public DocumentIngestEventsQueue()
    {
        _channel = Channel.CreateUnbounded<T>(
            new UnboundedChannelOptions { SingleReader = true, SingleWriter = false }
        );
    }

    public ChannelReader<T> Reader => _channel.Reader;
    public ChannelWriter<T> Writer => _channel.Writer;
}
