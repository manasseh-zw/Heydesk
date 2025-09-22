import React, { useEffect, useMemo, useState } from "react";
import { ChatService, type ChatMessage } from "@/lib/services/chat.service";
import { chatActions } from "@/lib/state/chat.state";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageAvatar,
} from "@/components/ai-elements/message";
import { Streamdown } from "streamdown";
import {
  PromptInput,
  PromptInputButton,
  PromptInputTextarea,
  PromptInputToolbar,
} from "@/components/ai-elements/prompt-input";
import { Send } from "lucide-react";
import Avatar from "boring-avatars";
import { ShiningText } from "@/components/shining-text";
import {
  type GetConversationWithMessagesResponse,
  type MessageResponse,
  type SenderType,
} from "@/lib/services/conversations.service";
import { useConversationWithMessages } from "@/lib/hooks/use-conversations";

interface ChatPageProps {
  chatId: string;
  orgSlug: string;
  organizationId: string;
  // When true, skip fetching conversation history on mount (used for new chat from prompt-landing)
  skipHistory?: boolean;
}

// Helper function to convert MessageResponse to ChatMessage
const convertMessageResponseToChatMessage = (
  msg: MessageResponse
): ChatMessage => {
  const senderTypeMap: Record<
    SenderType,
    "customer" | "ai-agent" | "human-agent"
  > = {
    Customer: "customer",
    AiAgent: "ai-agent",
    HumanAgent: "human-agent",
  };

  const roleMap: Record<SenderType, "user" | "assistant" | "human-agent"> = {
    Customer: "user",
    AiAgent: "assistant",
    HumanAgent: "human-agent",
  };

  return {
    id: msg.id,
    role: roleMap[msg.senderType],
    content: msg.content,
    sender: {
      id:
        msg.senderId ||
        (msg.senderType === "AiAgent" ? "ai-agent" : msg.senderId || "unknown"),
      name: msg.senderName,
      avatarUrl: msg.senderAvatarUrl || undefined,
      type: senderTypeMap[msg.senderType],
    },
    createdAt: msg.timestamp,
  };
};

export function ChatPage({ chatId, organizationId, skipHistory }: ChatPageProps) {
  // Use React Query to fetch conversation history reactively
  const { data: conversationHistory, isLoading: isLoadingHistory } =
    useConversationWithMessages(organizationId, chatId, { enabled: !skipHistory });

  // Initialize and update messages when conversation history changes
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Update messages when conversation history is loaded or chatId changes
  useEffect(() => {
    if (conversationHistory?.messages) {
      const historyMessages = conversationHistory.messages.map(
        convertMessageResponseToChatMessage
      );
      setMessages(historyMessages);
    } else {
      // Clear messages for new conversations
      setMessages([]);
    }
  }, [conversationHistory, chatId]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<ChatMessage | null>(
    null
  );
  const [isThinking, setIsThinking] = useState(false);

  const chatService = useMemo(
    () =>
      new ChatService({
        onMessage: (message) => {
          // This is the final complete message - replace any streaming message
          setStreamingMessage(null);
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === message.id);
            if (exists) {
              return prev.map((m) => (m.id === message.id ? message : m));
            }
            return [...prev, message];
          });
        },
        onToken: (token) => {
          // Hide thinking indicator when first token arrives
          setIsThinking(false);

          setStreamingMessage((prev) => {
            if (!prev) {
              // Create new streaming message for AI assistant
              return {
                id: `streaming-${Date.now()}`,
                role: "assistant" as const,
                content: token,
                sender: {
                  id: "ai-agent",
                  name: "AI Assistant",
                  type: "ai-agent" as const,
                },
                createdAt: new Date().toISOString(),
              };
            }
            // Append token to existing streaming message
            return {
              ...prev,
              content: prev.content + token,
            };
          });
        },
        onStateChange: (state) => {
          console.log("Conversation state changed:", state);
        },
        onConnectionChange: (connected) => {
          setIsConnected(connected);
        },
      }),
    []
  );

  useEffect(() => {
    const connectAndJoin = async () => {
      try {
        await chatService.connect();
        await chatService.joinConversation(chatId);

        // Check for pending initial message and send it (only for new conversations)
        const pendingMessage = chatActions.consumePendingInitialMessage();
        if (pendingMessage && pendingMessage.trim()) {
          // This is a new conversation with an initial message
          setIsThinking(true);
          await chatService.sendMessage(chatId, pendingMessage.trim());
        }
      } catch (error) {
        console.error("Failed to connect to chat:", error);
        setIsThinking(false);
      }
    };

    // If skipping history, connect immediately. Otherwise wait for history load.
    if (skipHistory || !isLoadingHistory) {
      connectAndJoin();
    }

    return () => {
      if (skipHistory || !isLoadingHistory) {
        chatService.leaveConversation(chatId);
        chatService.disconnect();
      }
    };
  }, [chatService, chatId, isLoadingHistory, skipHistory]);

  const handleSend = async () => {
    if (!input.trim() || !isConnected) return;

    const messageText = input.trim();
    setInput("");
    setIsLoading(true);
    setIsThinking(true); // Show thinking indicator

    try {
      // Send to backend (do not optimistically append to avoid duplicates)
      await chatService.sendMessage(chatId, messageText);
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsThinking(false); // Hide thinking on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Show loading state while fetching conversation history
  if (isLoadingHistory) {
    return (
      <div className="relative h-full max-w-3xl mx-auto w-full flex items-center justify-center">
        <div className="text-sm text-muted-foreground">
          Loading conversation...
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full max-w-3xl mx-auto w-full">
      {/* Messages - Scrollable container with bottom padding for input */}
      <div className="absolute inset-0 pb-24">
        <Conversation
          className="h-full conversation-container transparent-assistant"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent 0px, black 24px, black calc(100% - 24px), transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0px, black 24px, black calc(100% - 24px), transparent 100%)",
          }}
        >
          <ConversationContent className="mx-1">
            {[
              ...messages,
              ...(streamingMessage ? [streamingMessage] : []),
              ...(isThinking
                ? [
                    {
                      id: "thinking",
                      role: "assistant" as const,
                      content: "",
                      sender: {
                        id: "ai-agent",
                        name: "AI Assistant",
                        type: "ai-agent" as const,
                      },
                      createdAt: new Date().toISOString(),
                    },
                  ]
                : []),
            ].map((message) => {
              const isUser = message.role === "user";
              const isThinkingMessage = message.id === "thinking";
              return (
                <Message
                  key={message.id}
                  from={isUser ? "user" : "assistant"}
                  className="items-start"
                >
                  <MessageContent className="group-[.is-assistant]:bg-transparent group-[.is-user]:bg-primary/50">
                    {isThinkingMessage ? (
                      <ShiningText text="Thinking..." />
                    ) : !isUser && message.role === "assistant" ? (
                      <Streamdown className="prose prose-sm max-w-none">
                        {message.content}
                      </Streamdown>
                    ) : (
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>
                    )}
                  </MessageContent>
                  {message.sender.avatarUrl ? (
                    <MessageAvatar
                      src={message.sender.avatarUrl}
                      name={message.sender.name}
                    />
                  ) : (
                    <div className="size-8  rounded-full overflow-hidden">
                      <Avatar
                        name={message.sender.name}
                        size={32}
                        colors={[
                          "#0ea5e9",
                          "#22c55e",
                          "#f59e0b",
                          "#6366f1",
                          "#ec4899",
                        ]}
                      />
                    </div>
                  )}
                </Message>
              );
            })}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      {/* Input - Fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-background px-2">
        <PromptInput
          className="w-full shadow-xl px-3"
          onSubmit={() => {
            handleSend();
          }}
        >
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={!isConnected || isLoading}
            className="min-h-[30px] max-h-[60px] resize-none"
          />
          <PromptInputToolbar className="p-2">
            <div className="flex items-center gap-2 ml-auto">
              <PromptInputButton
                onClick={handleSend}
                disabled={!input.trim() || !isConnected || isLoading}
                className="rounded-full"
              >
                <Send size={16} />
              </PromptInputButton>
            </div>
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
}
