import { createFileRoute } from "@tanstack/react-router";
import { SectionCards } from "@/components/org/dashboard/section-cards";
import { ClippedAreaChart } from "@/components/org/dashboard/clipped-area-chart";
import { RoundedPieChart } from "@/components/org/dashboard/rounded-pie-chart";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/$org/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex justify-between items-center px-4 lg:px-6 mb-2">
        <div className="ml-1">
          <div className=" text-sm text-gray-500 mb-2">My Workspace</div>
          <h1 className="text-3xl ">Good evening, Manasseh</h1>
        </div>
        <div>
          <Badge className="h-10" variant="outline">
            <span className=" inline-block h-2 w-2 rounded-full bg-primary"></span>
            Active calls: 0
          </Badge>
        </div>
      </div>

      <SectionCards />
      <div className="px-4 lg:px-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <ClippedAreaChart />
        </div>
        <div>
          <RoundedPieChart />
        </div>
      </div>
    </div>
  );
}
