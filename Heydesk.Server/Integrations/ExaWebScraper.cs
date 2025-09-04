using System.Text.Json;
using Heydesk.Server.Config;

namespace Heydesk.Server.Integrations;

public interface IExaWebScraper
{
    Task<WebSearchResponse> GetContentsAsync(List<string> urls, ContentsRequest? options = null);
}

public class ExaWebScraper : IExaWebScraper
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ExaWebScraper>? _logger;
    private const string BaseUrl = "https://api.exa.ai";

    public ExaWebScraper(HttpClient httpClient, ILogger<ExaWebScraper>? logger = null)
    {
        _httpClient = httpClient;
        _logger = logger;
        _httpClient.DefaultRequestHeaders.Add("x-api-key", AppConfig.ExaAI.ApiKey);
    }

    public async Task<WebSearchResponse> GetContentsAsync(
        List<string> urls,
        ContentsRequest? options = null
    )
    {
        _logger?.LogInformation("Sending get contents request for URLs: {Urls}", urls);

        var request = new
        {
            urls,
            options?.Text,
            options?.Highlights,
            options?.Summary,
            options?.Livecrawl,
            options?.LivecrawlTimeout,
            options?.Subpages,
            options?.SubpageTarget,
            options?.Extras,
        };

        var response = await _httpClient.PostAsJsonAsync($"{BaseUrl}/contents", request);

        response.EnsureSuccessStatusCode();
        var contentsResponse =
            await response.Content.ReadFromJsonAsync<WebSearchResponse>()
            ?? throw new Exception("Failed to deserialize contents response");

        _logger?.LogInformation(
            "Received contents response: {Response}",
            JsonSerializer.Serialize(
                contentsResponse,
                new JsonSerializerOptions { WriteIndented = true }
            )
        );

        return contentsResponse;
    }
}

public class WebSearchResponse
{
    public List<WebSearchResult> Results { get; set; } = [];
    public string SearchType { get; set; } = string.Empty;
}

public class WebSearchResult
{
    public string Title { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string? PublishedDate { get; set; }
    public string? Author { get; set; }
    public double? Score { get; set; }
    public string? Text { get; set; }
    public List<string>? Highlights { get; set; }
    public List<double>? HighlightScores { get; set; }
    public string? Summary { get; set; }
    public List<WebSearchResult>? Subpages { get; set; }
    public string? Image { get; set; }
    public string? Favicon { get; set; }
    public ExtrasResult? Extras { get; set; }
}

public class ExtrasResult
{
    public List<string>? Links { get; set; }
    public List<string>? ImageLinks { get; set; }
}

public class ContentsRequest
{
    public TextOptions? Text { get; set; }
    public HighlightsOptions? Highlights { get; set; }
    public bool? Summary { get; set; } = true;
    public string? Livecrawl { get; set; }
    public int? LivecrawlTimeout { get; set; }
    public int? Subpages { get; set; }
    public object? SubpageTarget { get; set; }
    public ExtrasOptions? Extras { get; set; }
}

public class TextOptions
{
    public int? MaxCharacters { get; set; }
    public bool IncludeHtmlTags { get; set; } = false;
}

public class HighlightsOptions
{
    public int NumSentences { get; set; } = 5;
    public int HighlightsPerUrl { get; set; } = 1;
    public string? Query { get; set; }
}

public class ExtrasOptions
{
    public int Links { get; set; }
    public int ImageLinks { get; set; }
}
