using System.Text;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;
using UglyToad.PdfPig.DocumentLayoutAnalysis.TextExtractor;

namespace Heydesk.Server.Domains.Document.Processors;

public interface IDocProcessor
{
    Task<string> Process(Stream data);
}

public class DocProcessor : IDocProcessor
{
    public Task<string> Process(Stream data)
    {
        var sb = new StringBuilder();

        using PdfDocument pdfDocument = PdfDocument.Open(data);

        foreach (Page page in pdfDocument.GetPages())
        {
            // Add page header
            sb.AppendLine($"--- Page {page.Number} ---");
            sb.AppendLine();

            // Extract text in reading order
            string pageText = ContentOrderTextExtractor.GetText(page);
            sb.AppendLine(pageText.Trim());
            sb.AppendLine(); // extra spacing after each page
        }

        return Task.FromResult(sb.ToString());
    }
}
