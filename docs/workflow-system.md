# Workflow System

## Canonical workflow statuses

WePlanner uses a semantic workflow model with fixed base statuses:

- `backlog`
- `todo`
- `in_progress`
- `review`
- `adjustments`
- `approval`
- `done`

These are the canonical workflow stages used for:

- board behavior
- status history
- analytics aggregation
- reporting consistency across boards

## Column-driven workflow

Tasks do not define workflow status directly.

The governing rule is:

- `task.columnId -> column.baseStatus -> task.status`

This means:

- the board column is the visual source of truth
- the column `baseStatus` is the semantic source of truth
- the task status is derived from the selected column

## Column naming vs workflow meaning

Columns may have custom user-facing names, but they must still map to one base workflow status.

Examples:

- `Ideias` -> `backlog`
- `A Fazer` -> `todo`
- `Revisao interna` -> `review`
- `Aguardando cliente` -> `approval`

This allows teams to use their own language without breaking analytics.

## Default column behavior

When a task is created, the system chooses a default starting column using this rule:

1. first column whose `baseStatus = todo`
2. if multiple exist, the earliest by `order`
3. if none exist, the first column by `order`

## Workflow transitions

A workflow transition happens when a task changes column in a way that changes its derived status or stage placement.

Current transition sources include:

- drag-and-drop between columns
- programmatic updates in board logic
- create/edit flows that place the task in a new column
- column `baseStatus` changes that force tasks in that column to inherit a different semantic status

## Status vs resolution

Workflow status is not the same as resolution.

Workflow status means:

- where the task is inside the active workflow

Resolution means:

- how the task left the active workflow

Current resolution values:

- `completed`
- `cancelled`
- `archived`
- `rejected` is already supported in persistence types, but not currently emphasized in the main UI flows

## Important constraints

- no arbitrary status creation should define system workflow
- task creation must choose a board column, not a free-form status
- task detail views must show the visible column label to the user instead of raw technical workflow values when possible
