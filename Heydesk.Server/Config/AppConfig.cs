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
        new Database(
            Environment.GetEnvironmentVariable("LOCAL_DATABASE")
                ?? throw new Exception("Local Database Connection String is not set"),
            Environment.GetEnvironmentVariable("CLOUD_DATABASE")
                ?? throw new Exception("Cloud Database Connection String is not set")
        );

    public static Client Client { get; } =
        new Client(
            Environment.GetEnvironmentVariable("CLIENT_URL")
                ?? throw new Exception("Client URL is not set")
        );

    public static AzureAI AzureAI { get; } =
        new AzureAI(
            Environment.GetEnvironmentVariable("AZURE_AI_ENDPOINT")
                ?? throw new Exception("AZURE ENDPOINT is not set"),
            Environment.GetEnvironmentVariable("AZURE_AI_APIKEY")
                ?? throw new Exception("AZURE APIKEY is not set")
        );
}

public record Database(string LocalConnectionString, string CloudConnectionString);

public record Client(string Url);

public record AzureAI(string Endpoint, string ApiKey);
