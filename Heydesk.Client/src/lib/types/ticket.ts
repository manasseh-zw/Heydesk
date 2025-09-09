export enum TicketStatus {
  Open = "Open",
  Escalated = "Escalated",
  Closed = "Closed",
}

export enum AssignedEntityType {
  HumanAgent = "HumanAgent",
  AiAgent = "AiAgent",
}

export type AssignedToInfo = {
  id: string;
  name: string;
  avatarUrl?: string | null;
  type: AssignedEntityType;
};

export type Ticket = {
  id: string;
  subject: string;
  context?: string | null;
  status: TicketStatus;
  openedAt: string; // ISO string
  closedAt?: string | null; // ISO string
  assignedTo?: AssignedToInfo | null;
};

export type GetTicketsResponse = {
  tickets: Ticket[];
  totalCount: number;
};

export type GetTicketsRequest = {
  page?: number;
  pageSize?: number;
};


