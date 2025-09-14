using Heydesk.Server.Config;
using TiDB.Vector.AzureOpenAI.Builder;
using TiDB.Vector.Core;
using TiDB.Vector.Models;
using TiDB.Vector.Options;

namespace Heydesk.Server.Data;

public interface IVectorStore
{
    Task<List<SearchResult>> SearchAsync(string orgId, string query);
    Task<bool> UpsertAsync(Guid OrgId, string content, MimeType mimeType);
}

//TODO add colleciton and tag filtering... and change meta data to json string.
public class VectorStore : IVectorStore
{
    private readonly TiDBVectorStore _store;

    public VectorStore()
    {
        _store = new TiDBVectorStoreBuilder(AppConfig.Database.VectorConnectionString)
            .WithDefaultCollection("default")
            .WithDistanceFunction(DistanceFunction.Cosine)
            .AddAzureOpenAI(AppConfig.AzureAI.ApiKey, AppConfig.AzureAI.Endpoint)
            .AddAzureOpenAITextEmbedding("text-embedding-3-small", 1536)
            .AddAzureOpenAIChatCompletion("gpt-4.1")
            .EnsureSchema(createVectorIndex: true)
            .Build();
    }

    public async Task<List<SearchResult>> SearchAsync(string orgId, string query)
    {
        var result = await _store.SearchAsync(query, 5, new SearchOptions() { Collection = orgId });

        return [.. result];
    }

    public async Task<bool> UpsertAsync(Guid OrgId, string content, MimeType mimeType)
    {
        var options = new UpsertOptions
        {
            UseChunking = true,
            MaxTokensPerChunk = 600,
            OverlapTokens = 80,
            ChunkHeader = "",
            StripHtml = true,
        };
        var record = new UpsertItem
        {
            Id = Guid.CreateVersion7().ToString(),
            Collection = OrgId.ToString(),
            Content = content,
            ContentType = mimeType.Equals(MimeType.Markdown)
                ? ContentType.Markdown
                : ContentType.PlainText,
        };

        await _store.UpsertAsync(record, options);

        return true;
    }
}

public enum MimeType
{
    Markdown,
    PlainText,
}
