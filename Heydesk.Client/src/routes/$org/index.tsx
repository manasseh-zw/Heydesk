import { createFileRoute } from "@tanstack/react-router";
import data from "./data.json";
import { ChartAreaInteractive } from "@/components/org/dashboard/chart-area-interactive";
import { ChartBarMixed } from "@/components/org/dashboard/chart-bar-mixed";
import { ChartPieDonut } from "@/components/org/dashboard/chart-pie-donut";
import { DataTable } from "@/components/org/dashboard/data-table";
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
      {/* <DataTable data={data} /> */}
      <div className="flex gap-4 px-4 lg:px-6">
        <div className="basis-1/2">
          <ChartPieDonut />
        </div>
        <div className="basis-1/2">
          <ChartBarMixed />
        </div>
      </div>
    </div>
  );
}
