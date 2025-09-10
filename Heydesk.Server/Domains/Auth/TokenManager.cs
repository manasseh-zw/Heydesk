using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Heydesk.Server.Config;
using Heydesk.Server.Data.Models;
using Microsoft.IdentityModel.Tokens;

namespace Heydesk.Server.Domains.Auth;

public interface ITokenManager
{
    string GenerateUserToken(UserModel user);
    string GenerateCustomerToken(CustomerModel customer);
}

public class TokenManager : ITokenManager
{
    public string GenerateUserToken(UserModel user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(AppConfig.JwtOptions.Secret));

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: AppConfig.JwtOptions.Issuer,
            audience: AppConfig.JwtOptions.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(14),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateCustomerToken(CustomerModel customer)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, customer.Id.ToString()),
            new Claim(ClaimTypes.Email, customer.Email),
            new Claim(ClaimTypes.Name, customer.Username),
            new Claim("user_type", "customer")
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(AppConfig.JwtOptions.Secret));

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: AppConfig.JwtOptions.Issuer,
            audience: AppConfig.JwtOptions.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(14),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
