import { cn } from "@/lib/utils";
import type { ChatThread } from "./data";

type Props = {
  chat: ChatThread;
  isActive?: boolean;
  onSelect?: (chat: ChatThread) => void;
};

export function ChatCard({ chat, isActive, onSelect }: Props) {
  return (
    <button
      className={cn(
        "hover:bg-accent hover:text-accent-foreground flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all",
        isActive && "bg-muted"
      )}
      onClick={() => onSelect?.(chat)}
    >
      <div className="flex w-full items-center gap-2">
        <div className="font-semibold line-clamp-1">{chat.title}</div>
        {chat.unread && (
          <span className="flex h-2 w-2 rounded-full bg-blue-600" />
        )}
      </div>
      <div className="text-xs line-clamp-2 text-muted-foreground">
        {chat.preview}
      </div>
      <div className="text-[10px] text-muted-foreground line-clamp-1">
        {chat.participants.join(", ")}
      </div>
    </button>
  );
}
