export enum DocumentType {
  Url = "Url",
  Document = "Document",
  Text = "Text",
}

export enum DocumentIngestStatus {
  Pending = "Pending",
  Processing = "Processing",
  Completed = "Completed",
  Failed = "Failed",
}

// Mirrors GetDocumentResponse from server
export type Document = {
  id: string;
  name: string;
  type: DocumentType;
  sourceUrl: string | null;
  status: DocumentIngestStatus;
  content?: string | null;
};

export type GetDocumentsResponse = {
  documents: Document[];
  totalCount: number;
};


// Requests mirror server contracts
export type GetDocumentsRequest = {
  page?: number;
  pageSize?: number;
};

export type IngestUrlRequest = {
  url: string;
};

export type IngestTextRequest = {
  name: string;
  content: string;
};

export type IngestDocumentRequest = {
  name: string;
  file: File;
};

// SSE event from /ingest/stream
export type IngestionSseEvent = {
  organizationId: string;
  documentId: string;
  status: DocumentIngestStatus;
};


