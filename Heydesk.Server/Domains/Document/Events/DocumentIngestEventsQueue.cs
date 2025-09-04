using System.Threading.Channels;

namespace Heydesk.Server.Domains.Document.Workflows;

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
