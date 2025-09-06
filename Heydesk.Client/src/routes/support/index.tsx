import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/support/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <main>select org</main>;
}
