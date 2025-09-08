import { apiRequest } from "@/lib/api";
import type {
  Document,
  GetDocumentsRequest,
  GetDocumentsResponse,
  IngestDocumentRequest,
  IngestTextRequest,
  IngestUrlRequest,
  IngestionSseEvent,
} from "@/lib/types/document";

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
export const subscribeToIngestion = (
  organizationId: string,
  onEvent: (evt: IngestionSseEvent) => void
): (() => void) => {
  const url = new URL(
    `/api/organizations/${organizationId}/documents/ingest/stream`,
    window.location.origin
  );
  const evtSource = new EventSource(url.toString(), { withCredentials: true });

  evtSource.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data) as IngestionSseEvent;
      onEvent(data);
    } catch (_err) {
      // ignore malformed events
    }
  };

  evtSource.onerror = () => {
    // Let caller decide to resubscribe if needed
    evtSource.close();
  };

  return () => evtSource.close();
};


