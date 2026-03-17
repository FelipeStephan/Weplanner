# Database Entity Map

This document maps the current frontend/domain concepts to a future relational database model.

## Core entities

### Board

Represents one operational workspace.

Suggested fields:

- `id`
- `workspace_id` or `tenant_id`
- `name`
- `created_at`
- `updated_at`

### Column

Represents a visible board column.

Suggested fields:

- `id`
- `board_id`
- `name`
- `base_status`
- `display_order`
- `accent_color`
- `created_at`
- `updated_at`

Important:

- `name` is user-facing and customizable
- `base_status` is semantic and powers workflow analytics
- multiple columns may share the same `base_status`

### Task

Represents one unit of operational work.

Suggested fields:

- `id`
- `board_id`
- `column_id`
- `title`
- `description_html`
- `priority`
- `status`
- `resolution`
- `credits`
- `due_at`
- `status_changed_at`
- `created_at`
- `updated_at`
- `completed_at`
- `cancelled_at`
- `archived_at`
- `client_id`

Analytics aggregate fields may live either on the task row or in a derived table:

- `total_time_in_progress`
- `total_time_in_review`
- `total_time_in_adjustments`
- `total_time_in_approval`
- `review_cycles`
- `adjustment_cycles`

### TaskStatusHistory

Tracks workflow transitions.

Suggested fields:

- `id`
- `task_id`
- `from_column_id`
- `to_column_id`
- `from_status`
- `to_status`
- `entered_at`
- `exited_at`
- `duration_in_seconds`
- `changed_by`
- `change_type`
- `created_at`

### User

Represents a person in the system.

Suggested fields:

- `id`
- `workspace_id` or `tenant_id`
- `name`
- `email`
- `role`
- `avatar_url`
- `created_at`
- `updated_at`

### Client

Represents the business client served by the agency.

Suggested fields:

- `id`
- `workspace_id` or `tenant_id`
- `name`
- `sector`
- `avatar_url`
- `credit_balance`
- `created_at`
- `updated_at`

### Subtask

Represents a checklist item inside a task.

Suggested fields:

- `id`
- `task_id`
- `title`
- `is_done`
- `assignee_id`
- `due_at`
- `display_order`

### ActivityLog

Represents user-visible or audit-relevant events.

Suggested fields:

- `id`
- `board_id`
- `task_id`
- `actor_id`
- `action`
- `metadata_json`
- `created_at`

## Relationship map

- one board has many columns
- one board has many tasks
- one column has many tasks
- one task has many status history entries
- one task has many subtasks
- one task may belong to one client
- many users may be assigned to many tasks through a join table

## Recommended join tables

### TaskAssignees

- `task_id`
- `user_id`
- `assigned_at`

### TaskTags

- `task_id`
- `tag_name`
- `tag_color`

## Important business mapping

- active workflow is column-driven
- `status` is derived from `column.base_status`
- `resolution` is separate from `status`
- cancelled tasks remain historically visible but should not consume client credits

## Notes for future backend work

- `description_html` should preserve rich text formatting
- due dates should be stored as full datetime values
- display labels must still come from columns, not raw workflow values
- deleted tasks should be explicit and not automatic in the current MVP direction
