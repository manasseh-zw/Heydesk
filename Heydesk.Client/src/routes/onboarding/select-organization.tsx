import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/onboarding/select-organization")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/support/select-organization"!</div>;
}
