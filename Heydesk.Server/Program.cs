using System.Text.Json.Serialization;
using Heydesk.Server.Config;
using Heydesk.Server.Data.Models;
using Heydesk.Server.Domains.Document.Workflows;
using Heydesk.Server.Domains.Notifications;
using Heydesk.Server.Domains.Agent.Chat;
using Heydesk.Server.Extensions;
using Microsoft.AspNetCore.Identity;

var builder = WebApplication.CreateBuilder(args);

AppConfig.Initialize();

builder.Services.AddOpenApi();
builder.Services.ConfigureDatabase();
builder.Services.ConfigureAuthentication();
builder.Services.AddAuthorization();
builder.Services.AddControllers().AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    }); ;

builder.Services.AddSingleton<IPasswordHasher<UserModel>, PasswordHasher<UserModel>>();

// Configure all domain services
builder.Services.ConfigureDomainServices();
builder.Services.ConfigureSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "heydesk",
        policy =>
        {
            policy
                .WithOrigins(
                    AppConfig.Client.Url,
                    "https://www.heydesk.cc",
                    "https://heydesk.cc",
                    "http://localhost:3000",
                    "http://localhost:5173"
                )
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
app.MapHub<NotificationsHub>("/hubs/notifications").RequireAuthorization();
app.MapHub<ChatHub>("/hubs/chat");

// Notifications hub exposed at /hubs/notifications
// Chat hub exposed at /hubs/chat

app.UseExceptionHandler(options => { });

app.Run();
