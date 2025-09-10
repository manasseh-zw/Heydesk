import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$org/analytics")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="h-full flex items-center justify-center">
      <p className="text-center">coming soon</p>
    </div>
  );
}
