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
      console.log("ConversationsUpdated signal received for org:", organizationId);
      // Invalidate and refetch conversations for this organization
      queryClient.invalidateQueries({
        queryKey: ["conversations", organizationId],
      });
      console.log("Invalidated queries for org:", organizationId);
    };

    // Join the organization group when component mounts
    const joinGroup = async () => {
      try {
        console.log("Joining organization group:", organizationId);
        await connection.invoke("JoinOrganizationGroup", organizationId);
        console.log("Successfully joined organization group:", organizationId);
      } catch (error) {
        console.error("Failed to join organization group:", error);
      }
    };

    // Leave the organization group when component unmounts
    const leaveGroup = async () => {
      try {
        console.log("Leaving organization group:", organizationId);
        await connection.invoke("LeaveOrganizationGroup", organizationId);
        console.log("Successfully left organization group:", organizationId);
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
