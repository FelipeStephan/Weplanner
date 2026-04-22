# WePlanner — Features Centrais

> Especificação estratégica dos quatro pilares do produto: Kanban, Task Cards, Camada de IA, e Sistema de Créditos.
> Este documento responde: "O que cada feature é, por que existe, e como deve evoluir."

---

## Feature 1: Kanban Boards

### O que é
O Kanban do WePlanner é o ambiente de execução central. Não é uma lista com colunas — é o espaço onde o trabalho de uma agência se torna visível, organizado, e gerenciável.

### Por que existe
A maioria das agências gerencia projetos por cliente. O board representa um cliente ou um projeto — e as colunas representam o fluxo de trabalho daquele cliente. A metáfora é intencional: o board é a sala de operações de cada cliente.

### Decisões de design que importam

**1. Status derivado da coluna, não da tarefa**
Uma task não tem um campo "status" livre — seu status é determinado pela coluna onde ela está. Isso impede inconsistência: se a task está na coluna "Revisão", seu status é revisão, sempre.

Isso tem implicações poderosas para relatórios: o gestor pode confiar nos dados porque o sistema garante consistência semântica.

**2. Múltiplas colunas podem ter o mesmo `baseStatus`**
Uma agência pode ter "Revisão Interna" e "Revisão do Cliente" como colunas separadas, mas ambas mapeam para `baseStatus: review`. Isso dá flexibilidade de nomenclatura sem quebrar a coerência dos dados.

**3. Boards são first-class — não são "projetos dentro de projetos"**
Cada board é um workspace de execução com seu próprio time, histórico, créditos, e estado. Boards podem ser arquivados, mas não deletados com perda de dados.

**4. Acesso por usuário, incluindo clientes**
O board é o ponto de controle de acesso. Vincular um colaborador ao board dá visibilidade naquele contexto. O mesmo vale para clientes — eles não são convidados passivos, são usuários com acesso controlado a um contexto específico.

### Estados do Kanban

| `baseStatus` | Descrição | Visível para cliente? |
|--------------|-----------|----------------------|
| `todo` | Backlog / a fazer | Sim (configurável) |
| `in_progress` | Em execução | Sim |
| `review` | Aguardando aprovação/revisão | Sim |
| `completed` | Entregue | Sim |
| `cancelled` | Cancelado | Não (interno) |
| `archived` | Arquivado | Não (interno) |

### Evolução esperada

- **Curto prazo:** Swimlanes por responsável dentro do board
- **Médio prazo:** Templates de board por vertical (social media, branding, SEO)
- **Longo prazo:** Boards interconectados (task de um board pode ser dependência de outro)

---

## Feature 2: Task Cards

### O que é
O Task Card é a unidade fundamental de trabalho no WePlanner. É onde o briefing vive, o trabalho é documentado, e o valor é rastreado.

### Por que existe
Em agências, a maioria dos problemas de entrega vem de briefings incompletos ou contexto perdido. O Task Card resolve isso sendo a "fonte de verdade" da tarefa — tudo que é necessário para executar, revisar, e entregar está ali.

### Anatomia do Task Card

#### Campos de identidade
| Campo | Tipo | Quem define | Notas |
|-------|------|-------------|-------|
| Título | Texto | Gestor | Curto, descritivo |
| Descrição | Rich text | Gestor + Colaborador | Briefing completo com formatação |
| Prioridade | Enum | Gestor | low / medium / high / urgent |
| Status | Derivado | Sistema (coluna) | Não editável diretamente |
| Data de entrega | Date + Time | Gestor | Time só exibe se explicitamente definido |
| Créditos | Número | Gestor (com sugestão de IA) | Ver Feature 4 |
| Cliente | Referência | Gestor | Vincula a tarefa ao cliente do board |

#### Campos de execução
| Campo | Tipo | Quem usa | Notas |
|-------|------|----------|-------|
| Subtarefas | Lista checklist | Colaborador | Progress bar automático |
| Responsáveis | Multi-select de usuários | Gestor | Máximo recomendado: 3 |
| Tags | Chips com cor | Gestor + Colaborador | Máximo: 5, para categorização rápida |
| Attachments | Arquivos | Colaborador | Referências, entregáveis, aprovações |
| Comentários | Thread | Todos | Contexto de decisão e feedback |

#### Campos de rastreabilidade
| Campo | Tipo | Quem vê |
|-------|------|---------|
| Atividade | Timeline automática | Gestor + Colaborador |
| Créditos usados | Badge no header | Gestor + Cliente (no relatório) |
| `reviewCycles` | Contador interno | Gestor (via relatórios) |
| `adjustmentCycles` | Contador interno | Gestor (via relatórios) |
| `createdAt` | Timestamp | Gestor |

### Editor rico de descrição

O editor é central para o valor do Task Card. Deve suportar:

- Formatação básica: **negrito**, *itálico*, ~~tachado~~
- Headings: H1, H2, H3 (para estruturar briefings longos)
- Cor de texto e highlight (para marcar partes críticas do briefing)
- Listas ordenadas e não-ordenadas
- Upload e preview de imagem inline

**Princípio de design:** O editor não é um "campo de texto com alguns botões". É o lugar onde o briefing acontece. Quanto melhor o briefing, menor o retrabalho. O produto incentiva bons briefings por design.

### Estados de resolução vs. estados de workflow

Esta distinção é crítica:

- **Workflow status** (`baseStatus`): onde a tarefa está no processo — `todo`, `in_progress`, `review`
- **Resolution status**: como a tarefa foi encerrada — `completed`, `cancelled`, `archived`

Uma tarefa nunca tem ambos ativos ao mesmo tempo. Quando uma resolução é aplicada, a tarefa sai do board ativo e vai para o histórico.

### Regras de data e prazo

| Situação | Display |
|----------|---------|
| > 24h para o prazo | Neutro (data simples) |
| ≤ 24h para o prazo | Warning (amarelo, relógio pulsando) |
| Prazo passou | Overdue (vermelho) |
| Sem prazo definido | Campo vazio, sem penalidade visual |

Hora só é exibida se o usuário definiu explicitamente — evitar ruído para tarefas sem hora.

---

## Feature 3: Camada de IA

### O que é
A camada de IA do WePlanner não é um chatbot genérico — é um conjunto de agentes especializados com contexto de execução real. Eles operam sobre dados de tarefas, histórico, e padrões da agência para gerar valor acionável.

### Por que existe
A IA sem contexto gera resposta genérica. A IA com contexto de execução real gera insight acionável. O diferencial da WePlanner é que a IA tem acesso a:
- O briefing completo da tarefa
- O histórico de iterações e rework
- Os créditos estimados versus consumidos
- Os padrões anteriores de tarefas similares

### Agentes planejados

#### Agente 1: Estimador de Créditos
**Trigger:** Gestor cria uma tarefa e clica no botão "IA" ao lado do campo de créditos.

**Input:** Título + descrição da tarefa + histórico de tarefas similares do mesmo cliente.

**Output:** Sugestão de créditos com raciocínio breve ("Baseado em 3 tarefas similares de landing page no último trimestre, estimativa: 8 créditos").

**Regra:** A IA sugere, o gestor decide. O sistema nunca aplica créditos automaticamente sem confirmação.

#### Agente 2: Revisor de Briefing
**Trigger:** Colaborador abre a tarefa e a descrição está incompleta.

**Input:** Campo de descrição da tarefa + tipo de task (inferido de tags/título).

**Output:** Checklist do que está faltando no briefing ("Falta definir: formato de entrega, dimensões, referências visuais").

**Valor:** Reduz o loop "colaborador pergunta → gestor responde → colaborador executa" que gera atraso.

#### Agente 3: Detector de Risco de Entrega
**Trigger:** Automático, executado diariamente no backend.

**Input:** Tarefas com prazo nos próximos 3 dias + status atual + histórico de tempo médio de conclusão.

**Output:** Alerta no Dashboard do Gestor com estimativa de risco ("Task X tem 72% de chance de atrasar com base no ritmo atual").

**Valor:** O gestor age antes que o cliente perceba.

#### Agente 4: Gerador de Report de Cliente
**Trigger:** Gestor solicita "Gerar relatório semanal" para um cliente.

**Input:** Tasks concluídas no período + créditos consumidos + notas de atividade.

**Output:** Rascunho de relatório em linguagem de negócios, pronto para enviar ao cliente.

**Valor:** Elimina ~2h por semana de trabalho manual de account.

### Princípios da Camada de IA

1. **IA como colaboradora, não substituta.** A IA nunca toma decisões — ela informa e sugere.
2. **Contexto sempre local.** A IA acessa apenas dados do workspace atual — sem cruzamento de dados entre agências.
3. **Transparência de raciocínio.** Quando a IA sugere algo, ela mostra o motivo ("baseado em X tasks similares").
4. **Graceful degradation.** Se não há dados suficientes para uma sugestão confiável, a IA diz isso em vez de inventar.

### Relação com Créditos

O Estimador de Créditos é o ponto de intersecção mais alta entre IA e modelo de negócio. Quanto mais preciso o estimador, mais confiança o gestor tem ao precificar, e mais transparente é a relação com o cliente.

---

## Feature 4: Sistema de Créditos

### O que é
O sistema de créditos é a camada de medição de valor do WePlanner. Cada tarefa tem um peso em créditos. A agência define o que 1 crédito vale em termos contratuais. O sistema rastreia o consumo em tempo real.

### Por que existe

**Problema que resolve:** Agências cobram por pacote ou por hora — mas nenhuma das duas formas é transparente o suficiente para o cliente. "Horas trabalhadas" é abstrato demais. "Pacote de 10 posts" ignora a complexidade de cada post.

**Solução:** Créditos são uma unidade de esforço/valor que a agência calibra para seu contexto. Uma landing page pode valer 12 créditos. Um post simples vale 2. Um vídeo de 30s vale 20. O cliente compra um pacote de X créditos por mês e vê em tempo real quanto foi consumido.

### Regras de consumo

```
clientConsumedCredits = soma(task.credits) ONDE resolution != 'cancelled'
```

| Status de resolução | Consome créditos? | Motivo |
|--------------------|-------------------|--------|
| `completed` | Sim | Trabalho entregue |
| `archived` | Sim | Trabalho executado mesmo que pausado |
| `cancelled` | Não | Tarefa cancelada antes de execução real |
| Tasks ativas (sem resolução) | Provisório | Contabilizado como "comprometido" no burn rate |

### Estrutura de dados por cliente

```
Cliente
  └─ creditosContratados: number   (definido no contrato)
  └─ creditosConsumidos: number    (calculado via regra acima)
  └─ creditosRestantes: number     (contratados - consumidos)
  └─ burnRate: number              (créditos/dia — média dos últimos 14d)
  └─ horizonte: Date               (projeção de esgotamento com base no burn rate)
  └─ risco: 'healthy' | 'attention' | 'critical'
```

### Classificação de risco

| Nível | Critério | Ação sugerida |
|-------|---------|---------------|
| `healthy` | Restante > 40% do contratado | Nenhuma |
| `attention` | Restante entre 20-40% | Alerta para o gestor |
| `critical` | Restante < 20% | Alerta urgente + notificação para cliente opcional |
| `deficit` | Consumidos > contratados | Ação imediata — renegociação ou pausa de tasks |

### Visualizações do sistema de créditos

#### Para o Gestor
- Dashboard de créditos por cliente (KPIs: contratado, consumido, restante, deficit)
- Burn rate e horizonte de esgotamento
- Lista de clientes em risco
- Insight automático: "Cliente X está consumindo 2× mais rápido do que o mês passado"

#### Para o Cliente (portal)
- Saldo atual: X de Y créditos usados
- Barra de progresso visual
- Histórico de créditos consumidos por tarefa concluída
- Sem exposição de custo interno ou burn rate detalhado

#### No Task Card
- Badge compacto "X créditos" no header do card
- Clicável para editar (gestor apenas)
- Exibido na listagem do kanban como indicador visual

### Evolução esperada

- **Curto prazo:** Histórico de alterações de créditos (quem mudou, de X para Y, quando)
- **Médio prazo:** Estimativa automática de IA com base em histórico de tasks similares
- **Longo prazo:** Contrato digital — cliente define saldo mensal, sistema controla renovação automaticamente

---

## Conexões entre Features

```
KANBAN BOARD
  └─ contém columns → columns definem baseStatus
  └─ tasks derivam status da column
  └─ tasks têm créditos → alimentam SISTEMA DE CRÉDITOS
  └─ tasks têm descrição → CAMADA DE IA estima créditos

TASK CARD
  └─ é a unidade atômica
  └─ créditos → sistema de créditos
  └─ descrição + histórico → camada de IA
  └─ status (via column) → relatórios

SISTEMA DE CRÉDITOS
  └─ consome dados de tasks (concluídas, arquivadas)
  └─ expõe ao gestor: risco e burn rate
  └─ expõe ao cliente: saldo e histórico
  └─ alimenta: relatórios + avisos

CAMADA DE IA
  └─ consome: tasks, histórico, créditos
  └─ produz: sugestões, alertas, reports
  └─ nunca escreve dados sem confirmação humana
```
