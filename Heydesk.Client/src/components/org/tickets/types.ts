import type { Ticket } from "@/lib/types/ticket";

export interface TicketColumnData {
	id: 'active' | 'escalated' | 'resolved'
	title: string
	color?: string
	tickets: Ticket[]
}


