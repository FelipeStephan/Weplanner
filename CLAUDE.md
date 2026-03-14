# Meu Ambiente de Test — Contexto do Projeto

## O que é este projeto
Plataforma de **gestão de workflow** para agências de marketing, freelancers e equipes. Desenvolvido originalmente no Figma Maker, sendo replicado e expandido aqui com código.

## Objetivo principal
Construir um **design system** completo e reutilizável baseado no design criado no Figma.

## Stack técnica
- **React** 18 + **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** + **Radix UI**
- **Lucide React** (ícones)
- **Sonner** (toasts)
- **Motion** (animações)
- **Vite** (bundler / dev server)

## Papéis de usuário
- **Client** — visualiza projetos, tarefas e saldo de créditos
- **Manager** — acesso total: dashboard, time, relatórios, créditos
- **Collaborator** — tarefas atribuídas, updates, time tracking

---

## Repositório e Setup

### Repositório GitHub
```
https://github.com/FelipeStephan/meu-ambiente-de-test.git
```
**Branch ativa:** `feat/credits-client-cards`

### Como rodar localmente
```bash
# 1. Clonar o repositório
git clone https://github.com/FelipeStephan/meu-ambiente-de-test.git
cd meu-ambiente-de-test

# 2. Entrar na pasta do app principal
cd ai-contex_pattern

# 3. Instalar dependências
npm install

# 4. Rodar o dev server
npm run dev
# → Abre em http://localhost:5173
```

### Como fazer build e deploy
```bash
# Build de produção
npm run build
# Gera a pasta dist/

# Zipar o dist para deploy
# Windows PowerShell:
Compress-Archive -Path dist\* -DestinationPath dist_deploy.zip -Force

# Deploy na Hostinger via MCP (ferramenta mcp__hostinger-api__hosting_deployStaticWebsite)
# domain: ds.weplanner.com.br
# archivePath: caminho absoluto do dist_deploy.zip
```

### Produção
**URL:** https://ds.weplanner.com.br

---

## Estrutura de pastas

```
ai-contex_pattern/              # App principal (React + Vite)
  src/
    app/
      App.tsx                   # Componente raiz — todas as seções e mocks de dados
      components/
        tasks/
          CreateTaskModal.tsx   # Modal de criação de tarefa
          TaskDetailModal.tsx   # Modal de detalhes da tarefa
          TaskCard.tsx          # Card de tarefa (kanban/lista)
          StatusBadge.tsx       # Badge de status
          KanbanColumn.tsx      # Coluna kanban
          DetailedTaskCard.tsx  # Card expandido
          SimpleTaskCard.tsx    # Card compacto
          MeetingCard.tsx       # Card de reunião
        shared/
          PriorityBadge.tsx     # Badge de prioridade
          TagBadge.tsx          # Badge de tag
          AvatarStack.tsx       # Stack de avatares
          ProgressBar.tsx       # Barra de progresso
        dashboard/              # Componentes do dashboard
        ui/                     # Componentes base (Button, etc.)
    styles/
      index.css                 # Tailwind v4 config + variáveis CSS
    main.tsx                    # Entry point

  DESIGN_SYSTEM.md              # Tokens detalhados (cores, tipografia, sombras)
  COMPONENT_LIBRARY.md          # Guia de implementação dos componentes
  QUICK_START.md                # Exemplos de uso
  guidelines/                   # Diretrizes gerais

ui/                             # Biblioteca de componentes reutilizáveis (separada)
tutoriais-de-ambiente/          # Tutoriais de infraestrutura (Hostinger, etc.)
```

---

## Estado atual do trabalho

### Seções implementadas no App.tsx
A navegação principal tem as seguintes seções, todas funcionais:
- **Dashboard** — KPIs, gráficos, tarefas recentes
- **Tarefas** — lista de tarefas com kanban e tabela, filtros
- **Time** — membros da equipe com cards de perfil
- **Relatórios** — gráficos e métricas
- **Créditos** — gestão de créditos por cliente
- **Componentes** — showcase de todos os componentes do design system

### Componentes principais e seu estado

#### CreateTaskModal
Modal completo de criação de tarefas com:
- Campo de título
- Rich text editor (descrição) com toolbar: bold, italic, tamanho de fonte, cor, anexos
- **Subtarefas** (toggle abaixo da descrição) — adicionar via Enter, checkbox, X para deletar, contador
- Prioridade (Baixa / Média / Alta / Urgente)
- Status com pills clicáveis — padrões fixos + criação de status customizado via `+` (chip inline editável com cor)
- Data de entrega (date picker nativo)
- Créditos + botão IA (calcula automaticamente)
- Cliente (dropdown com mock)
- Tags — suggestions clicáveis + chip input unificado, máx 5 tags, clique no chip troca cor, X deleta
- Responsáveis (multi-select com avatares)
- Anexos (upload simulado com preview)

#### TaskDetailModal
Modal de visualização/edição de tarefas com:
- Header: badge de prioridade + status + **badge "Créditos usados"** (clicável para editar valor via popover)
- Tabs: Detalhes / Anexos / Comentários / Atividades
- **Aba Detalhes:**
  - Cover image (quando disponível)
  - Tags
  - Título + descrição
  - **Subtarefas** (abaixo da descrição) — progress bar + lista com checkboxes
  - Grid: **Data de entrega** (clicável para editar inline) + **Cliente**
  - "Criado em" como texto discreto (pequeno, sem card)
  - Responsáveis com AvatarStack
- **Aba Atividades:** timeline com 10 eventos incluindo "editou a descrição" e "ajustou data de entrega"
- **Footer sticky:** botão **"Concluir tarefa"** com animação bounce → estado verde "Concluída"

#### Tags (CreateTaskModal)
- `TAG_SUGGESTIONS`: Design, Frontend, Backend, UX, Mobile, API, Testes, Documentação
- `TAG_PALETTE`: 8 cores disponíveis (laranja, azul, verde, roxo, rosa, amarelo, vermelho, cinza)
- Interface `TagItem { label: string; color: typeof TAG_PALETTE[number] }`

#### Status customizado (CreateTaskModal)
- Padrões: A fazer, Em progresso, Revisão, Concluído (fixos, sem X)
- Customizados: clicar `+` cria chip inline editável → digita nome → Enter salva → hover mostra X para deletar
- Interface `CustomStatus { value: string; label: string; color: string }`

### Dados mock em App.tsx
- `TEAM` — array de membros da equipe com nome, cargo, avatar, cor
- `MOCK_COMMENTS` — comentários mockados
- `MODAL_TASK_DATA` — objeto Record<string, TaskData> com 9 tarefas detalhadas:
  - `"design-system"`, `"api-docs"`, `"onboarding-flow"`, `"db-migration"`, e outras
  - Cada tarefa tem: title, description, priority, status, subtasks, subtasksList, progress, dueDate, tags, assignees, attachmentsList, comments, createdAt, credits, **client** (string simples, ex: "WePlanner")

> ⚠️ **Atenção:** O campo `client` em `MODAL_TASK_DATA` deve ser **string simples** (ex: `"WePlanner"`), não objeto. Já foi corrigido — não reverter para `{ name: "..." }`.

---

## Design System — Referência rápida

### Cor primária (brand)
`#ff5623` — laranja

### Paleta semântica
| Papel | Cor | Hex |
|-------|-----|-----|
| Primary | Laranja | `#ff5623` |
| Success | Verde | `#019364` |
| Info | Roxo | `#987dfe` |
| Secondary | Amarelo | `#feba31` |
| Danger | Vermelho | `#f32c2c` |
| Accent | Rosa | `#ffbee9` |

### Neutros
| Papel | Hex |
|-------|-----|
| Background | `#fafafa` |
| Border | `#e5e5e5` |
| Text primário | `#171717` |
| Text secundário | `#525252` |
| Text terciário | `#737373` |
| Dark | `#101010` |

### Tipografia
- Fonte: **SF Pro** (system fallback)
- Base: `14px`, linha `1.5`
- Pesos: 300, 400, 500, 600, 700

### Espaçamento
Base 8px: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px`

### Border radius
`4px, 6px, 8px, 10px, 12px, 16px, 9999px`

---

## Princípios de design
- Mobile-first, responsivo
- WCAG 2.1 AA (contraste mínimo 4.5:1)
- Inspiração: Linear, Notion, Vercel, Stripe
- Flexbox e Grid por padrão — evitar `position: absolute` (exceto dropdowns/popovers)
- Arquivos pequenos — componentes em arquivos separados
- Labels de seção: `text-[10px] font-semibold text-[#a3a3a3] uppercase tracking-wider` com ícone via `flex items-center gap-1.5`
- Pills/chips: `px-2.5 py-1 rounded-lg text-[11px] font-semibold`
- Inputs: `h-10 bg-[#fafafa] border border-[#e5e5e5] rounded-xl px-4 focus:ring-2 focus:ring-[#ff5623]/20 focus:border-[#ff5623]`
- Modais: `max-w-[560px]` criar, `max-w-[720px]` detalhes, `rounded-2xl`, `shadow-2xl`
- Z-index: modais `z-[100]`, popovers/dropdowns `z-[200]`
- Overflow em containers com filhos absolutos: adicionar `overflow: visible` via style inline

---

## Convenções de código

### Nomenclatura de estados
```tsx
const [showXxx, setShowXxx]   // toggles booleanos
const [isXxx, setIsXxx]       // estados de edição/loading
const [xxxOpen, setXxxOpen]   // dropdowns/popovers
```

### Padrão de chip com hover X
```tsx
<div className="group flex items-center rounded-lg ...">
  <button onClick={...} className="pl-2.5 pr-1 py-1 text-[11px] font-semibold">
    {label}
  </button>
  <button
    onClick={e => { e.stopPropagation(); /* ação */ }}
    className="opacity-0 group-hover:opacity-60 hover:!opacity-100 pr-1.5 py-1 transition-opacity"
  >
    <X className="h-2.5 w-2.5" />
  </button>
</div>
```

### Padrão de toggle switch
```tsx
<button onClick={() => setEnabled(v => !v)} className="flex items-center gap-2 group w-full">
  <div className={`w-8 h-4 rounded-full transition-colors flex items-center px-0.5 ${enabled ? 'bg-[#ff5623]' : 'bg-[#e5e5e5]'}`}>
    <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0'}`} />
  </div>
  <span className="text-[10px] font-semibold text-[#a3a3a3] uppercase tracking-wider">Label</span>
</button>
```

### Padrão de popover inline
```tsx
<div className="relative">
  <button onClick={() => setOpen(v => !v)}>Trigger</button>
  {open && (
    <div
      className="absolute top-full mt-1.5 left-0 z-[200] bg-white border border-[#e5e5e5] rounded-xl p-3 shadow-xl"
      onClick={e => e.stopPropagation()}
    >
      {/* conteúdo */}
    </div>
  )}
</div>
```

---

## Documentação detalhada
Para detalhes completos consulte `ai-contex_pattern/DESIGN_SYSTEM.md` e `ai-contex_pattern/COMPONENT_LIBRARY.md`.
