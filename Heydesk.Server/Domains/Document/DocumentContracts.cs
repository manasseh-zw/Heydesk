using Heydesk.Server.Data.Models;

namespace Heydesk.Server.Domains.Document;

public record IngestUrlRequest(string Url);

public record IngestDocumentRequest(string Name, IFormFile File);

public record IngestTextRequest(string Name, string Content);

public record GetDocumentResponse(
    Guid Id,
    string Name,
    DocumentType Type,
    string SourceUrl,
    string? Content = null
);

public record GetDocumentsResponse(List<GetDocumentResponse> Documents, int TotalCount);

public record GetDocumentsRequest(int Page = 1, int PageSize = 10);
