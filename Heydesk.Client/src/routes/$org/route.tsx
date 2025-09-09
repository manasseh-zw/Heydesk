import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/org/dashboard/app-sidebar";
import { SiteHeader } from "@/components/org/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import IngestionEventsListener from "@/components/org/knowledge-base/IngestionEventsListener";

export const Route = createFileRoute("/$org")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SidebarProvider className="bg-sidebar">
      <AppSidebar variant="inset" />
      <SidebarInset>
        <IngestionEventsListener />
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <main className="p-5">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
