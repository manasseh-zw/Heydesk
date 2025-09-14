using System.Text;
using Heydesk.Server.Config;
using Heydesk.Server.Data;
using Heydesk.Server.Data.Models;
using Heydesk.Server.Domains.Agent;
using Heydesk.Server.Domains.Agent.Chat;
using Heydesk.Server.Domains.Auth;
using Heydesk.Server.Domains.Document;
using Heydesk.Server.Domains.Document.Processors;
using Heydesk.Server.Domains.Document.Workflows;
using Heydesk.Server.Domains.Notifications;
using Heydesk.Server.Domains.Organization;
using Heydesk.Server.Domains.Ticket;
using Heydesk.Server.Integrations;
using Heydesk.Server.Utils;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Heydesk.Server.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection ConfigureDatabase(this IServiceCollection services)
    {
        services.AddDbContext<RepositoryContext>(options =>
            options.UseMySql(
                AppConfig.Database.CloudConnectionString,
                ServerVersion.AutoDetect(AppConfig.Database.LocalConnectionString)
            )
        );
        return services;
    }

    public static IServiceCollection ConfigureAuthentication(this IServiceCollection services)
    {
        services
            .AddAuthentication(options =>
            {
                options.DefaultScheme = "Bearer";
            })
            // Policy scheme decides which bearer to use based on cookies
            .AddPolicyScheme(
                "Bearer",
                "Bearer",
                options =>
                {
                    options.ForwardDefaultSelector = context =>
                    {
                        var hasCustomer = context.Request.Cookies.ContainsKey(
                            Constants.CustomerAccessTokenCookieName
                        );
                        return hasCustomer ? "CustomerBearer" : "UserBearer";
                    };
                }
            )
            .AddJwtBearer(
                "UserBearer",
                options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        SaveSigninToken = true,
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = AppConfig.JwtOptions.Issuer,
                        ValidAudience = AppConfig.JwtOptions.Audience,
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(AppConfig.JwtOptions.Secret)
                        ),
                    };
                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = ctx =>
                        {
                            if (
                                ctx.Request.Cookies.TryGetValue(
                                    Constants.AccessTokenCookieName,
                                    out var token
                                ) && !string.IsNullOrEmpty(token)
                            )
                            {
                                ctx.Token = token;
                            }
                            return Task.CompletedTask;
                        },
                    };
                }
            )
            .AddJwtBearer(
                "CustomerBearer",
                options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        SaveSigninToken = true,
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = AppConfig.JwtOptions.Issuer,
                        ValidAudience = AppConfig.JwtOptions.Audience,
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(AppConfig.JwtOptions.Secret)
                        ),
                    };
                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = ctx =>
                        {
                            if (
                                ctx.Request.Cookies.TryGetValue(
                                    Constants.CustomerAccessTokenCookieName,
                                    out var token
                                ) && !string.IsNullOrEmpty(token)
                            )
                            {
                                ctx.Token = token;
                            }
                            return Task.CompletedTask;
                        },
                    };
                }
            );

        return services;
    }

    public static IServiceCollection ConfigureDomainServices(this IServiceCollection services)
    {
        // Add memory cache
        services.AddMemoryCache();

        // Password hashers
        services.AddScoped<IPasswordHasher<UserModel>, PasswordHasher<UserModel>>();
        services.AddScoped<IPasswordHasher<CustomerModel>, PasswordHasher<CustomerModel>>();

        // Auth services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ITokenManager, TokenManager>();

        // Organization services
        services.AddScoped<IOrgService, OrgService>();

        // Document services
        services.AddScoped<IDocumentService, DocumentService>();
        services.AddSingleton<
            IDocumentIngestEventsQueue<DocumentIngestEvent>,
            DocumentIngestEventsQueue<DocumentIngestEvent>
        >();
        services.AddHostedService<DocumentIngestProcessor>();
        services.AddScoped<DocumentIngestEventHandler>();
        services.AddScoped<IDocumentsEvents, DocumentsEvents>();

        // Document processors
        services.AddScoped<IUrlProcessor, UrlProcessor>();
        services.AddScoped<IDocProcessor, DocProcessor>();

        // Vector store service
        services.AddScoped<IVectorStore, VectorStore>();

        // HTTP client for external API calls (Exa)
        services.AddHttpClient<IExaWebScraper, ExaWebScraper>();

        // Agent services
        services.AddScoped<IAgentService, AgentService>();

        // Chat services
        services.AddScoped<ChatAgent>();

        // Ticket services
        services.AddScoped<ITicketService, TicketService>();

        return services;
    }

    public static IServiceCollection ConfigureSignalR(this IServiceCollection services)
    {
        services.AddSignalR();
        services.AddSingleton<INotificationsPublisher, NotificationsPublisher>();
        return services;
    }
}
