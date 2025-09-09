import { createFileRoute } from "@tanstack/react-router";
import { ChartAreaInteractive } from "@/components/org/dashboard/chart-area-interactive";
import { SectionCards } from "@/components/org/dashboard/section-cards";

export const Route = createFileRoute("/$org/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
    </div>
  );
}
