using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Heydesk.Server.Domains.Notifications;

[Authorize]
public class NotificationsHub : Hub<INotificationsClient>
{
    public override async Task OnConnectedAsync()
    {
        // Join per-user group
        var userId = Context.User?.FindFirst("sub")?.Value;
        if (Guid.TryParse(userId, out var uid))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user:{uid}");
        }

        await base.OnConnectedAsync();
    }
}


