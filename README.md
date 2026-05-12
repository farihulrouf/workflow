# FlowForge

Real-Time Multi-Tenant Workflow Orchestration Engine.

FlowForge is a simplified workflow automation platform inspired by Zapier and GitHub Actions. The system allows teams to define workflows as Directed Acyclic Graphs (DAGs), execute them in parallel, monitor execution in real time, and manage workflow history across multiple tenants.

---

# Tech Stack

## Backend

* Go
* Fiber
* PostgreSQL
* SSE (Server Sent Events)
* Goroutines + WaitGroup concurrency

## Frontend

* Next.js
* ReactFlow
* TypeScript

## Infrastructure

* Docker
* Docker Compose

---

# Features

## Workflow Engine

* DAG-based workflow execution
* Topological sorting
* Cycle detection
* Parallel execution using goroutines
* Sequential dependency handling
* Retry mechanism with exponential backoff
* Workflow run tracking
* Step run tracking

Supported node types:

* start
* task
* finish
* http
* delay
* script
* fail

---

## Multi-Tenant API

* JWT authentication
* Role-based access control

  * ADMIN
  * EDITOR
  * VIEWER
* Workflow CRUD
* Workflow versioning
* Workflow rollback
* Tenant isolation

---

## Realtime Monitoring

* SSE-based realtime updates
* Live node execution status
* Realtime workflow graph updates
* Execution logs and statuses

Node colors:

* Blue → running
* Green → success
* Red → failed
* Yellow → retrying

---

# Architecture Overview

```text
Frontend (Next.js + ReactFlow)
        |
        v
Backend API (Go + Fiber)
        |
        +-------------------+
        |                   |
        v                   v
Workflow Engine        SSE Hub
        |
        v
PostgreSQL
```

---

# Workflow Execution Flow

1. User creates workflow DAG
2. Backend validates DAG
3. Workflow is topologically sorted
4. Independent nodes execute in parallel
5. Dependent nodes wait for completion
6. Step status is persisted to database
7. SSE broadcasts realtime updates
8. Frontend updates workflow graph live

---

# Database Schema

Main tables:

* tenants
* users
* workflows
* workflow_versions
* workflow_runs
* step_runs

---

# Local Development Setup

## Requirements

* Docker
* Docker Compose
* Go 1.25+
* Node.js 22+

---

# Run with Docker

From project root:

```bash
docker compose up --build
```

Services:

| Service     | Port |
| ----------- | ---- |
| Frontend    | 3000 |
| Backend API | 8080 |
| PostgreSQL  | 5432 |
| Redis       | 6379 |

---

# Backend Setup

```bash
cd backend

go mod download

go run cmd/main.go
```

Worker:

```bash
cd backend

go run cmd/worker/main.go
```

---

# Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

# Running Tests

Backend tests:

```bash
cd backend

go test ./... -v
```

Current automated test coverage includes:

* DAG validation
* Cycle detection
* Topological sorting
* Invalid edge detection
* Retry execution
* RBAC middleware
* Tenant isolation

---

# API Endpoints

## Authentication

| Method | Endpoint       |
| ------ | -------------- |
| POST   | /auth/register |
| POST   | /auth/login    |

---

## Workflows

| Method | Endpoint                         |
| ------ | -------------------------------- |
| GET    | /workflows                       |
| POST   | /workflows                       |
| GET    | /workflows/:id                   |
| PUT    | /workflows/:id                   |
| DELETE | /workflows/:id                   |
| POST   | /workflows/:id/run               |
| GET    | /workflows/:id/versions          |
| POST   | /workflows/:id/rollback/:version |

---

# Realtime SSE Endpoint

```text
GET /events
```

Example event:

```json
{
  "workflow_run_id": 1,
  "step": "TASK_A",
  "status": "running",
  "message": "node started"
}
```

---

# Trade-Offs & Engineering Decisions

## Why SSE instead of WebSockets?

SSE was chosen because:

* simpler implementation
* lightweight for unidirectional events
* easier browser integration
* sufficient for MVP realtime monitoring

---

## Why PostgreSQL for execution tracking?

PostgreSQL provides:

* transactional consistency
* relational integrity
* simple querying for workflow history
* reliable persistence for MVP scope

---

## Why Goroutines for Parallel Execution?

Go goroutines allow:

* lightweight concurrency
* simple parallel DAG execution
* low overhead orchestration
* clean synchronization with WaitGroup

---

## Why No Distributed Scheduler?

The project intentionally avoids overengineering.

Focus was placed on:

* workflow orchestration
* DAG execution
* realtime monitoring
* reliability
* maintainable MVP architecture

Features intentionally deferred:

* distributed scheduling
* Kubernetes orchestration
* event sourcing
* websocket clustering
* advanced observability
* microservices architecture

---

# Future Improvements

If more time were available:

* Webhook-triggered workflows
* Cron scheduler improvements
* Advanced retry policies
* Execution cancellation
* Workflow templates
* GraphQL API
* AI-powered failure analysis
* Distributed worker queue
* Metrics and observability dashboards
* OpenTelemetry tracing

---

# CI/CD

Planned GitHub Actions pipeline:

* run tests
* build backend
* build frontend
* validate Docker images

---

# Security Considerations

* JWT authentication
* Role-based access control
* Tenant isolation
* Input validation
* Workflow validation
* Safe DAG cycle detection

---

# Screenshots

Add screenshots here:

* workflow dashboard
* realtime execut
