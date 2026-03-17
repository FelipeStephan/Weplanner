import { CheckSquare, Loader, Search, ShieldCheck, Target, type LucideIcon } from 'lucide-react';
import type { BoardCreateInput, BoardTemplateKey } from '../domain/boards/contracts';
import type { BoardColumn, BoardRecord, BoardTask, WorkflowStatus } from '../domain/kanban/contracts';
import {
  applyAnalyticsToTasks,
  buildInitialStatusHistory,
  normalizeTaskForBoardState,
  serializeTasksForSnapshot,
} from '../domain/kanban/workflow';
import type { PersistedKanbanWorkspaceSnapshot } from '../app/data/kanban-workspace-persistence';
import { BOARD_DIRECTORY_CLIENTS, BOARD_DIRECTORY_USERS } from './boardDirectory';

export const DEFAULT_BOARD_ID = 'board-my-workspace';
export const DEFAULT_BOARD_TEMPLATE_KEY: BoardTemplateKey = 'operations-kanban';

type TemplateColumnSeed = {
  key: string;
  name: string;
  baseStatus: WorkflowStatus;
  accentColor: string;
  bgClass: string;
  iconName: string;
};

const TEMPLATE_COLUMNS: TemplateColumnSeed[] = [
  {
    key: 'todo',
    name: 'A Fazer',
    baseStatus: 'todo',
    accentColor: '#ff5623',
    bgClass: 'bg-[#FFF8F3] dark:bg-[#1d1511]',
    iconName: 'CheckSquare',
  },
  {
    key: 'in-progress',
    name: 'Em Progresso',
    baseStatus: 'in_progress',
    accentColor: '#987dfe',
    bgClass: 'bg-[#F6F1FF] dark:bg-[#171425]',
    iconName: 'Loader',
  },
  {
    key: 'review',
    name: 'Revisão',
    baseStatus: 'review',
    accentColor: '#3b82f6',
    bgClass: 'bg-[#F1F7FF] dark:bg-[#111b29]',
    iconName: 'Search',
  },
  {
    key: 'approval',
    name: 'Aprovação Interna',
    baseStatus: 'approval',
    accentColor: '#feba31',
    bgClass: 'bg-[#FFF8E7] dark:bg-[#21190d]',
    iconName: 'ShieldCheck',
  },
  {
    key: 'done',
    name: 'Concluído',
    baseStatus: 'done',
    accentColor: '#019364',
    bgClass: 'bg-[#EFFAF5] dark:bg-[#10211a]',
    iconName: 'Target',
  },
];

const ICON_REGISTRY: Record<string, LucideIcon> = {
  CheckSquare,
  Loader,
  Search,
  ShieldCheck,
  Target,
};

const team = BOARD_DIRECTORY_USERS;

const buildBoardAccess = (
  memberUserIds: string[] = [],
): BoardRecord['access'] => ({
  managerAccess: 'all',
  memberUserIds,
});

export const createBoardColumnsFromTemplate = (
  boardId: string,
  createdAt: string,
): BoardColumn[] =>
  TEMPLATE_COLUMNS.map((column, index) => ({
    id: `${boardId}-column-${column.key}`,
    boardId,
    name: column.name,
    baseStatus: column.baseStatus,
    order: index,
    createdAt,
    updatedAt: createdAt,
    accentColor: column.accentColor,
    bgClass: column.bgClass,
    iconName: column.iconName,
    icon: ICON_REGISTRY[column.iconName] ?? CheckSquare,
  }));

export const createBoardRecord = (
  id: string,
  input: BoardCreateInput,
  createdAt: string,
): BoardRecord => ({
  id,
  name: input.name,
  description: input.description?.trim() || 'Board operacional padrão do WePlanner',
  templateKey: input.templateKey ?? DEFAULT_BOARD_TEMPLATE_KEY,
  access: buildBoardAccess(input.memberUserIds ?? []),
  createdAt,
  updatedAt: createdAt,
});

const INITIAL_BOARD = createBoardRecord(
  DEFAULT_BOARD_ID,
  {
    name: 'Meu quadro',
    description: 'Board principal de operação do gestor com visão consolidada do time.',
    memberUserIds: ['user-carlos', 'user-mariana', 'user-rafael', 'user-julia', 'user-luiza-arcadia'],
  },
  '2026-03-01T09:00:00.000Z',
);

const INITIAL_BOARD_COLUMNS = createBoardColumnsFromTemplate(
  DEFAULT_BOARD_ID,
  '2026-03-01T09:00:00.000Z',
);

const columnId = (key: string) => `${DEFAULT_BOARD_ID}-column-${key}`;

const getTeamUser = (id: string) => team.find((member) => member.id === id)!;
const getClient = (id: string) => BOARD_DIRECTORY_CLIENTS.find((client) => client.id === id)!;

const INITIAL_CARDS: BoardTask[] = [
  {
    id: 'todo-1',
    boardId: DEFAULT_BOARD_ID,
    columnId: columnId('todo'),
    createdAt: '2026-03-09',
    type: 'simple',
    title: 'Refinar brief do cliente para campanha de maio',
    description: 'Consolidar feedback do time comercial e separar entregas que entram na sprint.',
    priority: 'high',
    status: 'todo',
    resolution: null,
    dueDate: '18 Mar',
    tags: ['Briefing', 'Cliente'],
    assignees: [getTeamUser('user-ana')],
    progress: 10,
    showProgressBar: false,
    showDateAlert: false,
    credits: 14,
    clientId: 'client-arcadia',
    client: getClient('client-arcadia'),
  },
  {
    id: 'todo-2',
    boardId: DEFAULT_BOARD_ID,
    columnId: columnId('todo'),
    createdAt: '2026-03-11',
    type: 'detailed',
    title: 'Subir assets iniciais do quadro comercial',
    description: 'Organizar capas, thumbs e textos-base para o kickoff da próxima campanha.',
    priority: 'medium',
    status: 'todo',
    resolution: null,
    dueDate: '21 Mar',
    tags: ['Assets', 'Operação'],
    tagColors: ['pink', 'orange'],
    assignees: [getTeamUser('user-ana'), getTeamUser('user-carlos')],
    progress: 18,
    showDateAlert: false,
    credits: 8,
    attachments: 2,
    comments: 3,
    subtasks: { completed: 1, total: 5 },
    clientId: 'client-arcadia',
    client: getClient('client-arcadia'),
  },
  {
    id: 'progress-1',
    boardId: DEFAULT_BOARD_ID,
    columnId: columnId('in-progress'),
    createdAt: '2026-03-06',
    type: 'detailed',
    title: 'Construir visão de board por perfil',
    description: 'Permitir alternar entre time interno, cliente e visão pessoal com filtros persistidos.',
    priority: 'high',
    status: 'in_progress',
    resolution: null,
    dueDate: '16 Mar',
    dateAlert: 'approaching',
    tags: ['Frontend', 'Permissões'],
    tagColors: ['blue', 'purple'],
    assignees: [getTeamUser('user-carlos'), getTeamUser('user-mariana'), getTeamUser('user-rafael')],
    progress: 68,
    credits: 22,
    attachments: 4,
    comments: 10,
    subtasks: { completed: 6, total: 9 },
    clientId: 'client-weplanner',
    client: getClient('client-weplanner'),
  },
  {
    id: 'progress-2',
    boardId: DEFAULT_BOARD_ID,
    columnId: columnId('in-progress'),
    createdAt: '2026-03-10',
    type: 'detailed',
    title: 'Aplicar dark mode nas colunas de board',
    description: 'Ajustar contraste dos cards e cabeçalhos para o tema escuro.',
    priority: 'medium',
    status: 'in_progress',
    resolution: null,
    dueDate: '19 Mar',
    tags: ['Dark mode', 'UI'],
    tagColors: ['gray', 'orange'],
    assignees: [getTeamUser('user-ana'), getTeamUser('user-carlos'), getTeamUser('user-mariana')],
    progress: 54,
    showDateAlert: false,
    credits: 16,
    attachments: 1,
    comments: 6,
    subtasks: { completed: 4, total: 7 },
    clientId: 'client-weplanner',
    client: getClient('client-weplanner'),
  },
  {
    id: 'review-1',
    boardId: DEFAULT_BOARD_ID,
    columnId: columnId('review'),
    createdAt: '2026-03-04',
    type: 'detailed',
    title: 'Validar regras de ocultação por coluna',
    description: 'Confirmar se colunas ocultas continuam acessíveis para gestores e líderes do squad.',
    priority: 'urgent',
    status: 'review',
    resolution: null,
    dueDate: '15 Mar',
    dateAlert: 'approaching',
    tags: ['QA', 'Governança'],
    tagColors: ['green', 'yellow'],
    assignees: [getTeamUser('user-mariana'), getTeamUser('user-rafael'), getTeamUser('user-julia')],
    progress: 88,
    credits: 20,
    attachments: 3,
    comments: 12,
    subtasks: { completed: 7, total: 8 },
    clientId: 'client-arcadia',
    client: getClient('client-arcadia'),
  },
  {
    id: 'approval-1',
    boardId: DEFAULT_BOARD_ID,
    columnId: columnId('approval'),
    createdAt: '2026-03-08',
    type: 'detailed',
    title: 'Liberar visão segmentada para clientes enterprise',
    description: 'Entrega depende da validação interna de segurança e checklist de privacidade.',
    priority: 'high',
    status: 'approval',
    resolution: null,
    dueDate: '17 Mar',
    dateAlert: 'approaching',
    tags: ['Compliance', 'Cliente'],
    tagColors: ['red', 'blue'],
    assignees: [
      getTeamUser('user-ana'),
      getTeamUser('user-carlos'),
      getTeamUser('user-mariana'),
      getTeamUser('user-rafael'),
    ],
    progress: 91,
    credits: 28,
    attachments: 5,
    comments: 9,
    subtasks: { completed: 5, total: 6 },
    clientId: 'client-arcadia',
    client: getClient('client-arcadia'),
  },
  {
    id: 'completed-1',
    boardId: DEFAULT_BOARD_ID,
    columnId: columnId('done'),
    createdAt: '2026-03-02',
    type: 'detailed',
    title: 'Estrutura base do board entregue',
    description: 'Sidebar, busca superior e colunas principais prontas no fluxo.',
    priority: 'medium',
    status: 'done',
    resolution: 'completed',
    dueDate: '12 Mar',
    tags: ['Board', 'Entrega'],
    tagColors: ['orange', 'green'],
    assignees: team,
    progress: 100,
    credits: 32,
    attachments: 6,
    comments: 14,
    subtasks: { completed: 10, total: 10 },
    clientId: 'client-weplanner',
    client: getClient('client-weplanner'),
  },
];

export const createBoardFromTemplate = (
  id: string,
  input: BoardCreateInput,
  createdAt: string,
) => {
  const board = createBoardRecord(id, input, createdAt);
  const columns = createBoardColumnsFromTemplate(id, createdAt);
  return { board, columns };
};

export const createInitialKanbanWorkspaceSnapshot = (): PersistedKanbanWorkspaceSnapshot => {
  const normalizedCards = INITIAL_CARDS.map((card) =>
    normalizeTaskForBoardState(card, INITIAL_BOARD_COLUMNS, undefined, undefined, DEFAULT_BOARD_ID),
  );
  const history = buildInitialStatusHistory(normalizedCards);
  const cardsWithAnalytics = applyAnalyticsToTasks(normalizedCards, history);

  return {
    schemaVersion: 3,
    persistedAt: new Date().toISOString(),
    boards: [INITIAL_BOARD],
    columns: INITIAL_BOARD_COLUMNS.map((column) => ({
      ...column,
      iconName: column.iconName ?? 'CheckSquare',
    })),
    tasks: serializeTasksForSnapshot(cardsWithAnalytics, history),
    taskStatusHistory: history,
  };
};
