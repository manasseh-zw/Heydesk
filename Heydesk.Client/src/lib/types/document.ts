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


