# Authorization Model

This document describes the intended access model for WePlanner.

## Current product roles

- Client
- Gestor
- Colaborador

## Current implementation state

Role handling is currently frontend-driven for navigation, board visibility, and presentation.

This means:

- role-based visibility exists at the UI level
- board access is filtered in the frontend using persisted board access metadata
- backend enforcement does not exist yet
- this must change before production authentication is introduced

Current board membership rule:

- board access is user-based
- clients are treated as users with a client-facing role
- board access no longer depends on a separate client access list

## Intended permission direction

### Client

Should be able to:

- see only boards explicitly linked to their user id
- view their own projects and tasks
- follow progress and delivery states
- view credit balance and consumption
- access client-facing dashboards and reports only within allowed scope

Should not be able to:

- manage internal workflow structure
- edit cross-client data
- access internal management analytics

### Gestor

Should be able to:

- see all boards
- manage boards, columns, tasks, credits, and team allocation
- edit credits manually
- access operational reports and history
- restore or archive tasks

### Colaborador

Should be able to:

- see only boards explicitly linked to their `userId`
- view and update assigned tasks
- interact with subtasks, attachments, comments, and activity
- access personal productivity and scoped team views when allowed

## Recommended future backend enforcement

The backend should own authorization decisions for:

- board access
- board creation permissions
- task mutations
- credit editing
- history visibility
- report visibility

The frontend should only reflect the permissions returned by the backend.

## AI agent note

Future AI agents must not assume current UI-level role handling is sufficient for production security. Any backend work must implement authorization as a real system boundary.
