using Heydesk.Server.Utils;

namespace Heydesk.Server.Domains.Document;

public interface IDocumentService
{
    Task<Result<GetDocumentResponse>> IngestDocument(
        Guid OrganizationId,
        IngestDocumentRequest request
    );
    Task<Result<GetDocumentResponse>> IngestUrl(Guid OrganizationId, IngestUrlRequest request);
    Task<Result<GetDocumentResponse>> IngestText(Guid OrganizationId, IngestTextRequest request);
}

public class DocumentService { }
