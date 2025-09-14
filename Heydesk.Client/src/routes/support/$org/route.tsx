import { SupportHeader } from "@/components/support/support-header";
import SupportSidebar from "@/components/support/support-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/support/$org")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SidebarProvider
      className="bg-sidebar"
      style={{ "--sidebar-width": "25rem" } as React.CSSProperties}
    >
      <SupportSidebar />
      <SidebarInset>
        <SupportHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col">
            <main className="flex-1">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
