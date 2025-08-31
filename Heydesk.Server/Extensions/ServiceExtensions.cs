using Heydesk.Server.Config;
using Heydesk.Server.Data;
using Microsoft.EntityFrameworkCore;

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
}
