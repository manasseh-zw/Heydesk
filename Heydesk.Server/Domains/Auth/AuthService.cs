using System.Net.Http.Headers;
using System.Text.Json;
using Heydesk.Server.Data;
using Heydesk.Server.Data.Models;
using Heydesk.Server.Domains.Organization;
using Heydesk.Server.Utils;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Extensions;
using static Heydesk.Server.Domains.Auth.AuthContracts;

namespace Heydesk.Server.Domains.Auth;

public interface IAuthService
{
    Task<Result<AuthResponse>> EmailSignUp(EmailSignUpRequest request);
    Task<Result<AuthResponse>> EmailSignIn(EmailSignInRequest request);
    Task<Result<AuthResponse>> GoogleAuth(GoogleAuthRequest request);
    Task<Result<UserDataResponse>> GetUserData(Guid userId);

    // Customer Auth Methods
    Task<Result<CustomerAuthResponse>> CustomerSignUp(CustomerSignUpRequest request);
    Task<Result<CustomerAuthResponse>> CustomerSignIn(CustomerSignInRequest request);
    Task<Result<CustomerAuthResponse>> CustomerGoogleAuth(GoogleAuthRequest request);
    Task<Result<CustomerDataResponse>> GetCustomerData(Guid customerId);
    Task<Result<CustomerDataResponse>> SelectOrganization(Guid customerId, SelectOrganizationRequest request);
}

public class AuthService : IAuthService
{
    private readonly RepositoryContext _repository;
    private readonly IPasswordHasher<UserModel> _passwordHasher;
    private readonly IPasswordHasher<CustomerModel> _customerPasswordHasher;
    private readonly ITokenManager _tokenManager;
    private readonly IHttpClientFactory _httpClientFactory;

    public AuthService(
        RepositoryContext repository,
        IPasswordHasher<UserModel> passwordHasher,
        IPasswordHasher<CustomerModel> customerPasswordHasher,
        ITokenManager tokenManager,
        IHttpClientFactory httpClientFactory
    )
    {
        _repository = repository;
        _passwordHasher = passwordHasher;
        _customerPasswordHasher = customerPasswordHasher;
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
            user.AuthProvider,
            user.Onboarding,
            null
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

            var existingUser = await _repository
                .Users.Include(u => u.Organization)
                .FirstOrDefaultAsync(u => u.Email == googleUser.Email);

            if (existingUser != null)
            {
                if (existingUser.AuthProvider != AuthProvider.Google)
                {
                    existingUser.AuthProvider = AuthProvider.Google;
                    await _repository.SaveChangesAsync();
                }

                var token = _tokenManager.GenerateUserToken(existingUser);
                var orgResponse =
                    existingUser.Organization != null
                        ? new GetOrgResponse(
                            existingUser.Organization.Id,
                            existingUser.Organization.Name,
                            existingUser.Organization.Slug,
                            existingUser.Organization.Url,
                            existingUser.Organization.IconUrl
                        )
                        : null;

                var userData = new UserDataResponse(
                    existingUser.Id,
                    existingUser.Email,
                    existingUser.Username,
                    existingUser.AvatarUrl,
                    existingUser.CreatedAt,
                    existingUser.AuthProvider,
                    existingUser.Onboarding,
                    orgResponse
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
                newUser.AuthProvider,
                newUser.Onboarding,
                null
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
        var user = await _repository
            .Users.Include(u => u.Organization)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return Result.Fail("User not found");
        }

        var orgResponse =
            user.Organization != null
                ? new GetOrgResponse(
                    user.Organization.Id,
                    user.Organization.Name,
                    user.Organization.Slug,
                    user.Organization.Url,
                    user.Organization.IconUrl
                )
                : null;

        var response = new UserDataResponse(
            user.Id,
            user.Email,
            user.Username,
            user.AvatarUrl,
            user.CreatedAt,
            user.AuthProvider,
            user.Onboarding,
            orgResponse
        );

        return Result.Ok(response);
    }

    public async Task<Result<AuthResponse>> EmailSignIn(EmailSignInRequest request)
    {
        var validationResult = new SignInValidator().Validate(request);
        if (!validationResult.IsValid)
            return Result.Fail([.. validationResult.Errors.Select(e => e.ErrorMessage)]);

        // Check if the identifier is an email or username
        var user = await _repository
            .Users.Include(u => u.Organization)
            .FirstOrDefaultAsync(u =>
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

        var orgResponse =
            user.Organization != null
                ? new GetOrgResponse(
                    user.Organization.Id,
                    user.Organization.Name,
                    user.Organization.Slug,
                    user.Organization.Url,
                    user.Organization.IconUrl
                )
                : null;

        var userData = new UserDataResponse(
            user.Id,
            user.Email,
            user.Username,
            user.AvatarUrl,
            user.CreatedAt,
            user.AuthProvider,
            user.Onboarding,
            orgResponse
        );

        return Result.Ok(new AuthResponse(token, userData));
    }

    // Customer Auth Methods
    public async Task<Result<CustomerAuthResponse>> CustomerSignUp(CustomerSignUpRequest request)
    {
        var isEmailTaken = await _repository.Customers.AnyAsync(c => c.Email == request.Email);
        if (isEmailTaken)
            return Result.Fail("Email already exists");

        var validationResult = new CustomerAuthValidator().Validate(request);

        if (!validationResult.IsValid)
            return Result.Fail([.. validationResult.Errors.Select(e => e.ErrorMessage)]);

        var customer = new CustomerModel()
        {
            Username = request.Username,
            Email = request.Email,
            AuthProvider = AuthProvider.Email,
        };

        customer.PasswordHash = _customerPasswordHasher.HashPassword(customer, request.Password);

        await _repository.Customers.AddAsync(customer);
        await _repository.SaveChangesAsync();

        var token = _tokenManager.GenerateCustomerToken(customer);
        var customerData = new CustomerDataResponse(
            customer.Id,
            customer.Email,
            customer.Username,
            customer.AvatarUrl,
            customer.CreatedAt,
            customer.AuthProvider,
            customer.Organizations
        );

        return Result.Ok(new CustomerAuthResponse(token, customerData));
    }

    public async Task<Result<CustomerAuthResponse>> CustomerSignIn(CustomerSignInRequest request)
    {
        var validationResult = new CustomerSignInValidator().Validate(request);
        if (!validationResult.IsValid)
            return Result.Fail([.. validationResult.Errors.Select(e => e.ErrorMessage)]);

        // Check if the identifier is an email or username
        var customer = await _repository.Customers
            .FirstOrDefaultAsync(c =>
                c.Email == request.UserIdentifier || c.Username == request.UserIdentifier
            );

        if (customer == null)
            return Result.Fail("Invalid credentials");

        if (customer.AuthProvider != AuthProvider.Email)
            return Result.Fail($"Please sign in with {customer.AuthProvider.GetDisplayName()}");

        // Verify password
        var passwordVerificationResult = _customerPasswordHasher.VerifyHashedPassword(
            customer,
            customer.PasswordHash,
            request.Password
        );

        if (passwordVerificationResult == PasswordVerificationResult.Failed)
            return Result.Fail("Invalid credentials");

        var token = _tokenManager.GenerateCustomerToken(customer);
        var customerData = new CustomerDataResponse(
            customer.Id,
            customer.Email,
            customer.Username,
            customer.AvatarUrl,
            customer.CreatedAt,
            customer.AuthProvider,
            customer.Organizations
        );

        return Result.Ok(new CustomerAuthResponse(token, customerData));
    }

    public async Task<Result<CustomerAuthResponse>> CustomerGoogleAuth(GoogleAuthRequest request)
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

            var existingCustomer = await _repository
                .Customers
                .FirstOrDefaultAsync(c => c.Email == googleUser.Email);

            if (existingCustomer != null)
            {
                if (existingCustomer.AuthProvider != AuthProvider.Google)
                {
                    existingCustomer.AuthProvider = AuthProvider.Google;
                }

                // Update basic profile if changed
                existingCustomer.Username = existingCustomer.Username ?? googleUser.Username;
                existingCustomer.AvatarUrl = existingCustomer.AvatarUrl ?? googleUser.AvatarUrl;
                existingCustomer.GoogleId = existingCustomer.GoogleId ?? googleUser.Id;

                await _repository.SaveChangesAsync();

                var token = _tokenManager.GenerateCustomerToken(existingCustomer);
                var customerData = new CustomerDataResponse(
                    existingCustomer.Id,
                    existingCustomer.Email,
                    existingCustomer.Username,
                    existingCustomer.AvatarUrl,
                    existingCustomer.CreatedAt,
                    existingCustomer.AuthProvider,
                    existingCustomer.Organizations
                );

                return Result.Ok(new CustomerAuthResponse(token, customerData));
            }

            var newCustomer = new CustomerModel
            {
                Email = googleUser.Email,
                Username = googleUser.Username,
                AvatarUrl = googleUser.AvatarUrl,
                GoogleId = googleUser.Id,
                AuthProvider = AuthProvider.Google,
            };

            await _repository.Customers.AddAsync(newCustomer);
            await _repository.SaveChangesAsync();

            var newToken = _tokenManager.GenerateCustomerToken(newCustomer);
            var newCustomerData = new CustomerDataResponse(
                newCustomer.Id,
                newCustomer.Email,
                newCustomer.Username,
                newCustomer.AvatarUrl,
                newCustomer.CreatedAt,
                newCustomer.AuthProvider,
                newCustomer.Organizations
            );
            return Result.Ok(new CustomerAuthResponse(newToken, newCustomerData));
        }
        catch (Exception ex)
        {
            return Result.Fail($"Error processing Google sign-in: {ex.Message}");
        }
    }

    public async Task<Result<CustomerDataResponse>> GetCustomerData(Guid customerId)
    {
        var customer = await _repository.Customers
            .FirstOrDefaultAsync(c => c.Id == customerId);

        if (customer == null)
        {
            return Result.Fail("Customer not found");
        }

        var response = new CustomerDataResponse(
            customer.Id,
            customer.Email,
            customer.Username,
            customer.AvatarUrl,
            customer.CreatedAt,
            customer.AuthProvider,
            customer.Organizations
        );

        return Result.Ok(response);
    }

    public async Task<Result<CustomerDataResponse>> SelectOrganization(Guid customerId, SelectOrganizationRequest request)
    {
        // Verify the organization exists
        var organization = await _repository.Organizations
            .FirstOrDefaultAsync(o => o.Slug == request.OrganizationSlug);

        if (organization == null)
        {
            return Result.Fail("Organization not found");
        }

        // Get the customer
        var customer = await _repository.Customers
            .FirstOrDefaultAsync(c => c.Id == customerId);

        if (customer == null)
        {
            return Result.Fail("Customer not found");
        }

        // Add organization to customer's list if not already present
        if (!customer.Organizations.Contains(request.OrganizationSlug))
        {
            customer.Organizations.Add(request.OrganizationSlug);
            await _repository.SaveChangesAsync();
        }

        // Return updated customer data
        var customerData = new CustomerDataResponse(
            customer.Id,
            customer.Email,
            customer.Username,
            customer.AvatarUrl,
            customer.CreatedAt,
            customer.AuthProvider,
            customer.Organizations
        );

        return Result.Ok(customerData);
    }
}
