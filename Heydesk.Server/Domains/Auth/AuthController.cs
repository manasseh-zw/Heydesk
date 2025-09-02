using System.Security.Claims;
using Heydesk.Server.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static Heydesk.Server.Domains.Auth.AuthContracts;

namespace Heydesk.Server.Domains.Auth;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("email-sign-up")]
    [AllowAnonymous]
    public async Task<IActionResult> EmailSignUp([FromBody] EmailSignUpRequest request)
    {
        var result = await _authService.EmailSignUp(request);

        if (!result.Success)
            return BadRequest(result.Errors);

        SetAuthCookie(HttpContext, result.Data!.Token);
        return Ok(result.Data.UserData);
    }

    [HttpPost("email-sign-in")]
    [AllowAnonymous]
    public async Task<IActionResult> EmailSignin([FromBody] EmailSignInRequest request)
    {
        var result = await _authService.EmailSignIn(request);

        if (!result.Success)
            return BadRequest(result.Errors);

        SetAuthCookie(HttpContext, result.Data!.Token);
        return Ok(result.Data.UserData);
    }

    [HttpPost("google-auth")]
    [AllowAnonymous]
    public async Task<IActionResult> GoogleAuth([FromBody] GoogleAuthRequest request)
    {
        var result = await _authService.GoogleAuth(request);
        if (!result.Success)
            return BadRequest(result.Errors);

        SetAuthCookie(HttpContext, result.Data!.Token);

        return Ok(result.Data.UserData);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetUserData()
    {
        if (Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            var result = await _authService.GetUserData(userId);
            return result.Success ? Ok(result.Data) : BadRequest(result.Errors);
        }
        return Unauthorized("User not authenticated");
    }

    private static void SetAuthCookie(HttpContext httpContext, string token)
    {
        httpContext.Response.Cookies.Append(
            Constants.AccessTokenCookieName,
            token,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddDays(14),
            }
        );
    }
}
