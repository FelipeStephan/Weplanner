# Client Management

## Overview

The client management module allows workspace managers to create, manage, and track clients and their associated resources, team members, boards, and credits.

It is accessible through the `/clients` route and the sidebar item "Clientes" (visible only to managers or users with `canEditClients = true`).

---

## ClientRecord

The canonical client data structure is defined in `src/domain/clients/contracts.ts`:

```ts
interface ClientRecord {
  id: string;
  name: string;
  sector?: string;
  logoUrl?: string;
  responsibleUserId?: string;    // ID of a manager responsible for this client
  status: 'active' | 'onboarding' | 'inactive';
  creditsEnabled: boolean;       // when false, client is hidden from all credit views
  contractedCredits?: number;    // total credits contracted with the client
  boardIds: string[];            // soft link to boards — no structural rule
  libraryResources: ClientLibraryResource[];
  createdAt: string;
  updatedAt: string;
}
```

---

## ClientLibraryResource

Each client has a library of links organized by type:

```ts
interface ClientLibraryResource {
  id: string;
  label: string;
  href?: string;
  type: 'drive' | 'brand' | 'social' | 'links' | 'other';
}
```

When a client is created, **4 default empty slots are created automatically**:

- Drive (banco de imagens)
- Identidade visual (Figma)
- Redes sociais
- Links importantes

These are seeded by `buildDefaultLibraryResources(clientId)` from the contracts file.

---

## Client Lifecycle

```
CreateClientModal → clientsRepository.create() → CLIENTS_DEMO_SEED + localStorage
  ↓ library auto-initialized with 4 default slots
ClientPanel
  ↓ Aba Perfil → editar nome, setor, logo URL, responsável, status
  ↓ Aba Biblioteca → editar links, adicionar slots extras
  ↓ Aba Equipe → ver membros com clientId === this.id, convidar novo
  ↓ Aba Boards → vincular/desvincular boards (soft link)
  ↓ Aba Créditos → toggle creditsEnabled, editar contractedCredits
```

---

## Status

| Status | Label | Meaning |
|--------|-------|---------|
| `active` | Ativo | Client is actively managed |
| `onboarding` | Em onboarding | Client is being onboarded, not fully active |
| `inactive` | Inativo | Client has been paused or finished |

Default for new clients: `onboarding`.

---

## Credits per Client

Credits are controlled per client through two fields:

| Field | Purpose |
|-------|---------|
| `creditsEnabled` | When `false`, client is hidden from all credit KPIs and reports |
| `contractedCredits` | Total credits contracted — used as the budget reference |

### Rules

- `creditsEnabled = true` + `contractedCredits` set → shows progress bar (consumed/contracted)
- `creditsEnabled = true` + no `contractedCredits` → shows consumed count, no progress bar
- `creditsEnabled = false` → client is completely hidden from credit views in Overview and Reports

This is the per-client equivalent of the global `WorkspaceSettings.creditsEnabled` master switch.

---

## Board Links

- `ClientRecord.boardIds` is a list of board IDs linked to the client
- This is a **soft link** — no structural enforcement
- The same board can be linked to multiple clients
- A board does not need to be linked to any client
- Links are managed from the "Boards" tab in the ClientPanel

---

## Member Links

- Members with `role === 'client'` have a `clientId` field linking them to a `ClientRecord`
- The "Equipe" tab in ClientPanel lists these members
- Clicking "Convidar usuário cliente" opens the `TeamInviteModal` pre-filled with `role = client` + `clientId`

---

## Access Control

| Action | Who can perform |
|--------|----------------|
| View "Clientes" in sidebar | `manager` or `canEditClients = true` |
| View client details | Any user with page access |
| Create / edit / delete client | `manager` or `canEditClients = true` |
| Edit library resources | `manager` or `canEditClients = true` |

### `canEditClients` permission

This permission was added to the `MemberPermissions` type in `src/domain/team/contracts.ts`.

It can be toggled per-member from the "Permissões" tab in the `TeamMemberPanel`.

Managers always have this permission implicitly.
Client users (`role = 'client'`) never receive this permission.

---

## Persistence

Clients are persisted in `localStorage` under the key:

```
weplanner:clients:v1
```

The repository is `src/repositories/clientsRepository.ts`.

If `localStorage` is empty, the seed data from `src/demo/clientsDemoData.ts` is used.

### Demo seed

5 clients are pre-loaded:

| Client | Sector | Status | creditsEnabled | contractedCredits |
|--------|--------|--------|---------------|-------------------|
| Arcadia | Tecnologia | active | true | 300 |
| WePlanner | SaaS | active | true | 150 |
| iFood | Delivery | active | true | 500 |
| Nubank | Fintech | onboarding | true | 200 |
| Ambev | Bebidas | active | **false** | — |

---

## UI Components

| File | Responsibility |
|------|---------------|
| `ClientsPage.tsx` | Main page — header, filters, grid, panel integration |
| `ClientCard.tsx` | Grid card — logo/initials, status badge, credit summary, responsible, boards |
| `ClientPanel.tsx` | Side panel — 5 tabs (Perfil, Biblioteca, Equipe, Boards, Créditos) |
| `CreateClientModal.tsx` | New client form — name, sector, logo URL, responsible, status, credits |

---

## Database Schema (future backend)

```sql
CREATE TABLE clients (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id       UUID NOT NULL REFERENCES workspaces(id),
  name               VARCHAR(255) NOT NULL,
  sector             VARCHAR(100),
  logo_url           TEXT,
  responsible_user_id UUID REFERENCES users(id),
  status             VARCHAR(20) NOT NULL DEFAULT 'onboarding',
  credits_enabled    BOOLEAN NOT NULL DEFAULT TRUE,
  contracted_credits INTEGER,
  board_ids          UUID[] DEFAULT '{}',
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE client_library_resources (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id  UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  label      VARCHAR(255) NOT NULL,
  href       TEXT,
  type       VARCHAR(20) NOT NULL,
  sort_order INTEGER DEFAULT 0
);
```

---

## Routing

```
/#/clients → ClientsPage
```

Registered in `App.tsx` via `pageView === "clients"`.
Sidebar item: "Clientes" with `Building2` icon (Lucide).
