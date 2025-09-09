namespace Heydesk.Server.Domains.Notifications;

public record SimpleNotification(
    string Title,
    string Message,
    DateTimeOffset Timestamp,
    string? CorrelationId = null
);

public interface INotificationsClient
{
    Task Notify(SimpleNotification notification);
}

public interface INotificationsPublisher
{
    Task PublishToOrganizationAsync(Guid organizationId, SimpleNotification notification, CancellationToken ct = default);
    Task PublishToUserAsync(Guid userId, SimpleNotification notification, CancellationToken ct = default);
}


