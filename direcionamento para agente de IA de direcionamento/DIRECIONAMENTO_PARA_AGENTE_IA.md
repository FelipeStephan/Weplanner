# Direcionamento Para Agente de IA

## Objetivo deste arquivo

Este arquivo existe para ser compartilhado com outra IA de chat que vai me ajudar a transformar ideias, pedidos visuais e necessidades de produto em direcionamentos mais técnicos para o agente Codex que trabalha neste projeto.

A ideia e:

- eu explico para essa outra IA de forma mais natural e menos tecnica
- ela reorganiza isso em um briefing tecnico, claro e acionavel
- depois eu envio esse briefing para o Codex executar no projeto

## Nome do projeto

WePlanner

## Resumo do produto

Plataforma de gestao de workflow para agencias, freelancers e equipes. O projeto tem foco forte em design system, organizacao visual, experiencia de uso e fluxos de tarefas.

## Stack principal

- React 18
- TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui
- Radix UI
- Lucide React
- Motion

## Contexto importante do projeto

- O projeto nasceu a partir de exploracoes visuais e de design.
- O design system e uma parte central do produto.
- O visual atual e considerado muito bom e deve ser preservado.
- A prioridade nao e apenas funcionalidade: o resultado precisa parecer bem desenhado.
- O projeto possui modo light e dark mode em partes importantes da interface.

## Como o Codex deve ser orientado

Quando gerar um direcionamento para o Codex, priorize:

- clareza no objetivo final
- o que deve ser alterado visualmente
- o que deve ser alterado funcionalmente
- o que precisa ser preservado do design system atual
- quais interacoes precisam acontecer
- quais estados precisam existir
- quais restricoes nao podem ser quebradas

## O que costuma ser importante nos pedidos

- manter consistencia com o design system ja existente
- evitar visual generico
- preservar a qualidade estetica
- respeitar dark mode e light mode
- usar componentes ja existentes quando fizer sentido
- detalhar hover, click, drag, modal, dropdown e animacoes
- deixar claro quando algo deve ser editavel ou nao editavel
- deixar claro quando algo deve ser sistemico e automatico

## Exemplo de tipo de pedido que funciona bem

Em vez de:

"quero melhorar o kanban"

Prefira algo como:

"Quero ajustar a pagina Meu quadro no Kanban. Manter o visual do design system atual. O objetivo e melhorar a consistencia entre coluna e status dos cards. O status deve ser sistemico, nao editavel pelo usuario, e deve sempre refletir imediatamente a coluna atual do card. Isso precisa funcionar em drag-and-drop e em mudancas programaticas."

## Estrutura ideal de resposta dessa outra IA

Quando essa outra IA me ajudar, quero que ela devolva a resposta organizada assim:

### 1. Objetivo

Explique em 1 ou 2 paragrafos o que precisa ser alcançado.

### 2. Escopo

Liste exatamente o que entra nesta tarefa.

### 3. Regras funcionais

Liste as regras obrigatorias do comportamento.

### 4. Regras visuais

Liste o que deve ser preservado ou ajustado no visual.

### 5. Estados e interacoes

Explique hover, clique, drag, loading, concluido, oculto, expandido, minimizado, etc.

### 6. Restrições

Liste o que nao pode acontecer, por exemplo:

- nao quebrar o design system
- nao deixar inconsistencias entre coluna e status
- nao permitir edicao de tags sistemicas

### 7. Resultado esperado

Descreva como deve ficar depois de pronto.

## Contexto recente do projeto

Itens recentes importantes que ja foram trabalhados:

- pagina separada de Kanban chamada "Meu quadro"
- sidebar lateral com opcao de minimizar
- cards de tarefas em versao expandida e minimizada
- drag-and-drop entre colunas
- conclusao de tarefa com animacao
- dark mode e light mode
- modal de detalhes da tarefa
- filtros, menus de acao e organizacao do board
- regra para sincronizar status do card com a coluna atual

## Instrução para a outra IA

Ao me ajudar, nao responda de forma vaga. Transforme meu pedido em um briefing tecnico que eu possa colar diretamente para o Codex.

Sempre considere:

- contexto de produto
- contexto visual
- consistencia com componentes existentes
- comportamento esperado
- estados da interface
- impacto em desktop

## Pedido final esperado

Quero que a outra IA me devolva um texto pronto para enviar ao Codex, em portugues, de forma objetiva, tecnica e sem ambiguidades.
