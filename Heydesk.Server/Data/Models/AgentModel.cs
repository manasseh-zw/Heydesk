namespace Heydesk.Server.Data.Models;

public class AgentModel
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public string Name { get; set; }
    public string SystemPrompt { get; set; }
    public AgentType Type { get; set; }

    public Guid OrganizationId { get; set; }
    public OrganizationModel Organization { get; set; }
}

public enum AgentType
{
    Chat,
    Voice,
}
