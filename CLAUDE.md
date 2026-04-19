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
      App.tsx                   # Componente raiz — APENAS composição (imports + JSX + roteamento)
      data/                     # Mock data / constantes de dados
        avatars.ts              # AVATAR_URLS (URLs de avatares)
        team.ts                 # TEAM (membros da equipe)
        notifications.ts        # MOCK_NOTIFICATIONS
        modalTasks.ts           # MOCK_COMMENTS + MODAL_TASK_DATA
        iconGroups.ts           # ICON_GROUPS (catálogo de ícones do design system)
      types/                    # Types compartilhados
        navigation.ts           # Section, Role, PageView
      utils/                    # Funções puras utilitárias
        routeState.ts           # getRouteStateFromHash
      hooks/                    # Custom hooks (a criar conforme necessidade)
      pages/                    # Páginas de seção (a criar na Fase 2)
      components/
        tasks/                  # Componentes de tarefa
        shared/                 # Componentes reutilizáveis (Badge, Avatar, etc.)
        dashboard/              # Componentes do dashboard
        boards/                 # Componentes de board/kanban
        team/                   # Componentes de equipe
        clients/                # Componentes de clientes
        reports/                # Componentes de relatórios
        settings/               # Componentes de configurações
        auth/                   # Componentes de autenticação
        onboarding/             # Componentes de onboarding
        ui/                     # Componentes base (Button, Input, etc.)
    styles/
      index.css                 # Tailwind v4 config + variáveis CSS
    main.tsx                    # Entry point
    context/                    # Contexts (Workspace, Settings, etc.)
    repositories/               # Camada de acesso a dados
    domain/                     # Types e contracts do domínio
    demo/                       # Demo data (seeds e fixtures)
    imports/                    # Imports gerados do Figma

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

### Dados mock (extraídos para `src/app/data/`)
- `AVATAR_URLS` → `src/app/data/avatars.ts`
- `TEAM` → `src/app/data/team.ts`
- `MOCK_NOTIFICATIONS` → `src/app/data/notifications.ts`
- `MOCK_COMMENTS` + `MODAL_TASK_DATA` → `src/app/data/modalTasks.ts`
- `ICON_GROUPS` → `src/app/data/iconGroups.ts` (catálogo dead code, usado por showcase futuro)

`MODAL_TASK_DATA` é `Record<string, TaskData>` com 9 tarefas. Cada tarefa tem: title, description, priority, status, subtasks, subtasksList, progress, dueDate, tags, assignees, attachmentsList, comments, createdAt, credits, **client** (string simples, ex: `"WePlanner"`).

> ⚠️ **Atenção:** O campo `client` em `MODAL_TASK_DATA` deve ser **string simples** (ex: `"WePlanner"`), não objeto. Não reverter para `{ name: "..." }`.

---

## 🧱 Regras de arquitetura e tamanho (HARD RULES)

Essas regras existem para evitar a regressão ao monólito `App.tsx` 2048-linhas. **Não são sugestões — são gates.**

### Limites numéricos
| Escopo | Limite | Ação ao exceder |
|--------|--------|-----------------|
| Qualquer arquivo `.tsx`/`.ts` | **400 linhas** | Extrair antes de continuar |
| Componente inline (função dentro de outro arquivo) | **80 linhas** de JSX | Mover para próprio arquivo |
| `App.tsx` | **250 linhas** (meta pós-Fase 2) | Bloquear merge |
| Função/handler | **50 linhas** | Quebrar em helpers ou custom hook |
| Props de um componente | **8 props** | Agrupar em objeto ou usar context |

### Localização obrigatória por tipo de código
- **Mock data / constantes de dados** → `src/app/data/` (NUNCA em `App.tsx` ou dentro de componentes)
- **Types compartilhados** → `src/app/types/`
- **Funções puras utilitárias** → `src/app/utils/`
- **Custom hooks** (`useXxx`) → `src/app/hooks/`
- **Páginas de seção** (1 por rota) → `src/app/pages/`
- **Componentes de UI reutilizáveis** → `src/app/components/<domínio>/`
- **Context providers** → `src/context/`

### O que `App.tsx` PODE conter
- Imports
- Roteamento por hash (switch de `pageView`)
- Composição de providers top-level
- Estado global mínimo que precisa viver na raiz (ex: user session)

### O que `App.tsx` NÃO PODE conter
- ❌ Arrays/objetos de mock data inline
- ❌ JSX de mais de uma página (cada rota → sua página em `pages/`)
- ❌ Handlers de negócio (ficam no hook/página relevante)
- ❌ Definições de sub-componentes no mesmo arquivo
- ❌ Lógica de transformação de dados (vai para `utils/` ou repositório)

### Quando criar algo novo
1. **Antes de adicionar código a um arquivo existente**, verifique o tamanho atual. Se está a < 50 linhas do limite, extraia primeiro.
2. **Antes de inventar uma pasta nova**, confira se alguma das existentes (`data/`, `types/`, `utils/`, `hooks/`, `pages/`, `components/<domínio>/`) já serve.
3. **Mock data nunca vive dentro de função de componente** — sempre em módulo no top-level de `data/`.
4. **Um arquivo = uma responsabilidade**: um componente por arquivo (exceto sub-componentes privados < 30 linhas usados só localmente).

### Checklist antes de considerar uma mudança "pronta"
- [ ] Nenhum arquivo ultrapassou 400 linhas
- [ ] `App.tsx` continua abaixo da meta
- [ ] Mock data está em `src/app/data/`, não inline
- [ ] Types exportados ficam em `src/app/types/` (ou colocalizados se usados em 1 só lugar)
- [ ] Dev server carrega sem erro de import
- [ ] Rota principal afetada renderiza (smoke test)

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

---

## Registro de atualizações (Changelog)

Todas as mudanças do projeto são documentadas em dois lugares complementares:

| Arquivo | Uso |
|---------|-----|
| `ai-contex_pattern/src/app/data/changelog.ts` | Fonte de verdade — dados estruturados (TypeScript) |
| `CHANGELOG.md` | Leitura rápida — formato Markdown universal |

### Como ler o changelog.ts
Cada entrada segue a hierarquia: **Release → Módulo → Mudança**.

```
ChangelogRelease
  version   — ex: "0.4.2"
  date      — ex: "19 Abr 2026"
  summary   — frase curta do que a release representa
  modules[]
    area    — nome do módulo afetado, ex: "Tarefas — Modal de Detalhes"
    changes[]
      type        — "feature" | "fix" | "improvement" | "refactor" | "design"
      title       — o quê mudou
      description — o porquê técnico da mudança (contexto para o Dev AI)
      files[]     — caminhos relativos a src/app/ dos arquivos tocados
```

### Como registrar uma nova release
Adicione um objeto no **início** do array `CHANGELOG_RELEASES` em `changelog.ts`.
Depois atualize o `CHANGELOG.md` com o mesmo conteúdo em Markdown.

### Página visual
A página de atualizações está disponível em `#/changelog` dentro do app,
renderizada pelo componente `src/app/pages/ChangelogPage.tsx`.
