namespace Heydesk.Server.Data.Models;

public class CustomerModel
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? GoogleId { get; set; }
    public string? AvatarUrl { get; set; }
    public AuthProvider AuthProvider { get; set; }

    public List<string> Organizations { get; set; } = [];

    // Navigation properties
    public List<ConversationModel> Conversations { get; set; } = [];
    public List<TicketModel> Tickets { get; set; } = [];
}
