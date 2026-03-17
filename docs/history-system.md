# History System

## Purpose

The board-level history view keeps active boards clean while preserving traceability and recovery for tasks that are no longer active.

This feature belongs to each board, not to reports.

## Included task types

The current history view is focused on:

- archived tasks
- cancelled tasks

These tasks are removed from active board columns but remain accessible in the same board context.

## Access pattern

The board header includes a `Historico` action.

Opening this action shows the history of the current board only.

Supported filters:

- `Todas`
- `Arquivadas`
- `Canceladas`

## History entry information

Each history item is intended to provide enough context for fast recognition.

Current displayed or derived information includes:

- task title
- client
- previous column
- due date
- credits
- assignees
- resolution type
- archive/cancel date

## Available actions

Current history actions include:

- restore task
- permanently delete task

Restore behavior:

- clears the closing resolution
- returns the task to a valid active column
- uses a safe default when the original column is not available

Delete behavior:

- removes the task from the board snapshot
- removes the related status history entries
- is an explicit user action

## Architectural constraints

- archived and cancelled tasks must not become workflow columns
- history must remain board-scoped
- this MVP does not implement automatic deletion

## Implementation note

The current history view is rendered inside the Kanban workspace and uses the same board data source as the active board.
