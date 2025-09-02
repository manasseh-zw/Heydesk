namespace Heydesk.Server.Domains.User;

public record GetUserResponse(
    Guid Id,
    string Username,
    string Email,
    string AvatarUrl,
    bool Onboarding
);
