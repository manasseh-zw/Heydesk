using dotenv.net;

namespace Heydesk.Server.Config;

public static class AppConfig
{
    public static void Initialize()
    {
        //get the current environment
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

        //if in development load from .env file else will get from host
        if (string.Equals(environment, "Development"))
        {
            DotEnv.Load();
        }
    }

    public static Database Database { get; } =
        new(
            Environment.GetEnvironmentVariable("LOCAL_DATABASE")
                ?? throw new Exception("Local Database Connection String is not set"),
            Environment.GetEnvironmentVariable("CLOUD_DATABASE")
                ?? throw new Exception("Cloud Database Connection String is not set")
        );

    public static Client Client { get; } =
        new(
            Environment.GetEnvironmentVariable("CLIENT_URL")
                ?? throw new Exception("Client URL is not set")
        );

    public static AzureAI AzureAI { get; } =
        new(
            Environment.GetEnvironmentVariable("AZURE_AI_ENDPOINT")
                ?? throw new Exception("AZURE ENDPOINT is not set"),
            Environment.GetEnvironmentVariable("AZURE_AI_APIKEY")
                ?? throw new Exception("AZURE APIKEY is not set")
        );

    public static JwtOptions JwtOptions { get; } =
        new(
            Environment.GetEnvironmentVariable("JWT_SECRET")
                ?? throw new Exception("JWT secret key is not set"),
            Environment.GetEnvironmentVariable("JWT_ISSUER")
                ?? throw new Exception("JWT issuer is not set"),
            Environment.GetEnvironmentVariable("JWT_AUDIENCE")
                ?? throw new Exception("JWT audience is not set")
        );
}

public record Database(string LocalConnectionString, string CloudConnectionString);

public record Client(string Url);

public record AzureAI(string Endpoint, string ApiKey);

public record JwtOptions(string Secret, string Issuer, string Audience);
