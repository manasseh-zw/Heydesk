import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Ticket, AssignedEntityType } from "@/lib/types/ticket";
import BoringAvatar from "boring-avatars";

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const name = ticket.assignedTo?.name ?? "Unassigned";
  const initial = name.charAt(0).toUpperCase();
  const colors = ["#0ea5e9", "#22c55e", "#f59e0b", "#6366f1", "#ec4899"];

  const statusColor = (() => {
    switch (ticket.status) {
      case "Open":
        return "bg-blue-500";
      case "Escalated":
        return "bg-yellow-500";
      case "Closed":
        return "bg-lime-500";
      default:
        return "bg-neutral-400";
    }
  })();

  const avatarEl = (() => {
    if (!ticket.assignedTo) {
      return (
        <BoringAvatar
          name={ticket.id}
          size={26}
          variant="marble"
          colors={colors}
        />
      );
    }
    if (ticket.assignedTo.type === ("HumanAgent" as AssignedEntityType)) {
      if (ticket.assignedTo.avatarUrl) {
        return (
          <Avatar className="size-7">
            <AvatarImage src={ticket.assignedTo.avatarUrl} alt={name} />
            <AvatarFallback className="text-[10px]">{initial}</AvatarFallback>
          </Avatar>
        );
      }
      return (
        <BoringAvatar name={name} size={26} variant="beam" colors={colors} />
      );
    }
    return (
      <BoringAvatar name={name} size={26} variant="marble" colors={colors} />
    );
  })();

  return (
    <Card className="transition-all duration-200 border bg-white/70 dark:bg-neutral-800/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-neutral-700/70">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${statusColor}`}
                aria-hidden="true"
              />
              <Badge variant="outline" className="text-xs">
                {ticket.status}
              </Badge>
            </div>
            <div
              className="font-medium text-neutral-900 dark:text-neutral-100 truncate max-w-[36ch]"
              title={ticket.subject}
            >
              {ticket.subject}
            </div>
            {ticket.context && (
              <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 line-clamp-2">
                {ticket.context}
              </p>
            )}
          </div>
          <div className="shrink-0">{avatarEl}</div>
        </div>
      </CardContent>
    </Card>
  );
}
