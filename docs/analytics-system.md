# Analytics System

## Purpose

The analytics layer exists so WePlanner can measure workflow efficiency, rework, approvals, client workload, and team throughput.

The current frontend already models analytics-oriented task data even though the product is still largely frontend-persisted.

## Core tracking fields

Tasks currently track:

- `statusChangedAt`
- `totalTimeInProgress`
- `totalTimeInReview`
- `totalTimeInAdjustments`
- `totalTimeInApproval`
- `reviewCycles`
- `adjustmentCycles`

These fields are used to support:

- production time calculations
- approval waiting time
- rework metrics
- client comparisons
- team performance metrics

## Workflow status history

The system persists workflow transition history through `taskStatusHistory`.

Each history record includes:

- `id`
- `taskId`
- `fromColumnId`
- `toColumnId`
- `fromStatus`
- `toStatus`
- `enteredAt`
- `exitedAt`
- `durationInSeconds`
- `changedBy`
- `changeType`
- `createdAt`

History is updated whenever workflow changes occur through:

- drag-and-drop
- programmatic movement
- column semantic changes that affect derived status

Resolution changes are modeled separately from workflow history.

## Reports dashboard

The reports dashboard provides:

- KPI metrics
- period insights for operational reporting
- workflow overview
- rework analysis
- client performance
- team performance
- task trend
- credit management subpage (`Relatorios -> Gestao de creditos`)

The dashboard reads from the persisted Kanban snapshot and computes filtered metrics by:

- time period
- board
- client
- collaborator

## Current metrics in use

Implemented analytics concepts already visible in reports include:

- tasks completed
- tasks in progress
- average production time
- average approval waiting time
- rework rate
- cancelled tasks
- workflow distribution by stage
- deadline health metrics inside workflow overview:
  - tasks on track
  - deadlines in attention
  - overdue tasks
- deadline drill-down for workflow overview:
  - clicking `Prazos em atenção` opens a task list modal
  - clicking `Tarefas em atraso` opens a task list modal
  - each list item can open the task in a new browser tab through the Kanban deep-link
- client-level delivery metrics
- team-level productivity metrics
- credit KPIs:
  - contracted credits
  - consumed credits
  - remaining credits
  - deficit clients
  - average burn rate
  - credits tied to rework cycles
- credit trend analytics:
  - cumulative consumption curve
  - cancelled credits (non-billable) curve
- credit insights:
  - client with highest exhaustion risk
  - client with highest burn rate in the current period
  - deficit alert or healthy-state insight when no client exceeds the contracted base
- client credit base table:
  - contracted / consumed / remaining / deficit
  - burn rate and estimated exhaustion
  - operational risk badge (healthy / attention / critical)

## Simulation mode

The reports dashboard includes a simulation mode and demo snapshot generator.

Purpose:

- validate layout and density before production data exists
- simulate busy agency conditions
- show realistic client and team variation

Behavior:

- real data remains the preferred source
- simulated data may be enabled when there is little or no real data
- demo mode must not replace the underlying analytics architecture

## Important product rule

Future credit analytics must respect:

- cancelled tasks do not consume client credits
- archived tasks do consume client credits
- completed tasks do consume client credits

Current implementation follows the formula:

- `clientConsumedCredits = sum(task.credits where resolution != cancelled)`

## Reporting interaction model

Some reporting widgets are intentionally actionable, not just visual.

Current interaction expectations:

- the workflow deadline health cards are interactive when the metric represents risk (`warning` or `overdue`)
- the drill-down modal shows compact task items with:
  - status badge
  - credit badge
  - client, board, and due-date metadata
  - `Ver tarefa` action
- `Ver tarefa` opens a new browser tab with the Kanban route and task deep-link
