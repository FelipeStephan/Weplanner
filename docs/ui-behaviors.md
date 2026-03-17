# UI Behaviors With Architectural Impact

## Why this file exists

Some UI interactions are not purely visual. They change workflow state, analytics data, or persistence behavior.

These behaviors need documentation because they affect system logic.

## Task completion behavior

Completing a task is not only a visual badge change.

The board logic can:

- update task resolution
- move the task to the done column
- preserve previous column context for restore flows

Current behavior rule:

- completing from the board card and completing from the task detail modal must use the same system flow
- a completed task is moved to the board column whose `baseStatus = done`
- after this automatic movement, the card must appear in minimized format by default

## Task action menus

Task cards and task detail modal actions are expected to stay aligned.

Actions currently include concepts such as:

- edit task
- duplicate
- copy link
- cancel task
- archive task

These actions affect resolution and board visibility, not only UI state.

## Create/edit modal behavior

The task modal is architecture-aware.

Important behavior:

- users choose `Coluna inicial`
- the modal does not create arbitrary workflow statuses
- the board receives the selected column and derives status

## Rich text descriptions

Descriptions use rich text editing and must preserve formatting when saved and rendered.

Current behavior expectations:

- preserve line breaks
- preserve paragraph spacing
- preserve simple formatting such as bold and italic

Cards show plain previews, while the detail modal shows formatted content.

## Due date formatting

Due dates are formatted and colored through shared helper logic.

This means UI state depends on system rules:

- warning and overdue colors are derived dynamically
- time is displayed only when explicitly set

## Drag-and-drop behavior

Board drag interactions affect system data.

Current drag-enabled behaviors:

- move task across columns
- reorder task within a column
- reorder columns horizontally

These interactions update persisted board state and may create workflow history changes.

## Card visual state rules

Task cards can be expanded or minimized, and this visual state now has system-backed behavior expectations.

Current rules:

- newly created tasks must appear minimized by default
- tasks moved automatically by system actions must appear minimized in the destination column
- manual drag-and-drop must preserve the card visual state

## Credit value formatting in reports

Credit values in reporting views should use explicit text labels for readability.

Current expectation:

- prefer textual format such as `120 créditos`
- use textual rates such as `7.2 créditos/dia`
- avoid icon-only representations for KPI values in reports

## Deadline health drill-down

The workflow section includes deadline health metrics that can open an actionable task list.

Current behavior:

- clicking `Prazos em atenção` or `Tarefas em atraso` opens a modal list of matching tasks
- each list item shows task-oriented metadata with status badge, credit badge, and iconized client / board / due-date context
- each list item has a direct action (`Ver tarefa`)
- `Ver tarefa` opens a new browser tab using the Kanban deep-link
- board routing uses hash query (`/kanban-workspace?board=<id>&card=<id>`) and opens the task detail modal automatically

## Board history UI

The `Historico` modal is part of the board experience.

Opening history does not change task state, but restore and delete actions do.

This is why board history should be treated as workflow-adjacent system behavior, not just a passive modal.

## Board header controls

The board header uses lightweight inline controls instead of a separate top app header.

Current behavior expectations:

- board settings are opened from the `...` action in the board header
- board member management is opened from the avatar stack next to the board name
- the header avatar stack intentionally shows at most 5 visible avatars plus a `+N` overflow indicator
- board description text should stay visually bounded so it does not push header actions out of balance

## Sidebar shell behavior

The app sidebar now has product-facing behavior beyond simple navigation.

Current expectations:

- `Visao geral` is a real page entry, not just a label
- the `Board` item supports two separate interactions:
  - clicking the row opens the board page
  - clicking the chevron expands or collapses the board list
- the board list acts as a lightweight accordion inside the sidebar

Profile and utility expectations:

- the user profile appears near the top of the sidebar, below the product mark
- the profile row should stay visually lightweight and should not compete with the sidebar collapse chevron
- the footer utility area contains compact controls such as theme toggle and session exit

Important rule:

- navigation state should be communicated primarily by the active menu fill state
- avoid duplicating active-page meaning with redundant subtitle labels under the brand area

## Overview task list behavior

Tasks rendered in `Visao Geral` follow a dashboard list pattern, not a kanban-card pattern.

Current expectations:

- no drag-and-drop
- no expandable card behavior
- compact horizontal scan layout
- status badge and deadline state still use shared system rules
- avatar stacks remain reusable across board, reports, and overview contexts
- due time must be shown when the task has an explicitly defined time
- each task row can navigate directly to the related task in the board workspace
- overview-origin navigation should open in a new browser tab to preserve the dashboard context

## Overview alerts behavior

The alerts block in `Visao Geral` is actionable, not informational only.

Current behavior:

- alert items can link directly to the related task
- the CTA should stay lightweight and arrow-based instead of using a heavy button label
- navigation uses the same board deep-link pattern already used in reports and board integrations
- overview-origin alert navigation should open in a new browser tab
- expected route shape:
  - `/kanban-workspace?board=<boardId>&card=<taskId>`

This keeps navigation behavior consistent between:

- reports deadline drill-down
- overview alerts
- board task opening from route state

## Overview recent activity behavior

The `Atividade recente` block also behaves as navigable operational context.

Current behavior:

- each activity row can open the related task in the board workspace
- rows use the same compact arrow CTA language used in overview alerts
- the block should stay list-based and not inherit kanban-card interaction patterns
- this block should behave as a user-relevant notification stream, not as a global workspace log
- activity-origin navigation should open in a new browser tab from the overview page
- priority should be given to:
  - comments where the user was mentioned
  - actions in tasks where the user is assigned
  - high-signal task updates that require awareness or response

Interaction expectation:

- all navigable overview surfaces should provide a visible hover affordance
- this includes task rows, alerts, activity rows, and board cards
- hover feedback should stay subtle and product-like:
  - slight elevation
  - soft border emphasis
  - small icon/arrow response when present

## Client library structure

The client library shown in `Visao Geral` should be treated as a structured feature, not hardcoded page content.

Current architecture:

- raw resource catalog lives in demo data
- the page consumes resources through `clientLibraryRepository`
- local persistence overlays the seed catalog so libraries can be edited without changing the page contract
- a reusable modal (`ClientLibraryModal`) is the main interaction surface
- future backend integration should replace the repository internals, not the page contract

Current UX expectations:

- client cards in overview open the library modal instead of navigating away
- clicking the client name in the task detail modal can open the same library modal
- library resources always open in a new browser tab
- the editing experience stays list-based for MVP simplicity
- the overview section should expose an explicit `Cadastrar biblioteca` action so the feature is discoverable even when the user does not start from a task

## Task detail comments layout

The task detail modal uses a persistent split layout so comments remain visible while users review task content.

Current behavior:

- the top tabs (`Detalhes`, `Anexos`, `Atividades`) were removed from the modal
- `Anexos` is now rendered inside the details column (left side)
- the right column is dedicated to collaboration context and has a button to toggle `Comentários` / `Atividades`
- the footer action (`Concluir tarefa`) is scoped to the details column only, not the full modal width
- modal sizing is viewport-based (`h`/`w` in screen percentage) to keep a full, consistent workspace and avoid hug-content shrinking
