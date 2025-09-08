export enum AgentType {
  Chat = "Chat",
  Voice = "Voice",
}

export type Agent = {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  systemPrompt: string;
  type: AgentType;
  createdAt: string; // ISO string
};


