import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatThread } from "./data";
import { ChatCard } from "./chat-card";

type Props = {
  items: ChatThread[];
  activeId?: string | null;
  onSelect?: (c: ChatThread) => void;
};

export function ChatList({ items, activeId, onSelect }: Props) {
  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((c) => (
          <ChatCard
            key={c.id}
            chat={c}
            isActive={activeId === c.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
