# Refatoração da Seção "Avisos" — Guia de Implementação

> **Destino:** Desenvolvedor / AI Agent responsável pela implementação.
> **Escopo:** Seção "Avisos" do Dashboard de Visão Geral (`OverviewDashboardPage`).
> **Status:** Decisões de produto confirmadas. Pronto para implementação.

---

## 1. Estado Atual (o que existe hoje)

### Onde fica o código

| Arquivo | Papel |
|--------|-------|
| `src/repositories/overviewRepository.ts` | Constrói os dados para o dashboard. A lógica de alertas está na função `overviewRepository.build()`, linhas ~320–342. |
| `src/app/components/dashboard/OverviewDashboardPage.tsx` | Renderiza o dashboard. A seção "Avisos" está em torno da linha 311. |

### Como funciona hoje

**`overviewRepository.ts` — lógica atual de `alertRows`:**

```ts
// CÓDIGO ATUAL — será substituído
const alertRows = sortTasksForOverview(activeScopedTasks)
  .filter((task) => {
    const state = getTaskDueDateState(task.dueDate, today);
    return state === 'warning' || state === 'overdue';   // ← 'overdue' será removido
  })
  .slice(0, 5)   // ← limite de 5 será removido
  .map((task) => {
    const dueState = getTaskDueDateState(task.dueDate, today);
    return {
      id: task.id,
      taskId: task.id,
      boardId: task.boardId,
      tone: dueState === 'overdue' ? 'danger' : 'warning',
      title: task.title,
      description: `${formatTaskDueDate(task.dueDate)} · ${task.client?.name || 'Sem cliente'}`,
      priorityLabel: dueState === 'overdue' ? 'Em atraso' : task.priority === 'urgent' ? 'Prioridade alta' : 'Prazo próximo',
    };
  });
```

**Interface atual de `OverviewAlertRow`** (também em `overviewRepository.ts`):

```ts
// INTERFACE ATUAL — será expandida
export interface OverviewAlertRow {
  id: string;
  taskId: string;
  boardId: string;
  tone: 'warning' | 'danger';
  title: string;
  description: string;
  priorityLabel: string;
}
```

**Problemas do estado atual:**
1. Inclui tasks com `dueState === 'overdue'` — tarefa atrasada já aparece no KPI "Atrasadas" e no board; duplicar nos avisos gera ruído
2. Limite fixo de 5 alertas — oculta alertas importantes arbitrariamente
3. Sem snooze/dismiss — não há como silenciar um aviso temporariamente
4. Sem alertas de crédito — um cliente com 5% do saldo restante não gera nenhum alerta
5. Sem distinção de origem do alerta (prazo vs. crédito)

---

## 2. Decisões de Produto Confirmadas

As seguintes decisões foram validadas pelo Product Owner. Não alterar sem nova confirmação.

| # | Decisão | Detalhe |
|---|---------|---------|
| 1 | **Remover tarefas atrasadas dos avisos** | Manter apenas `dueState === 'warning'` (≤ 24h para o prazo). `overdue` não deve aparecer nos Avisos — já está visível no KPI e no board. |
| 2 | **Alerta de crédito em ≤ 20%** | Quando `remainingCredits / contractedCredits <= 0.20` E o cliente tem créditos habilitados, gerar um alerta de crédito. |
| 3 | **Clientes veem seus próprios avisos desde o início** | O perfil `client` deve receber alertas relevantes ao seu contexto no portal — não é funcionalidade exclusiva do manager. |
| 4 | **Snooze de 24h** | Cada alerta individual pode ser dispensado por 24 horas. O estado de snooze é salvo em `localStorage`. Após 24h, o alerta volta automaticamente. |
| 5 | **Lista expandida inline** | Remover o `.slice(0, 5)`. Mostrar todos os alertas. Sem "ver todos" externo — expandir a lista no próprio lugar. |

---

## 3. Novos Tipos — `AlertOrigin`

Antes de alterar qualquer lógica, criar o tipo discriminado `AlertOrigin`. Esse tipo torna cada alerta autoexplicativo para qualquer consumidor (UI, IA, testes).

**Localização:** `src/domain/alerts/contracts.ts` ← **criar arquivo novo**

```ts
// src/domain/alerts/contracts.ts

export type AlertTone = 'warning' | 'danger';

/**
 * Alerta gerado por prazo próximo (≤ 24h) em uma task ativa.
 */
export interface DueSoonAlert {
  origin: 'due_soon';
  taskId: string;
  boardId: string;
  tone: 'warning';
  taskTitle: string;
  dueDateLabel: string;
  clientName: string;
  priority: string;
}

/**
 * Alerta gerado quando o saldo de créditos de um cliente cai para ≤ 20%.
 */
export interface CreditLowAlert {
  origin: 'credit_low';
  clientId: string;
  clientName: string;
  tone: 'danger';
  contractedCredits: number;
  consumedCredits: number;
  remainingCredits: number;
  remainingPercent: number; // 0..100
}

export type AlertOrigin = DueSoonAlert | CreditLowAlert;
```

---

## 4. Snooze — Utilitário de Persistência

**Localização:** `src/app/utils/alertSnooze.ts` ← **criar arquivo novo**

```ts
// src/app/utils/alertSnooze.ts

const STORAGE_KEY = 'weplanner:alerts:snoozed:v1';
const SNOOZE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 horas em ms

interface SnoozedEntry {
  snoozedAt: number; // timestamp ms
}

function loadSnoozed(): Record<string, SnoozedEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, SnoozedEntry>) : {};
  } catch {
    return {};
  }
}

function saveSnoozed(map: Record<string, SnoozedEntry>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

/** Retorna true se o alerta com esse id está atualmente em snooze (dentro de 24h). */
export function isAlertSnoozed(alertId: string): boolean {
  const map = loadSnoozed();
  const entry = map[alertId];
  if (!entry) return false;
  return Date.now() - entry.snoozedAt < SNOOZE_DURATION_MS;
}

/** Registra snooze de 24h para o alerta com esse id. */
export function snoozeAlert(alertId: string): void {
  const map = loadSnoozed();
  map[alertId] = { snoozedAt: Date.now() };
  // Limpar entradas expiradas automaticamente
  for (const key of Object.keys(map)) {
    if (Date.now() - map[key].snoozedAt >= SNOOZE_DURATION_MS) {
      delete map[key];
    }
  }
  saveSnoozed(map);
}
```

---

## 5. Atualizar `OverviewAlertRow` e lógica de alertas

### 5.1 Nova interface `OverviewAlertRow`

Em `src/repositories/overviewRepository.ts`, substituir a interface `OverviewAlertRow` atual por:

```ts
// SUBSTITUIR a interface existente por esta versão expandida
export interface OverviewAlertRow {
  id: string;          // usado como chave de snooze também
  tone: 'warning' | 'danger';
  title: string;
  description: string;
  priorityLabel: string;
  // Contexto para navegação (apenas em alertas de prazo)
  taskId?: string;
  boardId?: string;
  // Contexto de crédito (apenas em alertas de crédito)
  clientId?: string;
  // Origem do alerta — permite que a UI se comporte diferente por tipo
  origin: 'due_soon' | 'credit_low';
}
```

### 5.2 Nova função `buildAlertRows`

Em `src/repositories/overviewRepository.ts`, adicionar os seguintes imports no topo (junto aos existentes):

```ts
import type { ClientRecord } from '../domain/clients/contracts';
```

Substituir o bloco `const alertRows = ...` (linhas ~320–342) pelo seguinte:

```ts
// ─── Alertas: prazo próximo (due_soon) ────────────────────────────────────────
// Apenas dueState === 'warning' (≤ 24h). NÃO incluir 'overdue'.
const dueSoonAlerts: OverviewAlertRow[] = sortTasksForOverview(activeScopedTasks)
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

// ─── Alertas: crédito baixo (credit_low) ─────────────────────────────────────
// Gera um alerta por cliente quando saldo restante cai a ≤ 20% do contratado.
// Só para o perfil 'manager' — cliente vê crédito no portal, não nos avisos.
const creditAlerts: OverviewAlertRow[] = viewer.role === 'manager'
  ? (clients ?? [])
      .filter((client) => {
        if (!client.creditsEnabled) return false;
        const contracted = client.contractedCredits ?? 0;
        if (contracted <= 0) return false;

        // Calcular créditos consumidos a partir das tasks visíveis deste cliente
        const clientTasks = visibleTasks.filter(
          (task) => task.clientId === client.id && task.resolution !== 'cancelled',
        );
        const consumed = clientTasks.reduce((sum, task) => sum + (task.credits ?? 0), 0);
        const remaining = contracted - consumed;
        const remainingPercent = remaining / contracted;

        return remainingPercent <= 0.20; // ≤ 20% do saldo
      })
      .map((client) => {
        const contracted = client.contractedCredits ?? 0;
        const clientTasks = visibleTasks.filter(
          (task) => task.clientId === client.id && task.resolution !== 'cancelled',
        );
        const consumed = clientTasks.reduce((sum, task) => sum + (task.credits ?? 0), 0);
        const remaining = Math.max(0, contracted - consumed);
        const remainingPercent = Math.round((remaining / contracted) * 100);

        return {
          id: `credit_low:${client.id}`,
          origin: 'credit_low' as const,
          tone: 'danger' as const,
          title: `${client.name} — créditos baixos`,
          description: `${remaining} de ${contracted} créditos restantes (${remainingPercent}%)`,
          priorityLabel: remainingPercent <= 0 ? 'Saldo esgotado' : 'Saldo crítico',
          clientId: client.id,
        };
      })
  : [];

// ─── Merge e ordenação ────────────────────────────────────────────────────────
// Créditos esgotados primeiro, depois crédito baixo, depois prazo próximo.
const alertRows: OverviewAlertRow[] = [
  ...creditAlerts.filter((a) => a.priorityLabel === 'Saldo esgotado'),
  ...creditAlerts.filter((a) => a.priorityLabel !== 'Saldo esgotado'),
  ...dueSoonAlerts,
];
// Sem .slice() — mostrar todos os alertas.
```

### 5.3 Passar `clients` para `overviewRepository.build()`

A função `build()` atualmente recebe `(snapshot, viewer, user)`. Adicionar `clients` como quarto parâmetro:

```ts
// ASSINATURA NOVA
build(
  snapshot: PersistedKanbanWorkspaceSnapshot,
  viewer: BoardViewerContext,
  user: OverviewUserContext,
  clients: ClientRecord[] = [],        // ← novo parâmetro
): OverviewSnapshot {
```

O valor de `clients` deve ser passado pelo componente que chama `overviewRepository.build()` — tipicamente `OverviewDashboardPage.tsx`. Ver Fase 6.

---

## 6. Atualizar `OverviewDashboardPage.tsx`

### 6.1 Importar utilitário de snooze e ícone de dismiss

```ts
// Adicionar a estes imports existentes:
import { isAlertSnoozed, snoozeAlert } from '../../../app/utils/alertSnooze';
import { X } from 'lucide-react'; // se ainda não importado
```

### 6.2 Passar `clients` para `overviewRepository.build()`

Localizar onde `overviewRepository.build()` é chamado no componente (dentro de `useMemo` ou `useEffect`). Adicionar o array de clientes:

```ts
// ANTES
const overview = useMemo(
  () => overviewRepository.build(snapshot, viewer, currentUser),
  [snapshot, viewer, currentUser],
);

// DEPOIS
const overview = useMemo(
  () => overviewRepository.build(snapshot, viewer, currentUser, allClients),
  [snapshot, viewer, currentUser, allClients],
);
```

`allClients` é o array de `ClientRecord[]` já disponível no componente (ou deve ser buscado via `clientsRepository.listAll(CLIENTS_SEED)`).

### 6.3 Estado de snooze na UI

Adicionar estado local para forçar re-render após snooze:

```ts
const [snoozedVersion, setSnoozedVersion] = useState(0);

const handleSnoozeAlert = (alertId: string) => {
  snoozeAlert(alertId);
  setSnoozedVersion((v) => v + 1); // força re-render para sumir o alerta da lista
};
```

### 6.4 Filtrar alertas em snooze antes de renderizar

```ts
// Dentro do render, antes de mapear alertRows:
const visibleAlerts = overview.alertRows.filter(
  (alert) => !isAlertSnoozed(alert.id),
);
// Usar visibleAlerts no lugar de overview.alertRows
```

> **Nota:** incluir `snoozedVersion` como dependência do `useMemo` que calcula `visibleAlerts` se for memoizado, para garantir que o filtro roda após cada snooze.

### 6.5 Atualizar o render da seção "Avisos"

#### Header do card (contador)

```tsx
{/* Substituir overview.alertRows.length por visibleAlerts.length */}
<span className="...">
  {visibleAlerts.length}
</span>
```

#### Loop de alertas — adicionar botão de snooze e navegação condicional

```tsx
{visibleAlerts.length === 0 ? (
  <div className="rounded-[24px] border border-dashed border-[#D8DDD8] bg-[#FBFCFB] px-5 py-8 text-center dark:border-[#2A2C2D] dark:bg-[#171819]">
    <p className="text-sm font-semibold text-[#171717] dark:text-white">Nenhum aviso crítico</p>
    <p className="mt-1 text-sm text-[#737373] dark:text-[#A3A3A3]">
      Seus prazos e créditos estão controlados.
    </p>
  </div>
) : (
  visibleAlerts.map((alert) => {
    const Icon = ALERT_ICON[alert.tone];
    return (
      <div
        key={alert.id}
        className={cn(
          'group rounded-[22px] border px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 ...',
          alert.tone === 'danger'
            ? 'border-[#F6CDCD] bg-[#FFF7F7] ... dark:border-[#4B2225] dark:bg-[#1D1213] ...'
            : 'border-[#F4E4B3] bg-[#FFFDF3] ... dark:border-[#5A4520] dark:bg-[#1C1810] ...',
        )}
      >
        <div className="flex items-start gap-3">
          {/* Ícone — igual ao atual */}
          <span className={cn('inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl', ...)}>
            <Icon className="h-4.5 w-4.5" />
          </span>

          {/* Texto — igual ao atual */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#171717] dark:text-white">{alert.title}</p>
            <p className="mt-1 text-sm text-[#737373] dark:text-[#A3A3A3]">{alert.description}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8A8A8A] dark:text-[#A3A3A3]">
              {alert.priorityLabel}
            </p>
          </div>

          {/* Ações — condicional por origem */}
          <div className="flex shrink-0 items-center gap-1.5">
            {/* Botão de snooze 24h — SEMPRE visível */}
            <button
              type="button"
              onClick={() => handleSnoozeAlert(alert.id)}
              title="Dispensar por 24h"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7E4] text-[#A3A3A3] transition-colors hover:bg-white hover:text-[#171717] dark:border-[#2D2F30] dark:hover:bg-[#171819] dark:hover:text-white"
              aria-label="Dispensar aviso por 24 horas"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Botão de navegação — apenas para alertas de prazo (due_soon) */}
            {alert.origin === 'due_soon' && alert.boardId && (
              <button
                type="button"
                onClick={() => openBoardInNewTab(alert.boardId!, alert.taskId)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7E4] text-[#525252] transition-colors group-hover:bg-white group-hover:text-[#171717] dark:border-[#2D2F30] dark:text-[#D4D4D4] dark:group-hover:bg-[#171819] dark:group-hover:text-white"
                aria-label="Ver tarefa"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  })
)}
```

---

## 7. Checklist de Verificação Pós-Implementação

Antes de considerar a implementação concluída, verificar item a item:

### Tipos e utilitários
- [ ] Arquivo `src/domain/alerts/contracts.ts` criado com `DueSoonAlert`, `CreditLowAlert`, `AlertOrigin`
- [ ] Arquivo `src/app/utils/alertSnooze.ts` criado com `isAlertSnoozed` e `snoozeAlert`
- [ ] `OverviewAlertRow` atualizado com campo `origin: 'due_soon' | 'credit_low'`
- [ ] Sem erros de TypeScript em nenhum dos arquivos tocados

### Lógica de alertas
- [ ] Tarefas com `dueState === 'overdue'` **NÃO** aparecem mais nos Avisos
- [ ] Apenas tarefas com `dueState === 'warning'` geram alerta de prazo
- [ ] Clientes com `contractedCredits <= 0` ou `creditsEnabled === false` **não** geram alerta de crédito
- [ ] Alerta de crédito aparece quando `remainingPercent <= 20%`
- [ ] Alertas de crédito aparecem **antes** dos alertas de prazo na lista
- [ ] Sem `.slice(0, 5)` — todos os alertas são renderizados

### Snooze
- [ ] Clicar no botão X de um alerta faz ele sumir imediatamente da lista
- [ ] O alerta dispensado fica ausente após F5 (recarregar a página)
- [ ] Após simular 24h de diferença no timestamp do localStorage, o alerta volta
- [ ] Alertas de tipos diferentes (prazo e crédito) podem ser dispensados independentemente

### Perfis
- [ ] Perfil `manager`: vê alertas de prazo + alertas de crédito
- [ ] Perfil `collaborator`: vê apenas alertas de prazo das tasks atribuídas a ele (sem alertas de crédito)
- [ ] Perfil `client`: vê alertas de prazo dos boards vinculados a ele (sem alertas de crédito)

### UI
- [ ] Botão de snooze (X) aparece em todos os alertas
- [ ] Botão de navegação (ArrowRight) aparece **somente** em alertas `due_soon`
- [ ] Contador no header da seção reflete corretamente o número de alertas **não dispensados**
- [ ] Estado vazio exibe mensagem "Seus prazos e créditos estão controlados" (texto atualizado)
- [ ] Dark mode funciona em todos os novos elementos

---

## 8. Resumo das Mudanças por Arquivo

| Arquivo | Tipo de mudança | O que muda |
|--------|----------------|-----------|
| `src/domain/alerts/contracts.ts` | **CRIAR** | Tipos `DueSoonAlert`, `CreditLowAlert`, `AlertOrigin` |
| `src/app/utils/alertSnooze.ts` | **CRIAR** | Funções `isAlertSnoozed`, `snoozeAlert` com localStorage |
| `src/repositories/overviewRepository.ts` | **EDITAR** | Interface `OverviewAlertRow` expandida + novo campo `origin`; parâmetro `clients` em `build()`; lógica de alertas completamente substituída; remoção do `.slice(0, 5)` |
| `src/app/components/dashboard/OverviewDashboardPage.tsx` | **EDITAR** | Passar `clients` para `build()`; estado `snoozedVersion`; `handleSnoozeAlert`; `visibleAlerts` filtrado; render dos alertas com botão X e navegação condicional por `origin`; texto do estado vazio |

---

## 9. Regras de Arquitetura (não violar)

Este projeto tem regras rígidas de arquitetura. Ao implementar:

- Nenhum arquivo `.tsx` ou `.ts` pode ultrapassar **400 linhas**. Se `OverviewDashboardPage.tsx` estiver próximo desse limite, extrair o bloco da seção Avisos para um componente separado `src/app/components/dashboard/AlertsSection.tsx`.
- Mock data e seeds nunca dentro de componente — `CLIENTS_SEED` deve vir de `src/demo/` ou `src/app/data/`.
- Types de domínio em `src/domain/<entidade>/contracts.ts`, não colocalizados em componentes.
- Utilitários puros (sem JSX) em `src/app/utils/`.
- Funções/handlers com mais de 50 linhas devem ser quebradas ou movidas para hook.
