import { createFileRoute, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/$org/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { org } = useParams({ from: "/$org" });
  return (
    <main>
      <p>this is {org}</p>
    </main>
  );
}
