# System Overview

## Product purpose

WePlanner is a workflow and operational analytics platform for agencies, service teams, and collaborators.

The system combines:

- board-based execution
- task lifecycle management
- client workload tracking
- credits-based operational measurement
- reporting and workflow analytics

The platform is intended to support agency operations where a task is both a delivery unit and a measurable workload item.

## Main modules

The current application is organized around these main functional modules:

- Overview dashboard
- Design System / component showcase
- Kanban workspace
- Reports dashboard
- Task creation and task detail modals
- Shared UI components and badges

## Page structure

The top-level application currently switches between four primary page views:

- `overview-dashboard`
- `design-system`
- `kanban-workspace`
- `reports-dashboard`

Hash routing is used in the app shell:

- `#/`
- `#/overview-dashboard`
- `#/design-system`
- `#/kanban-workspace`
- `#/kanban-workspace?board=<boardId>`
- `#/reports-dashboard`

The overview dashboard is the default entry surface when no specific page route is selected.

## User roles

The application recognizes three main user roles in the frontend:

- `client`
- `manager`
- `collaborator`

Role switching is currently handled in the app shell and used to alter banners, labels, and access expectations.

Current product intent:

- managers have the broadest operational and reporting access
- clients focus on project visibility, task state, and credits
- collaborators focus on assigned work and execution

## Core relationships

The main operational relationship is:

- a board contains columns
- a viewer only sees boards allowed by role/access scope
- board access is user-based, including client-facing users
- columns define workflow semantics through `baseStatus`
- tasks live inside columns
- tasks derive workflow status from the column where they are placed
- overview consumes persisted task, board, and history data through a dedicated repository layer
- reports consume persisted task and history data

## Persistence model

The current Kanban workspace uses a persisted frontend snapshot stored in `localStorage`.

This snapshot includes:

- boards
- columns
- tasks
- task status history

Other product areas still mix real state, mock state, and view-level data. This is important when extending the system because not every visible concept is a first-class persisted entity yet.

Other persisted frontend structures now include:

- client library data persisted in localStorage through its own repository/persistence layer

This is relevant because the product now has two distinct frontend persistence domains:

- kanban operational snapshot
- client library resources
