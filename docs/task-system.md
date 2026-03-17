# Task System

## Task creation model

Tasks are created through the task creation modal and are inserted into a board column.

The create flow currently collects:

- title
- rich text description
- priority
- initial column
- due date and optional time
- credits
- client
- assignees
- tags
- subtasks
- attachments

The board layer receives the form payload and is responsible for deriving the task status from the selected column.

## Description behavior

Task descriptions support rich text editing.

Current supported editing concepts include:

- bold
- italic
- font size changes
- text color changes
- attachment actions in the editor toolbar

Descriptions are stored as rich text HTML and rendered back in the task detail modal. Cards use plain-text previews derived from the rich text content.

## Subtasks

Subtasks are checklist-style child items embedded inside the task payload.

Current subtask fields include:

- `id`
- `title`
- `done`
- optional assignee
- optional due date

Subtasks are currently UI-level nested data, not standalone persisted entities.

Progress behavior:

- task progress bars should only appear when a task has subtasks
- progress is derived from completed subtasks when subtasks exist

## Assignees

Tasks support multiple assignees.

Current assignee behavior:

- searchable selector
- multi-selection
- avatar-based display
- assignee identity is stored inside the task payload as nested objects

Assignees are not currently normalized into a standalone persisted user table inside the Kanban snapshot.

## Tags

Tasks support manual tag creation and color selection.

Tags are stored inside the task payload as:

- label
- color metadata

Tags are currently task-scoped UI data, not centrally managed taxonomy objects.

## Due dates

Due dates support:

- date only
- date plus explicit time

Important due date rules:

- if no time is explicitly set, time must not be displayed
- date highlighting is derived dynamically
- more than 24h away -> neutral
- 24h or less remaining -> warning
- past due -> overdue

These rules are reused across:

- board task cards
- create/edit modal
- task detail modal

## Task lifecycle

A task can be:

- active in workflow
- completed
- archived
- cancelled

Lifecycle summary:

- active tasks appear in board columns
- archived and cancelled tasks are removed from active board columns
- archived and cancelled tasks remain accessible through board history
- completed tasks remain part of workflow analytics and credit consumption

## Task detail modal

The task detail modal is the main task inspection surface.

Current responsibilities:

- show priority
- show visible status label from the current board column
- show credits
- render rich description
- show subtasks and derived progress when subtasks exist
- allow subtask completion directly inside the detail modal
- allow action menu operations such as edit, duplicate, cancel, and archive
- keep comments visible in a dedicated right column for continuous collaboration context
- show attachments inside the details column (not as a separate top tab)
- allow switching the right column between `Comentários` and `Atividades`

Editing rule:

- the task detail modal is not the place to edit the main due date
- due date changes must happen through the task edit flow

The detail modal must not expose raw workflow values such as `review` or `approval` when the user-facing board column label is available.

### Detail modal layout rules

- the top tab strip (`Detalhes`, `Anexos`, `Atividades`) is not used in the current architecture
- details content lives in the left column
- comments/activity context lives in the right column
- the footer action (`Concluir tarefa`) is scoped to the left/details column only
- modal sizing is viewport-based (fixed screen percentage) instead of content-hug sizing
