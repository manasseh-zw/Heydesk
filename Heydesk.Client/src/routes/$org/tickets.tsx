import { createFileRoute } from "@tanstack/react-router";
import { TicketsKanban, TicketsTable } from "@/components/org/tickets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/$org/tickets")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4 py-3 md:gap-6 ">
      <div className="px-4 lg:px-6">
        <Tabs defaultValue="table">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="table">
            <TicketsTable />
          </TabsContent>
          <TabsContent value="kanban">
            <TicketsKanban />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
