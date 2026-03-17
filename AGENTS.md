# WePlanner — Contexto do Projeto

## O que é este projeto
O WePlanner é um **SaaS de operação e gestão de workflow** para agências de marketing, freelancers e equipes criativas.

O produto combina:
- gestão de tarefas e boards
- organização de fluxo operacional
- acompanhamento de créditos consumidos
- histórico e analytics de execução
- relatórios para produtividade, rework e performance por cliente/equipe

O projeto nasceu a partir de estudos e estruturas vindas do Figma Maker, mas hoje o foco não é apenas replicar layouts: o objetivo é evoluir o WePlanner como uma **plataforma operacional real**, pronta para crescer para backend, banco de dados, autenticação e métricas de negócio.

## Objetivo principal
Construir uma **plataforma SaaS escalável para operação de times criativos**, com:
- workflow orientado por boards e colunas
- regras semânticas claras de status, resolução e histórico
- sistema de créditos por tarefa
- relatórios operacionais e visão analítica
- design system consistente para acelerar novas features

O design system continua sendo importante, mas como meio para suportar o produto, não como fim principal.

## Stack técnica
- **React 18** + **TypeScript**
- **Vite**
- **Tailwind CSS v4**
- **shadcn/ui** + **Radix UI**
- **Lucide React**
- **Sonner**
- **Motion**

## Papéis de usuário
- **Client** — acompanha entregas, créditos e visões relacionadas ao cliente
- **Manager / Gestor** — administra boards, tarefas, time, relatórios e regras operacionais
- **Collaborator / Colaborador** — executa tarefas, atualiza subtarefas e acompanha trabalho atribuído

---

## Repositório e Setup

### Repositório GitHub atual
```bash
https://github.com/FelipeStephan/Weplanner.git
```

### Branch principal atual
```bash
main
```

### Como rodar localmente
```bash
cd ai-contex_pattern
npm install
npm run dev
```

Dev server padrão:
```bash
http://localhost:5173
```

### Build de produção
```bash
cd ai-contex_pattern
npm run build
```

### Deploy estático
```bash
Compress-Archive -Path dist\* -DestinationPath dist_deploy.zip -Force
```

Produção atual:
```bash
https://ds.weplanner.com.br
```

---

## Regra importante para agentes e desenvolvedores

Antes de modificar a aplicação, **leia a pasta `/docs`**.

Ela contém as regras oficiais da arquitetura, incluindo:
- workflow semântico
- task lifecycle
- sistema de créditos
- board history
- analytics e reports
- plano de transição para backend

Arquivos centrais:
- `docs/README.md`
- `docs/weplanner-architecture.md`
- `docs/workflow-system.md`
- `docs/task-system.md`
- `docs/credits-system.md`
- `docs/board-architecture.md`
- `docs/analytics-system.md`
- `docs/product-rules.md`
- `docs/backend-transition-plan.md`
- `docs/database-entity-map.md`

Se houver divergência entre UI antiga e documentação recente, trate a pasta `/docs` como a referência arquitetural mais confiável.

---

## Estrutura principal de pastas

```text
Weplanner/
  ai-contex_pattern/                 # App principal React + Vite
    src/
      app/
        App.tsx                      # Shell principal e roteamento visual atual
        components/
          boards/                    # Board workspace e fluxo kanban
          reports/                   # Dashboard de relatórios
          dashboard/                 # Componentes de dashboard/overview
          tasks/                     # Cards, modais e componentes de tarefa
          shared/                    # Componentes compartilhados de UI de produto
          ui/                        # Base components / shadcn
          figma/                     # Componentes legados/importados do Figma Maker
      data/                          # Persistência local e estruturas de snapshot
      demo/                          # Dados de demonstração
      domain/                        # Contratos e regras de domínio
      mocks/                         # Catálogos/mock data para UI
      repositories/                  # Camada de acesso a dados
      styles/                        # CSS global e tokens
      main.tsx                       # Entry point
    DESIGN_SYSTEM.md
    COMPONENT_LIBRARY.md
    QUICK_START.md
    guidelines/

  docs/                              # Documentação oficial da arquitetura
  ui/                                # Biblioteca auxiliar / ativos reutilizáveis
  tutoriais-de-ambiente/             # Guias de infraestrutura e ambiente
  direcionamento para agente de IA de direcionamento/
```

---

## Arquitetura funcional atual

### 1. Workflow semântico
O workflow do produto não depende de labels livres.

Regra central:
```text
task.columnId -> column.baseStatus -> task.status
```

Base statuses oficiais:
- `backlog`
- `todo`
- `in_progress`
- `review`
- `adjustments`
- `approval`
- `done`

O nome visível da coluna pode mudar, mas a semântica vem de `baseStatus`.

### 2. Status x Resolution
Status de workflow e resolução são conceitos diferentes.

Resolutions relevantes:
- `completed`
- `archived`
- `cancelled`

Regras:
- tarefas arquivadas e canceladas saem das colunas ativas
- continuam acessíveis no histórico do board
- relatórios e regras de crédito respeitam essa separação

### 3. Sistema de créditos
Cada tarefa possui `credits`, que representam peso operacional.

Regra oficial:
```text
clientConsumedCredits = soma(task.credits onde resolution != cancelled)
```

Isso significa:
- `completed` consome créditos
- `archived` consome créditos
- `cancelled` não consome créditos

Créditos não aumentam automaticamente por retrabalho.

### 4. Histórico e analytics
O sistema já considera:
- transições de workflow
- `statusChangedAt`
- `reviewCycles`
- `adjustmentCycles`
- tempo por etapa
- métricas para relatórios

Existe também histórico no nível do board para tarefas:
- arquivadas
- canceladas

### 5. Visual state de cards
Regra de UI já adotada:
- criação de tarefa: entra minimizada
- movimentos automáticos do sistema: entram minimizados
- drag manual preserva o estado atual do card

---

## Módulos principais

### Board / Kanban
Arquivos importantes:
- `src/app/components/boards/KanbanWorkspacePage.tsx`
- `src/app/components/tasks/KanbanColumn.tsx`
- `src/app/components/tasks/TaskCard.tsx`
- `src/app/components/tasks/DetailedTaskCard.tsx`
- `src/app/components/tasks/SimpleTaskCard.tsx`

Responsabilidades:
- render do board
- drag and drop de cards
- reorder de colunas
- histórico do board
- integração com modal de criação e detalhes

### Tarefas
Arquivos importantes:
- `src/app/components/tasks/CreateTaskModal.tsx`
- `src/app/components/tasks/TaskDetailModal.tsx`
- `src/app/components/tasks/StatusBadge.tsx`

Responsabilidades:
- criação e edição de tarefas
- descrição rica
- subtarefas
- tags
- responsáveis
- data de entrega
- créditos

### Relatórios
Arquivos importantes:
- `src/app/components/reports/ReportsDashboardPage.tsx`
- `src/repositories/reportsRepository.ts`
- `src/demo/reportsDashboardDemo.ts`

Responsabilidades:
- KPIs
- workflow overview
- rework analysis
- performance por cliente
- performance da equipe
- tendências do período
- modo simulado/demo

---

## Estado atual do produto

Hoje o projeto já possui:
- board kanban operacional
- cards compactos e expandidos
- modal completo de tarefa
- histórico por board
- dashboard de relatórios
- dark mode / light mode
- camada inicial de domínio, repositórios e persistência local
- documentação arquitetural para futura transição de backend

Ainda não está com backend real, autenticação real ou banco integrado, mas a arquitetura já está sendo preparada para isso.

---

## Convenções importantes

### Não quebrar estas regras
- não criar status arbitrário fora de colunas
- não tratar `resolution` como coluna de board
- não misturar nome visual da coluna com semântica do workflow
- não fazer tarefa cancelada consumir créditos

### Ao editar ou criar features
- preserve a linguagem visual já existente
- não redesenhe sem necessidade
- mantenha coerência com o design system
- prefira extrair regra de negócio para `domain`, `repositories`, `data` ou `utils` quando fizer sentido

### Ao documentar novamente a arquitetura
Quando a instrução for:
```text
documentar novamente a arquitetura
```

O esperado é:
1. revisar o código atual
2. comparar com `/docs`
3. atualizar a documentação existente
4. adicionar novas regras/documentos se necessário
5. manter `/docs` sincronizado com o comportamento real do sistema

---

## Resumo para agentes de IA
Se você for uma IA trabalhando neste repositório:

1. leia `/docs` antes de alterar código
2. confirme a arquitetura de workflow, resolution e créditos
3. trate `KanbanWorkspacePage.tsx` como ponto central do board atual
4. evite decisões que empurrem regra de negócio para dentro da UI sem necessidade
5. mantenha o projeto preparado para futura integração com backend, banco e auth

O WePlanner não é apenas um design system.  
Ele é uma plataforma SaaS operacional em evolução.
