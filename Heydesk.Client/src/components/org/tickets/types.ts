export type TicketPriority = 'low' | 'medium' | 'high'

export interface TicketAssignee {
	name: string
	avatarUrl?: string
}

export interface Ticket {
	id: string
	title: string
	description?: string
	priority?: TicketPriority
	assignee?: TicketAssignee
	tags?: string[]
	dueDate?: string
	attachments?: number
	comments?: number
}

export interface TicketColumnData {
	id: 'active' | 'escalated' | 'resolved'
	title: string
	color?: string
	tickets: Ticket[]
}


