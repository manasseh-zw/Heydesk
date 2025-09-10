using System.Text.Json.Serialization;
using Heydesk.Server.Data.Models;
using Heydesk.Server.Domains.Organization;

namespace Heydesk.Server.Domains.Auth;

public class AuthContracts
{
    public record EmailSignUpRequest(string Username, string Email, string Password);

    public record EmailSignInRequest(string UserIdentifier, string Password);

    public record GoogleAuthRequest(string AccessToken);

    public record AuthResponse(string Token, UserDataResponse UserData);

    public record UserDataResponse(
        Guid Id,
        string Email,
        string? Username,
        string? AvatarUrl,
        DateTime CreatedAt,
        AuthProvider AuthProvider,
        bool Onboarding,
        GetOrgResponse? Organization
    );

    // Customer Auth Contracts
    public record CustomerSignUpRequest(string Username, string Email, string Password);

    public record CustomerSignInRequest(string UserIdentifier, string Password);

    public record CustomerAuthResponse(string Token, CustomerDataResponse CustomerData);

    public record CustomerDataResponse(
        Guid Id,
        string Email,
        string Username,
        string? AvatarUrl,
        DateTime CreatedAt,
        AuthProvider AuthProvider,
        List<string> Organizations
    );

    public class GoogleUserInfo
    {
        [JsonPropertyName("sub")]
        public string Id { get; set; }

        [JsonPropertyName("name")]
        public string Username { get; set; }

        [JsonPropertyName("email")]
        public string Email { get; set; }

        [JsonPropertyName("email_verified")]
        public bool IsEmailVerified { get; set; }

        [JsonPropertyName("picture")]
        public string AvatarUrl { get; set; }
    }
}
