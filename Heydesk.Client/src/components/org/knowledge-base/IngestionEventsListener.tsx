import { useEffect } from "react";
import { useStore } from "@tanstack/react-store";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authState } from "@/lib/state/auth.state";
import { subscribeToIngestion } from "@/lib/services/documents.service";
import { DocumentIngestStatus } from "@/lib/types/document";

export default function IngestionEventsListener() {
  const { organization } = useStore(authState);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!organization?.id) return;

    const unsubscribe = subscribeToIngestion(organization.id, (evt) => {
      const status = evt.status;
      if (status === DocumentIngestStatus.Pending) {
        toast("Starting document ingestion");
      } else if (status === DocumentIngestStatus.Processing) {
        toast.info("Document ingestion in progress");
      } else if (status === DocumentIngestStatus.Completed) {
        toast.success("Document ingested successfully");
      } else if (status === DocumentIngestStatus.Failed) {
        toast.error("Document ingestion failed");
      }

      queryClient.invalidateQueries({
        queryKey: ["documents", organization.id],
      });
    });

    return () => unsubscribe();
  }, [organization?.id, queryClient]);

  return null;
}
