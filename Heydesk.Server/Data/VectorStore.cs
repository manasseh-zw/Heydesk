using Heydesk.Server.Config;
using TiDB.Vector.AzureOpenAI.Builder;
using TiDB.Vector.Core;
using TiDB.Vector.Models;

namespace Heydesk.Server.Data;

public interface IVectorStore
{
    Task<List<SearchResult>> SearchAsync(
        string orgId,
        string query,
        CancellationToken cancellationToken = default
    );
}

public class VectorStore : IVectorStore
{
    private readonly TiDBVectorStore _store;

    public VectorStore()
    {
        _store = new TiDBVectorStoreBuilder(AppConfig.TiDBConnectionString)
            .WithDefaultCollection("default")
            .WithDistanceFunction(DistanceFunction.Cosine)
            .AddAzureOpenAI(AppConfig.AzureAI.ApiKey, AppConfig.AzureAI.Endpoint)
            .AddAzureOpenAITextEmbedding("text-embedding-3-small", 1536)
            .AddAzureOpenAIChatCompletion("gpt-4.1")
            .EnsureSchema(createVectorIndex: true)
            .Build();
    }

    public async Task<List<SearchResult>> SearchAsync(
        string orgId,
        string query,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _store.SearchAsync(query, 5);

        return result.ToList();
    }
}
