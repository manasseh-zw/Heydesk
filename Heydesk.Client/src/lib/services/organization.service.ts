import { apiRequest } from "@/lib/api";
import type {
  Organization,
  CreateOrgRequest,
  GetMembersResponse,
  GetMembersRequest,
} from "@/lib/types/organization";

export const createOrganization = async (
  payload: CreateOrgRequest
): Promise<Organization> => {
  return apiRequest<Organization>("/api/org", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const getOrganizationMembers = async (
  organizationId: string,
  params: GetMembersRequest = {}
): Promise<GetMembersResponse> => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.pageSize) searchParams.set("pageSize", params.pageSize.toString());
  
  const queryString = searchParams.toString();
  const url = `/api/org/${organizationId}/members${queryString ? `?${queryString}` : ""}`;
  
  return apiRequest<GetMembersResponse>(url);
};
