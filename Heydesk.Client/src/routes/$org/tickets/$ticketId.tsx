import { createFileRoute, useParams } from "@tanstack/react-router";
import {
  TicketConversation,
  type ChatMsg,
} from "@/components/org/tickets/ticket-conversation";
import { TicketDetails } from "@/components/org/tickets/ticket-details";
import { authState } from "@/lib/state/auth.state";
import { ticketWithConversationQueryOptions } from "@/lib/services/tickets.service";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/$org/tickets/$ticketId")({
  loader: async ({ context, params }) => {
    const orgId = authState.state.organization?.id;
    if (!orgId) return null;
    const query = ticketWithConversationQueryOptions(orgId, params.ticketId);
    await context.queryClient.ensureQueryData(query);
    return null;
  },
  component: TicketDetailPage,
});

const sampleMessages: ChatMsg[] = [
  {
    id: "m1",
    role: "user",
    sender: { id: "cust-1", name: "Jane Doe" },
    content: "Hi, I'm having trouble accessing my account.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toLocaleString(),
  },
  {
    id: "m2",
    role: "assistant",
    sender: { id: "agent-1", name: "AI Agent" },
    content:
      "I can help with that. Could you confirm the email on the account?",
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toLocaleString(),
  },
  {
    id: "m3",
    role: "user",
    sender: { id: "cust-1", name: "Jane Doe" },
    content: "sure@example.com",
    timestamp: new Date(Date.now() - 1000 * 60 * 52).toLocaleString(),
  },
  {
    id: "m4",
    role: "assistant",
    sender: { id: "agent-1", name: "AI Agent" },
    content: "Thanks! I've reset your access. Please try logging in again.",
    timestamp: new Date(Date.now() - 1000 * 60 * 48).toLocaleString(),
  },
];

function TicketDetailPage() {
  const params = useParams({ from: "/$org/tickets/$ticketId" });
  const ticketId = params.ticketId;

  const orgId = authState.state.organization?.id as string;
  const { data } = useQuery(
    ticketWithConversationQueryOptions(orgId, ticketId)
  );

  const ticketSubject = data?.ticket.subject ?? "Account access issue";
  const ticketStatus =
    (data?.ticket.status as "Open" | "Escalated" | "Closed") ?? "Open";
  const customer = {
    name: data?.ticket.customer?.name ?? "Jane Doe",
    email: data?.ticket.customer?.email ?? "jane@example.com",
    avatarUrl: data?.ticket.customer?.avatarUrl ?? null,
  };
  const agentContext = data?.ticket.context ?? "";
  const openedAt =
    data?.ticket.openedAt ??
    new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
  const closedAt = data?.ticket.closedAt ?? null;

  return (
    <div className="flex h-screen-minus-sidebar-minus-header md:rounded-s-3xl transition-all ease-in-out duration-300">
      {/* Chat area */}
      <div className="flex-1 w-full  md:rounded-s-[inherit] ">
        <div className="h-full flex flex-col px-4 ">
          {/* Conversation thread (read-only) */}
          <TicketConversation
            messages={
              data?.conversation?.messages?.map((m) => ({
                id: m.id,
                role: m.senderType === "Customer" ? "user" : "assistant",
                sender: {
                  id: m.senderId ?? "",
                  name: m.senderName,
                  avatarUrl: m.senderAvatarUrl ?? undefined,
                },
                content: m.content,
                timestamp: m.timestamp,
              })) ?? sampleMessages
            }
          />
        </div>
      </div>

      {/* Ticket details sidebar */}
      <TicketDetails
        ticketId={ticketId}
        subject={ticketSubject}
        status={ticketStatus}
        customer={customer}
        agentContext={agentContext}
        openedAt={openedAt}
        closedAt={closedAt}
      />
    </div>
  );
}
