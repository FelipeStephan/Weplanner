# Avisos — Alertas Adicionais (Fase 2)

> **Destino:** Desenvolvedor / AI Agent responsável pela implementação.
> **Depende de:** `docs/avisos-refactor-implementation.md` (Fase 1 — due_soon, credit_low, snooze, expand)
> **Escopo:** Novos tipos de alerta para Gestor, Colaborador e Cliente na seção "Avisos" do Dashboard.
> **Atualização de produto:** O perfil Cliente foi revisado — agora é participante ativo (pode criar, editar e mover tasks). Ver `docs/prd/02-profile-architecture.md` para a definição completa atualizada.

---

## 1. Decisões de Produto Confirmadas

### Alertas visíveis para o Gestor (ADMIN)

> **Escopo:** apenas boards onde o gestor está inserido como membro — mesmo que tenha acesso a todos os boards do workspace.

| # | Alerta | Gatilho | Tom |
|---|--------|---------|-----|
| 1 | **Task sem responsável** | Task ativa com `assignees.length === 0` | `warning` (amarelo) — ou `danger` se prazo ≤ 3 dias |
| 2 | **Task sem briefing** | Task ativa com `description` nula, vazia ou com menos de 20 caracteres | `warning` (amarelo) |
| 3 | **Task travada** | Task ativa em `review`, `adjustments` ou `approval` há **3+ dias** sem movimentação | `warning` (amarelo) |
| 4 | **Prazo próximo** | Task ativa com prazo ≤ 24h | `warning` (amarelo) |

> Os alertas 1, 2, 3 e 4 são **internos** — o Cliente nunca os vê.

---

### Alertas visíveis para o Colaborador (COLLABORATOR)

> **Escopo:** apenas tasks onde o colaborador está **explicitamente atribuído** (`assignees` contém seu `userId`).
> O colaborador não vê alertas de organização interna (sem responsável, sem briefing) — apenas alertas de execução direta.

| # | Alerta | Gatilho | Tom |
|---|--------|---------|-----|
| 5 | **Prazo próximo** | Task atribuída a ele com prazo ≤ 24h | `warning` (amarelo) |
| 6 | **Task travada** | Task atribuída a ele em `review`, `adjustments` ou `approval` há **3+ dias** | `warning` (amarelo) |

---

### Alertas visíveis para o Cliente (CLIENT_EXTERNAL)

> **Escopo:** tasks e créditos dos boards explicitamente vinculados ao cliente.
> O Cliente é participante ativo — pode criar, editar e mover tasks. Os alertas refletem isso.

| # | Alerta | Gatilho | Tom |
|---|--------|---------|-----|
| 7 | **Prazo próximo** | Task ativa nos boards do cliente com prazo ≤ 24h (Fase 1) | `warning` (amarelo) |
| 8 | **Créditos esgotando** | Cliente consumiu ≥ 80% do pacote contratado | `danger` (vermelho) |
| 9 | **Task travada** | Task nos boards do cliente em `review`, `adjustments` ou `approval` há **2+ dias** | `warning` (amarelo) |

> O Cliente **não vê** alertas internos da agência (sem responsável, sem briefing).

---

## 2. Thresholds Definidos

| Regra | Valor |
|-------|-------|
| "Briefing vazio" | `description` nula, `undefined`, string vazia, ou com menos de **20 caracteres** após remover tags HTML |
| "Task travada" — Gestor | Task parada na coluna de revisão/ajustes/aprovação há **≥ 3 dias** |
| "Task travada" — Cliente | Task parada na coluna de revisão/ajustes/aprovação há **≥ 2 dias** |
| "Crédito esgotando" | `consumedCredits / contractedCredits >= 0.80` (80% consumido = 20% restante) |
| "Task sem responsável urgente" | `assignees.length === 0` E prazo ≤ 3 dias → tom `danger` |
| "Task sem responsável normal" | `assignees.length === 0` E sem prazo ou prazo > 3 dias → tom `warning` |

---

## 3. Mapa de Visibilidade por Perfil

```
GESTOR (ADMIN) vê:
  ├─ Task sem responsável        (boards onde está inserido como membro)
  ├─ Task sem briefing           (boards onde está inserido como membro)
  ├─ Task travada (3+ dias)      (boards onde está inserido como membro)
  └─ Prazo próximo ≤24h          (boards onde está inserido como membro)
  * Crédito baixo ≤20% — herdado da Fase 1, escopo de workspace (todos os clientes)

COLABORADOR vê:
  ├─ Prazo próximo ≤24h          (apenas tasks onde ELE está atribuído)
  └─ Task travada (3+ dias)      (apenas tasks onde ELE está atribuído)
  * NÃO vê: sem responsável, sem briefing

CLIENTE vê:
  ├─ Prazo próximo ≤24h          (boards vinculados ao cliente)
  ├─ Créditos esgotando ≥80%    (seu próprio saldo)
  └─ Task travada (2+ dias)      (boards vinculados ao cliente)
  * NÃO vê: sem responsável, sem briefing
```

---

## 4. Novos Tipos no `AlertOrigin`

Adicionar ao arquivo `src/domain/alerts/contracts.ts` (criado na Fase 1):

```ts
/**
 * Alerta: task ativa sem responsável atribuído.
 * Tom: warning — ou danger se prazo ≤ 3 dias.
 */
export interface NoAssigneeAlert {
  origin: 'no_assignee';
  taskId: string;
  boardId: string;
  tone: 'warning' | 'danger';
  taskTitle: string;
  clientName: string;
  dueDateLabel: string | null;
  isUrgent: boolean; // true quando prazo ≤ 3 dias
}

/**
 * Alerta: task ativa sem briefing (descrição vazia ou insuficiente).
 * Tom: warning.
 */
export interface NoBriefingAlert {
  origin: 'no_briefing';
  taskId: string;
  boardId: string;
  tone: 'warning';
  taskTitle: string;
  clientName: string;
}

/**
 * Alerta: task parada em coluna de revisão/ajustes/aprovação por mais de X dias.
 * Tom: warning.
 */
export interface StuckInReviewAlert {
  origin: 'stuck_in_review';
  taskId: string;
  boardId: string;
  tone: 'warning';
  taskTitle: string;
  clientName: string;
  columnLabel: string;   // ex: "Revisão", "Ajustes", "Aprovação"
  daysStuck: number;     // quantos dias está parada
}

// Adicionar ao union type AlertOrigin existente:
export type AlertOrigin =
  | DueSoonAlert
  | CreditLowAlert
  | NoAssigneeAlert
  | NoBriefingAlert
  | StuckInReviewAlert;
```

---

## 5. Atualizar `OverviewAlertRow`

Adicionar `origin` ao union já existente em `src/repositories/overviewRepository.ts`:

```ts
export interface OverviewAlertRow {
  id: string;
  tone: 'warning' | 'danger';
  title: string;
  description: string;
  priorityLabel: string;
  origin: 'due_soon' | 'credit_low' | 'no_assignee' | 'no_briefing' | 'stuck_in_review';
  // Contexto de navegação (presente em todos exceto credit_low)
  taskId?: string;
  boardId?: string;
  // Contexto de crédito (apenas credit_low)
  clientId?: string;
}
```

---

## 6. Funções auxiliares

Adicionar no topo da função `build()` em `src/repositories/overviewRepository.ts`, antes de calcular os alertRows:

```ts
// ─── Helpers para novos alertas ───────────────────────────────────────────────

/** Remove tags HTML e retorna apenas o texto plano */
const stripHtml = (html: string): string =>
  html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

/** Retorna true se a descrição da task é considerada vazia ou insuficiente */
const isBriefingEmpty = (description?: string | null): boolean => {
  if (!description) return true;
  return stripHtml(description).length < 20;
};

/** Retorna quantos dias uma task está parada no status atual */
const daysSinceStatusChange = (task: PersistedTaskRecord): number => {
  const ref = task.statusChangedAt || task.createdAt;
  if (!ref) return 0;
  const diff = Date.now() - parseISO(ref).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

/** Statuses que representam revisão/ajustes/aprovação */
const STUCK_STATUSES: PersistedWorkflowStatus[] = ['review', 'adjustments', 'approval'];

/** Label legível por status */
const STUCK_STATUS_LABELS: Partial<Record<PersistedWorkflowStatus, string>> = {
  review: 'Revisão',
  adjustments: 'Ajustes',
  approval: 'Aprovação',
};
```

---

## 7. Lógica dos Novos Alertas em `overviewRepository.ts`

### Pré-requisito: conjunto de tasks por perfil

Antes dos blocos de alerta, calcular os conjuntos filtrados por papel:

```ts
// Tasks do GESTOR: apenas boards onde ele está inserido como membro
// (mesmo que viewer.role === 'manager' tenha acesso a todos, alertas são scopados ao membro)
const managerScopedTasks = viewer.role === 'manager'
  ? activeScopedTasks.filter((task) => {
      const board = visibleBoards.find((b) => b.id === task.boardId);
      return board?.access.memberUserIds.includes(viewer.userId ?? '') ?? false;
    })
  : [];

// Tasks do COLABORADOR: apenas tasks onde ELE está atribuído
const collaboratorScopedTasks = viewer.role === 'collaborator'
  ? activeScopedTasks.filter((task) =>
      task.assignees.some((a) => a.id === viewer.userId)
    )
  : [];

// Tasks do CLIENTE: todas as tasks dos boards vinculados (já em activeScopedTasks)
const clientScopedTasks = viewer.role === 'client' ? activeScopedTasks : [];
```

---

### Blocos de alerta

```ts
// ─── 1. Prazo próximo (due_soon) ─────────────────────────────────────────────
// Gestor: tasks dos boards onde está inserido
// Colaborador: tasks atribuídas a ele
// Cliente: tasks dos boards vinculados
const dueSoonSource =
  viewer.role === 'manager' ? managerScopedTasks :
  viewer.role === 'collaborator' ? collaboratorScopedTasks :
  clientScopedTasks;

const dueSoonAlerts: OverviewAlertRow[] = sortTasksForOverview(dueSoonSource)
  .filter((task) => getTaskDueDateState(task.dueDate, today) === 'warning')
  .map((task) => ({
    id: `due_soon:${task.id}`,
    origin: 'due_soon' as const,
    tone: 'warning' as const,
    title: task.title,
    description: `${formatTaskDueDate(task.dueDate)} · ${task.client?.name || 'Sem cliente'}`,
    priorityLabel: task.priority === 'urgent' ? 'Prioridade urgente' : 'Prazo próximo',
    taskId: task.id,
    boardId: task.boardId,
  }));

// ─── 2. Crédito baixo (credit_low) — Fase 1, manter ──────────────────────────
// Gestor: escopo de workspace (todos os clientes) — herdado da Fase 1
// Cliente: ≥ 80% consumido (novo threshold nesta fase)
// (substituir o threshold da Fase 1 de ≤20% restante para ≥80% consumido — mesma matemática)
// (manter o bloco credit_low da Fase 1 aqui com o threshold correto)

// ─── 3. Task sem responsável (no_assignee) ────────────────────────────────────
// APENAS para Gestor — nunca para Colaborador ou Cliente
const noAssigneeAlerts: OverviewAlertRow[] = viewer.role === 'manager'
  ? managerScopedTasks
      .filter((task) => task.assignees.length === 0)
      .map((task) => {
        const daysUntilDue = (() => {
          const parsed = parseTaskDueDate(task.dueDate).date;
          if (!parsed) return null;
          return Math.ceil((parsed.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        })();
        const isUrgent = daysUntilDue !== null && daysUntilDue <= 3;
        return {
          id: `no_assignee:${task.id}`,
          origin: 'no_assignee' as const,
          tone: isUrgent ? ('danger' as const) : ('warning' as const),
          title: task.title,
          description: task.dueDate
            ? `Prazo: ${formatTaskDueDate(task.dueDate)} · Sem responsável`
            : 'Sem responsável atribuído',
          priorityLabel: isUrgent ? 'Urgente — sem responsável' : 'Sem responsável',
          taskId: task.id,
          boardId: task.boardId,
        };
      })
  : [];

// ─── 4. Task sem briefing (no_briefing) ──────────────────────────────────────
// APENAS para Gestor — nunca para Colaborador ou Cliente
const noBriefingAlerts: OverviewAlertRow[] = viewer.role === 'manager'
  ? managerScopedTasks
      .filter((task) => isBriefingEmpty(task.description))
      .map((task) => ({
        id: `no_briefing:${task.id}`,
        origin: 'no_briefing' as const,
        tone: 'warning' as const,
        title: task.title,
        description: `${task.client?.name || 'Sem cliente'} · Descrição vazia ou insuficiente`,
        priorityLabel: 'Sem briefing',
        taskId: task.id,
        boardId: task.boardId,
      }))
  : [];

// ─── 5. Task travada (stuck_in_review) ───────────────────────────────────────
// Gestor: tasks dos boards onde está inserido, threshold 3 dias
// Colaborador: apenas tasks atribuídas a ele, threshold 3 dias
// Cliente: tasks dos boards vinculados, threshold 2 dias
const stuckThresholdDays = viewer.role === 'client' ? 2 : 3;
const stuckSource =
  viewer.role === 'manager' ? managerScopedTasks :
  viewer.role === 'collaborator' ? collaboratorScopedTasks :
  clientScopedTasks;

const stuckAlerts: OverviewAlertRow[] = stuckSource
  .filter((task) =>
    STUCK_STATUSES.includes(task.status) &&
    daysSinceStatusChange(task) >= stuckThresholdDays
  )
  .map((task) => {
    const days = daysSinceStatusChange(task);
    const columnLabel = STUCK_STATUS_LABELS[task.status] || task.status;
    return {
      id: `stuck_in_review:${task.id}`,
      origin: 'stuck_in_review' as const,
      tone: 'warning' as const,
      title: task.title,
      description: `${days} dias em ${columnLabel} · ${task.client?.name || 'Sem cliente'}`,
      priorityLabel: `Parada em ${columnLabel}`,
      taskId: task.id,
      boardId: task.boardId,
    };
  });

// ─── Merge final ──────────────────────────────────────────────────────────────
// Ordem de prioridade:
// 1. Sem responsável urgente (danger — gestor)
// 2. Crédito esgotando (danger — gestor + cliente)
// 3. Sem responsável normal (warning — gestor)
// 4. Task travada (warning — todos)
// 5. Sem briefing (warning — gestor)
// 6. Prazo próximo (warning — todos)
const alertRows: OverviewAlertRow[] = [
  ...noAssigneeAlerts.filter((a) => a.tone === 'danger'),
  ...creditAlerts.filter((a) => a.priorityLabel === 'Saldo esgotado'),
  ...creditAlerts.filter((a) => a.priorityLabel !== 'Saldo esgotado'),
  ...noAssigneeAlerts.filter((a) => a.tone === 'warning'),
  ...stuckAlerts,
  ...noBriefingAlerts,
  ...dueSoonAlerts,
];
// Sem .slice() — mostrar todos
```

---

## 8. UI — `OverviewDashboardPage.tsx`

Nenhuma mudança de estrutura necessária além do que já foi definido na Fase 1 (botão X para snooze, botão ArrowRight condicional por `origin`).

Os novos alertas usam o mesmo visual dos existentes:
- Tom `warning` → card amarelo (já existe)
- Tom `danger` → card vermelho (já existe)
- Botão ArrowRight → visível pois todos os novos alertas têm `taskId` e `boardId`

**Único ajuste**: o `priorityLabel` de cada novo tipo deixa claro o que está errado, então o usuário entende sem precisar de ícone diferente.

Se quiser diferenciar visualmente os tipos no futuro (ícone diferente por `origin`), é uma evolução — não é necessário para esta implementação.

---

## 9. Checklist de Verificação

### Task sem responsável
- [ ] Tasks com `assignees.length === 0` aparecem nos Avisos
- [ ] Tom é `danger` quando prazo ≤ 3 dias, `warning` caso contrário
- [ ] Cliente **não vê** este alerta
- [ ] Task com responsável não aparece (não gera falso positivo)

### Task sem briefing
- [ ] Tasks com `description` vazia ou < 20 chars (sem HTML) aparecem
- [ ] Tasks com descrição completa não aparecem
- [ ] Cliente **não vê** este alerta

### Task travada em revisão/ajustes/aprovação
- [ ] Tasks em `review`, `adjustments` ou `approval` há ≥ 3 dias aparecem para Gestor
- [ ] Tasks em `review`, `adjustments` ou `approval` há ≥ 2 dias aparecem para Cliente
- [ ] Tasks em outros status não aparecem
- [ ] `daysStuck` exibido na descrição está correto
- [ ] Tasks recém-chegadas na coluna de revisão (< threshold) **não** aparecem

### Créditos ≥ 80% consumidos (cliente)
- [ ] Alerta aparece quando `consumedCredits / contractedCredits >= 0.80`
- [ ] Clientes com `creditsEnabled === false` não geram alerta
- [ ] Clientes sem `contractedCredits` definido não geram alerta

### Ordenação
- [ ] Alertas `danger` (sem responsável urgente + crédito) aparecem antes dos `warning`
- [ ] Dentro de `warning`, ordem: sem responsável → travada → sem briefing → prazo próximo

### Snooze (herdado da Fase 1)
- [ ] Todos os novos tipos de alerta respeitam o snooze de 24h
- [ ] O id único por tipo (`no_assignee:taskId`, `stuck_in_review:taskId`) evita colisão de snooze entre tipos diferentes na mesma task

---

## 10. Resumo de Arquivos

| Arquivo | Tipo | O que muda |
|--------|------|-----------|
| `src/domain/alerts/contracts.ts` | EDITAR | Adicionar `NoAssigneeAlert`, `NoBriefingAlert`, `StuckInReviewAlert` ao union `AlertOrigin` |
| `src/repositories/overviewRepository.ts` | EDITAR | Atualizar `OverviewAlertRow.origin` union; adicionar helpers `stripHtml`, `isBriefingEmpty`, `daysSinceStatusChange`, `STUCK_STATUSES`, `STUCK_STATUS_LABELS`; adicionar blocos `noAssigneeAlerts`, `noBriefingAlerts`, `stuckAlerts`; atualizar merge final `alertRows` |
| `src/app/components/dashboard/OverviewDashboardPage.tsx` | SEM MUDANÇA | Nenhuma alteração necessária além da Fase 1 |
