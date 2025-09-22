import { useQuery } from "@tanstack/react-query";
import { conversationsService, type GetConversationsRequest } from "../services/conversations.service";

export function useConversations(
  organizationId: string | undefined,
  request: GetConversationsRequest = {}
) {
  return useQuery({
    queryKey: ["conversations", organizationId, request.page, request.pageSize],
    queryFn: () => conversationsService.getConversations(organizationId!, request),
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useConversationWithMessages(
  organizationId: string | undefined,
  conversationId: string | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["conversation", organizationId, conversationId],
    queryFn: () => conversationsService.getConversationWithMessages(organizationId!, conversationId!),
    enabled: (options?.enabled ?? true) && !!organizationId && !!conversationId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
