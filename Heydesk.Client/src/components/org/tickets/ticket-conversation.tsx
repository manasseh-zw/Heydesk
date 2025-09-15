import { Streamdown } from "streamdown";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ai-elements/message";
import Avatar from "boring-avatars";

export type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sender: { id: string; name: string; avatarUrl?: string };
};

export function TicketConversation({ messages }: { messages: ChatMsg[] }) {
  return (
    <div className="relative grow min-h-0 min-w-0">
      <ScrollArea className="h-full">
        <div className="max-w-[45rem] w-full mx-auto mt-3 pr-2 pb-4">
          <Conversation className="conversation-container transparent-assistant">
            <ConversationContent className="mx-1 space-y-4">
              {messages.map((message) => {
                const isUser = message.role === "user";
                return (
                  <Message
                    key={message.id}
                    from={isUser ? "user" : "assistant"}
                    className="items-start"
                  >
                    <MessageContent className="group-[.is-assistant]:bg-transparent group-[.is-user]:bg-primary/50">
                      {isUser ? (
                        <div className="whitespace-pre-wrap">
                          {message.content}
                        </div>
                      ) : (
                        <Streamdown className="prose prose-sm max-w-none">
                          {message.content}
                        </Streamdown>
                      )}
                    </MessageContent>
                    {message.sender.avatarUrl ? (
                      <MessageAvatar
                        src={message.sender.avatarUrl}
                        name={message.sender.name}
                      />
                    ) : (
                      <div className="size-8 rounded-full overflow-hidden">
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
      </ScrollArea>
    </div>
  );
}
