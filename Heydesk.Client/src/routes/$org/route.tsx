import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/org/layout/app-sidebar";
import { SiteHeader } from "@/components/org/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import NotificationsListener from "@/components/org/NotificationsListener";

export const Route = createFileRoute("/$org")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SidebarProvider className="bg-sidebar">
      <AppSidebar variant="inset" />
      <SidebarInset>
        <NotificationsListener />
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
