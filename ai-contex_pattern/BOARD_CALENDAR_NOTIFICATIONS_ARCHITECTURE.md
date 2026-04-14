# WePlanner: Boards, Calendário, Tarefas e Notificações

## Objetivo

Este documento consolida o estado atual do front-end para servir como referência de contexto para IA, back-end e próximas integrações do produto.

Escopo documentado:

- board workspace (Kanban e Calendário)
- criação e edição de tarefa (capa, subtarefas, anexos)
- modal de detalhe de tarefa
- busca de tarefas no board
- notificações globais e notificações por board
- estrutura atual da Visão Geral

## Estado atual da arquitetura

### Fonte principal de estado

Hoje o estado de boards, tarefas e notificações está centralizado em `App.tsx` e `KanbanWorkspacePage.tsx`.

Responsabilidades de `App.tsx`:

- manter a lista global de notificações
- calcular total de não lidas
- marcar uma notificação como lida
- marcar todas como lidas
- marcar notificações de um board específico como lidas
- navegar para board/tarefa ao abrir uma notificação

Responsabilidades de `KanbanWorkspacePage.tsx`:

- manter o estado dos boards, colunas e tarefas (via snapshot persistido em localStorage)
- controlar modais: criação de tarefa, edição de tarefa, detalhe de tarefa
- controlar a visualização Kanban / Calendário
- controlar filtros, busca, histórico e notificações por board

Arquivos principais:

- `src/app/App.tsx`
- `src/app/components/dashboard/OverviewDashboardPage.tsx`
- `src/app/components/boards/KanbanWorkspacePage.tsx`
- `src/app/components/boards/BoardCalendarView.tsx`
- `src/app/components/boards/BoardNotificationsPopover.tsx`
- `src/app/components/tasks/CreateTaskModal.tsx`
- `src/app/components/tasks/TaskDetailModal.tsx`
- `src/app/components/tasks/DetailedTaskCard.tsx`
- `src/app/components/shared/NotificationCard.tsx`

---

## Board workspace

### Cabeçalho do board

O cabeçalho do board hoje possui:

- seletor compacto `Organizar por`
- switch de visualização `Kanban | Calendário`
- botão de busca por ícone
- botão de notificações por board
- menu de ações em `3 pontinhos`
- botão principal de criar tarefa

Arquivo principal:

- `src/app/components/boards/KanbanWorkspacePage.tsx`

### Busca no board

Comportamento atual:

- o ícone de lupa abre um popup central
- o fundo é desfocado
- a digitação filtra tarefas do board atual em tempo real
- os resultados aparecem em lista com a mesma hierarquia visual de `Minhas tarefas` da Visão Geral
- clicar em um resultado abre a tarefa
- `Esc` fecha a busca e limpa o termo

Campos pesquisados hoje:

- título
- descrição
- tags
- cliente
- nomes dos responsáveis

Estrutura visual dos resultados:

- barra de busca única, com lupa integrada no próprio campo
- acento vertical discreto com a cor da coluna
- título da tarefa + badge de status/coluna
- alerta de prazo quando aplicável
- linha de metadados com cliente, prazo e responsáveis em texto
- avatar stack alinhado à direita

Regras de UX:

- a busca é contextual ao board atual
- a busca não altera as colunas por trás
- fechar o popup limpa o termo
- o resultado selecionado abre o modal de detalhe da tarefa

Arquitetura:

- estado local no `KanbanWorkspacePage`
- sem persistência
- sem impacto nas colunas por trás

---

## Calendário do board

### Objetivo da visualização

O Calendário funciona como visualização mensal do board baseada em `dueDate`.

Cada card/tarefa com data aparece no dia correspondente.

Arquivo principal:

- `src/app/components/boards/BoardCalendarView.tsx`

### Comportamento atual

- navegação por mês
- clique no dia seleciona o dia
- clique no mesmo dia novamente limpa o filtro
- clique fora da área útil também limpa a seleção
- clicar em uma tarefa (no grid ou no painel lateral) abre o `TaskDetailModal`
- lateral direita mostra:
  - `Tarefas do mês` em ordem cronológica quando nada está selecionado
  - `Tarefas do dia` quando um dia está selecionado
- ao passar o mouse sobre um dia, aparece um botão `+` para criação rápida

### Criação rápida pelo calendário

- o botão `+` não substitui o clique normal do dia
- clicar no `+` abre o `CreateTaskModal`
- o campo de data já entra preenchido com a data daquele dia

Fluxo:

1. usuário clica no `+` do dia
2. `BoardCalendarView` dispara `onCreateTaskAtDate(date)`
3. `KanbanWorkspacePage` chama `openCreateTaskModal(undefined, { dueDate })`
4. `CreateTaskModal` recebe `initialTask` com `dueDate` já preenchido

### Abertura de tarefa pelo calendário

Fluxo ao clicar numa tarefa no grid ou no painel lateral:

1. `BoardCalendarView` dispara `onOpenTask(taskId)`
2. `KanbanWorkspacePage` localiza o card em `cards` pelo id
3. `setSelectedCard(card)` abre o `TaskDetailModal`

### Interface de dados do calendário

O `BoardCalendarView` recebe um array de `CalendarBoardTask`:

```ts
interface CalendarBoardTask {
  id: string;
  title: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: WorkflowStatus;
  columnName: string;
  columnAccentColor: string;
  assignees: Array<{ name: string; image?: string }>;
  clientName?: string | null;
  /** URL da imagem de capa — exibida como miniatura no painel lateral */
  coverImage?: string | null;
}
```

O `coverImage` é exibido como thumbnail `68×68px` no painel lateral quando presente.

### Formato atual de data

O front suporta:

- `YYYY-MM-DD`
- `YYYY-MM-DDTHH:mm`
- formatos compactos legados como `18 Mar`

Utilitário:

- `src/app/utils/taskDueDate.ts`

Recomendação para back-end:

- padronizar resposta e escrita em ISO:
  - data sem hora: `YYYY-MM-DD`
  - data com hora: `YYYY-MM-DDTHH:mm`

### Props do BoardCalendarView

```ts
interface BoardCalendarViewProps {
  month: Date;
  selectedDate: Date | null;
  tasks: CalendarBoardTask[];
  onMonthChange: (nextMonth: Date) => void;
  onSelectDate: (date: Date | null) => void;
  /** Abre o TaskDetailModal para a tarefa */
  onOpenTask: (taskId: string) => void;
  /** Abre o CreateTaskModal com dueDate pré-preenchida */
  onCreateTaskAtDate: (date: Date) => void;
}
```

---

## Modal de criação e edição de tarefa

### Arquivo principal

- `src/app/components/tasks/CreateTaskModal.tsx`

### Props

```ts
interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId?: string;
  columns?: TaskFormColumnOption[];
  defaultColumnId?: string;
  onCreateTask?: (payload: CreateTaskSubmitData) => void;
  /** Dados para pré-preencher o formulário (criação rápida ou edição) */
  initialTask?: CreateTaskInitialData | null;
  /** 'create' (padrão) ou 'edit' */
  mode?: 'create' | 'edit';
}
```

### Payload de submissão

```ts
interface CreateTaskSubmitData {
  /** Presente em modo edição — id da tarefa sendo editada */
  taskId?: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  credits: number;
  client: string;
  assignees: TaskAssignee[];
  tags: TagItem[];
  subtasks: TaskFormSubtask[];
  attachments: TaskFormAttachment[];
  /** Data URL da imagem de capa — null quando sem capa */
  coverImage: string | null;
}
```

### Seções do formulário

O modal divide-se nas seguintes seções:

1. **Cabeçalho** — título do modal (Nova tarefa / Editar tarefa), botão de capa, botão fechar
2. **Preview de capa** — visível apenas quando uma capa está selecionada
3. **Título** — input de texto obrigatório
4. **Descrição** — editor rich text com toolbar (bold, italic, tamanho de fonte, cor de texto)
5. **Subtarefas** — toggle de ativação + lista de subtarefas
6. **Anexos** — área de upload + lista de arquivos
7. **Metadados** — coluna, data, hora, créditos, cliente, tags, responsáveis
8. **Rodapé** — botão Cancelar + botão principal (Criar tarefa / Salvar alterações)

---

### Capa da tarefa (coverImage)

#### Seleção inicial

O cabeçalho do modal possui um botão **"Capa"** com ícone `ImagePlus`.

Ao clicar, abre um dropdown com as opções:

- **Enviar do computador** — abre `<input type="file" accept="image/*">` oculto
  - ao selecionar um arquivo, lê como Data URL via `FileReader` e seta `coverImage`
- **Remover capa atual** — visível somente quando já há uma capa; seta `coverImage = null`
- **Dos anexos** — seção adicional quando há imagens em `attachments`; permite selecionar qualquer imagem já anexada como capa

#### Preview inline

Quando `coverImage !== null`:

- um bloco de `136px` de altura exibe a imagem em `object-cover` abaixo do cabeçalho
- ao passar o mouse sobre o bloco, aparece um overlay escuro com dois botões:
  - **"Trocar"** — abre um dropdown idêntico ao do cabeçalho (upload ou dos anexos)
  - **"Remover"** — seta `coverImage = null` e oculta o bloco

#### Propagação do coverImage

Após a criação/edição, o `coverImage` é salvo no `BoardCard` (campo `coverImage: string | null`) e propagado para:

- `DetailedTaskCard` — exibido como banner de `128px` no topo do card Kanban quando presente
- `TaskDetailModal` — exibido como banner de `192px` na seção de detalhe da tarefa
- `CalendarBoardTask.coverImage` — enviado para o `BoardCalendarView` para exibição no painel lateral

---

### Subtarefas

#### Ativação

Um toggle no formulário ativa/desativa a seção de subtarefas. O estado inicial é `false` (desativado) exceto quando `initialTask.subtasks` possui itens.

#### Estrutura de uma subtarefa

```ts
interface TaskFormSubtask {
  id: string;
  title: string;
  done: boolean;
  dueDate?: string;
  assignee?: { id: string; name: string; image?: string };
}
```

#### Interações disponíveis por subtarefa

- **Checkbox** — marca/desmarca a subtarefa como concluída
- **Input de título** — edita o texto da subtarefa inline
- **Botão de responsável** — abre um mini dropdown com busca para atribuir um membro da equipe
- **Botão de data** — abre um input de data inline para definir prazo da subtarefa
- **Botão X** — remove a subtarefa da lista

#### Adição de nova subtarefa

Campo de texto ao final da lista. Pressionar `Enter` ou clicar fora adiciona a subtarefa.

#### Progresso automático

O `progress` da tarefa é calculado automaticamente com base nas subtarefas:

```ts
Math.round((completedSubtasks / totalSubtasks) * 100)
```

Esse valor é persistido no `BoardCard.progress` e exibido na `ProgressBar` do `DetailedTaskCard`.

---

### Anexos

#### Área de upload

- bloco com borda tracejada e ícone de upload
- clicar no bloco adiciona um arquivo (hoje mockado; comportamento real será integrado ao back-end)
- limite visual de `25 MB` por arquivo

#### Lista de arquivos

Cada arquivo exibido possui:

- thumbnail `40×48px` (para imagens) ou ícone de tipo de arquivo
- nome e tamanho do arquivo
- botão de download
- botão de remover (exclui da lista local)
- botão de opções (`ChevronDown`)

#### Tipo de anexo

```ts
interface TaskFormAttachment {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'image' | 'doc' | 'spreadsheet' | 'other';
}
```

#### Integração com a capa

Quando `attachments` contém arquivos de imagem (`type === 'image'` ou extensões `.jpg` / `.png`), eles aparecem no dropdown do seletor de capa na seção "Dos anexos".

---

### Modo edição

#### Como é acionado

A partir do `TaskDetailModal`, o usuário clica em `... → Editar tarefa`, que dispara `onEditTask()`.

`KanbanWorkspacePage` executa `openEditTaskModal(selectedCard)`:

1. `setSelectedCard(null)` — fecha o `TaskDetailModal`
2. `window.requestAnimationFrame(...)` — aguarda o desmonte completo do `TaskDetailModal` (evita conflito de `body.style.overflow` que causava tela branca)
3. `setEditingTaskId(card.id)`
4. `setCreateTaskModalOpen(true)` — abre o `CreateTaskModal` em modo edição

#### Serialização do card para o formulário

`KanbanWorkspacePage` converte um `BoardCard` em `CreateTaskInitialData` antes de passar para o modal:

- `taskId` ← `card.id`
- `columnId` ← `card.columnId`
- `title` ← `card.title`
- `description` ← `card.description`
- `priority` ← `card.priority`
- `dueDate` ← `card.dueDate`
- `credits` ← `card.credits`
- `client` ← `card.client?.name`
- `assignees` ← `card.assignees`
- `tags` ← mapeamento de `card.tags` + `card.tagColors` para o formato `{ label, color: TagColor }`
- `subtasks` ← `card.subtasksList`
- `attachments` ← `card.attachmentsList`
- `coverImage` ← `card.coverImage`

#### Submissão em modo edição

Quando `payload.taskId` está presente, `handleCreateTask` atualiza o card existente em vez de criar um novo:

```ts
current.map(card => card.id === payload.taskId ? buildCard(card) : card)
```

---

### Gerenciamento de body overflow

Tanto `CreateTaskModal` quanto `TaskDetailModal` gerenciam `body.style.overflow = 'hidden'` via `useEffect` ao abrir, restaurando o valor anterior ao fechar. Isso evita que o conteúdo de fundo role enquanto o modal está aberto.

---

## Modal de detalhe de tarefa

### Arquivo principal

- `src/app/components/tasks/TaskDetailModal.tsx`

### O que exibe

- capa da tarefa (banner de 192px, com opções de trocar e remover)
- badges de prioridade, status e créditos (editáveis inline)
- título e descrição em rich text
- subtarefas com checkbox interativo
- grade de metadados: data de entrega e cliente
- data de criação
- responsáveis (avatar stack)
- seção de anexos (lista com preview e upload drag-and-drop)
- sidebar: comentários ou histórico de atividades (toggle)
- footer: botão "Concluir tarefa" com animação

### Ações disponíveis no cabeçalho (`...`)

- **Editar tarefa** → abre `CreateTaskModal` em modo edição
- **Duplicar** → cria uma cópia do card no mesmo board
- **Copiar link** → copia URL com parâmetros de board e card
- **Cancelar tarefa** → resolve o card como `cancelled`
- **Arquivar tarefa** → resolve o card como `archived`

### Props

```ts
interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteTask?: () => void;
  onToggleSubtask?: (subtaskId: string) => void;
  onEditTask?: () => void;
  onDuplicateTask?: () => void;
  onCopyTaskLink?: () => void;
  onCancelTask?: () => void;
  onArchiveTask?: () => void;
  onOpenClientLibrary?: (clientId?: string | null, clientName?: string | null) => void;
  task: { /* campos abaixo */ };
}
```

Campos do objeto `task`:

```ts
{
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: WorkflowStatus;
  statusLabel?: string;
  subtasks?: { completed: number; total: number };
  subtasksList?: SubtaskItem[];
  progress: number;
  dueDate: string;
  tags: Array<{ label: string; color: TagColor }>;
  assignees: Array<{ name: string; image?: string }>;
  attachmentsList?: Attachment[];
  comments: Comment[];
  createdAt?: string;
  coverImage?: string;
  credits?: number;
  client?: string;
  clientId?: string | null;
  activityLog?: ActivityLogEntry[];
}
```

---

## Notificações no board

### Comportamento atual

O board possui um sino próprio no cabeçalho.

- mostra badge com quantidade de não lidas daquele board
- ao clicar, abre um popover ancorado no header
- o popover tem filtros:
  - `Todas`
  - `Menções`
  - `Atualizações`
- botão `Ler todas` marca como lidas apenas as notificações do board atual
- clique em uma notificação:
  - marca como lida
  - abre a tarefa correspondente

### Regras atuais

- o board mostra somente notificações com `notification.boardId === activeBoardId`
- `Menções` é inferido por `type === 'mention'`
- `Atualizações` é o restante dos tipos
- scroll interno com carregamento progressivo (exibe 5 por vez, expande ao rolar)

### Arquivos

- `src/app/components/boards/KanbanWorkspacePage.tsx`
- `src/app/components/boards/BoardNotificationsPopover.tsx`
- `src/app/components/shared/NotificationCard.tsx`

---

## Kanban

O Kanban segue como visualização operacional principal:

- colunas dinâmicas por board
- drag and drop com indicador de posição
- arrastar colunas para reordenar
- histórico de tarefas arquivadas/canceladas
- modal de criação/edição de tarefa
- modal de detalhe de tarefa
- filtros por responsável e ordenação por coluna
- colunas ocultas com controle visual de reexibição

---

## Visão Geral

### Estrutura atual

A Visão Geral funciona como hub consolidado.

Arquivo principal:

- `src/app/components/dashboard/OverviewDashboardPage.tsx`

Layout atual:

- topo com KPIs
- coluna esquerda:
  - `Minhas tarefas`
  - `Avisos`
- coluna direita:
  - `Notificações`
  - `Seus boards`
- abaixo:
  - `Biblioteca de clientes`

### Minhas tarefas

Comportamento atual:

- filtros `Todas`, `Hoje`, `Atrasadas`
- lista com altura limitada
- scroll para carregar mais itens

### Notificações na Visão Geral

Comportamento atual:

- usa a mesma fonte global de notificações do `App.tsx`
- título com badge vermelho de não lidas
- botão `Ler todas`
- lista com scroll e carregamento progressivo
- clique em uma notificação abre o fluxo correspondente

### Sidebar

O item `Visão geral` da sidebar possui badge com a quantidade global de notificações não lidas.

Arquivo:

- `src/app/components/shared/AppShellChrome.tsx`

---

## Modelo de notificação

### Tipo compartilhado atual

```ts
interface NotificationItem {
  id: string;
  type: 'mention' | 'comment' | 'completed' | 'overdue' | 'attachment' | 'assigned';
  actor: {
    name: string;
    image?: string;
  };
  message: string;
  taskTitle?: string;
  timestamp: string;
  isRead?: boolean;
  boardId?: string;
  taskId?: string;
}
```

Observações:

- `boardId` vincula a notificação ao board
- `taskId` permite abrir a tarefa específica
- `type` controla ícone e cor do selo
- `message` e `taskTitle` estão separados para permitir composição visual

### Design do componente de notificação

O componente compartilhado:

- `src/app/components/shared/NotificationCard.tsx`

Estado visual:

- card com borda neutra
- avatar do ator
- selo do tipo de notificação sobre o avatar com cor sólida e ícone branco interno

Tipos visuais atuais: `mention`, `comment`, `completed`, `overdue`, `attachment`, `assigned`

---

## Regras de navegação

### Ao abrir uma notificação

Fluxo atual:

1. marcar a notificação como lida
2. se houver `boardId` ou `taskId`, navegar para o board
3. se houver `taskId`, abrir a tarefa correspondente
4. se não houver vínculo com board/tarefa, abrir a Visão Geral

---

## Contrato sugerido para back-end

### Entidade de notificação

```ts
interface BackendNotification {
  id: string;
  userId: string;
  boardId?: string | null;
  taskId?: string | null;
  type: 'mention' | 'comment' | 'completed' | 'overdue' | 'attachment' | 'assigned';
  category?: 'mention' | 'update';
  actor: {
    id?: string | null;
    name: string;
    avatarUrl?: string | null;
  };
  message: string;
  taskTitle?: string | null;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
}
```

Mapeamento recomendado para front:

- `actor.avatarUrl` → `actor.image`
- `createdAt` → gerar `timestamp` relativo no front, ou fornecer ambos

### Endpoints sugeridos

- `GET /notifications`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all`
- `PATCH /boards/:boardId/notifications/read-all`

Filtros úteis: `boardId`, `isRead`, `type`, `category`, paginação por cursor

### Entidade de tarefa para o calendário

Campos mínimos necessários:

```ts
interface BoardTaskCalendarPayload {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  assignees: Array<{
    id?: string;
    name: string;
    image?: string;
  }>;
  clientName?: string | null;
  /** URL pública da imagem de capa — null quando não houver */
  coverImage?: string | null;
}
```

### Entidade completa de tarefa (criação/edição)

```ts
interface BoardTaskPayload {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  dueDate: string;
  credits: number;
  clientId?: string | null;
  assignees: Array<{ id: string; name: string; avatarUrl?: string | null }>;
  tags: Array<{ label: string; color: string }>;
  subtasks: Array<{
    id: string;
    title: string;
    done: boolean;
    dueDate?: string | null;
    assigneeId?: string | null;
  }>;
  attachments: Array<{
    id: string;
    name: string;
    size: string;
    type: 'pdf' | 'image' | 'doc' | 'spreadsheet' | 'other';
    url?: string;
  }>;
  /** URL pública da imagem de capa — null quando não houver */
  coverImage?: string | null;
}
```

---

## Pontos importantes para IA

### Onde editar cada parte

- estado global de notificações: `src/app/App.tsx`
- Visão Geral: `src/app/components/dashboard/OverviewDashboardPage.tsx`
- sidebar e badge global: `src/app/components/shared/AppShellChrome.tsx`
- board workspace: `src/app/components/boards/KanbanWorkspacePage.tsx`
- calendário do board: `src/app/components/boards/BoardCalendarView.tsx`
- popover de notificações do board: `src/app/components/boards/BoardNotificationsPopover.tsx`
- card visual de notificação: `src/app/components/shared/NotificationCard.tsx`
- modal de criação/edição de tarefa: `src/app/components/tasks/CreateTaskModal.tsx`
- modal de detalhe de tarefa: `src/app/components/tasks/TaskDetailModal.tsx`
- card detalhado Kanban: `src/app/components/tasks/DetailedTaskCard.tsx`

### Fluxos críticos de estado

**Abrir detalhe de tarefa a partir do calendário:**

```
BoardCalendarView.onOpenTask(taskId)
→ KanbanWorkspacePage: setSelectedCard(card)
→ renderiza TaskDetailModal (isOpen=true)
```

**Editar tarefa a partir do detalhe:**

```
TaskDetailModal: onEditTask()
→ KanbanWorkspacePage: openEditTaskModal(selectedCard)
  → setSelectedCard(null)           // fecha TaskDetailModal
  → requestAnimationFrame(...)      // aguarda desmonte completo
    → setEditingTaskId(card.id)
    → setCreateTaskModalOpen(true)  // abre CreateTaskModal em modo edição
```

> **Importante:** o `requestAnimationFrame` é necessário para evitar conflito de `body.style.overflow` entre os dois modais. Não remover sem antes revisar os efeitos.

**Salvar edição:**

```
CreateTaskModal: onCreateTask(payload)
→ KanbanWorkspacePage: handleCreateTask(payload)
  → payload.taskId presente → atualiza card existente
  → setCreateTaskModalOpen(false)
  → setEditingTaskId(null)
```

### Situação atual de persistência

Hoje esses fluxos ainda estão majoritariamente acoplados ao front demo/mocks:

- notificações nascem em `App.tsx`
- comportamento de leitura é local
- integração com board/tarefa é local
- calendário usa tarefas já carregadas no estado do board
- upload de capa e anexos simulados (sem backend real)
- snapshot de boards/tarefas persiste em `localStorage` via `kanbanWorkspaceRepository`

### Débito técnico relevante

- O projeto ainda possui textos legados com problemas de acentuação em áreas antigas, especialmente em partes do showcase/design system dentro de `App.tsx`. Esses trechos não bloqueiam build, mas merecem limpeza antes de entrega final.
- O `COMPONENT_LIBRARY.md` documenta componentes genéricos do boilerplate inicial e não reflete os componentes reais do produto. Componentes como `DetailedTaskCard`, `CreateTaskModal`, `BoardCalendarView`, `PriorityBadge`, `TagBadge`, `AvatarStack` e `ProgressBar` ainda não estão documentados nele.

---

## Resumo executivo

Estado atual do produto:

- Board já possui header compacto, busca popup, switch Kanban/Calendário e sino de notificações próprio
- Calendário mostra tarefas por dia (com miniatura de capa quando disponível), lista cronológica do mês e criação rápida com `+`
- Tarefa pode ter capa (Data URL), subtarefas com responsável e data, e lista de anexos com preview
- Capa é propagada do `CreateTaskModal` → `BoardCard` → `DetailedTaskCard`, `TaskDetailModal` e painel lateral do calendário
- Visão Geral centraliza tarefas, avisos e notificações globais com scroll progressivo
- Notificações possuem componente visual compartilhado e navegação integrada com board/tarefa
- Back-end pode integrar com segurança começando por notificações, depois tarefas com `dueDate` em ISO e `coverImage` como URL pública
