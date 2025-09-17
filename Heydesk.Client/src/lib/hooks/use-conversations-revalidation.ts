import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useHubConnection } from "./use-hub-connection";

export function useConversationsRevalidation(
  organizationId: string | undefined
) {
  const queryClient = useQueryClient();
  const { connection } = useHubConnection();

  useEffect(() => {
    if (!connection || !organizationId) return;

    const handleConversationsUpdated = () => {
      // Invalidate and refetch conversations for this organization
      queryClient.invalidateQueries({
        queryKey: ["conversations", organizationId],
      });
    };

    // Join the organization group when component mounts
    const joinGroup = async () => {
      try {
        await connection.invoke("JoinOrganizationGroup", organizationId);
      } catch (error) {
        console.error("Failed to join organization group:", error);
      }
    };

    // Leave the organization group when component unmounts
    const leaveGroup = async () => {
      try {
        await connection.invoke("LeaveOrganizationGroup", organizationId);
      } catch (error) {
        console.error("Failed to leave organization group:", error);
      }
    };

    // Set up event listeners
    connection.on("ConversationsUpdated", handleConversationsUpdated);

    // Join the group
    joinGroup();

    // Cleanup
    return () => {
      connection.off("ConversationsUpdated", handleConversationsUpdated);
      leaveGroup();
    };
  }, [connection, organizationId, queryClient]);
}
