import { apiRequest } from "@/lib/api";
import type {
  GetTicketsRequest,
  GetTicketsResponse,
  GetTicketWithConversationResponse,
} from "@/lib/types/ticket";
import { queryOptions } from "@tanstack/react-query";

export const getTickets = async (
  organizationId: string,
  params: GetTicketsRequest = {}
): Promise<GetTicketsResponse> => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.pageSize) searchParams.set("pageSize", params.pageSize.toString());

  const queryString = searchParams.toString();
  const url = `/api/organizations/${organizationId}/tickets${queryString ? `?${queryString}` : ""}`;
  return apiRequest<GetTicketsResponse>(url);
};

export const ticketsQueryOptions = (
  organizationId: string,
  params: GetTicketsRequest = {}
) =>
  queryOptions({
    queryKey: ["tickets", organizationId, params],
    queryFn: () => getTickets(organizationId, params),
    staleTime: 30_000,
  });


export const getTicketWithConversation = async (
  organizationId: string,
  ticketId: string
): Promise<GetTicketWithConversationResponse> => {
  const url = `/api/organizations/${organizationId}/tickets/${ticketId}/with-conversation`;
  return apiRequest<GetTicketWithConversationResponse>(url);
};

export const ticketWithConversationQueryOptions = (
  organizationId: string,
  ticketId: string
) =>
  queryOptions({
    queryKey: ["ticket-with-conversation", organizationId, ticketId],
    queryFn: () => getTicketWithConversation(organizationId, ticketId),
    staleTime: 15_000,
  });


