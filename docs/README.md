# WePlanner Documentation Index

This folder stores the architecture and product documentation for WePlanner.

Its purpose is to help:

- new developers understand the product quickly
- future AI agents work safely on the codebase
- product rules remain consistent over time
- architecture decisions stay synchronized with the real implementation

## Current document map

- `system-overview.md` - platform scope, modules, roles, and page map
- `workflow-system.md` - semantic workflow model and status derivation rules
- `task-system.md` - task creation, task lifecycle, subtasks, due dates, and modal behavior
- `credits-system.md` - credits model and client credit consumption rules
- `credits-system-architecture.md` - implementação detalhada do sistema de créditos (data-driven, sem toggle por board)
- `board-architecture.md` - board, column, ordering, drag-and-drop, and board-level history
- `analytics-system.md` - workflow tracking, reports, simulation mode, and analytics metrics
- `data-model.md` - persisted entities, UI-level entities, and data relationships
- `product-rules.md` - business rules and product constraints that must remain stable
- `backend-transition-plan.md` - staged plan for moving from local persistence to backend/API architecture
- `database-entity-map.md` - mapping between frontend domain concepts and future relational entities
- `analytics-metrics-catalog.md` - catalog of KPI, workflow, rework, client, and team metrics
- `authorization-model.md` - intended access model and future backend authorization direction
- `history-system.md` - board-level history behavior for archived and cancelled tasks
- `ui-behaviors.md` - UI behaviors that directly affect system data and workflow logic
- `overview-dashboard.md` - overview/dashboard surfaces and navigation structure
- `team-management.md` - member lifecycle, invite flow, roles, deletion, permissions, and DB schema
- `workspace-settings.md` - workspace identity, operational config, access policies, accent color, and DB schema
- `client-management.md` - client lifecycle, library resources, board links, credit control per client, and DB schema
- `weplanner-architecture.md` - consolidated high-level architecture summary

## Required rule for future AI agents

Before changing the codebase, future AI agents should read the `/docs` folder first.

Minimum recommended reading path:

1. `README.md`
2. `weplanner-architecture.md`
3. the document that matches the feature being changed

Examples:

- board changes -> `board-architecture.md`, `workflow-system.md`, `history-system.md`
- task changes -> `task-system.md`, `credits-system.md`, `credits-system-architecture.md`, `product-rules.md`
- reports changes -> `analytics-system.md`, `analytics-metrics-catalog.md`
- team changes -> `team-management.md`, `authorization-model.md`
- settings changes -> `workspace-settings.md`, `credits-system-architecture.md`
- client changes -> `client-management.md`, `credits-system-architecture.md`, `team-management.md`
- backend planning -> `backend-transition-plan.md`, `database-entity-map.md`, `authorization-model.md`

## Documentation maintenance rule

When the instruction `documentar novamente a arquitetura` is given, the documentation must be updated instead of rewritten from scratch.

Required process:

1. Review the current codebase again.
2. Compare the implementation with the files inside `/docs`.
3. Update outdated sections.
4. Add documentation for new features, data rules, or product constraints.
5. Keep documentation aligned with the real system behavior.

## Current implementation note

The current product architecture is frontend-driven and uses local persistence for the Kanban workspace through `localStorage`.

Important distinction:

- boards, columns, tasks, and status history are persisted in the local Kanban snapshot
- several other business entities still exist as UI-level or mock structures and are not yet standalone persisted resources

Any future backend work should use these documents as the source of truth for the intended system behavior.
