using Microsoft.AspNetCore.SignalR;

namespace Heydesk.Server.Domains.Notifications;

public class NotificationsPublisher : INotificationsPublisher
{
    private readonly IHubContext<NotificationsHub, INotificationsClient> _hub;

    public NotificationsPublisher(IHubContext<NotificationsHub, INotificationsClient> hub)
    {
        _hub = hub;
    }

    public Task PublishToOrganizationAsync<T>(
        Guid organizationId,
        Notification<T> notification,
        CancellationToken ct = default
    )
    {
        return _hub.Clients.Group($"org:{organizationId}").Notify(notification);
    }

    public Task PublishToUserAsync<T>(
        Guid userId,
        Notification<T> notification,
        CancellationToken ct = default
    )
    {
        return _hub.Clients.Group($"user:{userId}").Notify(notification);
    }
}


