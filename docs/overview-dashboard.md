# Overview Dashboard

## Purpose

`Visao Geral` is now the main operational landing page of the product.

It is not a reporting page and it is not a board page.

Its job is to help the current user quickly understand:

- what needs attention
- what is assigned to them
- which boards matter most right now
- which clients/resources are relevant
- what happened recently in the workspace

## Routing

The overview dashboard is the default shell entry point.

Current routes:

- `#/` -> overview dashboard
- `#/overview-dashboard` -> overview dashboard
- `#/kanban-workspace?board=<boardId>` -> board workspace
- `#/reports-dashboard` -> reports
- `#/design-system` -> design system

## Data source

The page reads from the persisted workspace snapshot and derives its own view model through:

- `src/repositories/overviewRepository.ts`

This keeps operational derivation outside the page component and prepares the overview for future backend replacement.

## Main sections

The current overview page includes:

1. Header
- current date
- page title
- supporting subtitle

2. KPI cards
- `Em andamento`
- `Concluidas hoje`
- `Proximas do prazo`
- `Atrasadas`

3. `Minhas tarefas`
- compact horizontal task list
- tabs: `Todas`, `Hoje`, `Atrasadas`
- bottom action to open the board workspace

4. `Avisos`
- warning and overdue task alerts
- each alert can open the related task in the board workspace

5. `Seus boards`
- quick access cards for visible boards

6. `Atividade recente`
- lightweight recent feed derived from task history and task metadata
- this feed is not intended to show every workspace event
- it should prioritize events that matter directly to the current user
- each activity row can open the related task in the board workspace

7. `Biblioteca de clientes`
- quick resource cards per visible client
- clicking a client card opens the client library modal inside the overview page
- section header now includes an explicit `Cadastrar biblioteca` entry point

## Task list pattern outside Kanban

Important UI rule:

- overview task items must not reuse kanban-card behavior
- they use a compact scanning-friendly horizontal list pattern
- they should not expand like board cards
- they should not introduce drag-and-drop behavior

Expected item composition:

- status dot
- task title
- status badge
- client
- due date
- due time when the task explicitly has a time defined
- overdue / warning indicator when needed
- assignee avatars

Behavior:

- each task row is clickable
- clicking a task row opens the board workspace using the board/task deep-link
- overview-driven task navigation should open in a new browser tab instead of replacing the current overview page

This same list-oriented pattern should be reused in future dashboard-like pages when tasks need to be scanned quickly outside the board.

## Scope rules

The overview is role-aware.

Current intent:

- `manager` sees visible operational scope across visible boards
- `collaborator` focuses on assigned tasks
- `client` uses visible board scope inside its allowed environment

This scope is currently derived in the repository layer from:

- viewer role
- visible boards
- task assignees
- task deadlines

## Activities

The recent activity block is currently a derived feed, not a fully persisted event stream.

It is built from:

- task status history
- comment counts
- attachment counts
- task timestamps

Current product rule:

- the block should behave more like a lightweight notification feed than a generic audit feed
- it should prioritize comments where the current user was mentioned
- it should also prioritize relevant actions in tasks where the current user is assigned
- it should not become a noisy list of unrelated workspace changes

Behavior:

- each activity row is clickable
- each row uses the same lightweight arrow CTA language adopted in alerts/reports drill-downs
- clicking a row opens the related task in board context through the board/task deep-link
- overview-driven activity navigation should open in a new browser tab

Future backend implementation may replace this with a true `ActivityLog` source without changing the page contract.

Recommended future event types for this block:

- mention in comment
- new comment in an assigned task
- file attachment added to an assigned task
- workflow movement in an assigned task
- due-date update in an assigned task

This keeps the block useful as a notification surface without turning it into a duplicated reports feed.

## Client library

The client library is now a reusable product feature, not only a visual card list.

This is intentional for V1:

- the card structure is already productized
- it opens through a reusable modal
- the same modal can be triggered from overview cards and task-related client surfaces
- links always open in a new browser tab
- the source can later move to backend/client resources
- the overview page does not need to read raw mock catalogs directly
- the page contract does not need redesign when that happens

Current structure:

- static resource catalog: `src/demo/clientLibraryCatalog.ts`
- access layer: `src/repositories/clientLibraryRepository.ts`
- local persistence overlay: `src/app/data/client-library-persistence.ts`
- reusable modal: `src/app/components/shared/ClientLibraryModal.tsx`

This keeps the feature ready for future backend replacement without changing the overview UI contract.

Current modal expectations:

- supports scroll for long link lists
- supports empty state when a client has no registered library yet
- supports simple list-based editing in the same modal
- supports create/edit/remove item interactions for MVP
- overview also exposes a lightweight client selector modal to choose which client library to create or edit
- each resource item should expose:
  - icon
  - label
  - URL
  - link-out action in new tab

## Relationship with reports

High-level distinction:

- overview = quick operational reading and navigation
- reports = filtered analytics and management intelligence

The overview should stay lightweight and action-oriented, not become a second reports dashboard.

## Alert navigation

The alerts section is actionable.

Current behavior:

- each alert item includes a compact arrow action
- the action navigates to the kanban workspace using the board/task deep-link
- overview-driven alert navigation should open in a new browser tab
- the task detail modal should open automatically in the board context when the route includes `card=<taskId>`

This keeps the overview useful as a triage surface instead of a passive summary page.
