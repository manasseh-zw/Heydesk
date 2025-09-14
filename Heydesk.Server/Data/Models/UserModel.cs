namespace Heydesk.Server.Data.Models;

public class UserModel
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? GoogleId { get; set; }
    public string? AvatarUrl { get; set; }
    public AuthProvider AuthProvider { get; set; }
    public bool Onboarding { get; set; } = true;

    public Guid? OrganizationId { get; set; }
    public OrganizationModel? Organization { get; set; }
}

public enum AuthProvider
{
    Email,
    Google,
}
