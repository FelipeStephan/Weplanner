# Sistema de Créditos — Arquitetura

> Documento de referência para futura integração com backend.
> Última atualização: 2026-03-27

## Visão Geral

O sistema de créditos permite que cada tarefa tenha um **peso operacional** (`task.credits`), usado para calcular o consumo de entrega por cliente e por período.

A lógica é **data-driven**: o badge e o campo de créditos aparecem **automaticamente** somente quando a tarefa possui `credits > 0`. Não é necessária nenhuma configuração no board.

## Controle de exibição — data-driven

| Cenário | Resultado |
|---------|-----------|
| `task.credits > 0` | badge e campo exibidos normalmente |
| `task.credits === 0` ou `undefined` | campo e badge **não aparecem** |

> **Regra fundamental:** O campo `task.credits` é uma propriedade da tarefa. Não há toggle por board. O board não afeta a visibilidade do campo de créditos.

## Nível Global (Workspace Settings)

| Campo | Tipo | Padrão |
|-------|------|--------|
| `workspaceSettings.creditsEnabled` | `boolean` | `true` |

- Configurado na página `/settings` → seção "Configurações operacionais"
- Quando `false`, o campo e o badge de créditos são **ocultos em todo o workspace**, independente do valor de `task.credits`
- Os valores são **preservados** — nunca apagados
- Armazenado em `WorkspaceSettingsContext` (frontend) / tabela `workspace_settings` (backend)

## O que foi removido

A versão anterior possuía um **toggle por board** (`board.creditsEnabled`). Esse controle foi **removido** por simplificação arquitetural:

- `PersistedBoardRecord.creditsEnabled` — removido
- `BoardRecord.creditsEnabled` — removido
- `BoardCreateInput.creditsEnabled` — removido
- Toggle no `CreateBoardModal` — removido
- Lógica `boardCreditsEnabled` no `KanbanWorkspacePage` — removida

## Lógica efetiva de exibição (atual)

```ts
// No componente de card/modal:
const showCreditsField = workspaceSettings.creditsEnabled && (task.credits ?? 0) > 0;
```

## Comportamento ao mover tarefas entre boards

Como não há mais configuração por board, o comportamento é uniforme:

| Cenário | Comportamento |
|---------|---------------|
| Qualquer board com `credits > 0` | badge exibido |
| Qualquer board com `credits === 0` | badge não exibido |

## Relatórios

O cálculo de consumo segue a regra de resolução (não muda):

```ts
clientConsumedCredits = tasks
  .filter(task => task.resolution !== 'cancelled')
  .reduce((sum, task) => sum + (task.credits ?? 0), 0);
```

## AvatarStack no header dos Relatórios

O `<AvatarStack>` no cabeçalho do dashboard de relatórios representa os **usuários com papel `manager`** que têm acesso ao relatório.

**No backend, isso deve ser:**
```sql
SELECT u.id, u.name, u.avatar_url
FROM users u
WHERE u.workspace_id = :workspace_id
  AND u.role = 'manager'
  AND u.status = 'active'
ORDER BY u.created_at ASC
LIMIT 8;
```

**Por que manter:** É uma informação operacional relevante — o gestor que acessa o relatório sabe quem mais tem visibilidade dos dados de performance da equipe.

## Esquema de banco sugerido (atualizado)

```sql
-- Tabela workspaces (toggle global permanece)
ALTER TABLE workspaces
  ADD COLUMN credits_enabled BOOLEAN NOT NULL DEFAULT true;

-- Tabela boards (toggle por board foi REMOVIDO — não adicionar)
-- A coluna credits_enabled NÃO deve existir em boards

-- Lógica de exibição:
-- SELECT (w.credits_enabled AND t.credits > 0) AS show_credits
-- FROM tasks t
-- JOIN boards b ON t.board_id = b.id
-- JOIN workspaces w ON b.workspace_id = w.id
-- WHERE t.id = :task_id;
```
