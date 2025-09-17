import { cn } from "@/lib/utils";
import type { ConversationSummary } from "@/lib/services/conversations.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import BoringAvatar from "boring-avatars";

type Props = {
  conversation: ConversationSummary;
  isActive?: boolean;
  onSelect?: (conversation: ConversationSummary) => void;
};

export function ChatCard({ conversation, isActive, onSelect }: Props) {
  // Debug logging
  console.log("ChatCard rendering conversation:", {
    id: conversation.id,
    title: conversation.title,
  });

  // Format the last message time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  // Get preview text from the first message
  const previewText =
    conversation.previewMessages.length > 0
      ? `${conversation.previewMessages[0].senderName}: ${conversation.previewMessages[0].content.slice(0, 50)}...`
      : "No messages yet";

  // Get unique participants with their info from preview messages
  const participants =
    conversation.previewMessages.length > 0
      ? conversation.previewMessages.reduce(
          (acc, message) => {
            const existing = acc.find((p) => p.name === message.senderName);
            if (!existing) {
              acc.push({
                name: message.senderName,
                avatarUrl: message.senderAvatarUrl,
                type: message.senderType,
              });
            }
            return acc;
          },
          [] as Array<{ name: string; avatarUrl?: string | null; type: string }>
        )
      : [{ name: "Support", avatarUrl: null, type: "support" }];

  // Truncate names to max 10 characters
  const truncateName = (name: string) => {
    return name.length > 10 ? name.substring(0, 10) + "..." : name;
  };

  return (
    <button
      className={cn(
        "hover:bg-accent hover:text-accent-foreground flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all",
        isActive && "bg-muted"
      )}
      onClick={() => onSelect?.(conversation)}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <div className="font-semibold line-clamp-1">
          {conversation.title === "new_conversation"
            ? "New Conversation"
            : conversation.title}
        </div>
        <div className="flex items-center gap-1">
          {conversation.isTicketTied && (
            <span
              className="flex h-2 w-2 rounded-full bg-orange-500"
              title="Ticket created"
            />
          )}
          <span className="text-[10px] text-muted-foreground">
            {formatTime(conversation.lastMessageAt || conversation.startedAt)}
          </span>
        </div>
      </div>
      <div className="text-xs line-clamp-2 text-muted-foreground">
        {previewText}
      </div>
      <div className="flex flex-wrap gap-1">
        {participants.map((participant, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-1 text-[10px] h-5"
          >
            <Avatar className="h-3 w-3">
              {participant.type === "AiAgent" ||
              participant.type === "HumanAgent" ? (
                <AvatarImage src={participant.avatarUrl || undefined} />
              ) : null}
              <AvatarFallback className="text-[8px] bg-muted p-0">
                {participant.type === "AiAgent" ||
                participant.type === "HumanAgent" ? (
                  <BoringAvatar
                    name="rrr"
                    size={32}
                    colors={[
                      "#0ea5e9",
                      "#22c55e",
                      "#f59e0b",
                      "#6366f1",
                      "#ec4899",
                    ]}
                  />
                ) : (
                  <BoringAvatar
                    size={12}
                    name="Support"
                    variant="beam"
                    colors={[
                      "#92A1C6",
                      "#146A7C",
                      "#F0AB3D",
                      "#C271B4",
                      "#C20D90",
                    ]}
                  />
                )}
              </AvatarFallback>
            </Avatar>
            <span className="text-[9px]">{truncateName(participant.name)}</span>
          </Badge>
        ))}
      </div>
    </button>
  );
}
