namespace Heydesk.Server.Data.Models;

public class UserModel
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? GoogleId { get; set; }
    public string? AvatarUrl { get; set; }
    public AuthProvider AuthProvider { get; set; }
}

public enum AuthProvider
{
    Email,
    Google,
}
