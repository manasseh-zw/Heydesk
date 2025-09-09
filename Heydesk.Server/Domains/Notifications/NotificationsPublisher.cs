using Microsoft.AspNetCore.SignalR;

namespace Heydesk.Server.Domains.Notifications;

public class NotificationsPublisher : INotificationsPublisher
{
    private readonly IHubContext<NotificationsHub, INotificationsClient> _hub;

    public NotificationsPublisher(IHubContext<NotificationsHub, INotificationsClient> hub)
    {
        _hub = hub;
    }

    public Task PublishToOrganizationAsync(
        Guid organizationId,
        SimpleNotification notification,
        CancellationToken ct = default
    )
    {
        return _hub.Clients.Group($"org:{organizationId}").Notify(notification);
    }

    public Task PublishToUserAsync(
        Guid userId,
        SimpleNotification notification,
        CancellationToken ct = default
    )
    {
        return _hub.Clients.Group($"user:{userId}").Notify(notification);
    }
}


