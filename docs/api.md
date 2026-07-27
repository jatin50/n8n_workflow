# API Documentation

## Base URL

```
/api/v1
```

---

# Authentication

```
POST /auth/register

POST /auth/login

POST /auth/logout

GET /auth/me

POST /auth/refresh
```

---

# Users

```
GET /users

GET /users/:id

PATCH /users/:id

DELETE /users/:id
```

---

# Workspaces

```
GET /workspaces

POST /workspaces

GET /workspaces/:id

PATCH /workspaces/:id

DELETE /workspaces/:id
```

---

# Workflows

```
GET /workflows

POST /workflows

GET /workflows/:id

PATCH /workflows/:id

DELETE /workflows/:id
```

---

# Workflow Versions

```
GET /workflows/:id/versions

POST /workflows/:id/versions

GET /versions/:id
```

---

# Nodes

```
GET /nodes

GET /nodes/categories

GET /nodes/:type

POST /nodes/validate
```

---

# Executions

```
POST /executions/start

POST /executions/test

POST /executions/cancel

GET /executions

GET /executions/:id

GET /executions/:id/logs
```

---

# Credentials

```
GET /credentials

POST /credentials

PATCH /credentials/:id

DELETE /credentials/:id
```

---

# Variables

```
GET /variables

POST /variables

PATCH /variables/:id

DELETE /variables/:id
```

---

# Webhooks

```
POST /webhooks/:id

GET /webhooks/:id
```

---

# File Storage

```
POST /files/upload

GET /files/:id

DELETE /files/:id
```

---

# Marketplace

```
GET /marketplace

GET /marketplace/nodes

POST /marketplace/install

DELETE /marketplace/uninstall
```

---

# Admin

```
GET /admin/stats

GET /admin/logs

GET /admin/system

POST /admin/cache/clear
```

---

# API Standards

- RESTful design
- JSON responses
- JWT authentication
- Pagination support
- Cursor-based pagination where applicable
- Standard error format
- Request validation
- Rate limiting
- OpenAPI (Swagger) documentation