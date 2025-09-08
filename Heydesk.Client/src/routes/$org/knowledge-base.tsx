import { createFileRoute } from "@tanstack/react-router";
import DocumentsTable from "@/components/org/knowledge-base/documents-table";
import { ActionCard } from "@/components/action-card";
import { GlobeIcon, FileText, TypeIcon } from "lucide-react";

export const Route = createFileRoute("/$org/knowledge-base")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="mb-4 flex flex-wrap items-stretch gap-4">
          <ActionCard
            title="Add URL"
            icon={<GlobeIcon size={22} />}
            onClick={() => {}}
          />
          <ActionCard
            title="Add Files"
            icon={<FileText size={22} />}
            onClick={() => {}}
          />
          <ActionCard
            title="Create Text"
            icon={<TypeIcon size={22} />}
            onClick={() => {}}
          />
        </div>
        <DocumentsTable />
      </div>
    </div>
  );
}
