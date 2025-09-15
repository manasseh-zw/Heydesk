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
  customer: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
};

export type GetTicketsResponse = {
  tickets: Ticket[];
  totalCount: number;
};

export type GetTicketsRequest = {
  page?: number;
  pageSize?: number;
};

// Conversation types
export type ConversationMessage = {
  id: string;
  timestamp: string; // ISO
  senderType: "Customer" | "HumanAgent" | "AiAgent";
  senderId?: string | null;
  senderName: string;
  senderAvatarUrl?: string | null;
  content: string;
};

export type Conversation = {
  id: string;
  startedAt: string;
  messages: ConversationMessage[];
};

export type GetTicketWithConversationResponse = {
  ticket: Ticket;
  conversation: Conversation;
};


