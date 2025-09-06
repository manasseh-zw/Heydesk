import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/support")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main>
      Hello /support outlet
      <Outlet />
    </main>
  );
}
