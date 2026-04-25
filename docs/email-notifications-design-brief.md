# WePlanner — Design Brief: Templates de E-mail
## Direcionamento para Claude Design

> **Missão:** Criar templates visuais para os 16 e-mails transacionais e de notificação do WePlanner.
> **Entrega esperada:** Um exemplo visual completo para cada template, com subject line, preview text, estrutura de layout e conteúdo de exemplo real.

---

## Identidade Visual

### Marca
- **Nome:** WePlanner
- **Tagline:** Gestão de workflow para agências
- **Cor primária:** `#ff5623` (laranja)
- **Cor de fundo do e-mail:** `#f5f5f5`
- **Fundo do card/container:** `#ffffff`
- **Texto principal:** `#171717`
- **Texto secundário:** `#525252`
- **Texto terciário / labels:** `#737373`
- **Borda sutil:** `#e5e5e5`
- **Sucesso / verde:** `#019364`
- **Alerta / amarelo:** `#feba31`
- **Perigo / vermelho:** `#f32c2c`
- **Info / roxo:** `#987dfe`

### Tipografia
- **Fonte:** Inter (fallback: -apple-system, sans-serif)
- **Tamanho base:** 15px
- **Line height:** 1.6
- **Heading principal:** 22px, weight 700
- **Subheading:** 16px, weight 600

### Estilo visual geral
- Limpo, moderno, profissional mas acessível
- Bordas arredondadas: `12px` nos cards, `8px` nos botões
- Sem exageros decorativos — o conteúdo é o destaque
- Botão CTA: background `#ff5623`, texto branco, padding `14px 28px`, border-radius `8px`
- Referências de estilo: Linear, Vercel, Stripe (e-mails)

### Estrutura base de todos os e-mails
```
[Logo WePlanner — centralizado, topo]
[Container branco, max-width 560px, centralizado]
  [Ícone ou emoji temático]
  [Título do e-mail]
  [Corpo com informações]
  [Card de contexto — dados da task/cliente]
  [Botão CTA principal]
  [Texto secundário opcional]
[Footer: © WePlanner · Cancelar notificações deste tipo]
```

---

## Princípios de Tom por Perfil

| Perfil | Tom | Exemplos de voz |
|--------|-----|----------------|
| **Admin** | Analítico, direto, confiável | "Atenção necessária", "Aqui está o resumo", "Ação recomendada" |
| **Colaborador** | Objetivo, energético, colega de trabalho | "Você tem uma nova tarefa", "Hora de retomar", "Prazo chegando" |
| **Cliente** | Caloroso, transparente, parceiro | "Seu projeto está avançando", "Preparamos algo para você", "Tudo sob controle" |

---

## Templates por Perfil

---

## ADMIN — 5 templates

---

### `admin.credit_warning`
**Contexto:** O cliente consumiu ≥ 80% do pacote de créditos contratados.

**Subject line:** `⚠️ Arcadia está com 18% de créditos restantes`
**Preview text:** `O cliente consumiu 82 dos 100 créditos contratados este mês.`

**Estrutura:**
```
[Ícone: ⚡ ou gráfico de bateria quase vazia]
[Título]: Atenção: créditos do cliente Arcadia estão acabando
[Subtítulo]: Restam apenas 18 créditos de 100 contratados.

[Card de dados]:
  Cliente: Arcadia
  Créditos contratados: 100
  Créditos consumidos: 82
  Créditos restantes: 18 (18%)
  [Barra de progresso visual: 82% preenchida em laranja/vermelho]

[Texto]: Considere entrar em contato com o cliente para discutir
a renovação ou expansão do contrato antes que o saldo se esgote.

[CTA]: Ver painel de créditos →

[Link secundário]: Ver tarefas ativas do cliente
```

---

### `admin.credit_exhausted`
**Contexto:** O cliente esgotou 100% do pacote.

**Subject line:** `🔴 Créditos de iFood esgotados — ação necessária`
**Preview text:** `O saldo contratado foi totalmente consumido. Novas entregas estão bloqueadas.`

**Estrutura:**
```
[Ícone: 🔴]
[Título]: Os créditos do cliente iFood foram esgotados
[Subtítulo]: O saldo contratado de 500 créditos foi totalmente consumido.

[Card de dados — tom vermelho]:
  Cliente: iFood
  Créditos contratados: 500
  Créditos consumidos: 512
  Excedente: 12 créditos acima do contrato
  [Barra de progresso: 100% + overflow indicado]

[Texto]: Novas entregas para este cliente devem ser pausadas ou
renegociadas. Entre em contato para definir os próximos passos.

[CTA]: Gerenciar créditos do cliente →
```

---

### `admin.task_overdue`
**Contexto:** Uma ou mais tasks venceram sem resolução.

**Subject line:** `📋 2 tarefas venceram hoje — WePlanner`
**Preview text:** `Campanha Black Friday e Landing Page Nubank passaram do prazo sem conclusão.`

**Estrutura:**
```
[Ícone: 📋]
[Título]: Tarefas com prazo vencido
[Subtítulo]: As tarefas abaixo passaram do prazo e ainda estão abertas.

[Lista de tasks — até 5]:
  • Campanha Black Friday
    Cliente: iFood · Board: Marketing Digital · Venceu ontem
    [Badge vermelho: Atrasada]

  • Landing Page Produto
    Cliente: Nubank · Board: Growth · Venceu hoje
    [Badge vermelho: Atrasada]

[CTA]: Ver todas as tarefas atrasadas →

[Texto rodapé sutil]: Você recebe este aviso porque está inserido nesses boards.
```

---

### `admin.client_joined`
**Contexto:** Um cliente aceitou o convite e entrou na plataforma.

**Subject line:** `🎉 João Silva (Arcadia) entrou no WePlanner`
**Preview text:** `Seu cliente acabou de fazer o primeiro acesso ao portal.`

**Estrutura:**
```
[Ícone: 🎉]
[Título]: Um novo cliente está no portal!
[Subtítulo]: João Silva, da empresa Arcadia, aceitou o convite
e fez seu primeiro login agora.

[Card de dados]:
  Nome: João Silva
  Empresa: Arcadia
  E-mail: joao@arcadia.com
  Primeiro acesso: hoje, 14h23

[Texto]: Agora ele pode acompanhar os projetos, tarefas e
créditos do portal. Certifique-se de que os boards estão
organizados para uma boa primeira experiência.

[CTA]: Ver portal do cliente →
```

---

### `admin.weekly_digest`
**Contexto:** Resumo semanal de operações enviado toda segunda-feira.

**Subject line:** `📊 Resumo da semana — WePlanner (14 a 20 abr)`
**Preview text:** `12 tarefas concluídas, 2 clientes em alerta de crédito, time com 89% de eficiência.`

**Estrutura:**
```
[Cabeçalho com data]: Semana de 14 a 20 de Abril de 2026

[Seção 1 — KPIs da semana]:
  ✅  12 tarefas concluídas
  🆕   8 tarefas criadas
  ⚠️   3 tarefas em atraso
  🔄  21 tarefas ativas no momento

[Seção 2 — Créditos por cliente] (apenas clientes com creditsEnabled):
  Arcadia    ██████████░░  82% consumido  ⚠️ Atenção
  WePlanner  ████░░░░░░░░  38% consumido  ✅ Saudável
  iFood      ████████████ 100% consumido  🔴 Esgotado
  Nubank     ██░░░░░░░░░░  22% consumido  ✅ Saudável

[Seção 3 — Destaque da semana]:
  🏆 Colaborador mais produtivo
  Ana Costa — 5 tarefas concluídas

[CTA]: Ver relatório completo →

[Footer sutil]: Você recebe este resumo toda segunda-feira.
Ajustar preferências
```

---

## COLABORADOR — 4 templates

---

### `collaborator.task_assigned`
**Contexto:** Uma nova task foi atribuída ao colaborador.

**Subject line:** `📌 Nova tarefa atribuída: Campanha Redes Sociais`
**Preview text:** `Felipe Stephan atribuiu uma tarefa para você no board Marketing Digital.`

**Estrutura:**
```
[Ícone: 📌]
[Título]: Você tem uma nova tarefa
[Subtítulo]: Felipe Stephan atribuiu a seguinte tarefa para você:

[Card de task — destaque visual]:
  📋  Campanha Redes Sociais — Black Friday
  Cliente: iFood
  Board: Marketing Digital
  Prioridade: [Badge laranja] Alta
  Prazo: 28 de Abril de 2026
  
  Briefing:
  "Criar 5 posts para o feed do Instagram com tema Black Friday,
   seguindo a identidade visual da campanha..."

[CTA]: Abrir tarefa →

[Texto sutil]: Atribuído por Felipe Stephan · há 2 minutos
```

---

### `collaborator.task_returned`
**Contexto:** A task foi devolvida para ajustes após revisão.

**Subject line:** `🔁 Tarefa devolvida para ajuste: Landing Page Produto`
**Preview text:** `A tarefa voltou para ajustes. Este é o 2º ciclo de revisão.`

**Estrutura:**
```
[Ícone: 🔁]
[Título]: Sua tarefa precisa de ajustes
[Subtítulo]: Felipe Stephan moveu a tarefa de Aprovação
de volta para Ajustes.

[Card de task]:
  📋  Landing Page — Lançamento Produto
  Cliente: Nubank
  Board: Growth
  Movido de: Aprovação → Ajustes
  Ciclo de revisão: 2º ciclo
  Prazo: 30 de Abril de 2026

[Texto]: Verifique os comentários na tarefa para entender
o que precisa ser ajustado.

[CTA]: Ver tarefa e comentários →
```

---

### `collaborator.task_due_soon`
**Contexto:** Prazo da task em ≤ 24h.

**Subject line:** `⏰ Prazo em 6 horas: Campanha Redes Sociais`
**Preview text:** `Esta tarefa vence hoje às 18h00. Certifique-se de que está no caminho certo.`

**Estrutura:**
```
[Ícone: ⏰ — com tom amarelo de urgência]
[Título]: Prazo chegando
[Subtítulo]: A tarefa abaixo vence em menos de 24 horas.

[Card de task — borda amarela]:
  📋  Campanha Redes Sociais — Black Friday
  Cliente: iFood
  Board: Marketing Digital
  Prioridade: [Badge vermelho] Urgente
  ⏰  Vence hoje às 18h00

[CTA]: Abrir tarefa →

[Texto sutil]: Mova para Revisão assim que finalizar.
```

---

### `collaborator.daily_digest`
**Contexto:** Resumo das tarefas do dia, enviado toda manhã às 8h.

**Subject line:** `☀️ Suas tarefas de hoje — 25 de Abril`
**Preview text:** `3 tarefas vencem hoje. 2 para amanhã. Bom trabalho!`

**Estrutura:**
```
[Saudação]: Bom dia, Ana 👋

[Seção 1 — Vencem hoje]:
  🔴 Campanha Black Friday  ·  iFood  ·  Vence às 18h
  🔴 Revisão de Copy        ·  Arcadia ·  Vence às 23h59

[Seção 2 — Vencem amanhã]:
  🟡 Landing Page Produto   ·  Nubank  ·  Amanhã às 12h

[Seção 3 — Demais tarefas ativas]:
  📋 Post LinkedIn Semana  ·  WePlanner
  📋 Ajuste de Banner      ·  iFood

[CTA]: Abrir minhas tarefas →

[Texto sutil]: Você tem 5 tarefas ativas no total.
```

---

## CLIENTE — 7 templates

> **Nota de tom:** E-mails para clientes devem transmitir cuidado, transparência e profissionalismo. O cliente precisa sentir que seu projeto está em boas mãos.

---

### `client.workspace_invite`
**Contexto:** Convite para acessar o portal pela primeira vez.

**Subject line:** `Você foi convidado para acompanhar seu projeto no WePlanner`
**Preview text:** `A Agência Loopera convidou você para acessar o portal do cliente.`

**Estrutura:**
```
[Logo WePlanner centralizado]

[Título]: Seu portal está pronto, João 🎉
[Subtítulo]: Felipe Stephan, da Agência Loopera, convidou você
para acompanhar os projetos da Arcadia no WePlanner.

[Caixa de destaque — fundo levemente colorido]:
  No portal você pode:
  ✅  Acompanhar o andamento das suas tarefas
  ✅  Aprovar entregas diretamente
  ✅  Criar novas solicitações
  ✅  Acompanhar seu saldo de créditos

[CTA — destaque máximo]: Acessar meu portal →

[Texto]: Este convite expira em 7 dias.
Caso tenha dúvidas, entre em contato com Felipe Stephan.

[Footer discreto]: Agência Loopera · via WePlanner
```

---

### `client.task_assigned`
**Contexto:** A agência criou uma task e atribuiu ao cliente.

**Subject line:** `📋 Nova solicitação adicionada ao seu projeto`
**Preview text:** `A Loopera adicionou uma tarefa que precisa da sua atenção no board Arcadia.`

**Estrutura:**
```
[Ícone: 📋]
[Título]: Uma nova solicitação foi adicionada para você
[Subtítulo]: A equipe da Loopera criou a seguinte tarefa
e atribuiu a você:

[Card de task]:
  📋  Aprovação de Identidade Visual — Fase 2
  Projeto: Arcadia · Board: Branding
  Prazo: 30 de Abril de 2026
  
  Descrição:
  "Prezamos pela sua aprovação nos materiais da segunda
   fase do projeto de identidade visual. Os arquivos
   estão disponíveis em anexo na tarefa..."

[CTA]: Ver solicitação →

[Texto sutil]: Adicionado por Felipe Stephan (Loopera)
```

---

### `client.approval_requested`
**Contexto:** Uma entrega está aguardando aprovação do cliente.

**Subject line:** `✅ Entrega pronta para sua aprovação: Identidade Visual`
**Preview text:** `A Loopera finalizou a entrega e está aguardando sua aprovação.`

**Estrutura:**
```
[Ícone: ✅ — tom verde]
[Título]: Uma entrega está esperando por você
[Subtítulo]: A equipe da Loopera finalizou a tarefa abaixo
e precisa da sua aprovação para seguir em frente.

[Card de task — borda verde suave]:
  ✅  Identidade Visual — Fase 2
  Projeto: Arcadia
  📎  3 arquivos anexados
  Entregue por: Ana Costa (Loopera)

[Texto]: Acesse a tarefa para revisar os arquivos entregues.
Você pode aprovar movendo o card para "Aprovado" ou
deixar um comentário caso precise de ajustes.

[CTA]: Revisar entrega →

[Texto sutil]: A equipe aguarda seu retorno para continuar.
```

---

### `client.task_completed`
**Contexto:** Uma task foi concluída e entregue.

**Subject line:** `🎉 Tarefa concluída: Post Instagram — Lançamento`
**Preview text:** `Mais uma entrega finalizada para o seu projeto.`

**Estrutura:**
```
[Ícone: 🎉]
[Título]: Entrega concluída!
[Subtítulo]: A equipe da Loopera finalizou mais uma tarefa
do seu projeto.

[Card de task — tom celebratório, fundo verde muito sutil]:
  ✅  Post Instagram — Lançamento Produto
  Projeto: Arcadia
  Concluída por: Ana Costa
  Data: 25 de Abril de 2026
  Créditos utilizados: 3 créditos

[CTA]: Ver entrega →

[Texto sutil]: Gostou do resultado? Deixe um comentário na tarefa.
```

---

### `client.credit_warning`
**Contexto:** O cliente consumiu ≥ 80% dos créditos.

**Subject line:** `⚠️ Seu saldo de créditos está chegando ao fim`
**Preview text:** `Você utilizou 82% dos créditos contratados este mês.`

**Estrutura:**
```
[Ícone: ⚡]
[Título]: Atenção ao seu saldo de créditos
[Subtítulo]: Você já utilizou a maior parte dos créditos
contratados para este período.

[Card de saldo — barra de progresso visual]:
  💳  Saldo de Créditos — Arcadia
  
  Contratados:  100 créditos
  Utilizados:    82 créditos  ████████░░  82%
  Restantes:     18 créditos

[Texto]: Com 18 créditos restantes, algumas solicitações
podem não ser cobertas pelo contrato atual.
Entre em contato com a Loopera para discutir a renovação
ou expansão do seu pacote.

[CTA]: Ver meu saldo completo →

[Texto discreto]: Dúvidas? Fale com Felipe Stephan (Loopera)
```

---

### `client.credit_exhausted`
**Contexto:** Créditos totalmente esgotados.

**Subject line:** `🔴 Seus créditos foram esgotados — Arcadia`
**Preview text:** `O saldo de créditos do seu contrato foi totalmente consumido.`

**Estrutura:**
```
[Ícone: 🔴]
[Título]: Seu saldo de créditos chegou ao fim
[Subtítulo]: Os créditos contratados para este período
foram totalmente consumidos.

[Card de saldo — tom vermelho]:
  💳  Saldo de Créditos — Arcadia
  
  Contratados:  100 créditos
  Utilizados:   100 créditos  ██████████ 100%
  Restantes:      0 créditos

[Texto]: Para continuar recebendo entregas, é necessário
renovar ou ampliar seu pacote de créditos.
Entre em contato com Felipe Stephan para alinhar os próximos passos.

[CTA]: Ver meu portal →

[Contato em destaque]: Felipe Stephan · felipe@loopera.com.br
```

---

### `client.weekly_digest`
**Contexto:** Resumo semanal do projeto — o e-mail mais importante para o cliente.

**Subject line:** `📊 Resumo da semana do seu projeto — Arcadia`
**Preview text:** `5 entregas concluídas, 3 em andamento. Veja tudo que aconteceu esta semana.`

**Estrutura:**
```
[Cabeçalho com data e logo]:
Semana de 14 a 20 de Abril · Projeto Arcadia

[Saudação]:
Olá, João! Aqui está o resumo do seu projeto esta semana.

[Seção 1 — O que foi entregue]:
  Esta semana, concluímos 5 tarefas para você:

  ✅  Post Instagram — Lançamento Produto      · 25 abr
  ✅  Banner Google Ads — Campanha Sazonal     · 24 abr
  ✅  Identidade Visual — Fase 2 aprovada      · 23 abr
  ✅  Copy E-mail Marketing — Newsletter       · 22 abr
  ✅  Revisão de Paleta de Cores               · 21 abr

[Seção 2 — Em andamento]:
  🔄  3 tarefas em produção neste momento
  
  • Campanha Black Friday — Redes Sociais    (prazo: 28 abr)
  • Landing Page — Produto Novo              (prazo: 30 abr)
  • Relatório de Performance — Abril         (prazo: 02 mai)

[Seção 3 — Seus créditos] (apenas se creditsEnabled):
  💳  Saldo de Créditos
  
  Utilizados esta semana: 18 créditos
  Total consumido:        64 de 100 créditos
  Restante:               36 créditos
  [Barra de progresso: 64% — cor saudável verde/amarelo]

[CTA principal]: Ver meu projeto completo →

[Mensagem de encerramento — tom humano]:
Qualquer dúvida ou nova solicitação, estamos à disposição.
Até a próxima semana! 👋

Equipe Loopera

[Footer]:
© 2026 WePlanner · Agência Loopera
Cancelar este resumo semanal
```

---

## Notas Finais para o Designer

1. **Mobile-first:** Todos os e-mails devem ser responsivos. Container de 560px no desktop, 100% no mobile.
2. **Dark mode:** Considerar versão dark dos e-mails (muitos clientes de e-mail suportam).
3. **Acessibilidade:** Contraste mínimo WCAG AA. Alt text em todas as imagens.
4. **Logo:** Usar versão horizontal do logo WePlanner no topo de todos os e-mails.
5. **Footer padrão:** Todos os e-mails têm `© [ano] WePlanner · [Nome da Agência]` + link de cancelamento específico por categoria.
6. **Digest semanal do cliente** é o template prioritário — é o e-mail de maior impacto na percepção de valor. Deve ser o mais polido de todos.
