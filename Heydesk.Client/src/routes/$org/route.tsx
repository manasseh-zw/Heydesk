import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/$org")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main>
      this is the layout for the organization route
      <Outlet />
    </main>
  );
}
