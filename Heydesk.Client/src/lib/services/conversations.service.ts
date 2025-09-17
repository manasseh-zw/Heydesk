import { apiRequest } from "../api";

export type SenderType = "Customer" | "HumanAgent" | "AiAgent";

export type MessageResponse = {
  id: string;
  timestamp: string;
  senderType: SenderType;
  senderId?: string | null;
  senderName: string;
  senderAvatarUrl?: string | null;
  content: string;
};

export type ConversationSummary = {
  id: string;
  title: string;
  startedAt: string;
  lastMessageAt?: string | null;
  previewMessages: MessageResponse[];
  isTicketTied: boolean;
  ticketId?: string | null;
};

export type GetConversationsRequest = {
  page?: number;
  pageSize?: number;
};

export type GetConversationsResponse = {
  conversations: ConversationSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type GetConversationWithMessagesResponse = {
  id: string;
  title: string;
  startedAt: string;
  messages: MessageResponse[];
  isTicketTied: boolean;
  ticketId?: string | null;
};

export const conversationsService = {
  async getConversations(
    organizationId: string,
    request: GetConversationsRequest = {}
  ): Promise<GetConversationsResponse> {
    const params = new URLSearchParams();
    if (request.page) params.append("page", request.page.toString());
    if (request.pageSize) params.append("pageSize", request.pageSize.toString());

    const queryString = params.toString();
    const url = `/api/organizations/${organizationId}/conversations${queryString ? `?${queryString}` : ""}`;
    
    return apiRequest<GetConversationsResponse>(url);
  },

  async getConversationWithMessages(
    organizationId: string,
    conversationId: string
  ): Promise<GetConversationWithMessagesResponse> {
    return apiRequest<GetConversationWithMessagesResponse>(
      `/api/organizations/${organizationId}/conversations/${conversationId}`
    );
  },
};
