# Team Management — Arquitetura

> Documento de referência para futura integração com backend.
> Criado em: 2026-03-27

## Visão Geral

O módulo de gestão de equipe gerencia **membros**, **convites** e **permissões** de acesso ao workspace do WePlanner.

## Arquivos principais

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/app/components/team/TeamPage.tsx` | Página principal — lista, filtros, convites pendentes |
| `src/app/components/team/TeamMemberCard.tsx` | Card de visão geral do membro na grade |
| `src/app/components/team/TeamMemberPanel.tsx` | Painel lateral de detalhes e edição do membro |
| `src/app/components/team/TeamInviteModal.tsx` | Modal de convite de novos membros |
| `src/repositories/teamRepository.ts` | Camada de acesso a dados (localStorage → futuramente API) |
| `src/domain/team/contracts.ts` | Tipos `TeamMember`, `TeamInvite`, `MemberPermissions` |
| `src/demo/teamDemoData.ts` | Dados de demonstração para a UI |

## Roles disponíveis

| Role | Label | Permissões |
|------|-------|-----------|
| `manager` | Gestor | Acesso total — configurações, equipe, boards, relatórios |
| `collaborator` | Colaborador | Executa tarefas, visualiza boards atribuídos |
| `client` | Cliente | Visão reduzida — apenas entregas e créditos do próprio cliente |

## Ciclo de vida do membro

```
convite enviado (invited)
    ↓
link aceito → cadastro completo (active)
    ↓
desativado pelo gestor (inactive)
    ↓
excluído permanentemente (deleteMember)
```

### Status possíveis

| Status | Descrição |
|--------|-----------|
| `invited` | Convite enviado, cadastro pendente |
| `active` | Membro ativo no workspace |
| `inactive` | Membro desativado (soft delete) |

## Fluxo de convite (atual)

1. Gestor abre `TeamInviteModal`
2. Informa: email, role, cliente (opcional)
3. **Não é mais possível atribuir boards durante o convite** — o acesso é configurado manualmente depois no painel do membro
4. Um `TeamInvite` é criado com `status = pending` e expira conforme `workspace_settings.inviteExpiryDays`
5. Um `TeamMember` com `status = invited` é criado simultaneamente

### Por que boards foram removidos do convite

- Simplifica o fluxo de onboarding
- Evita configuração prematura antes do membro criar a conta
- O gestor atribui boards com contexto real após o cadastro

## Exclusão de membro

| Ação | Tipo | Resultado |
|------|------|-----------|
| Desativar | Soft delete | `status = inactive`, histórico preservado |
| Excluir | Hard delete | Removido permanentemente da lista |

### Regras de exclusão

- Apenas **gestores** podem excluir membros
- Um gestor **não pode excluir seu próprio perfil**
- A exclusão passa por um **fluxo de confirmação inline** destrutivo com aviso de permanência
- Implementado em: `teamRepository.deleteMember(id, seed)`

## Permissões (`MemberPermissions`)

Cada membro pode ter permissões granulares configuradas pelo gestor no painel lateral:

```ts
interface MemberPermissions {
  canManageTasks: boolean;
  canInviteMembers: boolean;
  canViewReports: boolean;
  canManageCredits: boolean;
}
```

## Esquema de banco sugerido

```sql
-- Tabela members
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('manager', 'collaborator', 'client')),
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'inactive')),
  avatar_url TEXT,
  job_title TEXT,
  client_id UUID REFERENCES clients(id),
  invited_at TIMESTAMPTZ,
  invited_by UUID REFERENCES members(id),
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela member_board_access
CREATE TABLE member_board_access (
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (member_id, board_id)
);

-- Tabela invites
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'cancelled', 'expired')),
  invited_by UUID REFERENCES members(id),
  client_id UUID REFERENCES clients(id),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela member_permissions
CREATE TABLE member_permissions (
  member_id UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
  can_manage_tasks BOOLEAN NOT NULL DEFAULT true,
  can_invite_members BOOLEAN NOT NULL DEFAULT false,
  can_view_reports BOOLEAN NOT NULL DEFAULT false,
  can_manage_credits BOOLEAN NOT NULL DEFAULT false
);
```

## Notas para o backend

- `member_board_access` é gerenciado pelo gestor após o membro aceitar o convite
- Ao excluir um membro (`DELETE FROM members`), verificar regras de soft-delete vs hard-delete com base na política de auditoria
- O token do convite deve ser gerado de forma segura (crypto-random, não timestamp-based como está na demo)
- A expiração do convite deve ser configurável via `workspace_settings.invite_expiry_days`
