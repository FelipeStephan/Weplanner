# Data Model

## Persisted entities in the current Kanban snapshot

The current persisted data model is centered on the Kanban workspace snapshot.

### Board

Current persisted fields:

- `id`
- `name`
- `description`
- `templateKey`
- `access.managerAccess`
- `access.memberUserIds`
- `createdAt`
- `updatedAt`

### Column

Current persisted fields:

- `id`
- `boardId`
- `name`
- `baseStatus`
- `order`
- `createdAt`
- `updatedAt`
- `accentColor`
- `bgClass`
- `iconName`

### Task

Current persisted fields include:

- `id`
- `boardId`
- `columnId`
- `title`
- `description`
- `status`
- `resolution`
- `statusChangedAt`
- `createdAt`
- `updatedAt`
- `completedAt`
- `cancelledAt`
- `archivedAt`
- `dueDate`
- `clientId`
- `assignees`
- `type`
- `priority`
- `dateAlert`
- `tags`
- `tagColors`
- `progress`
- `showProgressBar`
- `showDateAlert`
- `credits`
- `attachments`
- `comments`
- `subtasks`
- `client`
- `previousColumnId`
- `previousStatus`
- `previousProgress`
- analytics aggregate fields

### TaskStatusHistory

Current persisted fields:

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

## Embedded nested data

Several concepts are currently embedded inside the task record instead of being normalized into separate top-level entities.

These include:

- assignees
- client display object
- subtasks summary
- tag color metadata

## UI-level or partially modeled entities

The product language includes entities such as:

- Client
- User
- Subtask
- ActivityLog
- Attachment
- Comment

Current implementation note:

- these are visible in the UI
- some are represented by nested objects or mock data
- they are not all standalone persisted resources in the current snapshot model

## Entity relationship summary

Current implemented relationship pattern:

- `Board 1..n Columns`
- `Board 1..n Tasks`
- `Board 1..1 AccessRecord`
- `Column 1..n Tasks`
- `Task 1..n StatusHistoryRecords`
- `Task embeds assignees, subtasks summary, and some client display data`

## Current board access contract

The board access structure is already modeled to support future backend authorization:

- managers have implicit access through `managerAccess = all`
- all non-manager viewers are scoped by `memberUserIds`

Important rule:

- clients are modeled as users for board membership purposes
- client company/profile records are separate from board access membership

This should later map cleanly to a board membership or access-control table in the backend.

## Architectural caution

When future backend work begins, developers should not assume that every visible UI concept already has a normalized persisted model.

The current codebase contains a mix of:

- persisted Kanban entities
- embedded task data
- mock datasets
- view-only structures for the design system
