import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/$org")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main>
      <Outlet />
    </main>
  );
}
