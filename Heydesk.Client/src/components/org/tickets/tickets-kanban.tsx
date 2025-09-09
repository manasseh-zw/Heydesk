import { TicketColumn } from "./ticket-column";
import type { TicketColumnData } from "./types";
import { useStore } from "@tanstack/react-store";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { authState } from "@/lib/state/auth.state";
import { getTickets } from "@/lib/services/tickets.service";
import type { GetTicketsResponse, Ticket } from "@/lib/types/ticket";

function buildColumns(tickets: Ticket[]): TicketColumnData[] {
  const grouped: Record<string, Ticket[]> = {
    Open: [],
    Escalated: [],
    Closed: [],
  };
  tickets.forEach((t) => grouped[t.status]?.push(t));

  return [
    {
      id: "active",
      title: "Active",
      color: "#3A8AFF",
      tickets: grouped.Open.map(mapToCard),
    },
    {
      id: "escalated",
      title: "Escalated",
      color: "#ffd166",
      tickets: grouped.Escalated.map(mapToCard),
    },
    {
      id: "resolved",
      title: "Resolved",
      color: "#a5be00",
      tickets: grouped.Closed.map(mapToCard),
    },
  ];
}

function mapToCard(t: Ticket) {
  // TicketColumnData expects Ticket from local types; reuse minimal shape with id/title
  return {
    id: t.id,
    title: t.subject,
    description: t.context ?? undefined,
    assignee: t.assignedTo
      ? {
          name: t.assignedTo.name,
          avatarUrl: t.assignedTo.avatarUrl ?? undefined,
        }
      : undefined,
  } as unknown as any;
}

export function TicketsKanban() {
  const { organization } = useStore(authState);
  const orgId = organization?.id;
  const query = useQuery<GetTicketsResponse, Error>({
    queryKey: ["tickets", orgId, { page: 1, pageSize: 50 }],
    queryFn: () =>
      orgId
        ? getTickets(orgId, { page: 1, pageSize: 50 })
        : Promise.resolve({ tickets: [], totalCount: 0 }),
    enabled: !!orgId,
    placeholderData: keepPreviousData,
  });

  const tickets = query.data?.tickets ?? [];
  const columns: TicketColumnData[] = buildColumns(tickets);
  const total = tickets.length;

  if (query.isLoading) {
    return (
      <div className="text-center py-10 text-sm text-muted-foreground">
        Loading tickets...
      </div>
    );
  }
  if (query.isError) {
    return (
      <div className="text-center py-10 text-sm text-destructive">
        {(query.error as Error).message || "Failed to load tickets."}
      </div>
    );
  }
  if (total === 0) {
    return (
      <div className="text-center py-16 text-sm text-muted-foreground">
        No tickets yet.
      </div>
    );
  }

  return (
    <div className="">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {columns.map((column) => (
          <TicketColumn key={column.id} column={column} />
        ))}
      </div>
    </div>
  );
}

export default TicketsKanban;
