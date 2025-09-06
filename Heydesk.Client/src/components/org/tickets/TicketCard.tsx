import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MessageCircle, Paperclip } from "lucide-react";
import type { Ticket } from "./types";

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const initials = ticket.assignee?.name
    ? ticket.assignee.name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "NA";

  return (
    <Card className="transition-all duration-300 border bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-neutral-700/70">
      <CardContent className="p-5">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 leading-tight">
              {ticket.title}
            </h4>
            {ticket.priority && (
              <Badge variant="secondary" className="capitalize">
                {ticket.priority}
              </Badge>
            )}
          </div>

          {ticket.description && (
            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {ticket.description}
            </p>
          )}

          {ticket.tags && ticket.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ticket.tags.map((tag) => (
                <Badge
                  key={tag}
                  className="text-xs bg-neutral-100/60 dark:bg-neutral-700/60 text-neutral-800 dark:text-neutral-200 border-neutral-200/50 dark:border-neutral-600/50 backdrop-blur-sm"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-neutral-200/30 dark:border-neutral-700/30">
            <div className="flex items-center gap-4 text-neutral-600 dark:text-neutral-400">
              {ticket.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    {new Date(ticket.dueDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "2-digit",
                    })}
                  </span>
                </div>
              )}
              {typeof ticket.comments === "number" && (
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">{ticket.comments}</span>
                </div>
              )}
              {typeof ticket.attachments === "number" && (
                <div className="flex items-center gap-1">
                  <Paperclip className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    {ticket.attachments}
                  </span>
                </div>
              )}
            </div>

            {ticket.assignee && (
              <Avatar className="w-8 h-8 ring-2 ring-white/50 dark:ring-neutral-700/50">
                <AvatarImage src={ticket.assignee.avatarUrl} />
                <AvatarFallback className="bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
