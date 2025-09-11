import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Ticket } from "./data";

type Props = {
  ticket: Ticket;
  isActive?: boolean;
  onSelect?: (ticket: Ticket) => void;
};

export function TicketCard({ ticket, isActive, onSelect }: Props) {
  return (
    <button
      className={cn(
        "hover:bg-accent hover:text-accent-foreground flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all",
        isActive && "bg-muted"
      )}
      onClick={() => onSelect?.(ticket)}
    >
      <div className="flex w-full items-center gap-2">
        <div className="font-semibold line-clamp-1">{ticket.subject}</div>
        {ticket.unread && (
          <span className="flex h-2 w-2 rounded-full bg-blue-600" />
        )}
        <div className="ml-auto text-xs text-muted-foreground">
          {ticket.ref}
        </div>
      </div>
      <div className="text-xs line-clamp-2 text-muted-foreground">
        {ticket.preview}
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={statusToVariant(ticket.status)}>
          {formatStatus(ticket.status)}
        </Badge>
      </div>
    </button>
  );
}

function statusToVariant(status: Ticket["status"]) {
  switch (status) {
    case "open":
      return "secondary" as const;
    case "in_progress":
      return "default" as const;
    case "resolved":
      return "outline" as const;
    case "escalated":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

function formatStatus(status: Ticket["status"]) {
  return status.replace("_", " ");
}
