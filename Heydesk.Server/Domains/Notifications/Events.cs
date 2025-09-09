namespace Heydesk.Server.Domains.Notifications;

// Documents domain notifications
public record DocumentIngestionUpdatedPayload(Guid OrganizationId, Guid DocumentId, string Status);

// Tickets domain notifications (examples)
public record TicketCreatedPayload(Guid OrganizationId, Guid TicketId, string Summary);
public record TicketStatusChangedPayload(Guid OrganizationId, Guid TicketId, string Status);

// Agents domain notifications (examples)
public record AgentStatusChangedPayload(Guid OrganizationId, Guid AgentId, string Status);


