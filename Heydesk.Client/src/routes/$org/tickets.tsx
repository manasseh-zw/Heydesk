import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$org/tickets")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4 py-3 md:gap-6 ">
      <div className="px-4 lg:px-6">
        <Outlet />
      </div>
    </div>
  );
}
