# Changelog — WePlanner

Registro de todas as releases do projeto, organizadas por data (mais recente primeiro).
Hierarquia: **Release → Módulo → Mudança**.

Tipos de mudança:
- `[FEATURE]` — nova funcionalidade
- `[FIX]` — correção de bug
- `[IMPROVEMENT]` — melhoria em algo existente
- `[REFACTOR]` — reorganização de código sem mudança de comportamento
- `[DESIGN]` — ajuste visual/UX

> A fonte de verdade estruturada está em `ai-contex_pattern/src/app/data/changelog.ts`.
> A página visual está disponível em `#/changelog` dentro do app.

---

## v0.4.2 — 19 Abr 2026
**Correção de crash ao inserir imagens de capa**

### 🔧 Utilitários
- **[FEATURE]** `imageUtils.ts` — compressão e redimensionamento de imagens
  - Criado utilitário `compressImage()` que redimensiona para máximo 1600×600px e recomprime como JPEG 82% usando canvas. Previne crash de memória ao substituir `FileReader.readAsDataURL()` direto, que gerava strings base64 de 7–13MB no estado React.
  - Arquivos: `utils/imageUtils.ts`

### 🗂 Tarefas — Modais de Criação e Detalhes
- **[FIX]** Tela branca ao inserir imagens grandes como capa da tarefa
  - Imagens maiores que ~2MB causavam crash ao serem convertidas para base64 completo e armazenadas em estado React. Substituído o handler `FileReader` direto pelo novo `compressImage()` em ambos os modais. A imagem comprimida fica abaixo de ~300KB independentemente do tamanho original.
  - Arquivos: `components/tasks/CreateTaskModal.tsx`, `components/tasks/TaskDetailModal.tsx`

---

## v0.4.1 — 19 Abr 2026
**DateTimePicker unificado com calendário visual**

### 🧩 Componentes Compartilhados
- **[FEATURE]** `DateTimePicker` — seletor de data e hora com calendário customizado
  - Criado componente reutilizável com duas variantes: `"field"` (input com borda, CreateTaskModal) e `"inline"` (trigger de texto com cores de estado, TaskDetailModal). Inclui calendário visual com navegação por mês, grid de dias (Dom–Sáb), hoje destacado com borda laranja, dia selecionado com fundo laranja, input de horário com Clock icon e botões Limpar/Confirmar. Fecha ao clicar fora.
  - Arquivos: `components/shared/DateTimePicker.tsx`

- **[IMPROVEMENT]** Formato de data exibe `'às'` entre data e horário
  - Atualizada `formatTaskDueDate()` para incluir `'às'` entre data e hora. Resultado: `'19 Abr às 14:30'` em vez de `'19 Abr 14:30'`.
  - Arquivos: `utils/taskDueDate.ts`

### 🗂 Tarefas — Modais de Criação e Detalhes
- **[IMPROVEMENT]** Inputs de data/hora separados substituídos pelo DateTimePicker
  - CreateTaskModal usa `variant="field"`. TaskDetailModal usa `variant="inline"` com prop `dueDateState` para colorir o trigger (overdue=vermelho, warning=amarelo, normal=cinza). Ambos utilizam `buildTaskDueDateValue()` e `getTaskDueDateInputParts()` para serialização ISO.
  - Arquivos: `components/tasks/CreateTaskModal.tsx`, `components/tasks/TaskDetailModal.tsx`

---

## v0.4.0 — 19 Abr 2026
**Sistema completo de subtarefas no modal de detalhes**

### 🗂 Tarefas — Modal de Detalhes
- **[FEATURE]** Sistema de subtarefas com progress bar (idêntico ao CreateTaskModal)
  - Estado local `localSubtasks` espelha `task.subtasksList` e é re-sincronizado a cada abertura do modal. Cada mudança chama `onUpdateTaskField` imediatamente. Funcionalidades: checkbox de conclusão, título editável inline, seletor de responsável com busca, seletor de data nativo, botão de remoção, input de nova subtarefa (Enter para adicionar), `ProgressBar` + contador "X/Y concluídas".
  - Arquivos: `components/tasks/TaskDetailModal.tsx`

---

## v0.3.9 — 19 Abr 2026
**Tags padronizadas, capa movida e fix no date picker**

### 🗂 Tarefas — Modais de Criação e Detalhes
- **[DESIGN]** Tags com X sempre visível dentro da pill colorida
  - Padronizado o padrão "X-inline" em ambos os modais: X sempre visível dentro da pill, sem hover para revelar. TaskDetailModal usava `TagBadge` + X externo com hover; substituído pelo mesmo padrão do CreateTaskModal. `tag.color` em TaskDetailModal é string (ex: `"red"`) mapeada via `TAG_PALETTE.find(c => c.colorName === tag.color)`.
  - Arquivos: `components/tasks/CreateTaskModal.tsx`, `components/tasks/TaskDetailModal.tsx`

### 🗂 Tarefas — Modal de Criação
- **[DESIGN]** Botão 'Adicionar capa' movido do header para a área de conteúdo
  - Removido dropdown "Capa" do header do modal. Adicionado botão dashed minimalista no início da área de scroll (acima do título). Visível apenas sem capa ativa. Com capa: preview `h-36` com overlay `bg-black/40` no hover, botões "Trocar" (dropdown com upload + anexos) e "Remover".
  - Arquivos: `components/tasks/CreateTaskModal.tsx`

- **[FIX]** Date picker do TaskDetailModal não respondia ao clique
  - Input de data sobreposto (`opacity-0 absolute`) estava vinculado diretamente à prop `task.dueDate` que não atualizava imediatamente após `onUpdateTaskField`, causando reversão visual. Corrigido com estados locais `editDueDate`/`editDueTime`; posteriormente substituído pelo DateTimePicker (v0.4.1).
  - Arquivos: `components/tasks/TaskDetailModal.tsx`

---

## v0.3.8 — 19 Abr 2026
**Edição inline completa no modal de detalhes da tarefa**

### 🗂 Tarefas — Modal de Detalhes
- **[FEATURE]** Edição inline de título
  - Clique no título exibe input com borda laranja. Blur ou Enter salva via `onUpdateTaskField`. Escape cancela e restaura valor original.
  - Arquivos: `components/tasks/TaskDetailModal.tsx`

- **[FEATURE]** Edição inline de descrição
  - Clique na área de descrição exibe textarea redimensionável. Blur salva se houve alteração. Escape cancela. Utiliza `getRichTextPlainText()` para comparação.
  - Arquivos: `components/tasks/TaskDetailModal.tsx`

- **[FEATURE]** Edição inline de data de entrega
  - Data exibida como texto clicável com cor de estado (overdue=vermelho, warning=amarelo, normal=cinza). Clique abre `DateTimePicker` inline `variant="inline"`. Alteração salva via `onUpdateTaskField`.
  - Arquivos: `components/tasks/TaskDetailModal.tsx`

- **[FEATURE]** Edição inline de tags (adicionar, remover, trocar cor)
  - Tags editáveis: pill colorida com X para remover, clique no label abre picker de cor (grid 4×2). Botão `+` abre input inline para nova tag (Enter adiciona). Limite de 5 tags.
  - Arquivos: `components/tasks/TaskDetailModal.tsx`

- **[FEATURE]** Edição inline de responsáveis
  - Clique no `AvatarStack` abre dropdown com busca de membros. Toggle add/remove. Usa `BOARD_DIRECTORY_USERS` como fonte de dados.
  - Arquivos: `components/tasks/TaskDetailModal.tsx`

- **[FEATURE]** Edição inline de cliente
  - Clique no campo de cliente abre dropdown com lista de `MOCK_TASK_FORM_CLIENTS`. Salva `clientId` e `client name` via `onUpdateTaskField`.
  - Arquivos: `components/tasks/TaskDetailModal.tsx`, `data/taskForm.ts`

- **[FEATURE]** Créditos editáveis via popover no header
  - Badge "Créditos usados" no header é clicável e abre popover com input numérico para ajuste. Estado local `editCredits` sincronizado com `task.credits`.
  - Arquivos: `components/tasks/TaskDetailModal.tsx`

- **[FEATURE]** Capa da tarefa — adicionar, trocar e remover inline
  - Botão "Adicionar capa" (dashed) exibido quando sem capa. Com capa: preview `h-48`, overlay no hover com botões "Trocar" (dropdown upload/anexos) e "Remover" (vermelho). Alterações propagadas via `onUpdateTaskField({ coverImage })`.
  - Arquivos: `components/tasks/TaskDetailModal.tsx`

---

## v0.3.7 — 18 Abr 2026
**Phase 4 — Refatoração de arquitetura e extração de módulos**

### 🏗 Arquitetura — Clientes
- **[REFACTOR]** ClientPanel extraído em ClientPanelTabs
  - `ClientPanel.tsx` reduzido de 765 para ~224 linhas. Tabs (Profile, Library, Team, Boards, Credits) e constante `TABS` extraídas para `ClientPanelTabs.tsx` com exports individuais. Mantida compatibilidade total de interface.
  - Arquivos: `components/clients/ClientPanel.tsx`, `components/clients/ClientPanelTabs.tsx`

### 🏗 Arquitetura — Tarefas
- **[REFACTOR]** Types do TaskDetailModal centralizados em `types/taskDetail.ts`
  - Interfaces `TaskDetailComment`, `TaskDetailAttachment` e `TaskDetailModalProps` removidas do corpo do componente e exportadas de `src/app/types/taskDetail.ts`. Segue regra de arquitetura: types compartilhados ficam em `types/`.
  - Arquivos: `types/taskDetail.ts`, `components/tasks/TaskDetailModal.tsx`

- **[REFACTOR]** `MOCK_TASK_FORM_CLIENTS` centralizado em `data/taskForm.ts`
  - Array de 8 clientes mock removido do corpo de `TaskDetailModal` e adicionado ao módulo `data/taskForm.ts`, reutilizável por `CreateTaskModal` e `TaskDetailModal` sem duplicação.
  - Arquivos: `data/taskForm.ts`, `components/tasks/TaskDetailModal.tsx`
