using System.Text;
using Heydesk.Server.Integrations;

namespace Heydesk.Server.Domains.Document.Processors;

public interface IUrlProcessor
{
    Task<string> Process(string url);
}

public class UrlProcessor : IUrlProcessor
{
    private readonly IExaWebScraper _scraper;

    public UrlProcessor(IExaWebScraper scraper)
    {
        _scraper = scraper;
    }

    public async Task<string> Process(string url)
    {
        var response = await _scraper.GetContentsAsync(
            [url],
            new()
            {
                Text = true,
                Summary = new()
                {
                    Query =
                        "Provide a flowing, comprehensive summary for customer support use that covers this page's content from general overview to specific details. Include all factual information (prices, specifications, steps, requirements, limits, contact details, metrics) and summarize any conceptual content. Structure it to read naturally as part of a larger knowledge base, flowing from what this page covers to the specific actionable details agents need, ensuring seamless integration with other page summaries.",
                },
                Subpages = 30,
                SubpageTarget =
                [
                    "products",
                    "solutions",
                    "features",
                    "pricing",
                    "plans",
                    "api",
                    "documentation",
                    "docs",
                    "integrations",
                    "support",
                    "help",
                    "faq",
                    "demo",
                    "trial",
                    "free",
                    "enterprise",
                    "developer",
                    "technical",
                    "setup",
                    "getting started",
                    "onboarding",
                    "tutorials",
                    "guides",
                    "security",
                    "compliance",
                    "case studies",
                    "testimonials",
                    "blog",
                    "resources",
                    "about",
                    "contact",
                    "careers",
                ],
            }
        );

        return BuildMarkdownContent(response, url);
    }

    private static string BuildMarkdownContent(WebSearchResponse response, string originalUrl)
    {
        if (!response.Results.Any())
        {
            return "# No Content Found\n\nUnable to retrieve content from the provided URL.";
        }

        var mainResult = response.Results[0];
        var siteContent = new StringBuilder();

        // Main site header
        siteContent.AppendLine("# Company Website Knowledge Base");
        siteContent.AppendLine();
        siteContent.AppendLine($"**Website:** {mainResult.Url}");
        siteContent.AppendLine($"**Company:** {mainResult.Title}");
        if (!string.IsNullOrEmpty(mainResult.PublishedDate))
        {
            siteContent.AppendLine($"**Last Updated:** {mainResult.PublishedDate}");
        }
        siteContent.AppendLine();

        // Main page summary - this is the primary company overview
        if (!string.IsNullOrEmpty(mainResult.Summary))
        {
            siteContent.AppendLine("## Company Overview");
            siteContent.AppendLine();
            siteContent.AppendLine(mainResult.Summary);
            siteContent.AppendLine();
        }

        // Page summaries - the valuable, noise-free information
        if (mainResult.Subpages?.Count > 0 == true)
        {
            var pagesWithSummaries = mainResult
                .Subpages.Where(page => !string.IsNullOrEmpty(page.Summary))
                .ToList();

            if (pagesWithSummaries.Count > 0)
            {
                siteContent.AppendLine("## Detailed Information");
                siteContent.AppendLine();

                foreach (var subpage in pagesWithSummaries)
                {
                    siteContent.AppendLine($"### {subpage.Title}");
                    siteContent.AppendLine();

                    // The summary contains all the high-value, structured information
                    siteContent.AppendLine(subpage.Summary);
                    siteContent.AppendLine();

                    // Optional: Include URL for reference
                    siteContent.AppendLine($"*Source: {subpage.Url}*");
                    siteContent.AppendLine();
                    siteContent.AppendLine("---");
                    siteContent.AppendLine();
                }
            }
        }

        // Footer with metadata
        siteContent.AppendLine("## Knowledge Base Information");
        siteContent.AppendLine();
        siteContent.AppendLine(
            $"**Pages Analyzed:** {1 + (mainResult.Subpages?.Count(p => !string.IsNullOrEmpty(p.Summary)) ?? 0)}"
        );
        siteContent.AppendLine($"**Generated On:** {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
        siteContent.AppendLine($"**Source URL:** {originalUrl}");

        return siteContent.ToString();
    }
}
