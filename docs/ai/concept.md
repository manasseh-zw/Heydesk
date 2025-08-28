# TiDB.Vector.NET Concept Map

## Core Idea
A customer support platform where each organization manages a knowledge base and provides support through agents (both human and AI). Customers open tickets, which track conversations, escalations, and resolutions.

---

## Entities & Models

### Organization
- **Id**
- **Name**
- **KnowledgeBase** (1-to-1)

### KnowledgeBase
- **Id**
- **OrganizationId**
- **Documents** (1-to-many)

### Document
- **Id**
- **KnowledgeBaseId**
- **Type** (enum: Url, UploadedDoc, Text)
- **Content** (scraped or pasted text)
- **Url** (if source is a webpage)
- **StoragePath** (if uploaded file)

---

### Customer
- **Id**
- **Name**
- **Email**
- **Phone**

### Ticket
- **Id**
- **CustomerId**
- **OrganizationId**
- **Status** (enum: Open, InProgress, Resolved, Escalated)
- **AssignedAgentId**
- **ConversationHistory** (messages in JSON)

### ConversationMessage
- **Id**
- **TicketId**
- **SenderId** (Agent or Customer)
- **SenderType** (enum: HumanAgent, AiAgent, Customer)
- **Content**
- **Timestamp**

---

### Agent
- **Id**
- **OrganizationId**
- **Type** (enum: Human, AI)
- **Name**
- **UserId** (if Human, links to User entity)

### User (for Human Agents / Admins)
- **Id**
- **OrganizationId**
- **Name**
- **Email**
- **Role** (Admin, HumanAgent)

---

## Workflows

### Knowledge Base Management
1. Organization creates its KnowledgeBase.
2. Admin adds Documents:
   - URL → scraped text stored in Content.
   - Uploaded file → stored in bucket, path in StoragePath.
   - Text → directly stored in Content.

### Ticket Lifecycle
1. Customer submits a ticket.
2. System assigns ticket:
   - AI Agent first (auto-responder).
   - Escalates to Human Agent if needed.
3. Ticket status flows: **Open → InProgress → Resolved/Escalated**.
4. Conversation thread stored in `ConversationHistory`.

### Conversation Flow
- Every message stored with:
  - Sender (Customer, HumanAgent, AiAgent)
  - Timestamp
  - Content
- Ensures ordered conversation display.

### Agent Tracking
- Each Ticket stores `AssignedAgentId`.
- AI Agents are system entities.
- Human Agents are linked to `User`.

---

## Keep It Simple Philosophy
- Single KnowledgeBase per Organization.
- Tickets are central to customer interaction.
- ConversationHistory is the source of truth for communication.
- AI and Human Agents unified under Agent model with Type.
