import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CustomerAvatar } from "@/components/org/tickets/customer-avatar";
import { SendEmailSheet } from "@/components/org/tickets/send-email-sheet";
import { formatRelative } from "date-fns";

export type TicketDetailsProps = {
  ticketId: string;
  subject: string;
  status: "Open" | "Escalated" | "Closed";
  customer: {
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
  agentContext?: string;
  openedAt?: string | Date;
  closedAt?: string | Date | null;
};

export function TicketDetails({
  ticketId: _ticketId,
  subject,
  status,
  customer,
  agentContext,
  openedAt,
  closedAt,
}: TicketDetailsProps) {
  return (
    <aside className="w-full pl-3 h-minus-sidebar-minus-header shrink-0 max-w-[420px] hidden lg:block">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base ">{subject}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-10">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Status</div>
            <Badge variant="outline">{status}</Badge>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">Dates</div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Opened</span>
                <Badge className="bg-blue-500/10 text-blue-700 border-blue-200">
                  {openedAt
                    ? formatRelative(new Date(openedAt), new Date())
                    : "—"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Closed</span>
                <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200">
                  {closedAt
                    ? formatRelative(new Date(closedAt), new Date())
                    : "—"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3 ">
            <div className="text-sm text-muted-foreground">Customer</div>
            <CustomerAvatar
              name={customer.name}
              email={customer.email}
              avatarUrl={customer.avatarUrl ?? undefined}
            />
          </div>

          {agentContext && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Agent context</div>
              <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {agentContext}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="mt-auto pt-0">
          <SendEmailSheet
            defaultSubject={`Re: ${subject}`}
            defaultTo={customer.email}
            ticketId={_ticketId}
            customerName={customer.name}
          />
        </CardFooter>
      </Card>
    </aside>
  );
}
