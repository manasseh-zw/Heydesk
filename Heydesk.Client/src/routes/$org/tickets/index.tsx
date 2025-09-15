import { createFileRoute } from "@tanstack/react-router";
import { TicketsTable } from "@/components/org/tickets";
import { authState } from "@/lib/state/auth.state";
import { ticketsQueryOptions } from "@/lib/services/tickets.service";

export const Route = createFileRoute("/$org/tickets/")({
  loader: async ({ context }) => {
    const orgId = authState.state.organization?.id;
    if (!orgId) return null;
    const query = ticketsQueryOptions(orgId, { page: 1, pageSize: 10 });
    await context.queryClient.ensureQueryData(query);
    return null;
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <TicketsTable />;
}
