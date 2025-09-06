import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { TicketCard } from "./TicketCard";
import type { Ticket, TicketColumnData } from "./types";

interface TicketColumnProps {
  column: TicketColumnData;
  onAddTicket?: (columnId: TicketColumnData["id"]) => void;
}

export function TicketColumn({ column, onAddTicket }: TicketColumnProps) {
  return (
    <div className="bg-white/20 dark:bg-neutral-900/20 backdrop-blur-xl rounded-3xl p-4 border border-border dark:border-neutral-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
            {column.title}
          </h3>
          <Badge className="bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 border-neutral-200/50 dark:border-neutral-600/50">
            {column.tickets.length}
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        {column.tickets.map((ticket: Ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </div>
  );
}
