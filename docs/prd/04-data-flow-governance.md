# WePlanner — Fluxo de Dados & Governança

> Arquitetura de dados, fluxo entre entidades, propriedade e privacidade.
> Este documento responde: "Quem é dono de quê, como os dados fluem, e o que nunca deve vazar entre contextos."

---

## 1. Entidades Fundamentais

O domínio do WePlanner é composto por 7 entidades principais:

```
Workspace
  └─ Users (com roles)
  └─ Clients
  └─ Boards
       └─ Columns
            └─ Tasks
                 └─ Subtasks
                 └─ Attachments
                 └─ Comments
                 └─ ActivityLog
  └─ Credits (por Client)
  └─ Reports (derivados)
```

### Hierarquia de ownership

| Entidade | Dono | Scope de visibilidade |
|----------|------|-----------------------|
| Workspace | Conta raiz (admin/gestor fundador) | Total |
| Users | Workspace | Interno |
| Clients | Workspace | Interno + Portal do Cliente |
| Boards | Workspace (criado por Gestor) | Por acesso de usuário |
| Columns | Board | Usuários do board |
| Tasks | Board | Usuários do board |
| Credits | Client | Gestor + Cliente (view parcial) |
| Reports | Workspace | Gestor apenas |

---

## 2. Fluxo de Dados Operacional

### 2.1 Ciclo de vida de uma tarefa

```
CRIAÇÃO
  Gestor cria task → define: título, créditos, prioridade, prazo, responsável
  Sistema registra: boardId, columnId, createdAt, createdBy
  IA sugere créditos (opcional, confirmação do Gestor)

EXECUÇÃO
  Colaborador abre task → lê briefing → executa
  Colaborador atualiza: subtarefas, attachments, comentários
  Sistema registra: ActivityLog a cada mutação relevante

REVISÃO
  Task movida para coluna de review → status = review
  Revisor (Gestor ou Colaborador designado) aprova ou devolve
  Cada ciclo de revisão incrementa: reviewCycles

AJUSTE
  Task devolvida para correção → incrementa: adjustmentCycles
  Colaborador corrige → move novamente para review

RESOLUÇÃO
  Gestor (ou sistema) resolve: completed / cancelled / archived
  Sistema calcula: créditos consumidos (se não cancelled)
  Task sai do board ativo → vai para histórico
```

### 2.2 Fluxo de créditos

```
Contrato definido (gestor):
  Client.creditosContratados = N

Task concluída ou arquivada:
  Client.creditosConsumidos += task.credits

Task cancelada:
  Client.creditosConsumidos += 0 (sem impacto)

Cálculo em tempo real:
  Client.creditosRestantes = creditosContratados - creditosConsumidos
  Client.burnRate = média de consumo diário (14d rolling)
  Client.horizonte = creditosRestantes / burnRate (em dias)
  Client.risco = classify(creditosRestantes, creditosContratados)
```

### 2.3 Fluxo de dados para relatórios

Os relatórios consomem dados imutáveis (snapshots de estado) — nunca dados ao vivo do board:

```
Tasks → snapshot no momento da resolução
  └─ estado final: credits, baseStatus, reviewCycles, adjustmentCycles
  └─ timeline: duração total, tempo em cada baseStatus
  └─ responsáveis: quem executou

Relatório consolida:
  └─ por cliente: créditos consumidos, tasks entregues, rework rate
  └─ por colaborador: produtividade, tasks/semana, tempo médio
  └─ por período: comparativo semanal/mensal
```

---

## 3. Isolamento de Contexto (Privacidade por Design)

### Regra fundamental
> Nenhum dado de um cliente pode ser visível para outro cliente, em nenhuma circunstância.

### Isolamento Client-to-Client

| Acesso | Permitido? |
|--------|-----------|
| Cliente A vê boards de Cliente B | Nunca |
| Cliente A vê créditos de Cliente B | Nunca |
| Gestor usa dados de Cliente A para estimar créditos de Cliente B | Nunca (IA usa apenas histórico anonimizado do mesmo workspace) |
| Colaborador vê tasks de clientes não vinculados a ele | Nunca |

### O que o Cliente vê versus o que existe

O portal do cliente é uma projeção filtrada — nunca um espelho do sistema interno:

| Dado interno | Visível para o cliente? | Motivo |
|-------------|------------------------|--------|
| Créditos contratados | Sim | É o contrato dele |
| Créditos consumidos | Sim | Transparência |
| Burn rate | Não | Informação operacional interna |
| `reviewCycles` | Não | Dado de rework interno |
| `adjustmentCycles` | Não | Dado de rework interno |
| Comentários internos | Não (se marcados como internos) | Comunicação da agência |
| Tasks canceladas | Não | Visibilidade controlada pela agência |
| Custo real em horas/dinheiro | Nunca | Dado confidencial da agência |
| Outros clientes da agência | Nunca | Isolamento total |

---

## 4. ActivityLog — Rastreabilidade Completa

Toda mutação relevante a uma task gera um registro no ActivityLog:

```
ActivityLog {
  taskId: string
  boardId: string
  userId: string
  userRole: 'manager' | 'collaborator'
  eventType: ActivityEventType
  payload: Record<string, unknown>   // dados relevantes da mutação
  timestamp: Date
}
```

### Tipos de evento rastreados

| `eventType` | Trigger |
|-------------|---------|
| `task_created` | Task criada |
| `status_changed` | Task movida de coluna |
| `priority_changed` | Prioridade alterada |
| `due_date_changed` | Prazo alterado |
| `credits_changed` | Créditos editados manualmente |
| `assignee_added` | Responsável adicionado |
| `assignee_removed` | Responsável removido |
| `description_edited` | Descrição modificada |
| `subtask_completed` | Subtarefa marcada como concluída |
| `attachment_added` | Arquivo anexado |
| `comment_added` | Comentário criado |
| `review_cycle_started` | Task entrou em coluna de review |
| `task_completed` | Resolução: concluída |
| `task_cancelled` | Resolução: cancelada |
| `task_archived` | Resolução: arquivada |
| `task_restored` | Task restaurada do histórico |

---

## 5. Modelo de Persistência (Estado Atual e Evolução)

### Estado atual (MVP frontend)

O WePlanner opera com persistência em `localStorage` — adequado para validação de produto, inadequado para produção com múltiplos usuários.

```
localStorage
  └─ kanbanSnapshot: BoardState     // boards, columns, tasks, history
  └─ clientLibrary: ClientState     // clientes e seus dados
```

**Limitações conhecidas:**
- Dados não são compartilhados entre dispositivos
- Sem autenticação real
- Sem controle de concorrência (dois usuários editando a mesma task)
- Sem backup ou histórico de versões fora do sistema

### Evolução esperada para backend

Quando o backend for implementado, as responsabilidades se dividem:

| Responsabilidade | Frontend | Backend |
|------------------|----------|---------|
| Renderização de UI | Sim | Não |
| Validação de permissão | Reflexo | **Source of truth** |
| Mutações de dados | Via API | **Source of truth** |
| ActivityLog | Dispara evento | **Persiste** |
| Cálculo de créditos | Cache local | **Calculado no servidor** |
| Relatórios | Renderiza | **Calcula** |
| Autenticação | Token/cookie | **Emite e valida** |

**Princípio:** O frontend nunca é fonte de verdade para decisões de negócio (créditos, permissões, relatórios). Ele renderiza o que o backend diz.

---

## 6. Decisões de Governança de Dados

### 6.1 Deleção vs. Arquivamento

WePlanner **nunca deleta** dados operacionais — apenas arquiva ou cancela.

| Ação | Implementação |
|------|--------------|
| "Deletar tarefa" (UI) | Transição para `archived` ou `cancelled` |
| "Limpar board" | Move tasks para histórico, não remove |
| Deleção real | Reservada para LGPD/GDPR (direito ao esquecimento) — implementação futura |

**Motivo:** Dados de tasks são evidência de trabalho entregue. A agência precisa deles para:
- Resolver disputas com clientes
- Calcular histórico de créditos para auditoria
- Alimentar relatórios retrospectivos

### 6.2 Exportabilidade

O gestor deve poder exportar:
- Relatório de créditos de um cliente (PDF / CSV)
- Histórico de tasks de um board (CSV)
- ActivityLog de uma task específica

O cliente deve poder exportar:
- Seu extrato de créditos (PDF)
- Lista de entregas do período (PDF)

**Princípio:** Os dados do cliente pertencem ao cliente, não à agência. A agência custódia, o cliente pode solicitar.

### 6.3 Retenção de dados

| Tipo de dado | Retenção mínima | Motivo |
|-------------|----------------|--------|
| Tasks ativas | Indefinida | Operacional |
| Tasks arquivadas/concluídas | 24 meses | Histórico de entrega |
| ActivityLog | 24 meses | Auditoria |
| Créditos consumidos | 36 meses | Financeiro |
| Comentários | 12 meses | Comunicação |
| Attachments | 24 meses (ou até remoção explícita) | Evidência de entrega |

---

## 7. Integridade do Sistema

### Regras de integridade que nunca podem ser violadas

1. **Uma task sempre tem um `boardId` e um `columnId` válidos** — task sem coluna é dado corrompido.
2. **`creditosConsumidos` nunca inclui tasks `cancelled`** — violar isso quebra o relatório financeiro do cliente.
3. **Roles são sempre verificadas antes de mutações** — o frontend pode esconder botões, mas o backend valida.
4. **ActivityLog é append-only** — nunca editar ou deletar entradas do log.
5. **Dados de clientes diferentes nunca se cruzam** — workspaceId é o tenant raiz de qualquer query.

### Checklist de integridade para novas features

Antes de implementar qualquer feature que toca em dados:

- [ ] A feature respeita o isolamento de workspace?
- [ ] A feature respeita o isolamento de cliente dentro do workspace?
- [ ] Mutações de dados são registradas no ActivityLog?
- [ ] A regra de créditos (excluir `cancelled`) foi respeitada em relatórios?
- [ ] O cliente não recebe dados que pertencem ao contexto interno da agência?
- [ ] A IA não mistura dados de clientes diferentes para gerar sugestões?
