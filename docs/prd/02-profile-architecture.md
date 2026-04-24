# WePlanner — Arquitetura de Perfis

> Os três papéis do ecossistema WePlanner: quem são, o que precisam, quais superfícies entregam valor para cada um.

---

## Visão Geral

WePlanner existe em torno de uma relação triangular:

```
    [ GESTOR ]
    /         \
   /           \
[COLABORADOR] [CLIENTE]
```

O **Gestor** orquestra. O **Colaborador** executa. O **Cliente** participa e aprova.

Cada perfil tem um "emprego" diferente a ser feito (Jobs-to-be-Done) — e uma superfície de produto diferente que serve esse emprego. O erro mais comum em ferramentas de agência é tratar os três perfis como versões com mais/menos acesso do mesmo produto. WePlanner trata cada um como um produto dentro do produto.

---

## Perfil 1: Gestor

### Quem é
O dono da operação. Pode ser o fundador da agência, um head de projetos, ou um account manager sênior. É quem responde pelo prazo, pela qualidade, e pela relação com o cliente.

### Job-to-be-Done principal
> "Preciso saber, em qualquer momento, o que está acontecendo com cada cliente — o que está em atraso, o que está em risco, e se estamos no ritmo certo para entregar o contrato."

### Dores específicas
- Perda de visibilidade quando o time cresce
- Não saber quanto do contrato de um cliente já foi consumido
- Descobrir atrasos pelo cliente, não pelo sistema
- Tempo gasto em reuniões de status que poderiam ser substituídas por dados

### Superfícies de valor no WePlanner

| Superfície | Valor entregue |
|-----------|---------------|
| Dashboard de Visão Geral | Snapshot operacional de todos os clientes em um único lugar |
| Boards Kanban | Controle total sobre colunas, tarefas, e fluxo de trabalho |
| Gestão de Créditos | Visibilidade de consumo por cliente, burn rate, risco de esgotamento |
| Relatórios | Analytics de produtividade, rework, e eficiência de entrega |
| Time | Gestão de quem está em quê, carga por colaborador |
| Avisos / Alertas | Sinais proativos de risco antes que virem problemas |

### Permissões
- Acesso total a todos os boards
- Pode criar, editar e arquivar boards e colunas
- Pode criar, mover, concluir e arquivar tarefas em qualquer board
- Pode editar créditos de tarefas manualmente
- Pode gerenciar membros do time e seus acessos
- Pode vincular clientes a boards específicos
- Acesso a todos os relatórios e histórico
- Pode restaurar tarefas arquivadas ou canceladas

### Jornada típica — "Segunda de manhã"
1. Abre o Dashboard → vê os KPIs da semana: tarefas em atraso, créditos em risco
2. Verifica a seção de Avisos → vê dois clientes com entrega atrasada
3. Entra no board do cliente em risco → move uma tarefa, reatribui outra
4. Confere os créditos do cliente X → burn rate acelerado, decide negociar expansão
5. Fecha o dia com um relatório exportado para a reunião de sexta

---

## Perfil 2: Colaborador

### Quem é
O executor. Pode ser um designer, redator, desenvolvedor, analista de mídias sociais, ou qualquer profissional que produz o trabalho dentro da agência. Normalmente lida com múltiplos clientes ao mesmo tempo, mas só vê o que é relevante para ele.

### Job-to-be-Done principal
> "Quero saber exatamente o que eu preciso fazer hoje, com todo o contexto que preciso para executar — sem precisar perguntar para ninguém."

### Dores específicas
- Briefings incompletos que geram retrabalho
- Não saber qual tarefa priorizar quando tudo parece urgente
- Perder tempo procurando contexto espalhado em vários lugares
- Não ter um registro do que foi feito (faz, entrega, esquece)

### Superfícies de valor no WePlanner

| Superfície | Valor entregue |
|-----------|---------------|
| Meus boards (scoped) | Apenas os projetos onde está alocado — sem ruído |
| Task Card completo | Briefing, attachments, subtarefas, comentários em um só lugar |
| Subtarefas | Quebrando o trabalho em passos executáveis |
| Editor rico de descrição | Contexto completo da tarefa sem precisar sair |
| Comentários e atividade | Histórico de decisões e feedbacks no contexto da tarefa |
| Attachments | Referências, aprovações e arquivos centralizados |

### Permissões
- Acesso apenas a boards onde foi explicitamente vinculado
- Pode visualizar e mover tarefas atribuídas a ele dentro dos boards acessíveis
- Pode editar descrição, subtarefas, comentários, e attachments de tarefas atribuídas
- Pode marcar tarefas como concluídas
- Não pode editar créditos de tarefas
- Não pode criar ou deletar boards/colunas
- Não pode ver dados de clientes que não sejam de seus boards

### Jornada típica — "Chegando ao trabalho"
1. Abre WePlanner → vê apenas seus boards
2. Entra no board do cliente Y → vê as tarefas atribuídas a ele
3. Abre a task "Post Instagram — Lançamento Produto" → lê o briefing completo no editor rico
4. Faz download do arquivo de referência em Attachments
5. Começa a executar, move a task para "Em progresso"
6. Sobe o arquivo criado como attachment, comenta "Arte finalizada, aguardando aprovação"
7. Move task para "Revisão"

---

## Perfil 3: Cliente

### Quem é
O contratante. É quem paga pela agência e participa ativamente do processo de entrega — criando demandas, aprovando entregas e acompanhando o consumo do seu contrato. Não é um observador passivo — é um participante com voz no fluxo de trabalho, dentro do espaço que a agência autoriza.

### Job-to-be-Done principal
> "Quero ter controle sobre o que estou pedindo, acompanhar o andamento em tempo real e aprovar ou reprovar sem precisar mandar mensagem para a agência toda vez."

### Dores específicas
- Sensação de que o trabalho é uma caixa preta — não sabe o que está acontecendo
- Não saber quanto do contrato já foi usado
- Precisar esperar reunião ou e-mail para dar feedback
- Processo de aprovação é manual e desorganizado (WhatsApp, e-mail)
- Não ter histórico do que já foi entregue e aprovado

### Superfícies de valor no WePlanner

| Superfície | Valor entregue |
|-----------|---------------|
| Portal do Cliente | Visão exclusiva dos projetos e entregas que dizem respeito a ele |
| Boards vinculados ao cliente | Apenas os boards autorizados pela agência — onde pode criar, mover e editar tasks |
| Task Card | Pode criar novas demandas, editar tasks existentes, fazer upload de referências e comentar |
| Kanban de aprovação | Move tasks entre colunas para aprovar ou reprovar entregas — sem precisar de e-mail |
| Créditos do cliente | Saldo contratado, consumido, e restante em tempo real (se habilitado) |
| Relatório de créditos | Curva de consumo, previsão de esgotamento e detalhe por board (se habilitado) |
| Avisos ativos | Alertas sobre prazos, consumo de créditos e entregas aguardando sua ação |

### Permissões
- Acesso apenas a boards explicitamente vinculados à sua conta de cliente
- **Pode criar tasks** nos boards onde está inserido
- **Pode editar tasks** nos boards onde está inserido
- **Pode mover tasks no Kanban** — aprovação e reprovação são feitas movendo cards
- Pode fazer upload de arquivos em tasks e boards
- Pode comentar em tasks
- Visualização de créditos (contratado, consumido, saldo) — se `creditsEnabled = true`
- Acesso ao relatório de créditos simplificado — se flag `can_view_client_credit_report` ativa
- Sem acesso a dados de outros clientes
- Sem acesso a relatórios internos de produtividade da agência
- Sem visibilidade de campos internos (custo, retrabalho, métricas do time)
- Não pode criar ou gerenciar boards e colunas
- Não pode gerenciar membros ou permissões

### Labels de UI adaptadas para o Cliente
A interface usa terminologia própria para o perfil `CLIENT_EXTERNAL`:

| Label interno | Label para o cliente |
|--------------|---------------------|
| Tarefas | Tarefas Solicitadas |
| Board | Projeto |
| Colaborador atribuído | Responsável |

### Jornada típica — "Cliente participando ativamente"
1. Recebe notificação → abre o WePlanner no board do seu projeto
2. Vê uma task em "Revisão" → abre, analisa o arquivo entregue
3. Aprova: move o card para "Aprovado" — direto no Kanban, sem e-mail
4. Abre uma task no backlog → cria uma nova demanda com briefing e referências em anexo
5. Confere os créditos → vê que usou 68 de 100 créditos do mês, recebe alerta de 80%
6. Fecha o portal. A agência já recebeu a aprovação e a nova demanda sem nenhuma mensagem manual.

---

## Interseções e Tensões

### Onde os perfis se encontram
- **Task Card:** o ponto de convergência. O gestor cria e prioriza, o colaborador executa e documenta, o cliente cria demandas, comenta e aprova movendo cards.
- **Credits:** o gestor define, a execução do colaborador consome, o cliente acompanha o saldo.
- **Board:** o gestor estrutura e controla o acesso, o colaborador habita e executa, o cliente participa dentro do espaço autorizado.

### Tensões intencionais

| Tensão | Decisão de produto |
|--------|-------------------|
| Cliente quer liberdade total, agência quer controlar o fluxo | O gestor define quais boards são acessíveis ao cliente — dentro desses boards o cliente tem autonomia para criar, editar e mover |
| Cliente pode mover tasks para qualquer coluna, agência tem um fluxo interno | A solução é design de board: criar colunas específicas de aprovação/reprovação para que o cliente opere nelas — não restringir tecnicamente |
| Colaborador precisa de contexto, gestor precisa de velocidade | Task Card é rico por design; o gestor pode criá-la simplificada, o colaborador a enriquece durante a execução |
| IA sugere créditos, gestor define | A IA é consultiva — a decisão final sempre é do gestor |

---

## Modelo de Acesso — Resumo Visual

```
                    BOARD
                   /  |  \
            GESTOR    |    COLABORADOR (apenas boards vinculados)
                      |
                   CLIENTE (apenas boards autorizados — participante ativo)


AÇÕES NO BOARD
  └─ Criar boards/colunas:   GESTOR
  └─ Criar tasks:            GESTOR + COLABORADOR + CLIENTE
  └─ Editar tasks:           GESTOR + COLABORADOR + CLIENTE
  └─ Mover tasks (Kanban):   GESTOR + COLABORADOR + CLIENTE
  └─ Arquivar/cancelar:      GESTOR apenas


CREDITS
  └─ Definido por:           GESTOR
  └─ Consumido por:          execução das tarefas (qualquer perfil)
  └─ Visível para:           GESTOR + CLIENTE (saldo, se creditsEnabled)
  └─ Oculto para:            COLABORADOR


RELATÓRIOS
  └─ Internos (produtividade, rework, time):  GESTOR apenas
  └─ Créditos simplificado:                  CLIENTE (se can_view_client_credit_report ativo)
```
