
## Hackathon Overview

- **Dates**:

  - **Submission period** runs from **August 1 to September 15, 2025** ([TiDB AgentX Hackathon 2025][2]).
  - **Judging**: September 16–24, 2025.
  - **Winners announced** around **October 7, 2025** ([TiDB AgentX Hackathon 2025][2]).

- **Prizes**: Over **\$30,500** in total. Awards include:

  - 1st Place – \$12,000
  - 2nd – \$7,000
  - 3rd – \$3,500
  - 4th – \$2,500
  - 5th – \$1,500
  - **Social Good Award** – \$2,000
  - **Best Open Source Award** – \$2,000 ([TiDB AgentX Hackathon 2025][1]).

- **Key Objective**: Build a **multi-step, agentic AI workflow** using **TiDB Serverless (vector & full-text search)** that **chains together at least two building blocks** (e.g. ingest/index, vector search, full-text, LLM calls, external tool integration) in one automated flow ([TiDB AgentX Hackathon 2025][1]).

---

## How HeyDesk Matches the Requirements

HeyDesk, as an agentic customer support platform, can be structured to use:

1. **Ingestion & Indexing**:

   - Ingest support tickets or conversation logs into TiDB Serverless, using **vector and/or full-text indexing**.

2. **Search Capabilities**:

   - Utilize **vector search** to find similar past tickets.
   - Use **full-text search** for relevant knowledge-base passages or solutions.

3. **LLM Integration**:

   - Chain calls to an LLM to compose step-by-step responses or suggested actions based on search results.

This workflow leverages **at least two building blocks** (e.g., vector search + full-text search + LLM calls + external action), satisfying the hackathon’s core requirement ([TiDB AgentX Hackathon 2025][1]).

HeyDesk also aligns with one of the **sample ideas**: a customer support workflow agent that processes incoming support tickets, searches past similar tickets, extracts relevant knowledge-base content, and composes automated responses ([TiDB AgentX Hackathon 2025][3]).

---

## Submission Checklist for HeyDesk

Make sure you include the following in your submission:

- **TiDB Cloud account email** associated with the project ([TiDB AgentX Hackathon 2025][1]).
- **Public project repository URL**, or grant access to [hackathon-judge@pingcap.com](mailto:hackathon-judge@pingcap.com). (If eligible for Best Open Source Award, include an **OSI-approved license**) ([TiDB AgentX Hackathon 2025][1]).
- **Simple summary** of your data flow and integrations.
- **Run instructions** (README) so judges can launch or view the demo.
- **Text description** of features and functionalities.
- **Demo video** (< 3 minutes), publicly hosted (YouTube, Vimeo, etc.) and clearly shows the app functioning ([TiDB AgentX Hackathon 2025][2]).

---

## Maximizing Scoring Potential

Judging criteria breakdown:

| Criterion                    | Weight |
| ---------------------------- | ------ |
| Technological Implementation | 35 pts |
| Creativity / Idea Quality    | 25 pts |
| User Experience (UX/UI)      | 20 pts |
| Documentation Quality        | 10 pts |
| Demo Video Quality           | 10 pts |

To boost your chances:

- **Technological excellence**: Highlight innovative use of TiDB’s vector and full-text features, chain logic, and integration quality.
- **Creative flair**: Emphasize how HeyDesk stands out from existing support tools—agentic, autonomous, context-aware.
- **Great UX**: Ensure the interface is clean, intuitive, and shows meaningful interactions.
- **Solid docs**: Provide clear flow diagrams, README, and usage details.
- **Compelling demo**: Keep video under three minutes, demo end-to-end flow, clarity on functionality.

---

## Additional Resources to Leverage

- **Idea Inspiration**: Agentic workflows, knowledge orchestration, study companion examples ([TiDB AgentX Hackathon 2025][3]).
- **TiDB Tools**:

  - TiDB Serverless free tier with auto-scaling, vector search ([TiDB AgentX Hackathon 2025][3]).
  - Kimi sponsor token credits (200 million tokens) to support LLM usage — redeem via Discord ([TiDB AgentX Hackathon 2025][3]).

- **Development guides**:

  - TiDB developer guide, sample apps, open-source LLM datasets and repositories ([TiDB AgentX Hackathon 2025][3]).

---

## Next Steps

1. Design your **agentic flow**: Ticket ingestion → search → LLM response → response delivery.
2. Spin up TiDB Serverless and integrate vector/full-text indexing.
3. Incorporate Kimi tokens to run LLM inference.
4. Develop a clean UI or interface for demo.
5. Record your demo video (< 3 minutes).
6. Finalize documentation, repo, and submission materials.
7. Submit by **September 15, 2025** (11:45 pm PDT) ([TiDB AgentX Hackathon 2025][1]).

---

If you’d like help refining your workflow, drafting documentation, or scripting the demo video, I’m here to help—just let me know how you’d like to proceed without using any dashes or em dashes.

[1]: https://tidb-2025-hackathon.devpost.com/ "TiDB AgentX Hackathon 2025: Forge Agentic AI for Real-World Impact - Devpost"
[2]: https://tidb-2025-hackathon.devpost.com/rules?utm_source=chatgpt.com "Forge Agentic AI for Real-World Impact - Devpost"
[3]: https://tidb-2025-hackathon.devpost.com/resources?utm_source=chatgpt.com "Resources - TiDB AgentX Hackathon 2025 - Devpost"

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
