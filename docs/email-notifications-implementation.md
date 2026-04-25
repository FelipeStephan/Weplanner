# WePlanner — Sistema de Notificações por E-mail
## Guia de Implementação Técnica

> **Destino:** Desenvolvedor / AI Agent responsável pela implementação.
> **Contexto do produto:** WePlanner é uma plataforma de gestão de workflow para agências de marketing.
> **Três perfis:** `ADMIN` (Gestor), `COLLABORATOR` (Colaborador), `CLIENT_EXTERNAL` (Cliente).

---

## 1. Regra Universal de Escopo

> **Notificações task-específicas só são enviadas ao usuário se ele estiver listado como responsável (`assignees`) naquela task.**

Exceções a essa regra (eventos de gestão, não task-específicos):
- Alertas de crédito do Admin → escopo: todos os clientes dos boards onde está inserido
- Task com prazo vencido do Admin → escopo: todos os boards onde está inserido
- Cliente aceitou convite → evento de workspace, não de task
- Convite para workspace → transacional

---

## 2. Catálogo de E-mails

### 2.1 Perfil: ADMIN

---

#### `admin.credit_warning`
| Campo | Valor |
|-------|-------|
| **Trigger** | `consumedCredits / contractedCredits >= 0.80` — calculado a cada mutação de task (conclusão, arquivamento) |
| **Destinatário** | Todos os usuários com role `ADMIN` do workspace |
| **Frequência** | Uma vez por cliente por ciclo de contrato. Não reenviar até que o saldo seja renovado. |
| **Dados necessários** | `client.name`, `client.contractedCredits`, `client.consumedCredits`, `remainingCredits`, `remainingPercent`, `workspaceUrl` |
| **Condição de envio** | Apenas se `client.creditsEnabled === true` |

---

#### `admin.credit_exhausted`
| Campo | Valor |
|-------|-------|
| **Trigger** | `consumedCredits >= contractedCredits` |
| **Destinatário** | Todos os usuários com role `ADMIN` do workspace |
| **Frequência** | Uma vez por cliente por ciclo. Não reenviar. |
| **Dados necessários** | `client.name`, `client.contractedCredits`, `client.consumedCredits`, `deficitCredits`, `workspaceUrl` |
| **Condição de envio** | Apenas se `client.creditsEnabled === true` |

---

#### `admin.task_overdue`
| Campo | Valor |
|-------|-------|
| **Trigger** | `task.dueDate` passou E `task.resolution === null` (task ainda ativa) |
| **Destinatário** | Todos os usuários com role `ADMIN` que são membros do board da task (`board.access.memberUserIds.includes(userId)`) |
| **Frequência** | Uma vez por task. Não reenviar enquanto a task permanecer ativa. |
| **Dados necessários** | `task.title`, `task.dueDate`, `task.priority`, `task.assignees`, `client.name`, `board.name`, `taskUrl` |
| **Agrupamento** | Se múltiplas tasks vencerem no mesmo dia, agrupar em um único e-mail (máx. 5 tasks listadas + "e mais X") |

---

#### `admin.client_joined`
| Campo | Valor |
|-------|-------|
| **Trigger** | Usuário `CLIENT_EXTERNAL` aceitou o convite e fez primeiro login |
| **Destinatário** | Todos os usuários com role `ADMIN` do workspace |
| **Frequência** | Uma vez por usuário cliente |
| **Dados necessários** | `clientUser.name`, `clientUser.email`, `client.name` (empresa), `workspaceUrl` |

---

#### `admin.weekly_digest`
| Campo | Valor |
|-------|-------|
| **Trigger** | Cron job — toda segunda-feira às 08h00 no fuso do workspace |
| **Destinatário** | Todos os usuários com role `ADMIN` do workspace |
| **Frequência** | Semanal |
| **Período coberto** | Segunda a domingo da semana anterior |
| **Dados necessários** | `tasksCompleted` (count), `tasksCreated` (count), `tasksOverdue` (count), `clientCreditsSummary[]` (`client.name`, `remainingPercent`, `risk`), `topCollaborator` (nome + tasks concluídas), `boardsActivity[]` |
| **Condição de envio** | Só enviar se houve pelo menos 1 atividade no período |

---

### 2.2 Perfil: COLLABORATOR

---

#### `collaborator.task_assigned`
| Campo | Valor |
|-------|-------|
| **Trigger** | `task.assignees` recebe o `userId` do colaborador (via criação ou edição da task) |
| **Destinatário** | O colaborador atribuído |
| **Frequência** | A cada nova atribuição. Se for reatribuído à mesma task depois de removido, notificar novamente. |
| **Dados necessários** | `task.title`, `task.priority`, `task.dueDate`, `task.description` (primeiros 150 chars, sem HTML), `client.name`, `board.name`, `assignedBy.name`, `taskUrl` |
| **Delay** | 2 minutos após a atribuição (evitar e-mail de edições rápidas) |

---

#### `collaborator.task_returned`
| Campo | Valor |
|-------|-------|
| **Trigger** | Task move de coluna com `baseStatus: review \| approval` para coluna com `baseStatus: adjustments \| in_progress` E o colaborador está em `task.assignees` |
| **Destinatário** | Colaboradores listados em `task.assignees` |
| **Frequência** | A cada retorno. Se a task for devolvida 3x, notificar as 3 vezes. |
| **Dados necessários** | `task.title`, `task.priority`, `fromColumnName`, `toColumnName`, `movedBy.name`, `client.name`, `reviewCycles` (número do ciclo atual), `taskUrl` |

---

#### `collaborator.task_due_soon`
| Campo | Valor |
|-------|-------|
| **Trigger** | `dueDate` está a ≤ 24h do momento atual E task está ativa E colaborador está em `task.assignees` |
| **Destinatário** | Colaboradores listados em `task.assignees` |
| **Frequência** | Uma vez por task. Não reenviar. |
| **Horário de envio** | Calcular no momento em que entra na janela de 24h. Se o prazo for às 15h de amanhã, enviar às 15h de hoje. |
| **Dados necessários** | `task.title`, `task.priority`, `task.dueDate`, `client.name`, `board.name`, `taskUrl` |

---

#### `collaborator.daily_digest`
| Campo | Valor |
|-------|-------|
| **Trigger** | Cron job — toda manhã às 08h00 no fuso do colaborador |
| **Destinatário** | Colaboradores com tasks ativas atribuídas |
| **Frequência** | Diária (dias úteis apenas — seg a sex) |
| **Dados necessários** | `tasksAssigned[]` filtradas por: `dueDate === hoje` (prioridade), `dueDate === amanhã`, demais tasks ativas. Máx. 8 tasks listadas. |
| **Condição de envio** | Só enviar se o colaborador tiver ao menos 1 task ativa atribuída a ele |

---

### 2.3 Perfil: CLIENT_EXTERNAL

---

#### `client.workspace_invite`
| Campo | Valor |
|-------|-------|
| **Trigger** | Admin envia convite para usuário `CLIENT_EXTERNAL` |
| **Destinatário** | O e-mail do usuário convidado |
| **Frequência** | Uma vez. Reenvio apenas se Admin clicar em "Reenviar convite". |
| **Dados necessários** | `clientUser.name`, `agency.name` (nome do workspace), `inviteUrl` (com token), `invitedBy.name`, `expiresAt` (token expira em 7 dias) |
| **Tipo** | Transacional — nunca pode ser desativado |

---

#### `client.task_assigned`
| Campo | Valor |
|-------|-------|
| **Trigger** | Task criada ou editada com o `userId` do cliente em `task.assignees` |
| **Destinatário** | O usuário cliente atribuído |
| **Frequência** | A cada nova atribuição |
| **Dados necessários** | `task.title`, `task.description` (primeiros 150 chars, sem HTML), `task.dueDate`, `client.name` (empresa), `board.name`, `assignedBy.name` (nome do membro da agência), `taskUrl` |
| **Delay** | 2 minutos após a atribuição |

---

#### `client.approval_requested`
| Campo | Valor |
|-------|-------|
| **Trigger** | Task move para coluna com `baseStatus: approval` E cliente está em `task.assignees` |
| **Destinatário** | O usuário cliente listado em `task.assignees` |
| **Frequência** | A cada entrada na coluna de aprovação (se a task sair e voltar, notificar novamente) |
| **Dados necessários** | `task.title`, `task.attachments` (count), `client.name`, `board.name`, `movedBy.name`, `taskUrl` |

---

#### `client.task_completed`
| Campo | Valor |
|-------|-------|
| **Trigger** | `task.resolution === 'completed'` E cliente está em `task.assignees` |
| **Destinatário** | O usuário cliente listado em `task.assignees` |
| **Frequência** | Uma vez por task |
| **Dados necessários** | `task.title`, `task.credits`, `client.name`, `board.name`, `completedBy.name`, `taskUrl` |

---

#### `client.credit_warning`
| Campo | Valor |
|-------|-------|
| **Trigger** | `consumedCredits / contractedCredits >= 0.80` |
| **Destinatário** | Todos os usuários `CLIENT_EXTERNAL` vinculados ao cliente (`client.id`) |
| **Frequência** | Uma vez por ciclo de contrato |
| **Dados necessários** | `client.name`, `contractedCredits`, `consumedCredits`, `remainingCredits`, `remainingPercent`, `portalUrl` |
| **Condição de envio** | Apenas se `client.creditsEnabled === true` |

---

#### `client.credit_exhausted`
| Campo | Valor |
|-------|-------|
| **Trigger** | `consumedCredits >= contractedCredits` |
| **Destinatário** | Todos os usuários `CLIENT_EXTERNAL` vinculados ao cliente |
| **Frequência** | Uma vez por ciclo |
| **Dados necessários** | `client.name`, `contractedCredits`, `consumedCredits`, `agencyContactName`, `portalUrl` |
| **Condição de envio** | Apenas se `client.creditsEnabled === true` |

---

#### `client.weekly_digest`
| Campo | Valor |
|-------|-------|
| **Trigger** | Cron job — toda segunda-feira às 08h00 no fuso do workspace |
| **Destinatário** | Todos os usuários `CLIENT_EXTERNAL` com ao menos 1 board ativo vinculado |
| **Frequência** | Semanal |
| **Período coberto** | Segunda a domingo da semana anterior |
| **Dados necessários** | `client.name`, `tasksCompleted[]` (título + data), `tasksInProgress` (count), `tasksPending` (count), `contractedCredits`, `consumedCredits`, `remainingCredits`, `remainingPercent`, `portalUrl` |
| **Condição de envio** | Só enviar se houve ao menos 1 atividade no período (task concluída, movida, ou comentada) |

---

## 3. Regras Anti-spam

| Regra | Detalhe |
|-------|---------|
| **Agrupamento de eventos** | Se o mesmo tipo de evento ocorrer múltiplas vezes em 15 min para o mesmo usuário, enviar 1 único e-mail agrupado |
| **Máx. imediatos por hora** | 3 e-mails imediatos por usuário por hora. Excedente entra no digest do dia seguinte. |
| **Dias úteis para digest diário** | Digest do colaborador só envia de segunda a sexta |
| **Digest não envia vazio** | Nenhum digest é enviado se não houver atividade relevante no período |
| **Sem reenvio de alertas** | `credit_warning` e `task_overdue` não reenviam para a mesma entidade no mesmo ciclo |
| **Token de convite** | Expira em 7 dias. Após expirar, Admin precisa reenviar manualmente. |

---

## 4. Configurabilidade

### O que o ADMIN pode controlar (nível workspace)
- Ativar/desativar `weekly_digest` para o workspace inteiro
- Ativar/desativar notificações de crédito para clientes

### O que cada usuário pode controlar (nível pessoal)
- Desativar `daily_digest` (colaborador)
- Desativar `weekly_digest` pessoal
- Horário de entrega do digest (padrão: 08h00)

### O que nunca pode ser desativado
- `client.workspace_invite` (transacional)
- `admin.credit_exhausted` (crítico)
- `client.credit_exhausted` (crítico)

---

## 5. Variáveis Globais Disponíveis em Todos os E-mails

```ts
interface EmailBaseContext {
  recipientName: string;        // nome do destinatário
  recipientEmail: string;
  workspaceName: string;        // nome da agência/workspace
  workspaceLogoUrl?: string;
  currentYear: number;          // para footer de copyright
  unsubscribeUrl: string;       // link de cancelamento por categoria
  portalUrl: string;            // URL base do WePlanner
}
```

---

## 6. Identificadores de Template

| Template ID | Perfil | Tipo |
|-------------|--------|------|
| `admin.credit_warning` | Admin | Imediata |
| `admin.credit_exhausted` | Admin | Imediata |
| `admin.task_overdue` | Admin | Imediata |
| `admin.client_joined` | Admin | Imediata |
| `admin.weekly_digest` | Admin | Digest Semanal |
| `collaborator.task_assigned` | Colaborador | Imediata |
| `collaborator.task_returned` | Colaborador | Imediata |
| `collaborator.task_due_soon` | Colaborador | Imediata |
| `collaborator.daily_digest` | Colaborador | Digest Diário |
| `client.workspace_invite` | Cliente | Transacional |
| `client.task_assigned` | Cliente | Imediata |
| `client.approval_requested` | Cliente | Imediata |
| `client.task_completed` | Cliente | Imediata |
| `client.credit_warning` | Cliente | Imediata |
| `client.credit_exhausted` | Cliente | Imediata |
| `client.weekly_digest` | Cliente | Digest Semanal |
