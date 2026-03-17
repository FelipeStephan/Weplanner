# Board Architecture

## Board model

Each board is its own operational environment.

Current persisted board fields:

- `id`
- `name`
- `description`
- `templateKey`
- `access`
- `createdAt`
- `updatedAt`

Current implementation notes:

- boards are first-class entities in the persisted Kanban workspace snapshot
- the default seeded board is `board-my-workspace`
- new boards are created from the `operations-kanban` template
- board access is already modeled for future backend enforcement

## Board access model

Each board stores an `access` object with:

- `managerAccess`
- `memberUserIds`

Current product rule:

- managers can see all boards
- collaborators can only see boards where their `userId` is listed
- clients also access boards as users, not through a separate client-access list
- clients can only see boards where their user id is listed

Important modeling rule:

- board membership is user-based
- clients are treated as users with a client-facing role
- company/client profile data remains separate from board membership

This visibility is currently frontend-driven, but the shape was designed to map cleanly to backend authorization later.

## Board creation

Boards can be created from the sidebar through the `+` action next to `Board`.

Current MVP behavior:

- only managers can create boards
- new boards are created from the standard operational template
- the creation flow accepts:
  - board name
  - description
  - member user list

The template automatically creates the initial column set for that board.

The same board form is also reused for editing board metadata.

Current board header controls:

- members are shown beside the board title
- board settings are exposed from the `...` menu in the board header
- member management is exposed from the avatar stack in the board header

## Column model

Current persisted column fields:

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

Columns are both:

- visual workflow containers
- semantic mapping points to canonical workflow stages

## Column ordering

Columns use the `order` field for visual ordering.

Ordering can change through:

- column creation
- column editing
- horizontal column drag-and-drop

When columns are reordered, the board updates and persists `order` values for that board.

## Card placement

Tasks are placed inside board columns using `columnId`.

The board supports:

- drag-and-drop between columns
- reordering cards inside a column
- inserting before or after another card
- programmatic movement when completing or restoring tasks

## Active board filtering

Active columns only show tasks that are still operationally active.

Tasks with these resolution states are excluded from active board columns:

- `cancelled`
- `archived`

Completed tasks may still appear in the workflow depending on the column/status setup.

## Create/edit column flow

Board managers must define:

- column name
- `baseStatus`

Rules:

- `baseStatus` is required
- multiple columns may share the same `baseStatus`
- changing a column `baseStatus` updates derived task status for tasks currently in that column

## Board-scoped behavior

The board is also responsible for:

- creating tasks into specific columns
- creating columns inside the current board
- rendering only the columns that belong to the current board
- editing board metadata
- managing board members
- deleting the current board
- restoring archived/cancelled tasks
- maintaining board-level history
- persisting board snapshot updates

Current deletion rule:

- the last remaining board cannot be deleted

## Sidebar board navigation

The sidebar `Board` item is now a board group, not only a single page link.

Current behavior:

- the main `Board` item opens the active or default visible board
- nested board items are rendered below it
- the board list is filtered by current viewer role/access
- selecting a board updates the route with the board identifier

Current route pattern:

- `#/kanban-workspace?board=<boardId>`

## Persistence

The current board architecture is persisted in the Kanban snapshot stored in `localStorage`.

This includes:

- boards
- columns
- tasks
- task status history

The board loader also contains defensive hydration logic to recover from invalid or outdated persisted snapshots.
