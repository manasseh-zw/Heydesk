using System.Text;
using Heydesk.Server.Config;
using Heydesk.Server.Data;
using Heydesk.Server.Domains.Auth;
using Heydesk.Server.Domains.Document;
using Heydesk.Server.Domains.Document.Workflows;
using Heydesk.Server.Domains.Document.Processors;
using Heydesk.Server.Integrations;
using Heydesk.Server.Domains.Organization;
using Heydesk.Server.Domains.Agent;
using Heydesk.Server.Utils;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Heydesk.Server.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection ConfigureDatabase(this IServiceCollection services)
    {
        services.AddDbContext<RepositoryContext>(options =>
            options.UseMySql(
                AppConfig.Database.LocalConnectionString,
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
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(
                "Bearer",
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
                            ctx.Request.Cookies.TryGetValue(
                                Constants.AccessTokenCookieName,
                                out var accessToken
                            );

                            if (!string.IsNullOrEmpty(accessToken))
                                ctx.Token = accessToken;

                            return Task.CompletedTask;
                        },
                    };
                }
            );

        return services;
    }

    public static IServiceCollection ConfigureDomainServices(this IServiceCollection services)
    {
        // Auth services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ITokenManager, TokenManager>();

        // Organization services
        services.AddScoped<IOrgService, OrgService>();

        // Document services
        services.AddScoped<IDocumentService, DocumentService>();
        services.AddSingleton<IDocumentIngestEventsQueue<DocumentIngestEvent>, DocumentIngestEventsQueue<DocumentIngestEvent>>();
        services.AddHostedService<DocumentIngestProcessor>();
        services.AddScoped<DocumentIngestEventHandler>();
        services.AddSingleton<IIngestionSseBroker, IngestionSseBroker>();

        // Document processors
        services.AddScoped<IUrlProcessor, UrlProcessor>();
        services.AddScoped<IDocProcessor, DocProcessor>();

        // Vector store service
        services.AddScoped<IVectorStore, VectorStore>();

        // HTTP client for external API calls (Exa)
        services.AddHttpClient<IExaWebScraper, ExaWebScraper>();

        // Agent services
        services.AddScoped<IAgentService, AgentService>();

        return services;
    }

    public static IServiceCollection ConfigureSignalR(this IServiceCollection services)
    {
        // No SignalR; using SSE for ingestion notifications
        return services;
    }
}
