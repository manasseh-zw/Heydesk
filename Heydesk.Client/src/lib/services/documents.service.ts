import { apiRequest } from "@/lib/api";
import type {
  Document,
  GetDocumentsRequest,
  GetDocumentsResponse,
  IngestDocumentRequest,
  IngestTextRequest,
  IngestUrlRequest,
} from "@/lib/types/document";
import { queryOptions } from "@tanstack/react-query";

export const getDocuments = async (
  organizationId: string,
  params: GetDocumentsRequest = {}
): Promise<GetDocumentsResponse> => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.pageSize) searchParams.set("pageSize", params.pageSize.toString());

  const queryString = searchParams.toString();
  const url = `/api/organizations/${organizationId}/documents${queryString ? `?${queryString}` : ""}`;
  return apiRequest<GetDocumentsResponse>(url);
};

export const documentsQueryOptions = (
  organizationId: string,
  params: GetDocumentsRequest = {}
) =>
  queryOptions({
    queryKey: ["documents", organizationId, params],
    queryFn: () => getDocuments(organizationId, params),
    staleTime: 30_000,
  });

export const ingestUrl = async (
  organizationId: string,
  payload: IngestUrlRequest
): Promise<Document> => {
  return apiRequest<Document>(
    `/api/organizations/${organizationId}/documents/ingest/url`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
};

export const ingestText = async (
  organizationId: string,
  payload: IngestTextRequest
): Promise<Document> => {
  return apiRequest<Document>(
    `/api/organizations/${organizationId}/documents/ingest/text`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
};

export const ingestDocument = async (
  organizationId: string,
  payload: IngestDocumentRequest
): Promise<Document> => {
  const form = new FormData();
  form.append("Name", payload.name);
  form.append("File", payload.file);

  return apiRequest<Document>(
    `/api/organizations/${organizationId}/documents/ingest/document`,
    {
      method: "POST",
      body: form,
    }
  );
};

// SSE subscription for ingestion status updates
// SSE removed in favor of SignalR notifications


