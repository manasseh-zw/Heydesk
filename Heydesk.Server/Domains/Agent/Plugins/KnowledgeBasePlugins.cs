using System.ComponentModel;
using System.Text.Json;
using Heydesk.Server.Data;
using Microsoft.SemanticKernel;
using TiDB.Vector.Models;

namespace Heydesk.Server.Domains.Agent.Plugins;

public class KnowledgeBasePlugins
{
    private readonly IVectorStore _vectorStore;
    private readonly string _organizationId;

    public KnowledgeBasePlugins(IVectorStore vectorStore, string organizationId)
    {
        _vectorStore = vectorStore;
        _organizationId = organizationId;
    }

    [KernelFunction]
    [Description("Searches the organization's knowledge base for relevant information to help answer customer questions. Use this when you need to find specific information from documentation, FAQs, or support articles.")]
    public async Task<string> SearchKnowledgeBase(
        [Description("The search query or question to find relevant information in the knowledge base")] string query
    )
    {
        try
        {
            var searchResults = await _vectorStore.SearchAsync(_organizationId, query);

            if (searchResults == null || !searchResults.Any())
            {
                return "No relevant information found in the knowledge base for this query.";
            }

            var formattedResults = string.Join("\n\n---\n\n",
                searchResults.Take(3).Select(result =>
                    $"Relevance Score: {result.Distance:F2}\n" +
                    $"Content: {result.Content}\n" +
                    (!string.IsNullOrEmpty(result.Source) ? $"Source: {result.Source}" : "")
                )
            );

            return $"Found {searchResults.Count} relevant results from knowledge base:\n\n{formattedResults}";
        }
        catch (Exception ex)
        {
            return $"Error searching knowledge base: {ex.Message}. Please try rephrasing your question or contact a human agent for assistance.";
        }
    }
}
