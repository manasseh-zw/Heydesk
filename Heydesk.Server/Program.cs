using Heydesk.Server.Config;
using Heydesk.Server.Data.Models;
using Heydesk.Server.Domains.Auth;
using Heydesk.Server.Domains.Organization;
using Heydesk.Server.Extensions;
using Microsoft.AspNetCore.Identity;

var builder = WebApplication.CreateBuilder(args);

AppConfig.Initialize();

builder.Services.AddOpenApi();
builder.Services.ConfigureDatabase();
builder.Services.ConfigureAuthentication();
builder.Services.AddAuthorization();
builder.Services.AddControllers();

builder.Services.AddSingleton<IPasswordHasher<UserModel>, PasswordHasher<UserModel>>();
builder.Services.AddScoped<ITokenManager, TokenManager>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Organization services
builder.Services.AddScoped<IOrgService, OrgService>();

builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "heydesk",
        policy =>
        {
            policy
                .WithOrigins(AppConfig.Client.Url)
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        }
    );
});
builder.Services.AddHttpClient(
    "Google",
    client =>
    {
        client.BaseAddress = new Uri("https://www.googleapis.com/");
        client.DefaultRequestHeaders.Add("User-Agent", "Heydesk/1.0");
    }
);

var app = builder.Build();

app.MapOpenApi();

app.UseCors("heydesk");

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers().RequireAuthorization();
app.UseExceptionHandler(options => { });

app.Run();
