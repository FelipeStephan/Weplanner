# Analytics Metrics Catalog

This document catalogs the main metrics currently used or prepared in the WePlanner analytics layer.

## KPI metrics

### Tarefas concluídas

Definition:

- tasks completed during the selected period

Typical source:

- `task.completedAt`
- `task.resolution = completed`

### Tarefas em andamento

Definition:

- active tasks currently visible in workflow columns

Typical source:

- tasks without closing resolution
- workflow statuses excluding closed history items

### Tempo médio de produção

Definition:

- average time spent in production-related workflow stages before completion

Current frontend approximation uses:

- `task.totalTimeInProgress`
- `task.totalTimeInReview`
- `task.totalTimeInAdjustments`

### Tempo médio aguardando aprovação

Definition:

- average time spent in the approval stage

Current source:

- `task.totalTimeInApproval`

### Taxa de retrabalho

Definition:

- percentage of tasks that entered adjustment cycles

Current source:

- `task.adjustmentCycles > 0`

### Tarefas canceladas

Definition:

- tasks whose resolution is `cancelled`

## Workflow metrics

### Distribuição por etapa

Definition:

- number of tasks per workflow status

Statuses tracked:

- backlog
- todo
- in_progress
- review
- adjustments
- approval
- done

### Tempo médio por etapa

Definition:

- average duration spent in each workflow stage

Current source:

- `taskStatusHistory.durationInSeconds`

### Saúde dos prazos

Definition:

- operational grouping of active tasks by deadline state

States tracked:

- tarefas em dia
- prazos em atenção
- tarefas em atraso

Current source:

- `task.dueDate`
- shared due-date state helper (`normal`, `warning`, `overdue`)

### Drill-down de prazos

Definition:

- actionable list of tasks opened from risky deadline metrics

Current behavior:

- available for `Prazos em atenção`
- available for `Tarefas em atraso`
- each item can open the task in a new browser tab through the Kanban deep-link

## Rework metrics

### Review cycles

Definition:

- count of times a task entered `review`

### Adjustment cycles

Definition:

- count of times a task entered `adjustments`

### Tarefas retrabalhadas

Definition:

- tasks that had at least one adjustment cycle

## Client metrics

### Créditos consumidos por cliente

Definition:

- sum of task credits excluding cancelled tasks

Official rule:

- completed tasks count
- archived tasks count
- cancelled tasks do not count

### Tempo médio de produção por cliente

Definition:

- average production time across tasks linked to the same client

### Tempo médio de aprovação por cliente

Definition:

- average approval waiting time across tasks linked to the same client

## Credit management metrics

### Créditos contratados

Definition:

- total contracted credit base considered for the filtered client set

### Créditos consumidos

Definition:

- credits already consumed according to the official consumption rule

### Créditos restantes

Definition:

- contracted credits minus consumed credits, clamped at zero

### Déficit de créditos

Definition:

- credit over-consumption beyond the contracted base

### Taxa média de consumo

Definition:

- average burn rate in `créditos/dia` during the selected period

Formula:

- `consumedCredits / periodDays`

### Previsão de esgotamento

Definition:

- estimated number of days until the remaining balance reaches zero if current burn rate continues

### Créditos não faturáveis

Definition:

- credits associated with cancelled tasks

Important note:

- these credits remain visible for operational traceability
- they do not count toward billable client consumption

### Créditos com retrabalho

Definition:

- percentage of consumed credits tied to tasks that passed through review or adjustment cycles

## Credit insight metrics

### Maior risco de esgotamento

Definition:

- client with the lowest `daysToExhaust` value among valid estimates

### Consumo acelerado

Definition:

- client with the highest `burnRate` in the filtered period

### Déficit na carteira

Definition:

- number of clients already above the contracted credit base

## Team metrics

### Tarefas atribuídas

Definition:

- count of tasks assigned to a collaborator

### Tarefas concluídas por colaborador

Definition:

- count of completed tasks with that collaborator assigned

### Créditos por colaborador

Future intended metric:

- credits associated with tasks where the collaborator is assigned

## Trend metrics

### Tarefas criadas no período

Definition:

- tasks whose `createdAt` falls inside the selected range

### Tarefas concluídas no período

Definition:

- tasks whose `completedAt` falls inside the selected range

### Tendência de retrabalho

Definition:

- trend of tasks entering adjustment cycles over time

### Curva de consumo de créditos

Definition:

- trend of consumed credits in the selected period

### Curva acumulada de créditos

Definition:

- cumulative consumed credits over time

## Current implementation note

Today several metrics are still calculated in frontend selectors within the reports page. Over time, these should move behind analytics services or backend queries while keeping the definitions in this document stable.
