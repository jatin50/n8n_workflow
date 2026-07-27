# System Architecture

## Goal

Build a modular, scalable workflow automation platform inspired by n8n with a clean separation of responsibilities.

---

# High-Level Architecture

```
                    Browser
                       │
                       ▼
                Next.js Frontend
                       │
              REST / WebSocket API
                       │
                       ▼
                NestJS API Server
                       │
      ┌────────────────┼────────────────┐
      ▼                ▼                ▼
 Authentication   Workflow Service   Credential Service
      │                │                │
      └────────────────┼────────────────┘
                       │
                PostgreSQL Database
                       │
                       ▼
                    Prisma ORM
                       │
      ┌────────────────┼────────────────┐
      ▼                ▼                ▼
      Redis         BullMQ Queue      Object Storage
                       │
                       ▼
                Workflow Worker
                       │
             Node Execution Engine
                       │
      ┌────────────────┼────────────────┐
      ▼                ▼                ▼
    HTTP APIs      AI Providers      Databases
```

---

# Core Services

## Frontend

Responsibilities:

- Workflow editor
- Dashboard
- Authentication
- Execution history
- Settings
- Credential management

---

## API Server

Responsibilities:

- Authentication
- Authorization
- CRUD APIs
- Validation
- Scheduling
- Queue management

---

## Execution Worker

Responsibilities:

- Execute workflows
- Retry failed jobs
- Execute node logic
- Store outputs
- Generate logs

---

## Node Engine

Responsibilities:

- Load node definitions
- Validate configurations
- Execute nodes
- Handle branching
- Pass data between nodes
- Error handling

---

## Credential Service

Responsibilities:

- Encrypt secrets
- Decrypt during execution
- Rotate encryption keys
- Access control

---

## Scheduler

Responsibilities:

- Cron jobs
- Delayed execution
- Interval triggers
- Retry scheduling

---

# Database Responsibilities

PostgreSQL stores:

- Users
- Workspaces
- Workflows
- Credentials
- Executions
- Audit logs
- Workflow versions

Redis stores:

- Active queues
- Session cache
- Execution cache
- Temporary workflow state

Object storage stores:

- Uploaded files
- Binary node outputs
- Logs (optional)
- Exported workflows

---

# Execution Flow

1. User creates a workflow.
2. Workflow is validated and saved.
3. A trigger starts the workflow.
4. The API enqueues an execution job.
5. A worker processes the job.
6. The execution engine loads the workflow.
7. Nodes run according to their dependencies.
8. Outputs are passed between connected nodes.
9. Execution status and logs are persisted.
10. Results are returned to the frontend.

---

# Design Principles

- Modular architecture
- Domain-driven organization
- Stateless API servers
- Horizontally scalable workers
- Queue-based execution
- Event-driven communication where appropriate
- Strong typing with TypeScript
- Dependency injection via NestJS
- Secure credential handling
- Observability through logs and metrics

---

# Future Enhancements

- Multiple worker pools
- Distributed execution
- Kubernetes deployment
- Plugin SDK
- Node marketplace
- Multi-tenant architecture
- Event sourcing for workflow history
- Workflow version rollback
- Real-time collaboration