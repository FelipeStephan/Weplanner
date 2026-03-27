# Send to Board — Funcionalidade de Envio de Tarefa para Outro Board

## Propósito

A funcionalidade **Send to Board** permite que um usuário mova uma tarefa de um board para outro diretamente pelo menu de ações do card, sem precisar cancelar ou recriar a tarefa manualmente.

Essa operação é especialmente útil quando:
- Uma tarefa foi criada no board errado e precisa ser redistribuída
- Uma tarefa multi-equipe precisa ser transferida para o squad responsável por continuar
- O gestor deseja reorganizar o backlog entre projetos

---

## Como usar

1. Abra o board contendo a tarefa
2. Hover sobre o card → clique no ícone `···` (MoreHorizontal)
3. Clique em **"Enviar para outro board"**
4. Selecione o **board de destino** (o board atual não é exibido como opção)
5. Selecione a **coluna de destino** dentro do board escolhido
6. Clique em **"Enviar para [nome do board]"**

A tarefa desaparece do board atual e aparece minimizada na coluna selecionada do board destino.

---

## Regras de negócio

| Regra | Comportamento |
|-------|---------------|
| Board origem excluído | O board atual da tarefa não aparece como opção de destino |
| Coluna obrigatória | O botão de confirmar só fica ativo com board E coluna selecionados |
| Status derivado automaticamente | `task.status` é recalculado via `column.baseStatus` do novo board |
| Histórico preservado | O `taskStatusHistory` existente da tarefa não é apagado |
| Nova entrada no histórico | A mudança é registrada como `changeType: 'programmatic'` |
| Entrada minimizada | O card entra compacto (minimizado) no board de destino |
| Créditos inalterados | A migração não altera o valor de `credits` da tarefa |
| Resolution preservada | `resolution` não é alterada pela migração (ex: tarefa que estava `null` continua `null`) |
| `previousColumnId` atualizado | O campo `previousColumnId` aponta para a coluna de origem, permitindo rastreabilidade |

---

## Arquitetura da implementação (frontend)

### Handler principal

```ts
// KanbanWorkspacePage.tsx
const sendCardToBoard = (cardId: string, targetBoardId: string, targetColumnId: string) => {
  applyCardsUpdate(
    (current) =>
      current.map((card) => {
        if (card.id !== cardId) return card;
        return {
          ...card,
          boardId: targetBoardId,
          columnId: targetColumnId,
          previousColumnId: card.columnId,
          previousStatus: card.status,
          statusChangedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }),
    'programmatic',
  );
  setCardsCompactState([cardId]);
  setSendToBoardModal({ open: false, card: null });
};
```

`applyCardsUpdate` internamente chama `normalizeCardForBoardState()` que:
1. Encontra a coluna destino pelo novo `columnId`
2. Deriva o novo `status` via `column.baseStatus`
3. Registra a transição em `taskStatusHistory`

### Estado adicionado

```ts
const [sendToBoardModal, setSendToBoardModal] = useState<{
  open: boolean;
  card: BoardCard | null;
}>({ open: false, card: null });
```

### Componente modal

```
src/app/components/tasks/SendToBoardModal.tsx
```

Fluxo em 2 etapas dentro do mesmo modal:
1. **Board** — lista de boards disponíveis (exceto o atual)
2. **Coluna** — lista de colunas do board selecionado

---

## Persistência

A operação é persistida automaticamente pelo `useEffect` existente no `KanbanWorkspacePage` que observa o estado `cards` e salva o snapshot no `localStorage` via `kanbanWorkspaceRepository.save()`.

---

## Pontos de extensão para backend

Quando o projeto migrar para backend real, esta operação deverá:

1. Chamar um endpoint `POST /tasks/{taskId}/move-to-board`
2. Payload sugerido:
   ```json
   {
     "targetBoardId": "board-xyz",
     "targetColumnId": "column-abc",
     "actorId": "user-id"
   }
   ```
3. O backend deve:
   - Validar que o `actorId` tem acesso ao board destino
   - Registrar a transição no `task_status_history`
   - Atualizar `task.boardId`, `task.columnId`, `task.statusChangedAt`
   - Emitir evento para WebSocket (real-time update nos boards afetados)

---

## Registro de atividades

Toda movimentação de card é registrada no campo `activityLog` do `BoardCard` e exibida na aba **Atividades** do `TaskDetailModal`.

### Eventos registrados

| Ação | Ícone | Descrição no log |
|------|-------|-----------------|
| Drag-and-drop entre colunas | `move` | `moveu de "Coluna A" para "Coluna B"` |
| Enviar para outro board | `send` | `enviou esta tarefa para o board "X", coluna "Y"` |
| Concluir tarefa | `complete` | `marcou esta tarefa como concluída` |
| Arquivar tarefa | `archive` | `arquivou esta tarefa` |
| Cancelar tarefa | `cancel` | `cancelou esta tarefa` |
| Criação (entry fixa no modal) | `create` | `criou esta tarefa` |

### Estrutura do log

```ts
activityLog: Array<{
  id: string;          // "activity-<timestamp>-<type>"
  icon: 'move' | 'complete' | 'archive' | 'cancel' | 'send' | 'create' | 'edit';
  actor: string;       // Nome do usuário ativo (ACTIVE_WORKFLOW_ACTOR)
  action: string;      // Descrição legível da ação
  timestamp: string;   // ISO 8601
}>
```

O `activityLog` é acumulativo — novas entradas são **append-only** (`[...(card.activityLog ?? []), novaEntrada]`).  
A persistência ocorre automaticamente via `localStorage`.

---

## Link de card e acesso por board

### Como o link é gerado

`copyCardLink()` gera links no formato:

```
#/kanban-workspace?board=<boardId>&card=<cardId>
```

O parâmetro `?board=` garante que o app navegue diretamente para o board correto antes de tentar abrir o modal do card. Isso é válido inclusive após um "Enviar para outro board".

### Comportamento esperado ao acessar um link

1. O `App.tsx` lê `?board=<boardId>` do hash e ativa o board correspondente
2. O `KanbanWorkspacePage` lê `?card=<cardId>` e abre automaticamente o `TaskDetailModal`

### Limitação de acesso por board

> [!IMPORTANT]
> **O acesso a uma tarefa via link está condicionado ao acesso do usuário ao board onde ela reside.**

Se um usuário não tem permissão para visualizar o board destino:
- O board não aparecerá na sidebar
- O link redirecionará para o board padrão do usuário
- O modal da tarefa **não será aberto** (card não existe no board visível)

Esse comportamento é **intencional** — ele respeita as regras de controle de acesso por board definidas em `board-architecture.md`. O link de uma tarefa não garante acesso, apenas navega para a localização da tarefa.

Para backend futuro, uma URL pública com token de acesso temporário seria o mecanismo correto para compartilhamento externo.

---

## Arquivos relacionados

| Arquivo | Papel |
|--------|-------|
| `src/app/components/boards/KanbanWorkspacePage.tsx` | Handler `sendCardToBoard`, estado `sendToBoardModal`, dropdown item, renderização do modal |
| `src/app/components/tasks/SendToBoardModal.tsx` | Componente do modal de seleção de board e coluna |
| `src/repositories/kanbanWorkspaceRepository.ts` | Persiste snapshot via localStorage |
| `src/domain/kanban/workflow.ts` | `normalizeTaskForBoardState` — deriva status automaticamente após mudança de coluna |
