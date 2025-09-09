namespace Heydesk.Server.Domains.Notifications;

public enum NotificationType
{
    DocumentIngestionUpdated,
    TicketCreated,
    TicketStatusChanged,
    AgentStatusChanged,
}

public enum NotificationSource
{
    Documents,
    Tickets,
    Agents,
    System,
}

public record Notification<T>(
    NotificationType Type,
    NotificationSource Source,
    T Payload,
    DateTimeOffset Timestamp,
    string? CorrelationId = null
);

public interface INotificationsClient
{
    Task Notify<T>(Notification<T> notification);
}

public interface INotificationsPublisher
{
    Task PublishToOrganizationAsync<T>(Guid organizationId, Notification<T> notification, CancellationToken ct = default);
    Task PublishToUserAsync<T>(Guid userId, Notification<T> notification, CancellationToken ct = default);
}


