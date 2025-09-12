import * as signalR from "@microsoft/signalr";

export interface SenderInfoDto {
  id: string;
  name: string;
  avatarUrl?: string;
  type: "customer" | "ai-agent" | "human-agent";
}

export interface ChatMessageDto {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "human-agent";
  content: string;
  createdAt: string;
  sender: SenderInfoDto;
}

export interface ConversationStateDto {
  conversationId: string;
  state: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  customer?: SenderInfoDto;
  updatedAt: string;
}

export interface StartChatRequest {
  organizationId: string;
  sender: {
    senderId: string;
    senderName: string;
    senderAvatarUrl?: string;
  };
}

export interface ContinueChatRequest {
  conversationId: string;
  message: string;
}

export class ChatClient {
  private connection: signalR.HubConnection | null = null;
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async connect(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl}/hubs/chat`, {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    // Set up event handlers
    this.connection.on("Token", (token: string) => {
      (this as any).handlers?.onToken?.(token);
    });

    this.connection.on("MessageAppended", (message: ChatMessageDto) => {
      (this as any).handlers?.onMessageAppended?.(message);
    });

    this.connection.on("ConversationStateChanged", (state: ConversationStateDto) => {
      (this as any).handlers?.onConversationStateChanged?.(state);
    });

    await this.connection.start();
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  async startChat(request: StartChatRequest): Promise<string> {
    if (!this.connection) {
      await this.connect();
    }

    const conversationId = await this.connection!.invoke<string>("StartChat", request);
    return conversationId;
  }

  async joinConversation(conversationId: string): Promise<void> {
    if (!this.connection) {
      await this.connect();
    }

    await this.connection!.invoke("JoinConversation", conversationId);
  }

  async leaveConversation(conversationId: string): Promise<void> {
    if (!this.connection) {
      return;
    }

    await this.connection!.invoke("LeaveConversation", conversationId);
  }

  async sendUserMessage(conversationId: string, message: string): Promise<void> {
    if (!this.connection) {
      await this.connect();
    }

    const request: ContinueChatRequest = {
      conversationId,
      message,
    };

    await this.connection!.invoke("SendUserMessage", request);
  }

  async endChat(conversationId: string): Promise<void> {
    if (!this.connection) {
      return;
    }

    await this.connection!.invoke("EndChat", conversationId);
  }

  // Type for handlers that can be set externally
  handlers?: {
    onToken?: (token: string) => void;
    onMessageAppended?: (message: ChatMessageDto) => void;
    onConversationStateChanged?: (state: ConversationStateDto) => void;
  };
}
