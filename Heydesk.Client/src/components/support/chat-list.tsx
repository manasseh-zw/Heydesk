import { ScrollArea } from "@/components/ui/scroll-area";
import type { ConversationSummary } from "@/lib/services/conversations.service";
import { ChatCard } from "./chat-card";

type Props = {
  items: ConversationSummary[];
  activeId?: string | null;
  onSelect?: (c: ConversationSummary) => void;
};

export function ChatList({ items, activeId, onSelect }: Props) {
  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((conversation) => (
          <ChatCard
            key={conversation.id}
            conversation={conversation}
            isActive={activeId === conversation.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
