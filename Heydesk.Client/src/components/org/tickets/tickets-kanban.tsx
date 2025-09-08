import { TicketColumn } from "./ticket-column";
import type { TicketColumnData } from "./types";

const placeholderColumns: TicketColumnData[] = [
  {
    id: "active",
    title: "Active",
    color: "#3A8AFF",
    tickets: [
      {
        id: "t3",
        title: "Search results are inconsistent",
        description: "Vector results differ between environments",
        priority: "high",
        assignee: {
          name: "Jordan Kim",
          avatarUrl: "/headshot/Lummi Doodle 06.png",
        },
        tags: ["search", "vector"],
        attachments: 2,
        comments: 5,
      },
    ],
  },
  {
    id: "escalated",
    title: "Escalated",
    color: "#ffd166",
    tickets: [
      {
        id: "t4",
        title: "AI response flagged for accuracy",
        description: "Customer reported incorrect steps in automated reply",
        priority: "medium",
        assignee: {
          name: "Maya Patel",
          avatarUrl: "/headshot/Lummi Doodle 09.png",
        },
        tags: ["ai", "quality"],
        dueDate: "2025-09-12",
        comments: 1,
      },
    ],
  },
  {
    id: "resolved",
    title: "Resolved",
    color: "#a5be00",
    tickets: [
      {
        id: "t5",
        title: "Onboarding email template updated",
        description: "Typos corrected and links verified",
        priority: "low",
        assignee: {
          name: "Chris Wong",
          avatarUrl: "/headshot/Lummi Doodle 10.png",
        },
        tags: ["docs"],
        attachments: 1,
        comments: 4,
      },
    ],
  },
];

export function TicketsKanban() {
  const columns: TicketColumnData[] = placeholderColumns;

  return (
    <div className="">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {columns.map((column) => (
          <TicketColumn key={column.id} column={column} />
        ))}
      </div>
    </div>
  );
}

export default TicketsKanban;
