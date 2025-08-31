using System.Net.Http.Headers;
using System.Text.Json;
using Heydesk.Server.Data;
using Heydesk.Server.Data.Models;
using Heydesk.Server.Utils;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Extensions;
using static Heydesk.Server.Domains.Auth.AuthContracts;

namespace Heydesk.Server.Domains.Auth;

public interface IAuthService
{
    public Task<Result<AuthResponse>> EmailSignUp(EmailSignUpRequest request);
    public Task<Result<AuthResponse>> EmailSignIn(EmailSignInRequest request);
    public Task<Result<AuthResponse>> GoogleAuth(GoogleAuthRequest request);
    public Task<Result<UserDataResponse>> GetUserData(Guid userId);
}

public class AuthService : IAuthService
{
    private readonly RepositoryContext _repository;
    private readonly IPasswordHasher<UserModel> _passwordHasher;
    private readonly ITokenManager _tokenManager;
    private readonly IHttpClientFactory _httpClientFactory;

    public AuthService(
        RepositoryContext repository,
        IPasswordHasher<UserModel> passwordHasher,
        ITokenManager tokenManager,
        IHttpClientFactory httpClientFactory
    )
    {
        _repository = repository;
        _passwordHasher = passwordHasher;
        _tokenManager = tokenManager;
        _httpClientFactory = httpClientFactory;
    }

    public async Task<Result<AuthResponse>> EmailSignUp(EmailSignUpRequest request)
    {
        var isEmailTaken = await _repository.Users.AnyAsync(u => u.Email == request.Email);
        if (isEmailTaken)
            return Result.Fail("Email already exists");

        var validationResult = new AuthValidator().Validate(request);

        if (!validationResult.IsValid)
            return Result.Fail([.. validationResult.Errors.Select(e => e.ErrorMessage)]);

        var user = new UserModel()
        {
            Username = request.Username,
            Email = request.Email,
            AuthProvider = AuthProvider.Email,
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        await _repository.Users.AddAsync(user);
        await _repository.SaveChangesAsync();

        var token = _tokenManager.GenerateUserToken(user);
        var userData = new UserDataResponse(
            user.Id,
            user.Email,
            user.Username,
            user.AvatarUrl,
            user.CreatedAt,
            user.AuthProvider
        );

        return Result.Ok(new AuthResponse(token, userData));
    }

    public async Task<Result<AuthResponse>> GoogleAuth(GoogleAuthRequest request)
    {
        if (string.IsNullOrEmpty(request.AccessToken))
        {
            return Result.Fail("Invalid Google access token");
        }

        try
        {
            using var httpClient = _httpClientFactory.CreateClient("Google");
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
                "Bearer",
                request.AccessToken
            );

            var userInfoResponse = await httpClient.GetAsync(
                "https://www.googleapis.com/oauth2/v3/userinfo"
            );

            if (!userInfoResponse.IsSuccessStatusCode)
            {
                return Result.Fail("Failed to fetch user data from Google API");
            }

            var content = await userInfoResponse.Content.ReadAsStringAsync();
            var googleUser = JsonSerializer.Deserialize<GoogleUserInfo>(content);

            if (googleUser == null || string.IsNullOrEmpty(googleUser.Email))
            {
                return Result.Fail("Invalid user data received from Google");
            }

            var existingUser = await _repository.Users.FirstOrDefaultAsync(u =>
                u.Email == googleUser.Email
            );

            if (existingUser != null)
            {
                if (existingUser.AuthProvider != AuthProvider.Google)
                {
                    existingUser.AuthProvider = AuthProvider.Google;
                    await _repository.SaveChangesAsync();
                }

                var token = _tokenManager.GenerateUserToken(existingUser);
                var userData = new UserDataResponse(
                    existingUser.Id,
                    existingUser.Email,
                    existingUser.Username,
                    existingUser.AvatarUrl,
                    existingUser.CreatedAt,
                    existingUser.AuthProvider
                );

                return Result.Ok(new AuthResponse(token, userData));
            }

            var newUser = new UserModel
            {
                Email = googleUser.Email,
                Username = googleUser.Username,
                AvatarUrl = googleUser.AvatarUrl,
                GoogleId = googleUser.Id,
                AuthProvider = AuthProvider.Google,
            };

            await _repository.Users.AddAsync(newUser);
            await _repository.SaveChangesAsync();

            var newToken = _tokenManager.GenerateUserToken(newUser);
            var newUserData = new UserDataResponse(
                newUser.Id,
                newUser.Email,
                newUser.Username,
                newUser.AvatarUrl,
                newUser.CreatedAt,
                newUser.AuthProvider
            );

            return Result.Ok(new AuthResponse(newToken, newUserData));
        }
        catch (Exception ex)
        {
            return Result.Fail($"Error processing Google sign-up: {ex.Message}");
        }
    }

    public async Task<Result<UserDataResponse>> GetUserData(Guid userId)
    {
        var user = await _repository.Users.FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return Result.Fail("User not found");
        }

        var response = new UserDataResponse(
            user.Id,
            user.Email,
            user.Username,
            user.AvatarUrl,
            user.CreatedAt,
            user.AuthProvider
        );

        return Result.Ok(response);
    }

    public async Task<Result<AuthResponse>> EmailSignIn(EmailSignInRequest request)
    {
        var validationResult = new SignInValidator().Validate(request);
        if (!validationResult.IsValid)
            return Result.Fail([.. validationResult.Errors.Select(e => e.ErrorMessage)]);

        // Check if the identifier is an email or username
        var user = await _repository.Users.FirstOrDefaultAsync(u =>
            u.Email == request.UserIdentifier || u.Username == request.UserIdentifier
        );

        if (user == null)
            return Result.Fail("Invalid credentials");

        if (user.AuthProvider != AuthProvider.Email)
            return Result.Fail($"Please sign in with {user.AuthProvider.GetDisplayName()}");

        // Verify password
        var passwordVerificationResult = _passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.Password
        );

        if (passwordVerificationResult == PasswordVerificationResult.Failed)
            return Result.Fail("Invalid credentials");

        var token = _tokenManager.GenerateUserToken(user);
        var userData = new UserDataResponse(
            user.Id,
            user.Email,
            user.Username,
            user.AvatarUrl,
            user.CreatedAt,
            user.AuthProvider
        );

        return Result.Ok(new AuthResponse(token, userData));
    }
}
