namespace Heydesk.Server.Data.Models;

public class DocumentModel
{
    public Guid Id { get; set; }

    public string Name { get; set; }

    public string? SourceUrl { get; set; }

    public DocumentType Type { get; set; }

    public DocumentIngestStatus Status { get; set; }

    public string? Content { get; set; }

    public Guid OrganizationId { get; set; }
    public OrganizationModel Organization { get; set; }
}

public enum DocumentType
{
    Url,
    Document,
    Text,
}

public enum DocumentIngestStatus
{
    Pending,
    Processing,
    Completed,
    Failed,
}
