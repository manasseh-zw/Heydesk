import React, { useEffect, useMemo, useState } from "react";
import { ChatService, type ChatMessage } from "@/lib/services/chat.service";
import {
  Conversation,
  ConversationContent,
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

  const chatService = useMemo(
    () =>
      new ChatService({
        onMessage: (message) => {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === message.id);
            if (exists) {
              return prev.map((m) => (m.id === message.id ? message : m));
            }
            return [...prev, message];
          });
        },
        onToken: () => {
          // Token handling is managed by the service
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
    <div className="relative h-full max-w-4xl mx-auto w-full">
      {/* Messages - Scrollable container with bottom padding for input */}
      <div className="absolute inset-0 pb-24">
        <ScrollArea className="h-full [&>[data-slot=scroll-area-scrollbar]]:hidden">
          <Conversation className="min-h-full">
            <ConversationContent className="p-4">
              {messages.map((message) => {
                const isUser = message.role === "user";
                const isHumanAgent = message.role === "human-agent";
                return (
                  <Message
                    key={message.id}
                    from={isUser ? "user" : "assistant"}
                  >
                    <div className="max-w-[80%]">
                      <MessageContent
                        className={
                          isHumanAgent ? "bg-gray-50 text-gray-900" : undefined
                        }
                      >
                        <div className="text-xs text-muted-foreground mb-1 truncate max-w-[200px]">
                          {message.sender.name}
                        </div>
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
                    </div>
                    {message.sender.avatarUrl ? (
                      <MessageAvatar
                        src={message.sender.avatarUrl}
                        name={message.sender.name}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-border">
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
          </Conversation>
        </ScrollArea>
      </div>

      {/* Input - Fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-background border-t p-4">
        <PromptInput
          className="w-full"
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
            className="min-h-[60px] max-h-[100px] resize-none"
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
