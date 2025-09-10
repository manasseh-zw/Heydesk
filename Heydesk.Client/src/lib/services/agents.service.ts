import { apiRequest } from "@/lib/api";
import type { Agent, AgentType } from "@/lib/types/agent";
import { queryOptions } from "@tanstack/react-query";

export type CreateAgentRequest = {
  name: string;
  description: string;
  systemPrompt: string;
  type: AgentType;
};

export type GetAgentsResponse = {
  agents: Agent[];
  totalCount: number;
};

export const createAgent = async (
  organizationId: string,
  payload: CreateAgentRequest
): Promise<Agent> => {
  return apiRequest<Agent>(`/api/organizations/${organizationId}/agents`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const getAgents = async (
  organizationId: string,
  params: { page?: number; pageSize?: number } = {}
): Promise<GetAgentsResponse> => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.pageSize) searchParams.set("pageSize", params.pageSize.toString());

  const queryString = searchParams.toString();
  const url = `/api/organizations/${organizationId}/agents${queryString ? `?${queryString}` : ""}`;
  return apiRequest<GetAgentsResponse>(url);
};

export const agentsQueryOptions = (
  organizationId: string,
  params: { page?: number; pageSize?: number } = {}
) =>
  queryOptions({
    queryKey: ["agents", organizationId, params],
    queryFn: () => getAgents(organizationId, params),
    staleTime: 30_000,
  });
