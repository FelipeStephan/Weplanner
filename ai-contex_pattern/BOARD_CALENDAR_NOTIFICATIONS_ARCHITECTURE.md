# WePlanner: Boards, Calendário, Notificações e Visão Geral

## Objetivo

Este documento consolida o estado atual do front-end para servir como referência de contexto para IA, back-end e próximas integrações do produto.

Escopo documentado:

- board workspace
- visualização Kanban e Calendário
- busca de tarefas no board
- notificações globais e notificações por board
- estrutura atual da Visão Geral

## Estado atual da arquitetura

### Fonte principal de estado

Hoje o estado de notificações está centralizado em `App.tsx`.

Responsabilidades atuais:

- manter a lista global de notificações
- calcular total de não lidas
- marcar uma notificação como lida
- marcar todas como lidas
- marcar notificações de um board específico como lidas
- navegar para board/tarefa ao abrir uma notificação

Arquivos principais:

- `src/app/App.tsx`
- `src/app/components/dashboard/OverviewDashboardPage.tsx`
- `src/app/components/boards/KanbanWorkspacePage.tsx`
- `src/app/components/shared/NotificationCard.tsx`
- `src/app/components/boards/BoardNotificationsPopover.tsx`

### Modelo atual de notificação no front

Tipo compartilhado atual:

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
- os resultados aparecem em linhas/list items com a mesma hierarquia visual de `Minhas tarefas` da Visão Geral
- clicar em um resultado abre a tarefa
- `Esc` fecha a busca e limpa o termo

Campos pesquisados hoje:

- título
- descrição
- tags
- cliente
- nomes dos responsáveis

Estrutura visual atual dos resultados:

- barra de busca única, com lupa integrada no próprio campo
- itens em lista, sem bloco visual duplo
- acento vertical discreto com a cor da coluna
- título da tarefa
- badge de status/coluna
- alerta de prazo quando aplicável
- descrição curta
- chips de cliente e tags
- linha de metadados com:
  - cliente
  - ícone de calendário + prazo
  - responsáveis em texto
- avatar stack alinhado à direita

Regras de UX:

- a busca é contextual ao board atual
- a busca não altera silenciosamente as colunas por trás
- fechar o popup limpa o termo
- o resultado selecionado abre o modal/detalhe normal da tarefa

Arquitetura:

- estado local no `KanbanWorkspacePage`
- sem persistência
- sem impacto oculto nas colunas por trás

### Notificações no board

O board possui um sino próprio no cabeçalho.

Comportamento atual:

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

Regras atuais:

- o board mostra somente notificações com `notification.boardId === activeBoardId`
- `Menções` é inferido por `type === 'mention'` ou mensagem contendo `mencion`
- `Atualizações` é o restante
- scroll interno faz carregamento progressivo

Arquivos:

- `src/app/components/boards/KanbanWorkspacePage.tsx`
- `src/app/components/boards/BoardNotificationsPopover.tsx`
- `src/app/components/shared/NotificationCard.tsx`

### Kanban

O Kanban segue como visualização operacional principal:

- colunas dinâmicas por board
- drag and drop
- histórico de tarefas arquivadas/canceladas
- modal de criação/edição de tarefa
- modal de detalhe de tarefa

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
- clique fora da área útil também pode limpar a seleção
- clique em uma tarefa abre a tarefa
- lateral direita mostra:
  - `Tarefas do mês` em ordem cronológica quando nada está selecionado
  - `Tarefas do dia` quando um dia está selecionado
- a seção de `Próximos prazos` foi removida

### Criação rápida pelo calendário

Implementado recentemente:

- ao passar o mouse sobre um dia, aparece um botão `+`
- o `+` não substitui o clique normal do dia
- clicar no `+` abre o modal de criação de tarefa
- o campo de data já entra preenchido com a data daquele dia

Fluxo atual:

1. usuário clica no `+` do dia
2. `BoardCalendarView` dispara `onCreateTaskAtDate(date)`
3. `KanbanWorkspacePage` abre `CreateTaskModal`
4. o modal recebe `initialTask` com `dueDate` já preenchido

Arquivos envolvidos:

- `src/app/components/boards/BoardCalendarView.tsx`
- `src/app/components/boards/KanbanWorkspacePage.tsx`
- `src/app/components/tasks/CreateTaskModal.tsx`

### Formato atual de data

O front hoje já suporta:

- `YYYY-MM-DD`
- `YYYY-MM-DDTHH:mm`
- formatos compactos legados como `18 Mar`

Utilitário atual:

- `src/app/utils/taskDueDate.ts`

Recomendação para back-end:

- padronizar resposta e escrita em ISO:
  - data sem hora: `YYYY-MM-DD`
  - data com hora: `YYYY-MM-DDTHH:mm`

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
- sem botão `Ver todas as tarefas`

### Avisos

Comportamento atual:

- bloco separado abaixo de `Minhas tarefas`
- mostra alertas críticos e itens que exigem atenção

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

## Design system e componente visual de notificação

O componente compartilhado de notificação hoje é:

- `src/app/components/shared/NotificationCard.tsx`

Estado visual atual:

- sem borda lateral colorida
- card com borda neutra
- avatar do ator
- selo do tipo de notificação sobre o avatar
- círculo do selo com cor sólida
- ícone interno branco

Tipos visuais atuais:

- mention
- comment
- completed
- overdue
- attachment
- assigned

## Regras atuais de navegação

### Ao abrir uma notificação

Fluxo atual:

1. marcar a notificação como lida
2. se houver `boardId` ou `taskId`, navegar para o board
3. se houver `taskId`, abrir a tarefa correspondente
4. se não houver vínculo com board/tarefa, abrir a Visão Geral

### Ao clicar no sino da Visão Geral ou do layout

- a Visão Geral recebe foco na seção de notificações
- a lista consolidada continua sendo a referência global

## Contrato sugerido para back-end

### Entidade de notificação

Sugestão mínima:

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

- `actor.avatarUrl` -> `actor.image`
- `createdAt` -> gerar `timestamp` relativo no front, ou fornecer ambos
- `category` pode ser opcional se o back preferir delegar o filtro ao `type`

### Endpoints sugeridos

Sugestão funcional:

- `GET /notifications`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all`
- `PATCH /boards/:boardId/notifications/read-all`

Filtros úteis:

- `boardId`
- `isRead`
- `type`
- `category`
- paginação por cursor

## Contrato sugerido para tarefas no calendário

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
}
```

## Pontos importantes para IA

### Onde editar cada parte

- estado global de notificações: `src/app/App.tsx`
- Visão Geral: `src/app/components/dashboard/OverviewDashboardPage.tsx`
- sidebar e badge global: `src/app/components/shared/AppShellChrome.tsx`
- board workspace: `src/app/components/boards/KanbanWorkspacePage.tsx`
- calendário do board: `src/app/components/boards/BoardCalendarView.tsx`
- popover de notificações do board: `src/app/components/boards/BoardNotificationsPopover.tsx`
- card visual de notificação: `src/app/components/shared/NotificationCard.tsx`
- modal de criação de tarefa: `src/app/components/tasks/CreateTaskModal.tsx`

### Situação atual de persistência

Hoje esses fluxos ainda estão majoritariamente acoplados ao front demo/mocks:

- notificações nascem em `App.tsx`
- comportamento de leitura é local
- integração com board/tarefa é local
- calendário usa tarefas já carregadas no estado do board

### Débito técnico relevante

O projeto ainda possui textos legados com problemas de acentuação em áreas antigas, especialmente em partes do showcase/design system dentro de `App.tsx`.

Esses trechos não bloqueiam build, mas merecem uma limpeza dedicada antes de uma entrega final.

## Resumo executivo

Estado atual do produto:

- Board já possui header mais compacto, busca popup, switch Kanban/Calendário e sino de notificações próprio
- Calendário já mostra tarefas por dia, lista cronológica do mês e criação rápida com `+`
- Visão Geral já centraliza tarefas, avisos e notificações globais com scroll progressivo
- Notificações já possuem componente visual compartilhado e navegação integrada com board/tarefa
- Back-end agora pode integrar de forma segura começando por notificações e tarefas com `dueDate` em ISO
