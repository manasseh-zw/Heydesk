import { useEffect } from "react";
import { useStore } from "@tanstack/react-store";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authState } from "@/lib/state/auth.state";
import { notifications } from "@/lib/services/notifications.service";
import { NotificationType } from "@/lib/types/notifications";

export default function IngestionEventsListener() {
  const { organization } = useStore(authState);
  const queryClient = useQueryClient();

  useEffect(() => {
    let off: (() => void) | null = null;
    let joined = false;
    const start = async () => {
      if (!organization?.id) return;
      await notifications.start();
      try {
        // join org group
        // call server hub method
        // @ts-ignore - we access underlying connection to invoke
        await (notifications as any).connection?.invoke(
          "JoinOrganization",
          organization.id
        );
        joined = true;
      } catch {}

      off = notifications.on(NotificationType.DocumentIngestionUpdated, (n) => {
        console.log("Document ingestion updated", n);

        const status = n.payload.status;
        if (status === "Pending") toast("Starting document ingestion");
        else if (status === "Processing")
          toast.info("Document ingestion in progress");
        else if (status === "Completed")
          toast.success("Document ingested successfully");
        else if (status === "Failed") toast.error("Document ingestion failed");

        queryClient.invalidateQueries({
          queryKey: ["documents", organization.id],
        });
      });
    };
    start();

    return () => {
      if (off) off();
      if (joined) {
        // @ts-ignore
        (notifications as any).connection
          ?.invoke("LeaveOrganization", organization?.id)
          .catch(() => {});
      }
    };
  }, [organization?.id, queryClient]);

  return null;
}
