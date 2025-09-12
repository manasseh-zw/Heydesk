import { ChatClient, type ChatMessageDto, type ConversationStateDto } from "@/lib/chatClient";
import { config } from "../../../config";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "human-agent";
  content: string;
  sender: {
    id: string;
    name: string;
    avatarUrl?: string;
    type: "customer" | "ai-agent" | "human-agent";
  };
  createdAt: string;
}

export interface ChatServiceHandlers {
  onMessage: (message: ChatMessage) => void;
  onToken: (token: string) => void;
  onStateChange: (state: ConversationStateDto) => void;
  onConnectionChange: (connected: boolean) => void;
}

export class ChatService {
  private client: ChatClient;
  private handlers: ChatServiceHandlers;

  constructor(handlers: ChatServiceHandlers) {
    this.client = new ChatClient(config.serverUrl);
    this.handlers = handlers;
    this.setupClientHandlers();
  }

  private setupClientHandlers() {
    this.client.handlers = {
      onToken: (token: string) => {
        // Stream tokens to UI if needed; no provisional message emission to avoid duplicates
        this.handlers.onToken(token);
      },
      onMessageAppended: (message: ChatMessageDto) => {
        this.handlers.onMessage({
          id: message.id,
          role: message.role as "user" | "assistant" | "human-agent",
          content: message.content,
          sender: message.sender,
          createdAt: message.createdAt,
        });
      },
      onConversationStateChanged: (state: ConversationStateDto) => {
        this.handlers.onStateChange(state);
      },
    };
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.handlers.onConnectionChange(true);
    } catch (error) {
      console.error("Failed to connect to chat:", error);
      this.handlers.onConnectionChange(false);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
    this.handlers.onConnectionChange(false);
  }

  async startChat(organizationId: string, sender: {
    senderId: string;
    senderName: string;
    senderAvatarUrl?: string;
  }): Promise<string> {
    return await this.client.startChat({
      organizationId,
      sender,
    });
  }

  async joinConversation(conversationId: string): Promise<void> {
    await this.client.joinConversation(conversationId);
  }

  async leaveConversation(conversationId: string): Promise<void> {
    await this.client.leaveConversation(conversationId);
  }

  async sendMessage(conversationId: string, message: string): Promise<void> {
    await this.client.sendUserMessage(conversationId, message);
  }

  async endChat(conversationId: string): Promise<void> {
    await this.client.endChat(conversationId);
  }
}
