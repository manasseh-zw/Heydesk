## TiDB.Vector.NET

Ergonomic C# SDK for TiDB Vector Search: upsert, search, and RAG with a fluent builder, OpenAI embeddings/chat integration, and DX-first defaults.

Repository: [manasseh-zw/TiDB.Vector.NET](https://github.com/manasseh-zw/TiDB.Vector.NET)

### Features

- Fluent builder to wire connection, embeddings, and chat
- Default schema with fixed-dimension `VECTOR(D)` and optional HNSW index
- Safe, parameterized SQL via `MySqlConnector`
- OpenAI providers built into the core package
- Simple RAG helper (`AskAsync`) that cites sources
- Samples with `.env` support via `dotenv.net`

### NuGet Packages

- **`TiDB.Vector`** - Core package with vector store functionality

- **`TiDB.Vector.AzureOpenAI`** - Azure OpenAI integration (embeddings + chat)

### Projects

- `TiDB.Vector` (Core): store API, schema, SQL

- `TiDB.Vector.AzureOpenAI`: Azure OpenAI providers (embeddings/chat)
- `TiDB.Vector.Samples`: runnable examples (upsert, search, ask)

### Requirements

- .NET 8.0+
- TiDB v8.4+ (v8.5+ recommended); TiDB Cloud supported
- For HNSW index: TiFlash replica required on the target table

### Installation

```bash
# Core package with OpenAI built-in (recommended)
dotnet add package TiDB.Vector

# Azure OpenAI integration (optional, extends core)
dotnet add package TiDB.Vector.AzureOpenAI
```

### What You Get With Each Package

| Package                                   | Vector Store | Embeddings | Chat/RAG | Notes                                       |
| ----------------------------------------- | ------------ | ---------- | -------- | ------------------------------------------- |
| `TiDB.Vector`                             | ✅           | ✅         | ✅       | **Full functionality with OpenAI built-in** |
| `TiDB.Vector` + `TiDB.Vector.AzureOpenAI` | ✅           | ✅         | ✅       | Full functionality + Azure OpenAI support   |

**Note**: The core package now provides everything you need! Azure OpenAI is an optional extension for Azure-specific features.

### Quickstart (local dev)

1. Clone the repo:

```bash
git clone https://github.com/manasseh-zw/TiDB.Vector.NET
cd TiDB.Vector.NET
```

2. Create a `.env` file in `TiDB.Vector.Samples/`:

```
# Required for all samples
TIDB_CONN_STRING=Server=<host>;Port=4000;User ID=<user>;Password=<pwd>;Database=<db>;SslMode=VerifyFull;

# For OpenAI samples
OPENAI_API_KEY=sk-...

# For Azure OpenAI samples
AZURE_AI_APIKEY=your-azure-key
AZURE_AI_ENDPOINT=https://your-resource.openai.azure.com/
```

3. Run samples:

```bash
dotnet run --project TiDB.Vector.Samples
```

The sample will:

- Ensure the default schema and (optionally) HNSW index
- Upsert a couple of documents
- Perform a vector search
- Call `AskAsync` to answer a question using retrieved context

### Core API (glance)

#### **New Clean API (Recommended)**

```csharp
using TiDB.Vector.Core;
using TiDB.Vector.OpenAI.Builder; // Built into TiDB.Vector core package

var store = new TiDBVectorStoreBuilder(
        Environment.GetEnvironmentVariable("TIDB_CONN_STRING")!)
    .WithDefaultCollection("docs")
    .WithDistanceFunction(DistanceFunction.Cosine)
    .AddOpenAI(Environment.GetEnvironmentVariable("OPENAI_API_KEY")!)
    .AddOpenAITextEmbedding("text-embedding-3-small", 1536)
    .AddOpenAIChatCompletion("gpt-4.1")
    .EnsureSchema(createVectorIndex: true)
    .Build();
```

#### **Custom Endpoints (OpenAI-Compatible Services)**

```csharp
var store = new TiDBVectorStoreBuilder(connectionString)
    .AddOpenAI("your-api-key", "https://your-local-model.com/v1")
    .AddOpenAITextEmbedding("your-embedding-model", 1536)
    .AddOpenAIChatCompletion("your-chat-model")
    .Build();
```

#### **Azure OpenAI Integration**

```csharp
var store = new TiDBVectorStoreBuilder(connectionString)
    .AddAzureOpenAI("your-azure-key", "https://your-resource.openai.azure.com/")
    .AddAzureOpenAITextEmbedding("your-embedding-deployment", 1536)
    .AddAzureOpenAIChatCompletion("your-chat-deployment")
    .Build();
```

await store.EnsureSchemaAsync();

await store.UpsertAsync(new UpsertItem
{
Id = "sample-1",
Collection = "docs",
Content = "Fish live in water and are known for their swimming abilities."
});

var results = await store.SearchAsync("a swimming animal", topK: 3);
var answer = await store.AskAsync("Name an animal that swims.");

````

#### Azure OpenAI Example

```csharp
using TiDB.Vector.Core;
using TiDB.Vector.AzureOpenAI.Builder;

var store = new TiDBVectorStoreBuilder(
        Environment.GetEnvironmentVariable("TIDB_CONN_STRING")!)
    .WithDefaultCollection("docs")
    .WithDistanceFunction(DistanceFunction.Cosine)
    .AddAzureOpenAI(
        Environment.GetEnvironmentVariable("AZURE_AI_APIKEY")!,
        Environment.GetEnvironmentVariable("AZURE_AI_ENDPOINT")!)
    .AddAzureOpenAITextEmbedding("your-embedding-deployment", 1536)
    .AddAzureOpenAIChatCompletion("your-chat-deployment")
    .EnsureSchema(createVectorIndex: true)
    .Build();

### Default Schema and Index

- Table: `tidb_vectors`
  - `collection VARCHAR(128)` + `id VARCHAR(64)` as composite primary key
  - `embedding VECTOR(D)` where `D` = embedding dimension (e.g., 1536)
  - `content TEXT`, `metadata JSON`, timestamps
- Index (optional, HNSW):
  - Cosine: `CREATE VECTOR INDEX idx_tidb_vectors_embedding_cosine ON tidb_vectors ((VEC_COSINE_DISTANCE(embedding))) USING HNSW;`
  - L2: `CREATE VECTOR INDEX idx_tidb_vectors_embedding_l2 ON tidb_vectors ((VEC_L2_DISTANCE(embedding))) USING HNSW;`

Notes:
- Fixed dimension is required to build the vector index.
- TiFlash replica is required for building/using the HNSW index.
- To keep index usage when filtering, the SDK performs KNN first in a subquery, then applies filters.

### OpenAI integration

Built into the core package using the official OpenAI .NET SDK 2.x:
- Embeddings: `EmbeddingClient` (`text-embedding-3-small` 1536 dims, `text-embedding-3-large` 3072 dims)
- Chat: `ChatClient` (e.g., `gpt-4o-mini`)

Ensure the table dimension matches the chosen embedding model’s dimension.

### Connection string (TiDB Cloud)

Use standard ADO.NET format (not URL form), e.g.:

````

Server=<host>;Port=4000;User ID=<user>;Password=<pwd>;Database=<db>;SslMode=VerifyFull;

```

If you must provide a custom CA bundle, append:

```

SslCa=C:\\path\\to\\isrgrootx1.pem;

```

### Current Architecture

The project now has OpenAI integration built into the core package:

- **`TiDB.Vector`** - Core vector store functionality + **OpenAI integration built-in**
- **`TiDB.Vector.AzureOpenAI`** - Azure OpenAI integration (extends core capabilities)

**Note**: Users now get full AI functionality with just the core package! Azure OpenAI is available as an optional extension.

### Future Development Plans

We're planning to restructure the architecture for better user experience:

#### **Phase 1: OpenAI Built-In ✅ COMPLETED**
- **`TiDB.Vector`** - Core + OpenAI integration built-in by default
- Users get AI capabilities out of the box with one package
- **OpenAI-compatible endpoint support** for local models and other providers
- Provider abstraction layer for easy integration with OpenAI-compatible services

#### **Phase 2: Provider Extensions**
- **`TiDB.Vector.AzureOpenAI`** - Azure-specific optimizations
- **`TiDB.Vector.GoogleGemini`** - Google Gemini integration
- **`TiDB.Vector.Anthropic`** - Anthropic Claude integration
- **`TiDB.Vector.Custom`** - Template for custom provider implementations

#### **Benefits of New Architecture**
- ✅ **One package = full functionality**
- ✅ **AI works immediately** without additional packages
- ✅ **Easy provider switching** via configuration
- ✅ **Future-proof** with clean extension points
- ✅ **Better developer experience**

### Roadmap (high level)

- Iteration 1: Skeleton and builder ✅
- Iteration 2: Schema management + upsert/search ✅
- Iteration 3: Vector index + TiFlash helpers ✅
- Iteration 4: Chunking (out-of-the-box text splitter) ✅
- Iteration 5: OpenAI embeddings/chat + RAG `AskAsync` ✅
- Iteration 6: Azure OpenAI integration + additional providers ✅
- **Iteration 7**: OpenAI built into core + provider abstraction layer ✅ **COMPLETED**
- **Iteration 8**: Additional provider extensions (Gemini, Claude, etc.)
- **Iteration 9+**: Advanced features (filters, metrics, streaming, hybrid search)

### Contributing

We welcome issues and PRs! To contribute:
- Fork the repo and create a feature branch
- Follow the existing code style (explicit naming, clear control flow)
- Keep public APIs strongly-typed and documented
- Add/update samples if you change user-facing behavior
- Run `dotnet build` before submitting your PR

Open an issue to discuss larger proposals or provider integrations. Repo: [manasseh-zw/TiDB.Vector.NET](https://github.com/manasseh-zw/TiDB.Vector.NET)

### Acknowledgements

- TiDB Vector Search (data types, functions, HNSW index)
- Official OpenAI .NET SDK for embeddings/chat

```
