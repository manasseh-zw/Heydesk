import { useEffect } from "react";
import { useStore } from "@tanstack/react-store";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authState } from "@/lib/state/auth.state";
import { notifications } from "@/lib/services/notifications.service";

export default function NotificationsListener() {
  const { organization } = useStore(authState);
  const queryClient = useQueryClient();

  useEffect(() => {
    let offAny: (() => void) | null = null;
    let joined = false;
    const start = async () => {
      if (!organization?.id) return;
      await notifications.start();
      await notifications.joinOrganization(organization.id);
      joined = true;

      offAny = notifications.onAny((n) => {
        console.debug("[NotificationsListener] any", n);
        const { title, message } = n;
        if (title || message) {
          toast(message || title || "");
        }
        // Opportunistically refresh documents list for org
        queryClient.invalidateQueries({
          queryKey: ["documents", organization.id],
        });
      });
    };
    start();

    return () => {
      if (offAny) offAny();
      if (joined) notifications.leaveOrganization(organization!.id);
    };
  }, [organization?.id, queryClient]);

  return null;
}
