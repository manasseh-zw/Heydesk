import { createFileRoute } from "@tanstack/react-router";
import DocumentsTable from "@/components/org/knowledge-base/documents-table";
import { ActionCard } from "@/components/action-card";
import { GlobeIcon, FileText, TypeIcon } from "lucide-react";
import { authState } from "@/lib/state/auth.state";
import { documentsQueryOptions } from "@/lib/services/documents.service";

export const Route = createFileRoute("/$org/knowledge-base")({
  loader: async ({ context }) => {
    const orgId = authState.state.organization?.id;
    if (!orgId) return null;
    const query = documentsQueryOptions(orgId, { page: 1, pageSize: 10 });
    await context.queryClient.ensureQueryData(query);
    return null;
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4 py-10 md:gap-6 md:py-12">
      <div className="px-4 lg:px-6">
        <div className="mb-7 flex flex-wrap items-stretch gap-4">
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
