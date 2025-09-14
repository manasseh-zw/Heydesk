using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Heydesk.Server.Data;
using Heydesk.Server.Config;
using Microsoft.AspNetCore.Authorization;

namespace Heydesk.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class HealthController : ControllerBase
{
    private readonly RepositoryContext _context;
    private readonly IHttpClientFactory _httpClientFactory;

    public HealthController(RepositoryContext context, IHttpClientFactory httpClientFactory)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
    }

    [HttpGet]
    public async Task<IActionResult> GetHealth()
    {
        var health = new
        {
            Status = "Healthy",
            Timestamp = DateTime.UtcNow,
            Services = new
            {
                Database = await CheckDatabase(),
                AzureAI = await CheckAzureAI(),
                ExaAI = await CheckExaAI()
            }
        };

        return Ok(health);
    }

    [HttpGet("simple")]
    public IActionResult GetSimpleHealth()
    {
        return Ok(new { Status = "OK", Timestamp = DateTime.UtcNow });
    }

    private async Task<string> CheckDatabase()
    {
        try
        {
            await _context.Database.ExecuteSqlRawAsync("SELECT 1");
            return "Connected";
        }
        catch (Exception ex)
        {
            return $"Error: {ex.Message}";
        }
    }

    private async Task<string> CheckAzureAI()
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            client.BaseAddress = new Uri(AppConfig.AzureAI.Endpoint);
            client.DefaultRequestHeaders.Add("api-key", AppConfig.AzureAI.ApiKey);

            var response = await client.GetAsync("/openai/deployments?api-version=2024-02-15-preview");
            return response.IsSuccessStatusCode ? "Connected" : $"Error: {response.StatusCode}";
        }
        catch (Exception ex)
        {
            return $"Error: {ex.Message}";
        }
    }

    private async Task<string> CheckExaAI()
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            client.BaseAddress = new Uri("https://api.exa.ai");
            client.DefaultRequestHeaders.Add("x-api-key", AppConfig.ExaAI.ApiKey);

            var response = await client.GetAsync("/v1/search?query=test&numResults=1");
            return response.IsSuccessStatusCode ? "Connected" : $"Error: {response.StatusCode}";
        }
        catch (Exception ex)
        {
            return $"Error: {ex.Message}";
        }
    }
}
