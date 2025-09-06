import { createFileRoute } from "@tanstack/react-router";
import { TicketsKanban } from "@/components/org/tickets";

export const Route = createFileRoute("/$org/tickets")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <TicketsKanban />
      </div>
    </div>
  );
}
