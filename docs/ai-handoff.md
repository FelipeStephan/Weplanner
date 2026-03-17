# AI Handoff

Use this file when another AI agent needs to continue work on the WePlanner project.

## Project summary

WePlanner is a workflow and operational analytics platform for agencies.

Main goals:

- manage work through boards and tasks
- measure operational effort through task credits
- track workflow efficiency
- support reporting and analytics

Tech stack:

- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI
- Lucide React
- Vite

Main app path:

- `ai-contex_pattern/`

## First files to read

Read these files before changing architecture-sensitive behavior:

- `docs/README.md`
- `docs/system-overview.md`
- `docs/workflow-system.md`
- `docs/task-system.md`
- `docs/credits-system.md`
- `docs/board-architecture.md`
- `docs/analytics-system.md`
- `docs/data-model.md`
- `docs/product-rules.md`
- `docs/history-system.md`
- `docs/ui-behaviors.md`

If working on a specific area, also read:

- Kanban board:
  - `ai-contex_pattern/src/app/components/boards/KanbanWorkspacePage.tsx`
- Task creation:
  - `ai-contex_pattern/src/app/components/tasks/CreateTaskModal.tsx`
- Task details:
  - `ai-contex_pattern/src/app/components/tasks/TaskDetailModal.tsx`
- Reports:
  - `ai-contex_pattern/src/app/components/reports/ReportsDashboardPage.tsx`
- Persistence:
  - `ai-contex_pattern/src/app/data/kanban-workspace-persistence.ts`

## Critical architecture rules

Do not break these rules:

- task workflow status is derived from the selected board column
- source of truth:
  - `task.columnId -> column.baseStatus -> task.status`
- do not allow arbitrary workflow status creation
- board columns are the active workflow only
- archived and cancelled tasks must not become board columns
- resolution is separate from workflow status

Current workflow statuses:

- `backlog`
- `todo`
- `in_progress`
- `review`
- `adjustments`
- `approval`
- `done`

Current task resolutions:

- `completed`
- `cancelled`
- `archived`

## Credits rules

Each task has a `credits` value.

Credits represent effort/workload, not just task count.

Important rule:

- completed tasks consume client credits
- archived tasks consume client credits
- cancelled tasks do not consume client credits

Conceptual formula:

- `clientConsumedCredits = sum(task.credits where resolution != cancelled)`

Rework does not automatically change credits.

## Board rules

- columns have custom names
- columns must define `baseStatus`
- multiple columns may share the same `baseStatus`
- column ordering is stored through `order`
- cards and columns support drag-and-drop
- archived/cancelled tasks live in board-level history, not active columns

## Analytics rules

The system already tracks workflow analytics through:

- `statusChangedAt`
- `taskStatusHistory`
- `reviewCycles`
- `adjustmentCycles`
- stage duration aggregates

Reports depend on this architecture staying consistent.

## Current persistence reality

The Kanban workspace currently persists a local snapshot with:

- boards
- columns
- tasks
- task status history

Other entities such as users, clients, comments, attachments, and subtasks may still exist as nested task data or mock/UI-level structures.

Do not assume every visible concept already has a normalized backend entity.

## UI constraints

Keep the current WePlanner visual language.

Do not redesign the product unless explicitly asked.

Prefer:

- incremental changes
- consistency with existing cards, modals, badges, and spacing
- preserving light and dark mode behavior

## Safe working style

Before editing:

1. identify whether the change affects workflow, resolution, credits, analytics, or persistence
2. check the related doc in `/docs`
3. update documentation if the architecture changes

If the user later says:

- `documentar novamente a arquitetura`

You must:

1. review the real code again
2. compare it to `/docs`
3. update only what changed
4. keep docs synchronized with implementation

## Suggested prompt for another AI

Use this as a starting prompt:

> Read the documentation in `/docs` first, especially workflow, task, board, credits, analytics, and product rules. Do not break the rule `task.columnId -> column.baseStatus -> task.status`. Before proposing changes, explain how the requested feature fits into the current WePlanner architecture.
