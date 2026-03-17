# Product Rules

## Workflow rules

- task workflow status is derived from `column.baseStatus`
- task creation must choose a board column, not a free-form status
- columns may have custom names, but they must always define a `baseStatus`
- multiple columns may share the same `baseStatus`
- tasks belong to a specific `boardId`
- tasks may only be created in columns that belong to the current board

## Board rules

- boards are first-class operational environments
- managers can see all boards
- collaborators can only see boards where they are explicitly linked
- clients can only see boards where their user account is explicitly linked
- new boards are created from the default operational board template
- board membership is managed through users only
- clients are treated as users for board access
- the last remaining board cannot be deleted in the current MVP

## Resolution rules

- `completed`, `cancelled`, and `archived` are resolution states
- resolution is separate from workflow status
- archived and cancelled tasks must not remain visible in active board columns
- archived and cancelled tasks must remain recoverable through board history

## Credits rules

- every task has a credits value
- credits represent effort or workload, not only card existence
- rework does not automatically change credits
- credit changes should be tracked in the activity log
- cancelled tasks do not consume client credits
- archived tasks still consume client credits
- completed tasks consume client credits normally
- reports credit consumption must use the same rule:
  - `clientConsumedCredits = sum(task.credits where resolution != cancelled)`
- credit dashboard risk signals should classify client consumption as:
  - healthy
  - attention
  - critical

## Rework rules

- rework is measured through `reviewCycles` and `adjustmentCycles`
- rework must be visible in analytics and reports
- rework does not automatically increase client consumption

## Due date rules

- due date display must be consistent across cards and modals
- more than 24 hours remaining -> neutral state
- 24 hours or less remaining -> warning state
- past deadline -> overdue state
- time must only be shown when the user explicitly defined a time

## History rules

- archived and cancelled tasks belong to board-level history
- history is scoped to the current board
- history is not a board column
- history is not part of reports in this MVP
- restoring a historical task should place it back into a valid active column

## Task detail interaction rules

- task detail must prioritize side-by-side productivity: task context on the left and collaboration context on the right
- attachments are part of the details column experience
- activities are accessed from the collaboration column, not from a top tab strip
- the completion footer action is limited to the details column area
- modal workspace uses viewport-relative sizing to keep a stable, full reading/editing surface

## Documentation maintenance rule

When the instruction `documentar novamente a arquitetura` is given:

1. review the codebase again
2. compare implementation against `/docs`
3. update only what changed
4. add new product rules and architecture decisions
5. keep docs synchronized with real behavior
