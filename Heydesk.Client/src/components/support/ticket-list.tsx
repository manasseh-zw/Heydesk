import { ScrollArea } from "@/components/ui/scroll-area";
import type { Ticket } from "./data";
import { TicketCard } from "./ticket-card";

type Props = {
  items: Ticket[];
  activeId?: string | null;
  onSelect?: (t: Ticket) => void;
};

export function TicketList({ items, activeId, onSelect }: Props) {
  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((t) => (
          <TicketCard
            key={t.id}
            ticket={t}
            isActive={activeId === t.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
