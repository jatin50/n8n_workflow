# Workflow Nodes

## Purpose

This document defines every node available in the workflow engine.

Each node must have:

- Unique Type
- Category
- Inputs
- Outputs
- Configuration
- Validation Rules
- Execution Logic

---

# Node Structure

Every node follows this structure:

```ts
interface WorkflowNode {
  id: string;
  type: string;
  name: string;

  position: {
    x: number;
    y: number;
  };

  inputs: Port[];
  outputs: Port[];

  config: Record<string, any>;

  disabled: boolean;
}
```

---

# Node Categories

## Triggers

Workflow starting nodes.

Examples:

- Manual Trigger
- Webhook
- Schedule (Cron)
- Interval
- Form Submission
- Email Received
- File Upload

---

## Logic

Control workflow execution.

Examples:

- IF
- Switch
- Loop
- Merge
- Wait
- Delay
- Stop
- Error Handler

---

## Variables

Examples:

- Set Variable
- Get Variable
- Environment Variable

---

## Data

Examples:

- JSON
- CSV
- XML
- Markdown
- HTML Parser

---

## Database

Examples:

- PostgreSQL
- MySQL
- MongoDB
- Redis

---

## HTTP

Examples:

- HTTP Request
- REST API
- GraphQL

---

## AI

Examples:

- OpenAI
- Claude
- Gemini
- Ollama
- Embeddings
- Vector Search
- AI Agent
- Prompt Template

---

## Communication

Examples:

- Gmail
- Outlook
- Slack
- Discord
- Telegram
- WhatsApp

---

## Cloud Storage

Examples:

- AWS S3
- MinIO
- Google Drive
- Dropbox

---

## Developer

Examples:

- JavaScript
- TypeScript
- Python
- Execute Command

---

# Execution Lifecycle

Each node implements:

1. Validate Configuration
2. Receive Input
3. Execute
4. Return Output
5. Handle Errors
6. Emit Logs

---

# Node Execution Result

```ts
interface NodeExecutionResult {
  success: boolean;

  data?: any;

  error?: {
    message: string;
    code: string;
  };

  executionTime: number;
}
```

---

# Future Nodes

- Browser Automation
- PDF
- OCR
- Image Generation
- Speech to Text
- Text to Speech
- Calendar
- GitHub
- GitLab
- Stripe
- Shopify
- Jira
- Notion