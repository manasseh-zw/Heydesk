namespace Heydesk.Server.Data.Models;

public class OrganizationModel
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string IconUrl { get; set; } = string.Empty;
    public List<UserModel> Members { get; set; } = [];
    public List<DocumentModel> Documents { get; set; } = [];
    public List<AgentModel> Agents { get; set; } = [];
}
