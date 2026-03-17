# WePlanner Architecture

## 1. Platform Overview

WePlanner is a workflow and operational analytics platform designed for agencies, service teams, and collaborators managing delivery through tasks, boards, and reporting.

The product is not only a task manager. Its architecture is designed to support:

- overview-driven operational entry
- workflow execution
- workload measurement
- client consumption visibility
- collaborator productivity analysis
- operational reporting

In practice, WePlanner combines Kanban-based task management with a semantic workflow model and analytics-oriented task metadata.

The current frontend and state architecture already assume that workflow, task lifecycle, reporting, and credits are part of the same operational system.

## 2. Workflow System

The platform uses a semantic workflow model based on fixed base workflow statuses:

- `backlog`
- `todo`
- `in_progress`
- `review`
- `adjustments`
- `approval`
- `done`

These statuses represent the canonical workflow stages used by the system for:

- board logic
- workflow analytics
- reporting aggregation
- cross-board consistency

Board columns do not define workflow semantics by name alone. Instead, each column must be mapped to one of these base workflow statuses through the `baseStatus` field.

This allows teams to keep custom operational language in the UI while preserving consistent analytics and system behavior underneath.

## 3. Board Column Architecture

Board columns are part of the visual workflow layer, but they are also semantically connected to the canonical workflow system.

Each column should contain at least:

- `id`
- `boardId`
- `name`
- `baseStatus`
- `order`
- `createdAt`
- `updatedAt`

Important rules:

- columns may have fully custom names
- columns must always be mapped to a required `baseStatus`
- multiple columns may share the same `baseStatus`

Examples:

- `Ideias` -> `backlog`
- `Producao criativa` -> `in_progress`
- `Correcoes do cliente` -> `adjustments`
- `Validacao interna` -> `review`
- `Aguardando cliente` -> `approval`

This architecture allows each board to remain operationally flexible without breaking reporting, workflow metrics, or cross-board analysis.

## 3.1 Overview Dashboard

The platform also includes an overview dashboard as the primary app entry point.

This page is not a reporting view and it is not a kanban view.

Its purpose is to provide fast operational visibility through:

- KPI summary
- compact task lists
- alerts
- recent activity
- quick access to boards
- quick access to client resources

Important rule:

- overview task items must follow a list pattern
- they must not inherit kanban drag-and-drop or expandable card behavior
- the data should be derived from the same persisted workspace snapshot used by boards and reports

## 4. Task Status vs Resolution

WePlanner separates workflow progression from task outcome.

### Workflow status

Workflow status represents the current operational stage of a task inside the active delivery flow.

It is derived from the column where the task is currently located.

Examples:

- a task in a column mapped to `review` has workflow status `review`
- a task in a column mapped to `approval` has workflow status `approval`

### Task resolution

Resolution is a separate system concept that represents how the task left the active workflow.

Current resolution values:

- `completed`
- `cancelled`
- `archived`

Important rules:

- workflow status and resolution must remain separate
- resolution does not replace workflow status semantics
- resolution removes the task from active workflow views when applicable
- resolved tasks remain available for analytics, reports, and historical records

Example:

- a normally finished task ends with `status = done` and `resolution = completed`

This separation keeps active boards clean while preserving operational history.

## 5. Analytics Tracking

Tasks in WePlanner are not simple visual cards. They also carry workflow and performance metadata used for analytics.

Key tracked fields include:

- `statusChangedAt`
- `reviewCycles`
- `adjustmentCycles`
- time spent in workflow stages

The system also supports workflow transition history so analytics can measure:

- when a task entered a status
- when it exited a status
- how long it stayed there
- how many times it returned to review or adjustments
- how long it took from creation to completion

This architecture enables operational metrics such as:

- average production time
- average approval waiting time
- rework rate
- turnaround time
- workflow bottleneck detection

## 6. Reporting System

The Reports Dashboard is the main operational analytics surface for managers.

It is designed to provide visibility into workflow efficiency, team productivity, client load, and delivery bottlenecks.

The current reporting model includes:

- operational period insights
- KPI metrics
- workflow overview
- workflow deadline health metrics and drill-down
- rework analysis
- client performance
- team performance
- task trend
- credit management analytics

Typical report outputs include:

- completed tasks in the selected period
- tasks currently in progress
- average production time
- average approval waiting time
- rework rate
- cancelled tasks
- workflow distribution by stage
- tasks on track, in attention, and overdue
- client-level operational patterns
- collaborator-level throughput and delay risk
- contracted / consumed / remaining credits
- burn rate and estimated exhaustion by client
- credit risk and deficit visibility

The reporting architecture depends on workflow status, resolution, history, and credits being modeled consistently.

The current reporting UX also includes actionable drill-down behavior:

- risky deadline metrics can open a modal list of affected tasks
- those tasks can be opened in a new browser tab through the Kanban deep-link
- credit management includes its own insight layer, separate from operational workflow insights

## 7. Task Credit System

WePlanner uses credits as an operational workload metric.

Each task has a `credits` field.

Credits represent the effort or operational weight of the task, not just the existence of a card.

Examples:

- social media post -> 2 credits
- landing page -> 15 credits
- campaign production -> 40 credits

Credits are used for:

- workload measurement
- client consumption tracking
- productivity metrics
- reporting analytics

Important rules:

- every task must have a credit value
- credits do not automatically increase when a task returns to review or adjustments
- adjustments are considered part of the same task effort unless a manager manually changes credits
- credits can be manually edited by a manager or account manager
- credit changes should be recorded in the activity log so the system preserves change history

### Client credit consumption rule

Client credit consumption must not treat all task resolutions equally.

Official business rule:

- tasks with `resolution = completed` consume client credits normally
- tasks with `resolution = archived` still consume client credits
- tasks with `resolution = cancelled` do **not** consume client credits

Business reasoning:

- some tasks are created by mistake
- some requests are cancelled before production truly begins
- a client may cancel a request before execution starts

Because of that, cancelled tasks remain part of history and traceability, but they must be excluded from client credit consumption.

Conceptually, future credit calculations and reporting must follow:

- `clientConsumedCredits = sum(task.credits where resolution != cancelled)`

This means:

- completed tasks count
- archived tasks count
- cancelled tasks do not count

Reports are expected to use credits as an operational metric, including:

- credits consumed
- credits completed
- credits in progress
- credits by client
- credits by collaborator

## 8. Rework Tracking

Rework is explicitly tracked as part of the task analytics model.

Current rework indicators:

- `reviewCycles`
- `adjustmentCycles`

These fields measure how many times a task passed through revision or correction loops.

Important rule:

- rework does not automatically change task credits

This means the platform distinguishes between:

- operational complexity and effort already priced into the task
- workflow inefficiency caused by review or adjustment loops

That distinction is important for both agency reporting and internal delivery analysis.

## 9. Simulation Mode

The Reports Dashboard includes a simulation mode for visual validation when real operational data is not yet sufficient.

Simulation mode is used to:

- preview dashboard density
- validate layouts and charts
- test client and collaborator tables
- simulate realistic agency workflow behavior

The simulated dataset should represent a busy agency operation with:

- multiple clients
- many active tasks
- non-zero workflow distribution
- approvals and delays
- rework behavior
- collaborator workload variation
- meaningful trend movement over time

Important rules:

- simulation mode must not replace the real analytics architecture
- real data remains the default source when simulation is disabled
- simulation is a safe preview mode for design, UX, and analytics validation

## Architectural Summary

WePlanner should be understood as a workflow platform with analytics-first modeling.

The key architectural principles are:

- visual columns remain customizable
- semantic workflow stages remain canonical
- status and resolution are separate concepts
- analytics depend on history, time-in-stage, and rework cycles
- credits represent workload, not workflow movement
- reports are a first-class product surface, not an afterthought

Future changes should preserve these principles so the platform remains consistent across task management, reporting, workload measurement, and client operations.
