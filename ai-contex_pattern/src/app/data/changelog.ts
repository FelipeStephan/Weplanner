/**
 * changelog.ts
 *
 * Registro oficial de todas as releases do WePlanner Design System.
 * Estrutura hierárquica: Release → Módulo → Mudança.
 *
 * Convenções de tipo:
 *   feature     — nova funcionalidade
 *   fix         — correção de bug
 *   improvement — melhoria em algo existente
 *   refactor    — reorganização de código sem mudança de comportamento
 *   design      — ajuste visual/UX sem nova funcionalidade
 */

export type ChangeType = 'feature' | 'fix' | 'improvement' | 'refactor' | 'design';

export interface ChangelogChange {
  type: ChangeType;
  title: string;
  /** Contexto técnico do PORQUÊ da mudança — essencial para o Dev AI */
  description: string;
  /** Caminhos relativos a src/app/ dos arquivos afetados */
  files: string[];
}

export interface ChangelogModule {
  area: string;
  emoji: string;
  changes: ChangelogChange[];
}

export interface ChangelogRelease {
  version: string;
  date: string;
  isoDate: string;
  summary: string;
  modules: ChangelogModule[];
}

// ─── Releases (mais recente primeiro) ────────────────────────────────────────

export const CHANGELOG_RELEASES: ChangelogRelease[] = [
  {
    version: '0.4.3',
    date: '19 Abr 2026',
    isoDate: '2026-04-19',
    summary: 'Dark mode nos editores de texto, headings H1/H2/H3 e correções de comportamento da toolbar',
    modules: [
      {
        area: 'Tarefas — Editor de Descrição (Detalhes + Criação)',
        emoji: '✏️',
        changes: [
          {
            type: 'feature',
            title: 'Headings H1 / H2 / H3 na toolbar do editor rich text',
            description:
              'Adicionado select "P / H1 / H2 / H3" na toolbar de ambos os modais usando document.execCommand("formatBlock"). Estado reseta para "p" ao fechar o editor. Posicionado após o seletor de font-size para manter hierarquia visual coerente.',
            files: [
              'components/tasks/TaskDetailModal.tsx',
              'components/tasks/CreateTaskModal.tsx',
            ],
          },
          {
            type: 'feature',
            title: 'Marcador de texto (highlight) adicionado ao CreateTaskModal',
            description:
              'O CreateTaskModal agora tem o picker de highlight com a mesma implementação do TaskDetailModal: botão com ícone Highlighter + swatch, popup fixed-position via getBoundingClientRect() para não ser cortado pelo overflow-y-auto do container. Estados highlightColor, showHighlightPicker e highlightPickerPos adicionados.',
            files: ['components/tasks/CreateTaskModal.tsx', 'data/taskForm.ts'],
          },
          {
            type: 'fix',
            title: 'Selects de font-size e heading fechavam o editor ao serem clicados',
            description:
              'O onBlur={saveDetailDescription} no contentEditable disparava quando o foco movia para qualquer select da toolbar. Fix: adicionado descEditorContainerRef no container do editor e o onBlur agora verifica e.relatedTarget — se o foco ainda está dentro do container, o salvamento é cancelado. Selects são focusáveis nativamente, então relatedTarget aponta para eles corretamente.',
            files: ['components/tasks/TaskDetailModal.tsx'],
          },
          {
            type: 'fix',
            title: 'Picker de cor piscava e sumia imediatamente no CreateTaskModal',
            description:
              'Race condition: onMouseDown abria o picker, mas o click seguinte subia via bubble até o onClick do container de scroll que fechava tudo. Fix: onClick={(e) => e.stopPropagation()} nos wrappers dos botões de cor e highlight, impedindo a propagação sem afetar o onMouseDown.',
            files: ['components/tasks/CreateTaskModal.tsx'],
          },
        ],
      },
      {
        area: 'Dark Mode — Editores e Badges',
        emoji: '🌙',
        changes: [
          {
            type: 'design',
            title: 'Badges de prioridade adaptados para dark mode',
            description:
              'Os passiveBg/passiveText de PRIORITY_OPTIONS usavam tons pastéis claros (bg-[#dcfce7] etc.) que desaparecem em fundo escuro. Adicionadas variantes dark: com fundo semi-transparente (bg-color/15) e texto mais vivo para cada nível: Baixa dark:text-[#4ade80], Média dark:text-[#fbbf24], Alta dark:text-[#f87171], Urgente dark:text-[#c084fc]. Mesma correção aplicada ao CalendarTaskPreview que tinha as classes hardcoded.',
            files: [
              'data/taskForm.ts',
              'components/boards/CalendarTaskPreview.tsx',
            ],
          },
          {
            type: 'fix',
            title: 'Ícone "A" de cor do texto invisível em dark mode',
            description:
              'O span do "A" usava color: detailTextColor diretamente, que por padrão é #171717 (preto) — invisível em fundo escuro. Fix: o style inline só é aplicado quando a cor não é a padrão, deixando o className com dark:text-[#a3a3a3] assumir o controle no dark mode.',
            files: [
              'components/tasks/TaskDetailModal.tsx',
              'components/tasks/CreateTaskModal.tsx',
            ],
          },
          {
            type: 'fix',
            title: 'Ícone Highlighter e swatch do marcador sem contraste em dark mode',
            description:
              'O Highlighter recebia color: #525252 hardcoded quando sem cor ativa — quase invisível no dark. Fix: className com dark:text-[#a3a3a3] e style só aplicado quando há cor ativa. O swatch indicador usava boxShadow com #d4d4d4 (claro demais no dark). Substituído por #888888, cinza médio visível em ambos os modos sem precisar de variante dark separada.',
            files: [
              'components/tasks/TaskDetailModal.tsx',
              'components/tasks/CreateTaskModal.tsx',
            ],
          },
        ],
      },
    ],
  },

  {
    version: '0.4.2',
    date: '19 Abr 2026',
    isoDate: '2026-04-19',
    summary: 'Correção de crash ao inserir imagens de capa',
    modules: [
      {
        area: 'Utilitários',
        emoji: '🔧',
        changes: [
          {
            type: 'feature',
            title: 'imageUtils.ts — compressão e redimensionamento de imagens',
            description:
              'Criado utilitário compressImage() que redimensiona para máximo 1600×600px e recomprime como JPEG 82% usando canvas. Previne crash de memória ao substituir FileReader.readAsDataURL() direto, que gerava strings base64 de 7–13MB no estado React.',
            files: ['utils/imageUtils.ts'],
          },
        ],
      },
      {
        area: 'Tarefas — Modais de Criação e Detalhes',
        emoji: '🗂',
        changes: [
          {
            type: 'fix',
            title: 'Tela branca ao inserir imagens grandes como capa da tarefa',
            description:
              'Imagens maiores que ~2MB causavam crash ao serem convertidas para base64 completo e armazenadas em estado React. Substituído o handler FileReader direto pelo novo compressImage() em ambos os modais. A imagem comprimida fica abaixo de ~300KB independentemente do tamanho original.',
            files: [
              'components/tasks/CreateTaskModal.tsx',
              'components/tasks/TaskDetailModal.tsx',
            ],
          },
        ],
      },
    ],
  },

  {
    version: '0.4.1',
    date: '19 Abr 2026',
    isoDate: '2026-04-19',
    summary: 'DateTimePicker unificado com calendário visual',
    modules: [
      {
        area: 'Componentes Compartilhados',
        emoji: '🧩',
        changes: [
          {
            type: 'feature',
            title: 'DateTimePicker — seletor de data e hora com calendário customizado',
            description:
              'Criado componente reutilizável com duas variantes: "field" (input com borda, CreateTaskModal) e "inline" (trigger de texto com cores de estado, TaskDetailModal). Inclui calendário visual com navegação por mês, grid de dias (Dom–Sáb), hoje destacado com borda laranja, dia selecionado com fundo laranja, input de horário com Clock icon e botões Limpar/Confirmar. Fecha ao clicar fora.',
            files: ['components/shared/DateTimePicker.tsx'],
          },
          {
            type: 'improvement',
            title: "Formato de data exibe 'às' entre data e horário",
            description:
              "Atualizada formatTaskDueDate() para incluir 'às' entre data e hora. Resultado: '19 Abr às 14:30' em vez de '19 Abr 14:30'.",
            files: ['utils/taskDueDate.ts'],
          },
        ],
      },
      {
        area: 'Tarefas — Modais de Criação e Detalhes',
        emoji: '🗂',
        changes: [
          {
            type: 'improvement',
            title: 'Inputs de data/hora separados substituídos pelo DateTimePicker',
            description:
              'CreateTaskModal usa variant="field". TaskDetailModal usa variant="inline" com prop dueDateState para colorir o trigger (overdue=vermelho, warning=amarelo, normal=cinza). Ambos utilizam buildTaskDueDateValue() e getTaskDueDateInputParts() para serialização ISO.',
            files: [
              'components/tasks/CreateTaskModal.tsx',
              'components/tasks/TaskDetailModal.tsx',
            ],
          },
        ],
      },
    ],
  },

  {
    version: '0.4.0',
    date: '19 Abr 2026',
    isoDate: '2026-04-19',
    summary: 'Sistema completo de subtarefas no modal de detalhes',
    modules: [
      {
        area: 'Tarefas — Modal de Detalhes',
        emoji: '🗂',
        changes: [
          {
            type: 'feature',
            title: 'Sistema de subtarefas com progress bar (idêntico ao CreateTaskModal)',
            description:
              'Estado local localSubtasks espelha task.subtasksList e é re-sincronizado a cada abertura do modal. Cada mudança chama onUpdateTaskField imediatamente. Funcionalidades: checkbox de conclusão, título editável inline, seletor de responsável com busca, seletor de data nativo, botão de remoção, input de nova subtarefa (Enter para adicionar), ProgressBar + contador "X/Y concluídas".',
            files: ['components/tasks/TaskDetailModal.tsx'],
          },
        ],
      },
    ],
  },

  {
    version: '0.3.9',
    date: '19 Abr 2026',
    isoDate: '2026-04-19',
    summary: 'Tags padronizadas, capa movida e fix no date picker',
    modules: [
      {
        area: 'Tarefas — Modais de Criação e Detalhes',
        emoji: '🗂',
        changes: [
          {
            type: 'design',
            title: 'Tags com X sempre visível dentro da pill colorida',
            description:
              'Padronizado o padrão "X-inline" em ambos os modais: X sempre visível dentro da pill, sem hover para revelar. TaskDetailModal usava TagBadge + X externo com hover; substituído pelo mesmo padrão do CreateTaskModal. Tag.color em TaskDetailModal é string (ex: "red") mapeada via TAG_PALETTE.find(c => c.colorName === tag.color).',
            files: [
              'components/tasks/CreateTaskModal.tsx',
              'components/tasks/TaskDetailModal.tsx',
            ],
          },
        ],
      },
      {
        area: 'Tarefas — Modal de Criação',
        emoji: '🗂',
        changes: [
          {
            type: 'design',
            title: "Botão 'Adicionar capa' movido do header para a área de conteúdo",
            description:
              'Removido dropdown "Capa" do header do modal. Adicionado botão dashed minimalista no início da área de scroll (acima do título). Visível apenas sem capa ativa. Com capa: preview h-36 com overlay bg-black/40 no hover, botões "Trocar" (dropdown com upload + anexos) e "Remover".',
            files: ['components/tasks/CreateTaskModal.tsx'],
          },
          {
            type: 'fix',
            title: 'Date picker do TaskDetailModal não respondia ao clique',
            description:
              'Input de data sobreposto (opacity-0 absolute) estava vinculado diretamente à prop task.dueDate que não atualizava imediatamente após onUpdateTaskField, causando reversão visual. Corrigido com estados locais editDueDate/editDueTime; posteriormente substituído pelo DateTimePicker (v0.4.1).',
            files: ['components/tasks/TaskDetailModal.tsx'],
          },
        ],
      },
    ],
  },

  {
    version: '0.3.8',
    date: '19 Abr 2026',
    isoDate: '2026-04-19',
    summary: 'Edição inline completa no modal de detalhes da tarefa',
    modules: [
      {
        area: 'Tarefas — Modal de Detalhes',
        emoji: '🗂',
        changes: [
          {
            type: 'feature',
            title: 'Edição inline de título',
            description:
              'Clique no título exibe input com borda laranja. Blur ou Enter salva via onUpdateTaskField. Escape cancela e restaura valor original.',
            files: ['components/tasks/TaskDetailModal.tsx'],
          },
          {
            type: 'feature',
            title: 'Edição inline de descrição',
            description:
              'Clique na área de descrição exibe textarea redimensionável. Blur salva se houve alteração. Escape cancela. Utiliza getRichTextPlainText() para comparação.',
            files: ['components/tasks/TaskDetailModal.tsx'],
          },
          {
            type: 'feature',
            title: 'Edição inline de data de entrega',
            description:
              'Data exibida como texto clicável com cor de estado (overdue=vermelho, warning=amarelo, normal=cinza). Clique abre DateTimePicker inline variant="inline". Alteração salva via onUpdateTaskField.',
            files: ['components/tasks/TaskDetailModal.tsx'],
          },
          {
            type: 'feature',
            title: 'Edição inline de tags (adicionar, remover, trocar cor)',
            description:
              "Tags editáveis: pill colorida com X para remover, clique no label abre picker de cor (grid 4×2). Botão '+' abre input inline para nova tag (Enter adiciona). Limite de 5 tags.",
            files: ['components/tasks/TaskDetailModal.tsx'],
          },
          {
            type: 'feature',
            title: 'Edição inline de responsáveis',
            description:
              'Clique no AvatarStack abre dropdown com busca de membros. Toggle add/remove. Usa BOARD_DIRECTORY_USERS como fonte de dados.',
            files: ['components/tasks/TaskDetailModal.tsx'],
          },
          {
            type: 'feature',
            title: 'Edição inline de cliente',
            description:
              'Clique no campo de cliente abre dropdown com lista de MOCK_TASK_FORM_CLIENTS. Salva clientId e client name via onUpdateTaskField.',
            files: [
              'components/tasks/TaskDetailModal.tsx',
              'data/taskForm.ts',
            ],
          },
          {
            type: 'feature',
            title: 'Créditos editáveis via popover no header',
            description:
              'Badge "Créditos usados" no header é clicável e abre popover com input numérico para ajuste. Estado local editCredits sincronizado com task.credits.',
            files: ['components/tasks/TaskDetailModal.tsx'],
          },
          {
            type: 'feature',
            title: 'Capa da tarefa — adicionar, trocar e remover inline',
            description:
              'Botão "Adicionar capa" (dashed) exibido quando sem capa. Com capa: preview h-48, overlay no hover com botões "Trocar" (dropdown upload/anexos) e "Remover" (vermelho). Alterações propagadas via onUpdateTaskField({ coverImage }).',
            files: ['components/tasks/TaskDetailModal.tsx'],
          },
        ],
      },
    ],
  },

  {
    version: '0.3.7',
    date: '18 Abr 2026',
    isoDate: '2026-04-18',
    summary: 'Phase 4 — Refatoração de arquitetura e extração de módulos',
    modules: [
      {
        area: 'Arquitetura — Clientes',
        emoji: '🏗',
        changes: [
          {
            type: 'refactor',
            title: 'ClientPanel extraído em ClientPanelTabs',
            description:
              'ClientPanel.tsx reduzido de 765 para ~224 linhas. Tabs (Profile, Library, Team, Boards, Credits) e constante TABS extraídas para ClientPanelTabs.tsx com exports individuais. Mantida compatibilidade total de interface.',
            files: [
              'components/clients/ClientPanel.tsx',
              'components/clients/ClientPanelTabs.tsx',
            ],
          },
        ],
      },
      {
        area: 'Arquitetura — Tarefas',
        emoji: '🏗',
        changes: [
          {
            type: 'refactor',
            title: 'Types do TaskDetailModal centralizados em types/taskDetail.ts',
            description:
              'Interfaces TaskDetailComment, TaskDetailAttachment e TaskDetailModalProps removidas do corpo do componente e exportadas de src/app/types/taskDetail.ts. Segue regra de arquitetura: types compartilhados ficam em types/.',
            files: [
              'types/taskDetail.ts',
              'components/tasks/TaskDetailModal.tsx',
            ],
          },
          {
            type: 'refactor',
            title: 'MOCK_TASK_FORM_CLIENTS centralizado em data/taskForm.ts',
            description:
              'Array de 8 clientes mock removido do corpo de TaskDetailModal e adicionado ao módulo data/taskForm.ts, reutilizável por CreateTaskModal e TaskDetailModal sem duplicação.',
            files: [
              'data/taskForm.ts',
              'components/tasks/TaskDetailModal.tsx',
            ],
          },
        ],
      },
    ],
  },
];
