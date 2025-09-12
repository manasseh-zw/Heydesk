import React, { useEffect, useMemo, useState } from "react";
import { ChatService, type ChatMessage } from "@/lib/services/chat.service";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import Avatar from "boring-avatars";

interface ChatPageProps {
  chatId: string;
  orgSlug: string;
}

export function ChatPage({ chatId }: ChatPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<ChatMessage | null>(
    null
  );

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
      } catch (error) {
        console.error("Failed to connect to chat:", error);
      }
    };

    connectAndJoin();

    return () => {
      chatService.leaveConversation(chatId);
      chatService.disconnect();
    };
  }, [chatService, chatId]);

  const handleSend = async () => {
    if (!input.trim() || !isConnected) return;

    const messageText = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      // Send to backend (do not optimistically append to avoid duplicates)
      await chatService.sendMessage(chatId, messageText);
    } catch (error) {
      console.error("Failed to send message:", error);
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

  return (
    <div className="relative h-full max-w-3xl mx-auto w-full">
      {/* Messages - Scrollable container with bottom padding for input */}
      <div className="absolute inset-0 pb-24">
        <ScrollArea
          className="h-full [&>[data-slot=scroll-area-scrollbar]]:hidden"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent 0px, black 24px, black calc(100% - 24px), transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0px, black 24px, black calc(100% - 24px), transparent 100%)",
          }}
        >
          <Conversation className="h-full">
            <ConversationContent>
              {[
                ...messages,
                ...(streamingMessage ? [streamingMessage] : []),
              ].map((message) => {
                const isUser = message.role === "user";
                const isStreaming = message.id.startsWith("streaming-");
                return (
                  <Message
                    key={message.id}
                    from={isUser ? "user" : "assistant"}
                  >
                    <MessageContent
                      className={
                        !isUser
                          ? isStreaming
                            ? "bg-gray-50/50 animate-pulse"
                            : "bg-gray-50/50"
                          : undefined
                      }
                    >
                      {!isUser && message.role === "assistant" ? (
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
        </ScrollArea>
      </div>

      {/* Input - Fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-background">
        <PromptInput
          className="w-full shadow-xl "
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
            className="min-h-[40px] max-h-[60px] resize-none"
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
