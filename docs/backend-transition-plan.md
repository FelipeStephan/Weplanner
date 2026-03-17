# Backend Transition Plan

This document describes the intended transition path from the current frontend-driven architecture to a backend-driven SaaS architecture.

## Current state

The Kanban workspace is currently the main persisted product surface.

Persisted locally today:

- boards
- columns
- tasks
- task status history

Still partially UI-level or mock-backed:

- clients
- users
- activity log
- attachments
- comments
- overview/dashboard summaries outside the persisted Kanban snapshot

## Transition goal

Move from local snapshot persistence to a real backend without rewriting the product rules already defined in the frontend.

The main domain rules that must remain stable are:

- `task.columnId -> column.baseStatus -> task.status`
- boards are first-class entities with scoped access rules
- resolution is separate from workflow status
- cancelled tasks do not consume client credits
- archived tasks remain part of client credit consumption
- workflow history powers analytics and reporting

## Recommended phases

### Phase 1 - Repository compatibility

Keep the current UI working against repository modules.

Required result:

- page components stop talking directly to persistence utilities
- repository modules become the only data access boundary in the frontend

### Phase 2 - API contract definition

Introduce explicit API contracts for:

- boards
- columns
- tasks
- task history
- clients
- users
- reports

The frontend should consume these contracts through repositories or service modules.

### Phase 3 - Backend persistence

Replace local snapshot persistence with a backend implementation.

Suggested first persisted backend resources:

- `GET /boards`
- `GET /boards/:id`
- `POST /boards`
- `GET /boards/:id/columns`
- `GET /boards/:id/tasks`
- `POST /tasks`
- `PATCH /tasks/:id`
- `POST /tasks/:id/resolve`
- `POST /tasks/:id/restore`
- `GET /boards/:id/history`

Suggested follow-up endpoints:

- `GET /boards/:id/access`
- `PATCH /boards/:id/access`
- `GET /me/boards`

Recommended backend interpretation:

- `PATCH /boards/:id/access` should manage user membership in the board
- clients should be handled as users with role metadata, not as a separate board access resource

### Phase 4 - Analytics extraction

Move heavy analytics calculations from the page layer to backend-backed queries or materialized views.

Candidate metrics:

- workflow time per stage
- review cycles
- adjustment cycles
- credits consumed per client
- credits completed per collaborator
- approval waiting time

### Phase 5 - Authorization and tenancy

Add authentication and role-based access tied to:

- Client
- Gestor
- Colaborador

The backend should become the enforcement point for permissions, while the frontend should remain only a presentation layer for access states.

## Frontend preparation rules

Before backend integration, the frontend should keep improving these boundaries:

- `src/domain` for product logic
- `src/repositories` for data access
- `src/demo` and `src/mocks` for simulated or reference data
- `docs/` as the source of truth for product rules

Current board-related preparation already in place:

- board creation is routed through a repository boundary
- board templates are seeded from a dedicated demo/template module
- board visibility is already modeled per role and membership
- board edit/delete flows now fit the same board entity lifecycle

## Non-goals of this phase

This document does not require:

- implementing authentication yet
- implementing a database yet
- changing the UI design
- rewriting the Kanban interactions

## Success criteria

The transition is considered healthy when:

- backend replaces local persistence without changing core UI behavior
- frontend components no longer own workflow and persistence rules directly
- reports can consume either local demo data or backend data through the same interface
- future AI agents can safely identify the correct boundary for changes
