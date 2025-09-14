namespace Heydesk.Server.Data.Models;

public class AgentModel
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string SystemPrompt { get; set; } = string.Empty;
    public AgentType Type { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid OrganizationId { get; set; }
    public OrganizationModel Organization { get; set; }
}

public enum AgentType
{
    Chat,
    Voice,
}
