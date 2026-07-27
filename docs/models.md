# Database Models

---

## User

- id
- name
- email
- password
- createdAt
- updatedAt

---

## Workspace

- id
- ownerId
- name
- slug
- createdAt

---

## Workflow

- id
- workspaceId
- name
- description
- active
- version
- createdAt
- updatedAt

---

## WorkflowVersion

- id
- workflowId
- json
- version
- createdAt

---

## Node

- id
- workflowId
- type
- positionX
- positionY
- configuration

---

## Connection

- id
- workflowId
- sourceNode
- targetNode
- sourceHandle
- targetHandle

---

## Credential

- id
- workspaceId
- type
- encryptedData

---

## Execution

- id
- workflowId
- status
- startedAt
- finishedAt
- duration
- logs

---

## ExecutionData

- id
- executionId
- nodeId
- input
- output

---

## Trigger

- id
- workflowId
- type
- configuration

---

## Variable

- id
- workspaceId
- key
- value

---

## APIKey

- id
- workspaceId
- key
- permissions

---

## AuditLog

- id
- workspaceId
- userId
- action
- timestamp