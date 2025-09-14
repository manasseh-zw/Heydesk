import { useEffect } from "react";
import { useStore } from "@tanstack/react-store";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authState } from "@/lib/state/auth.state";
import { notifications } from "@/lib/services/notifications.service";

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

      off = notifications.onAny((n) => {
        console.log("Notification received", n);

        // Check if this is a document ingestion notification
        if (n.title?.includes("Document") || n.message?.includes("ingestion")) {
          if (n.message?.includes("Starting"))
            toast("Starting document ingestion");
          else if (n.message?.includes("progress"))
            toast.info("Document ingestion in progress");
          else if (n.message?.includes("success"))
            toast.success("Document ingested successfully");
          else if (n.message?.includes("failed"))
            toast.error("Document ingestion failed");

          queryClient.invalidateQueries({
            queryKey: ["documents", organization.id],
          });
        }
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
