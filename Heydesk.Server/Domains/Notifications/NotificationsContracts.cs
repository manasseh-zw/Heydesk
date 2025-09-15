using Heydesk.Server.Utils;

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

public record SendSupportEmailRequest(
    Guid OrganizationId,
    Guid TicketId,
    string To,
    string Subject,
    string HtmlBody,
    string CustomerName
);

public record SendSupportEmailResponse(bool Sent);


