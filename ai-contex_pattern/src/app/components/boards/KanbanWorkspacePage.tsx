import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import {
  Archive,
  ArrowDownWideNarrow,
  ArrowRightLeft,
  Bell,
  Building2,
  Calendar,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Copy,
  Diamond,
  EyeOff,
  Filter,
  FolderKanban,
  History,
  LayoutDashboard,
  Loader,
  Link2,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Moon,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Sun,
  Target,
  Trash2,
  RotateCcw,
  Users,
  WandSparkles,
} from 'lucide-react';
import { BOARD_DIRECTORY_USERS } from '../../../demo/boardDirectory';
import { boardsRepository } from '../../../repositories/boardsRepository';
import { AvatarStack } from '../shared/AvatarStack';
import type { NotificationItem } from '../shared/NotificationCard';
import { BoardNotificationsPopover } from './BoardNotificationsPopover';
import { CreateBoardModal } from './CreateBoardModal';
import { BoardCalendarView } from './BoardCalendarView';
import {
  CreateTaskModal,
  type CreateTaskInitialData,
  type CreateTaskSubmitData,
  type TaskFormAttachment,
  type TaskFormSubtask,
} from '../tasks/CreateTaskModal';
import { DetailedTaskCard } from '../tasks/DetailedTaskCard';
import { KanbanColumn } from '../tasks/KanbanColumn';
import { SendToBoardModal } from '../tasks/SendToBoardModal';
import { StatusBadge } from '../tasks/StatusBadge';
import { TaskCard } from '../tasks/TaskCard';
import { TaskDetailModal } from '../tasks/TaskDetailModal';
import { ClientLibraryModal } from '../shared/ClientLibraryModal';
import {
  type PersistedKanbanWorkspaceSnapshot,
} from '../../data/kanban-workspace-persistence';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import { getRichTextPlainText } from '../../utils/richText';
import { formatTaskDueDate, parseTaskDueDate } from '../../utils/taskDueDate';
import {
  applyAnalyticsToTasks,
  buildInitialStatusHistory as buildInitialTaskStatusHistory,
  formatCreatedAt as formatTaskCreatedAt,
  formatHistoryEventDate as formatTaskHistoryEventDate,
  getDefaultBoardColumnId as getDefaultTaskColumnId,
  getSystemStatusForColumn as getTaskStatusForColumn,
  hydrateColumnsFromSnapshot as hydrateTaskColumnsFromSnapshot,
  hydrateTasksFromSnapshot as hydrateBoardTasksFromSnapshot,
  isTaskVisibleInBoard as isBoardTaskVisible,
  normalizeTaskForBoardState,
  serializeTasksForSnapshot,
  updateStatusHistoryForTaskChanges,
} from '../../../domain/kanban/workflow';
import { kanbanWorkspaceRepository } from '../../../repositories/kanbanWorkspaceRepository';
import { clientLibraryRepository } from '../../../repositories/clientLibraryRepository';
import { createInitialKanbanWorkspaceSnapshot, DEFAULT_BOARD_ID } from '../../../demo/kanbanWorkspaceSeed';
import type { BoardUpdateInput } from '../../../domain/boards/contracts';

type CardType = 'simple' | 'detailed';
type BoardColumnId = string;
type TaskResolution = 'completed' | 'cancelled' | 'rejected' | 'archived' | null;
type WorkflowStatus =
  | 'backlog'
  | 'todo'
  | 'in_progress'
  | 'review'
  | 'adjustments'
  | 'approval'
  | 'done';
type StatusHistoryChangeType = 'system-init' | 'drag-and-drop' | 'programmatic' | 'manual';

interface KanbanWorkspacePageProps {
  boardId?: string;
  onBackToDesignSystem?: () => void;
  onOpenBoard?: (boardId: string) => void;
  onWorkspaceMetadataChange?: () => void;
  canManageBoards?: boolean;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  notifications?: NotificationItem[];
  onOpenNotification?: (notification: NotificationItem) => void;
  onMarkBoardNotificationsRead?: (boardId: string) => void;
}

interface BoardCard {
  id: string;
  boardId: string;
  columnId: BoardColumnId;
  previousColumnId?: BoardColumnId;
  previousStatus?: WorkflowStatus;
  previousProgress?: number;
  createdAt: string;
  statusChangedAt?: string;
  updatedAt?: string;
  type: CardType;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: WorkflowStatus;
  resolution?: TaskResolution;
  completedAt?: string | null;
  cancelledAt?: string | null;
  archivedAt?: string | null;
  dueDate: string;
  dateAlert?: 'approaching' | 'overdue';
  tags: string[];
  tagColors?: Array<'orange' | 'blue' | 'green' | 'purple' | 'pink' | 'yellow' | 'red' | 'gray'>;
  assignees: Array<{ id?: string; name: string; image?: string }>;
  clientId?: string | null;
  progress: number;
  showProgressBar?: boolean;
  showDateAlert?: boolean;
  credits?: number;
  attachments?: number;
  attachmentsList?: TaskFormAttachment[];
  comments?: number;
  subtasks?: { completed: number; total: number };
  subtasksList?: TaskFormSubtask[];
  client?: { name: string; image?: string };
  totalTimeInProgress?: number;
  totalTimeInReview?: number;
  totalTimeInAdjustments?: number;
  totalTimeInApproval?: number;
  reviewCycles?: number;
  adjustmentCycles?: number;
  activityLog?: Array<{
    id: string;
    icon: 'move' | 'complete' | 'archive' | 'cancel' | 'send' | 'create' | 'edit';
    actor: string;
    action: string;
    timestamp: string;
  }>;
}

interface TaskStatusHistoryRecord {
  id: string;
  taskId: string;
  fromColumnId: BoardColumnId | null;
  toColumnId: BoardColumnId;
  fromStatus: WorkflowStatus | null;
  toStatus: WorkflowStatus;
  enteredAt: string;
  exitedAt: string | null;
  durationInSeconds: number | null;
  changedBy: string;
  changeType: StatusHistoryChangeType;
  createdAt: string;
}

interface BoardHistoryListItem {
  id: string;
  title: string;
  clientName: string;
  previousColumnLabel: string;
  dueDateLabel: string;
  credits: number | null;
  assignees: Array<{ name: string; image?: string }>;
  resolution: 'archived' | 'cancelled';
  resolutionLabel: string;
  resolutionDateLabel: string;
  resolutionBadgeClass: string;
}

interface BoardColumn {
  id: BoardColumnId;
  boardId: string;
  name: string;
  baseStatus: WorkflowStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
  accentColor: string;
  bgClass: string;
  icon: typeof CheckSquare;
  iconName?: string;
}

interface BoardRecord {
  id: string;
  name: string;
  description?: string;
  templateKey?: string;
  access?: {
    managerAccess: 'all';
    memberUserIds: string[];
  };
  createdAt: string;
  updatedAt: string;
  /**
   * Créditos habilitados neste board. undefined = herda global (true).
   * Quando false, o campo credits é ocultado nos cards mas NÃO é apagado da tarefa.
   */
  creditsEnabled?: boolean;
}

type ColumnFilterOption = 'manual' | 'delivery-date' | 'recent' | 'oldest';
type BoardScope = 'all' | 'mine' | 'user';
type BoardViewMode = 'kanban' | 'calendar';
type ColumnEditorMode = 'create' | 'edit';
type HistoryFilterOption = 'all' | 'archived' | 'cancelled';
const BOARD_ID = 'board-my-workspace';
const BASE_WORKFLOW_STATUS_OPTIONS: WorkflowStatus[] = [
  'backlog',
  'todo',
  'in_progress',
  'review',
  'adjustments',
  'approval',
  'done',
];

const WORKFLOW_STAGE_META: Record<
  WorkflowStatus,
  {
    label: string;
    accentColor: string;
    bgClass: string;
    icon: typeof CheckSquare;
  }
> = {
  backlog: {
    label: 'Backlog',
    accentColor: '#4f46e5',
    bgClass: 'bg-[#F3F2FF] dark:bg-[#16172b]',
    icon: LayoutDashboard,
  },
  todo: {
    label: 'A Fazer',
    accentColor: '#ff5623',
    bgClass: 'bg-[#FFF8F3] dark:bg-[#1d1511]',
    icon: CheckSquare,
  },
  in_progress: {
    label: 'Em Progresso',
    accentColor: '#987dfe',
    bgClass: 'bg-[#F6F1FF] dark:bg-[#171425]',
    icon: Loader,
  },
  review: {
    label: 'Revisão',
    accentColor: '#3b82f6',
    bgClass: 'bg-[#F1F7FF] dark:bg-[#111b29]',
    icon: Search,
  },
  adjustments: {
    label: 'Ajustes',
    accentColor: '#f97316',
    bgClass: 'bg-[#FFF4EA] dark:bg-[#24170f]',
    icon: Pencil,
  },
  approval: {
    label: 'Aprovação',
    accentColor: '#feba31',
    bgClass: 'bg-[#FFF8E7] dark:bg-[#21190d]',
    icon: ShieldCheck,
  },
  done: {
    label: 'Concluído',
    accentColor: '#019364',
    bgClass: 'bg-[#EFFAF5] dark:bg-[#10211a]',
    icon: Target,
  },
};

const COLUMN_ICON_REGISTRY: Record<string, typeof CheckSquare> = {
  CheckSquare,
  LayoutDashboard,
  Loader,
  Search,
  Pencil,
  ShieldCheck,
  Target,
};

const resolveColumnIcon = (iconName: string | undefined, baseStatus: WorkflowStatus) =>
  COLUMN_ICON_REGISTRY[iconName ?? ''] ?? WORKFLOW_STAGE_META[baseStatus].icon;

const TEAM = [
  {
    name: 'Ana Silva',
    image:
      'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?w=80&h=80&fit=crop&crop=face',
  },
  {
    name: 'Carlos Lima',
    image:
      'https://images.unsplash.com/photo-1672685667592-0392f458f46f?w=80&h=80&fit=crop&crop=face',
  },
  {
    name: 'Mariana Costa',
    image:
      'https://images.unsplash.com/photo-1641808895769-29e63aa2f066?w=80&h=80&fit=crop&crop=face',
  },
  {
    name: 'Rafael Santos',
    image:
      'https://images.unsplash.com/photo-1762708550141-2688121b9ebd?w=80&h=80&fit=crop&crop=face',
  },
  {
    name: 'Julia Ferreira',
    image:
      'https://images.unsplash.com/photo-1753162660224-7852bd04f827?w=80&h=80&fit=crop&crop=face',
  },
];

const DEFAULT_BOARD_COLUMNS: BoardColumn[] = [
  {
    id: 'column-todo',
    boardId: BOARD_ID,
    name: 'A Fazer',
    baseStatus: 'todo',
    order: 0,
    createdAt: '2026-03-01T09:00:00.000Z',
    updatedAt: '2026-03-01T09:00:00.000Z',
    accentColor: '#ff5623',
    bgClass: 'bg-[#FFF8F3] dark:bg-[#1d1511]',
    icon: CheckSquare,
    iconName: 'CheckSquare',
  },
  {
    id: 'column-in-progress',
    boardId: BOARD_ID,
    name: 'Em Progresso',
    baseStatus: 'in_progress',
    order: 1,
    createdAt: '2026-03-01T09:05:00.000Z',
    updatedAt: '2026-03-01T09:05:00.000Z',
    accentColor: '#987dfe',
    bgClass: 'bg-[#F6F1FF] dark:bg-[#171425]',
    icon: Loader,
    iconName: 'Loader',
  },
  {
    id: 'column-review',
    boardId: BOARD_ID,
    name: 'Revisão',
    baseStatus: 'review',
    order: 2,
    createdAt: '2026-03-01T09:10:00.000Z',
    updatedAt: '2026-03-01T09:10:00.000Z',
    accentColor: '#3b82f6',
    bgClass: 'bg-[#F1F7FF] dark:bg-[#111b29]',
    icon: Search,
    iconName: 'Search',
  },
  {
    id: 'column-approval',
    boardId: BOARD_ID,
    name: 'Aprovação Interna',
    baseStatus: 'approval',
    order: 3,
    createdAt: '2026-03-01T09:15:00.000Z',
    updatedAt: '2026-03-01T09:15:00.000Z',
    accentColor: '#feba31',
    bgClass: 'bg-[#FFF8E7] dark:bg-[#21190d]',
    icon: ShieldCheck,
    iconName: 'ShieldCheck',
  },
  {
    id: 'column-done',
    boardId: BOARD_ID,
    name: 'Concluído',
    baseStatus: 'done',
    order: 4,
    createdAt: '2026-03-01T09:20:00.000Z',
    updatedAt: '2026-03-01T09:20:00.000Z',
    accentColor: '#019364',
    bgClass: 'bg-[#EFFAF5] dark:bg-[#10211a]',
    icon: Target,
    iconName: 'Target',
  },
];

const DEFAULT_BOARDS: BoardRecord[] = [
  {
    id: BOARD_ID,
    name: 'Meu quadro',
    createdAt: '2026-03-01T09:00:00.000Z',
    updatedAt: '2026-03-01T09:00:00.000Z',
  },
];

const INITIAL_CARDS: BoardCard[] = [
  {
    id: 'todo-1',
    boardId: BOARD_ID,
    columnId: 'column-todo',
    createdAt: '2026-03-09',
    type: 'simple',
    title: 'Refinar brief do cliente para campanha de maio',
    description: 'Consolidar feedback do time comercial e separar entregas que entram na sprint.',
    priority: 'high',
    status: 'todo',
    resolution: null,
    dueDate: '18 Mar',
    tags: ['Briefing', 'Cliente'],
    assignees: [TEAM[0]],
    progress: 10,
    showProgressBar: false,
    showDateAlert: false,
    credits: 14,
    client: { name: 'Arcadia' },
  },
  {
    id: 'todo-2',
    boardId: BOARD_ID,
    columnId: 'column-todo',
    createdAt: '2026-03-11',
    type: 'detailed',
    title: 'Subir assets iniciais do quadro comercial',
    description: 'Organizar capas, thumbs e textos-base para o kickoff da proxima campanha.',
    priority: 'medium',
    status: 'backlog',
    resolution: null,
    dueDate: '21 Mar',
    tags: ['Assets', 'Operacao'],
    tagColors: ['pink', 'orange'],
    assignees: TEAM.slice(0, 2),
    progress: 18,
    showDateAlert: false,
    credits: 8,
    attachments: 2,
    comments: 3,
    subtasks: { completed: 1, total: 5 },
    client: { name: 'Arcadia' },
  },
  {
    id: 'progress-1',
    boardId: BOARD_ID,
    columnId: 'column-in-progress',
    createdAt: '2026-03-06',
    type: 'detailed',
    title: 'Construir visao de board por perfil',
    description: 'Permitir alternar entre time interno, cliente e visao pessoal com filtros persistidos.',
    priority: 'high',
    status: 'in_progress',
    resolution: null,
    dueDate: '16 Mar',
    dateAlert: 'approaching',
    tags: ['Frontend', 'Permissoes'],
    tagColors: ['blue', 'purple'],
    assignees: TEAM.slice(1, 4),
    progress: 68,
    credits: 22,
    attachments: 4,
    comments: 10,
    subtasks: { completed: 6, total: 9 },
    client: { name: 'WePlanner' },
  },
  {
    id: 'progress-2',
    boardId: BOARD_ID,
    columnId: 'column-in-progress',
    createdAt: '2026-03-10',
    type: 'detailed',
    title: 'Aplicar dark mode nas colunas de board',
    description: 'Ajustar contraste dos cards e cabecalhos para o tema escuro.',
    priority: 'medium',
    status: 'in_progress',
    resolution: null,
    dueDate: '19 Mar',
    tags: ['Dark mode', 'UI'],
    tagColors: ['gray', 'orange'],
    assignees: TEAM.slice(0, 3),
    progress: 54,
    showDateAlert: false,
    credits: 16,
    attachments: 1,
    comments: 6,
    subtasks: { completed: 4, total: 7 },
    client: { name: 'WePlanner' },
  },
  {
    id: 'review-1',
    boardId: BOARD_ID,
    columnId: 'column-review',
    createdAt: '2026-03-04',
    type: 'detailed',
    title: 'Validar regras de ocultacao por coluna',
    description: 'Confirmar se colunas ocultas continuam acessiveis para gestores e lideres do squad.',
    priority: 'urgent',
    status: 'review',
    resolution: null,
    dueDate: '15 Mar',
    dateAlert: 'approaching',
    tags: ['QA', 'Governanca'],
    tagColors: ['green', 'yellow'],
    assignees: TEAM.slice(2, 5),
    progress: 88,
    credits: 20,
    attachments: 3,
    comments: 12,
    subtasks: { completed: 7, total: 8 },
    client: { name: 'Arcadia' },
  },
  {
    id: 'approval-1',
    boardId: BOARD_ID,
    columnId: 'column-approval',
    createdAt: '2026-03-08',
    type: 'detailed',
    title: 'Liberar visao segmentada para clientes enterprise',
    description: 'Entrega depende da validacao interna de seguranca e checklist de privacidade.',
    priority: 'high',
    status: 'approval',
    resolution: null,
    dueDate: '17 Mar',
    dateAlert: 'approaching',
    tags: ['Compliance', 'Cliente'],
    tagColors: ['red', 'blue'],
    assignees: TEAM.slice(0, 4),
    progress: 91,
    credits: 28,
    attachments: 5,
    comments: 9,
    subtasks: { completed: 5, total: 6 },
    client: { name: 'Arcadia' },
  },
  {
    id: 'completed-1',
    boardId: BOARD_ID,
    columnId: 'column-done',
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
    assignees: TEAM.slice(0, 5),
    progress: 100,
    credits: 32,
    attachments: 6,
    comments: 14,
    subtasks: { completed: 10, total: 10 },
    client: { name: 'WePlanner' },
  },
  {
    id: 'todo-3',
    boardId: BOARD_ID,
    columnId: 'column-todo',
    createdAt: '2026-03-13',
    type: 'detailed',
    title: 'Ajustar copy do onboarding de clientes',
    description: 'Revisar textos principais da jornada inicial e alinhar com o time de CS.',
    priority: 'low',
    status: 'todo',
    resolution: null,
    dueDate: '24 Mar',
    tags: ['Conteudo', 'Cliente'],
    tagColors: ['pink', 'blue'],
    assignees: [TEAM[4]],
    progress: 24,
    showProgressBar: false,
    showDateAlert: false,
    credits: 6,
    attachments: 1,
    comments: 2,
    client: { name: 'Arcadia' },
  },
  {
    id: 'review-2',
    boardId: BOARD_ID,
    columnId: 'column-review',
    createdAt: '2026-03-12',
    type: 'detailed',
    title: 'Validar checklist visual da sprint comercial',
    description: 'Conferir espaçamentos, badges e comportamento em cards sem subtarefas.',
    priority: 'medium',
    status: 'review',
    resolution: null,
    dueDate: '20 Mar',
    tags: ['UI', 'QA'],
    tagColors: ['orange', 'green'],
    assignees: TEAM.slice(1, 3),
    progress: 72,
    showProgressBar: false,
    showDateAlert: false,
    credits: 11,
    attachments: 2,
    comments: 4,
    client: { name: 'WePlanner' },
  },
  {
    id: 'progress-3',
    boardId: BOARD_ID,
    columnId: 'column-in-progress',
    createdAt: '2026-03-14',
    type: 'detailed',
    title: 'Revisar assets da apresentacao comercial',
    description: 'Consolidar imagens, anexos e feedbacks para a apresentacao do squad de vendas.',
    priority: 'high',
    status: 'in_progress',
    resolution: null,
    dueDate: '22 Mar',
    tags: ['Comercial', 'Assets'],
    tagColors: ['yellow', 'blue'],
    assignees: TEAM.slice(0, 2),
    progress: 42,
    showProgressBar: false,
    showDateAlert: false,
    credits: 13,
    attachments: 5,
    comments: 7,
    client: { name: 'Arcadia' },
  },
  {
    id: 'approval-2',
    boardId: BOARD_ID,
    columnId: 'column-approval',
    createdAt: '2026-03-07',
    type: 'detailed',
    title: 'Aprovar briefing final do cliente enterprise',
    description: 'Centralizar versoes finais, anexos e comentarios para validacao interna.',
    priority: 'medium',
    status: 'approval',
    resolution: null,
    dueDate: '25 Mar',
    tags: ['Briefing', 'Enterprise'],
    tagColors: ['orange', 'purple'],
    assignees: TEAM.slice(2, 5),
    progress: 64,
    showProgressBar: false,
    showDateAlert: false,
    credits: 9,
    attachments: 3,
    comments: 6,
    client: { name: 'WePlanner' },
  },
];

const COLUMN_FILTER_OPTIONS: Array<{ value: ColumnFilterOption; label: string }> = [
  { value: 'delivery-date', label: 'Data de entrega' },
  { value: 'recent', label: 'Recentes' },
  { value: 'oldest', label: 'Antigos' },
];

const EMPTY_DRAG_IMAGE_SRC =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

const MONTH_MAP: Record<string, number> = {
  Jan: 0,
  Fev: 1,
  Mar: 2,
  Abr: 3,
  Mai: 4,
  Jun: 5,
  Jul: 6,
  Ago: 7,
  Set: 8,
  Out: 9,
  Nov: 10,
  Dez: 11,
};

const parseBoardDate = (value: string) => parseTaskDueDate(value).date ?? new Date(2026, 0, 1);

const withAlpha = (hexColor: string, alpha: string) => {
  if (!/^#[\da-fA-F]{6}$/.test(hexColor)) {
    return undefined;
  }

  return `${hexColor}${alpha}`;
};

const getRouteCardId = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawHash = window.location.hash.replace(/^#/, '');
  const [, queryString = ''] = rawHash.split('?');
  const query = new URLSearchParams(queryString);
  return query.get('card');
};

const clearRouteCardId = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const rawHash = window.location.hash.replace(/^#/, '');
  const [path, queryString = ''] = rawHash.split('?');
  const query = new URLSearchParams(queryString);
  if (!query.has('card')) {
    return;
  }

  query.delete('card');
  const nextQuery = query.toString();
  window.location.hash = `${path}${nextQuery ? `?${nextQuery}` : ''}`;
};

const formatCreatedAt = (value: string) => {
  const date = new Date(value);
  const monthLabel = Object.keys(MONTH_MAP).find(
    (month) => MONTH_MAP[month] === date.getMonth(),
  );
  return `${String(date.getDate()).padStart(2, '0')} ${monthLabel}, ${date.getFullYear()}`;
};

const COLUMN_STATUS_MAP: Record<
  WorkflowStatus,
  WorkflowStatus
> = {
  backlog: 'backlog',
  todo: 'todo',
  in_progress: 'in_progress',
  review: 'review',
  adjustments: 'adjustments',
  approval: 'approval',
  done: 'done',
};

const getSystemStatusForColumn = (column: BoardColumn) => COLUMN_STATUS_MAP[column.baseStatus];
const getColumnById = (columns: BoardColumn[], columnId: BoardColumnId) =>
  columns.find((column) => column.id === columnId);
const getDefaultBoardColumnId = (
  columns: BoardColumn[],
  explicitColumnId?: BoardColumnId,
) => {
  const sortedColumns = [...columns].sort((left, right) => left.order - right.order);
  if (explicitColumnId && sortedColumns.some((column) => column.id === explicitColumnId)) {
    return explicitColumnId;
  }
  return sortedColumns.find((column) => column.baseStatus === 'todo')?.id || sortedColumns[0]?.id || '';
};
const isTaskVisibleInBoard = (card: BoardCard) =>
  card.resolution !== 'cancelled' &&
  card.resolution !== 'archived' &&
  card.resolution !== 'rejected';

const ACTIVE_WORKFLOW_ACTOR = 'Ana Silva';
const calculateDurationInSeconds = (enteredAt: string, exitedAt: string) =>
  Math.max(
    0,
    Math.floor((new Date(exitedAt).getTime() - new Date(enteredAt).getTime()) / 1000),
  );
const formatHistoryEventDate = (value?: string | null) => {
  if (!value) return 'sem registro';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'sem registro';
  }

  return parsed.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const normalizeCardForBoardState = (
  card: BoardCard,
  columns: BoardColumn[],
  previousCard?: BoardCard,
  fallbackChangedAt?: string,
): BoardCard => {
  const targetColumn = getColumnById(columns, card.columnId);
  const normalizedStatus = targetColumn ? getSystemStatusForColumn(targetColumn) : card.status;
  const taskTouched = !previousCard || previousCard !== card;
  const workflowChanged =
    !previousCard ||
    previousCard.columnId !== card.columnId ||
    previousCard.status !== normalizedStatus;
  const resolutionChanged = previousCard?.resolution !== card.resolution;
  const nextStatusChangedAt = workflowChanged
    ? card.statusChangedAt ??
      fallbackChangedAt ??
      previousCard?.statusChangedAt ??
      card.createdAt
    : card.statusChangedAt ?? previousCard?.statusChangedAt ?? card.createdAt;
  const nextUpdatedAt = taskTouched
    ? fallbackChangedAt ??
      card.updatedAt ??
      previousCard?.updatedAt ??
      nextStatusChangedAt
    : card.updatedAt ?? previousCard?.updatedAt ?? nextStatusChangedAt;
  const resolutionTimestamp =
    fallbackChangedAt ?? nextUpdatedAt ?? nextStatusChangedAt ?? card.createdAt;

  return {
    ...card,
    boardId: card.boardId ?? BOARD_ID,
    type: card.type ?? 'detailed',
    title: card.title ?? 'Tarefa sem título',
    description: card.description ?? '',
    priority: card.priority ?? 'medium',
    columnId: card.columnId,
    dueDate: card.dueDate ?? '',
    tags: Array.isArray(card.tags) ? card.tags : [],
    tagColors: Array.isArray(card.tagColors) ? card.tagColors : [],
    assignees: Array.isArray(card.assignees) ? card.assignees : [],
    attachments: card.attachments ?? 0,
    attachmentsList: Array.isArray(card.attachmentsList) ? card.attachmentsList : [],
    comments: card.comments ?? 0,
    subtasksList: Array.isArray(card.subtasksList) ? card.subtasksList : [],
    progress: typeof card.progress === 'number' ? card.progress : 0,
    showProgressBar: card.showProgressBar ?? Boolean(card.subtasks?.total),
    showDateAlert: card.showDateAlert ?? false,
    status: normalizedStatus,
    statusChangedAt: nextStatusChangedAt,
    updatedAt: nextUpdatedAt,
    resolution:
      normalizedStatus === 'done'
        ? card.resolution === 'cancelled' ||
          card.resolution === 'archived' ||
          card.resolution === 'rejected'
          ? card.resolution
          : 'completed'
        : card.resolution === 'completed'
          ? null
          : (card.resolution ?? null),
    completedAt:
      card.resolution === 'completed' || normalizedStatus === 'done'
        ? card.completedAt ?? (resolutionChanged ? resolutionTimestamp : previousCard?.completedAt ?? resolutionTimestamp)
        : null,
    cancelledAt:
      card.resolution === 'cancelled'
        ? card.cancelledAt ?? (resolutionChanged ? resolutionTimestamp : previousCard?.cancelledAt ?? resolutionTimestamp)
        : null,
    archivedAt:
      card.resolution === 'archived'
        ? card.archivedAt ?? (resolutionChanged ? resolutionTimestamp : previousCard?.archivedAt ?? resolutionTimestamp)
        : null,
    clientId: card.clientId ?? card.client?.name ?? null,
    client:
      card.client ?? (card.clientId ? { name: card.clientId } : undefined),
    totalTimeInProgress: card.totalTimeInProgress ?? previousCard?.totalTimeInProgress ?? 0,
    totalTimeInReview: card.totalTimeInReview ?? previousCard?.totalTimeInReview ?? 0,
    totalTimeInAdjustments: card.totalTimeInAdjustments ?? previousCard?.totalTimeInAdjustments ?? 0,
    totalTimeInApproval: card.totalTimeInApproval ?? previousCard?.totalTimeInApproval ?? 0,
    reviewCycles: card.reviewCycles ?? previousCard?.reviewCycles ?? 0,
    adjustmentCycles: card.adjustmentCycles ?? previousCard?.adjustmentCycles ?? 0,
  };
};

const buildInitialStatusHistory = (cards: BoardCard[]): TaskStatusHistoryRecord[] =>
  cards.map((card) => ({
    id: `history-${card.id}-${card.statusChangedAt ?? card.createdAt}`,
    taskId: card.id,
    fromColumnId: null,
    toColumnId: card.columnId,
    fromStatus: null,
    toStatus: card.status,
    enteredAt: card.statusChangedAt ?? card.createdAt,
    exitedAt: null,
    durationInSeconds: null,
    changedBy: ACTIVE_WORKFLOW_ACTOR,
    changeType: 'system-init',
    createdAt: card.statusChangedAt ?? card.createdAt,
  }));

const applyAnalyticsToCards = (
  cards: BoardCard[],
  history: TaskStatusHistoryRecord[],
): BoardCard[] =>
  cards.map((card) => {
    const cardHistory = history.filter((entry) => entry.taskId === card.id);
    const sumDuration = (status: WorkflowStatus) =>
      cardHistory
        .filter((entry) => entry.toStatus === status)
        .reduce((total, entry) => total + (entry.durationInSeconds ?? 0), 0);

    return {
      ...card,
      totalTimeInProgress: sumDuration('in_progress'),
      totalTimeInReview: sumDuration('review'),
      totalTimeInAdjustments: sumDuration('adjustments'),
      totalTimeInApproval: sumDuration('approval'),
      reviewCycles: cardHistory.filter((entry) => entry.toStatus === 'review').length,
      adjustmentCycles: cardHistory.filter((entry) => entry.toStatus === 'adjustments').length,
    };
  });

const createInitialWorkspaceSnapshot = (): PersistedKanbanWorkspaceSnapshot => {
  return createInitialKanbanWorkspaceSnapshot();
};

const hydrateColumnsFromSnapshot = (
  columns: PersistedKanbanWorkspaceSnapshot['columns'],
): BoardColumn[] =>
  columns
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((column) => ({
      ...column,
      icon: COLUMN_ICON_REGISTRY[column.iconName] ?? WORKFLOW_STAGE_META[column.baseStatus].icon,
    }));

const hydrateTasksFromSnapshot = (
  tasks: PersistedKanbanWorkspaceSnapshot['tasks'],
  columns: BoardColumn[],
): BoardCard[] =>
  tasks.map((task) =>
    normalizeCardForBoardState(
      {
        ...task,
        clientId: task.clientId ?? task.client?.name ?? null,
      },
      columns,
      undefined,
      task.statusChangedAt,
    ),
  );

const updateStatusHistoryForCardChanges = (
  previousCards: BoardCard[],
  nextCards: BoardCard[],
  currentHistory: TaskStatusHistoryRecord[],
  changeType: StatusHistoryChangeType,
  changedBy: string,
): TaskStatusHistoryRecord[] => {
  const previousCardsMap = new Map(previousCards.map((card) => [card.id, card]));
  const nextCardsMap = new Map(nextCards.map((card) => [card.id, card]));
  const nextHistory = currentHistory.map((entry) => ({ ...entry }));

  nextCardsMap.forEach((nextCard, taskId) => {
    const previousCard = previousCardsMap.get(taskId);

    if (!previousCard) {
      nextHistory.push({
        id: `history-${taskId}-${nextCard.statusChangedAt ?? nextCard.createdAt}`,
        taskId,
        fromColumnId: null,
        toColumnId: nextCard.columnId,
        fromStatus: null,
        toStatus: nextCard.status,
        enteredAt: nextCard.statusChangedAt ?? nextCard.createdAt,
        exitedAt: null,
        durationInSeconds: null,
        changedBy,
        changeType,
        createdAt: nextCard.statusChangedAt ?? nextCard.createdAt,
      });
      return;
    }

    const workflowChanged =
      previousCard.columnId !== nextCard.columnId || previousCard.status !== nextCard.status;

    if (!workflowChanged) {
      return;
    }

    const exitedAt = nextCard.statusChangedAt ?? previousCard.statusChangedAt ?? nextCard.createdAt;
    const activeEntry = [...nextHistory]
      .reverse()
      .find((entry) => entry.taskId === taskId && entry.exitedAt === null);

    if (activeEntry) {
      activeEntry.exitedAt = exitedAt;
      activeEntry.durationInSeconds = calculateDurationInSeconds(
        activeEntry.enteredAt,
        exitedAt,
      );
    }

    nextHistory.push({
      id: `history-${taskId}-${exitedAt}`,
      taskId,
      fromColumnId: previousCard.columnId,
      toColumnId: nextCard.columnId,
      fromStatus: previousCard.status,
      toStatus: nextCard.status,
      enteredAt: exitedAt,
      exitedAt: null,
      durationInSeconds: null,
      changedBy,
      changeType,
      createdAt: exitedAt,
    });
  });

  return nextHistory;
};

export function KanbanWorkspacePage({
  boardId,
  onBackToDesignSystem,
  onOpenBoard,
  onWorkspaceMetadataChange,
  canManageBoards = false,
  darkMode = false,
  onToggleDarkMode,
  notifications = [],
  onOpenNotification,
  onMarkBoardNotificationsRead,
}: KanbanWorkspacePageProps) {
  const activeBoardId = boardId || DEFAULT_BOARD_ID;
  const initialWorkspaceRef = useRef<PersistedKanbanWorkspaceSnapshot | null>(null);
  if (!initialWorkspaceRef.current) {
    const seedSnapshot = createInitialKanbanWorkspaceSnapshot();
    const loadedSnapshot = kanbanWorkspaceRepository.load(seedSnapshot);

    try {
      const hydratedColumns = hydrateTaskColumnsFromSnapshot(
        loadedSnapshot.columns,
        resolveColumnIcon,
      );
      hydrateBoardTasksFromSnapshot(loadedSnapshot.tasks, hydratedColumns, activeBoardId);
      initialWorkspaceRef.current = loadedSnapshot;
    } catch {
      kanbanWorkspaceRepository.clear();
      kanbanWorkspaceRepository.save(seedSnapshot);
      initialWorkspaceRef.current = seedSnapshot;
    }
  }

  const hydratedColumns = hydrateTaskColumnsFromSnapshot(
    initialWorkspaceRef.current.columns,
    resolveColumnIcon,
  );
  const hydratedTasks = applyAnalyticsToTasks(
    hydrateBoardTasksFromSnapshot(initialWorkspaceRef.current.tasks, hydratedColumns, activeBoardId),
    initialWorkspaceRef.current.taskStatusHistory,
  );

  const [boards, setBoards] = useState<BoardRecord[]>(initialWorkspaceRef.current.boards);
  const [cards, setCards] = useState<BoardCard[]>(hydratedTasks);
  const [statusHistory, setStatusHistory] = useState<TaskStatusHistoryRecord[]>(
    initialWorkspaceRef.current.taskStatusHistory,
  );
  const [boardColumns, setBoardColumns] = useState<BoardColumn[]>(hydratedColumns);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const [boardScope, setBoardScope] = useState<BoardScope>('all');
  const [selectedUser, setSelectedUser] = useState<string>('Ana Silva');
  const [organizeMenuOpen, setOrganizeMenuOpen] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState<BoardColumnId[]>([]);
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [selectedClientLibraryId, setSelectedClientLibraryId] = useState<string | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<HistoryFilterOption>('all');
  const [historyDeleteCandidate, setHistoryDeleteCandidate] = useState<BoardCard | null>(null);
  const [createTaskStartColumnId, setCreateTaskStartColumnId] = useState<BoardColumnId | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [createTaskPrefill, setCreateTaskPrefill] = useState<CreateTaskInitialData | null>(null);
  const [boardViewMode, setBoardViewMode] = useState<BoardViewMode>('kanban');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  });
  const [editBoardModalOpen, setEditBoardModalOpen] = useState(false);
  const [deleteBoardDialogOpen, setDeleteBoardDialogOpen] = useState(false);
  const [boardMembersOpen, setBoardMembersOpen] = useState(false);
  const [boardSettingsOpen, setBoardSettingsOpen] = useState(false);
  const [boardNotificationsOpen, setBoardNotificationsOpen] = useState(false);
  const [boardMemberSearch, setBoardMemberSearch] = useState('');
  const [automationColumn, setAutomationColumn] = useState<BoardColumn | null>(null);
  const [columnEditorMode, setColumnEditorMode] = useState<ColumnEditorMode | null>(null);
  const [editingColumn, setEditingColumn] = useState<BoardColumn | null>(null);
  const [columnNameInput, setColumnNameInput] = useState('');
  const [columnBaseStatusInput, setColumnBaseStatusInput] = useState<WorkflowStatus | ''>('');
  const [columnFormError, setColumnFormError] = useState<string | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<BoardColumnId, ColumnFilterOption>>(
    () =>
      Object.fromEntries(
        hydratedColumns.map((column) => [column.id, 'manual']),
      ) as Record<BoardColumnId, ColumnFilterOption>,
  );
  const [selectedCard, setSelectedCard] = useState<BoardCard | null>(null);
  const [pendingRouteCardId, setPendingRouteCardId] = useState<string | null>(() =>
    getRouteCardId(),
  );
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [draggedColumnId, setDraggedColumnId] = useState<BoardColumnId | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<BoardColumnId | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{
    columnKey: BoardColumnId;
    targetCardId: string | null;
    placement: 'before' | 'after';
  } | null>(null);
  const [columnDropIndicator, setColumnDropIndicator] = useState<{
    targetColumnId: BoardColumnId;
    placement: 'before' | 'after';
  } | null>(null);
  const [completingCardIds, setCompletingCardIds] = useState<string[]>([]);
  const [compactCardIds, setCompactCardIds] = useState<string[]>(() =>
    hydratedTasks.map((card) => card.id),
  );
  const [movingCardIds, setMovingCardIds] = useState<string[]>([]);
  const [sendToBoardModal, setSendToBoardModal] = useState<{
    open: boolean;
    card: BoardCard | null;
  }>({ open: false, card: null });
  const boardScrollRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const organizeMenuRef = useRef<HTMLDivElement | null>(null);
  const boardMembersRef = useRef<HTMLDivElement | null>(null);
  const boardSettingsRef = useRef<HTMLDivElement | null>(null);
  const boardNotificationsRef = useRef<HTMLDivElement | null>(null);
  const panStateRef = useRef({
    isPanning: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });
  const suppressCardClickRef = useRef(false);
  const statusHistoryRef = useRef(statusHistory);
  const [dragPreview, setDragPreview] = useState<{
    cardId: string;
    x: number;
    y: number;
  } | null>(null);
  const currentBoard = useMemo(
    () => boards.find((board) => board.id === activeBoardId) ?? boards[0] ?? null,
    [activeBoardId, boards],
  );
  const currentBoardNotifications = useMemo(
    () => notifications.filter((notification) => notification.boardId === activeBoardId),
    [activeBoardId, notifications],
  );
  const currentBoardUnreadNotificationCount = useMemo(
    () => currentBoardNotifications.filter((notification) => !notification.isRead).length,
    [currentBoardNotifications],
  );
  const currentBoardColumns = useMemo(
    () =>
      boardColumns
        .filter((column) => column.boardId === activeBoardId)
        .sort((left, right) => left.order - right.order),
    [activeBoardId, boardColumns],
  );
  const currentBoardMembers = useMemo(
    () =>
      BOARD_DIRECTORY_USERS.filter((member) =>
        currentBoard?.access.memberUserIds.includes(member.id ?? ''),
      ),
    [currentBoard],
  );
  const filteredBoardMemberDirectory = useMemo(
    () =>
      BOARD_DIRECTORY_USERS.filter((member) =>
        `${member.name} ${member.role ?? ''}`.toLowerCase().includes(boardMemberSearch.toLowerCase()),
      ),
    [boardMemberSearch],
  );

  const applyWorkspaceSnapshot = (
    snapshot: PersistedKanbanWorkspaceSnapshot,
    nextBoardId = activeBoardId,
  ) => {
    initialWorkspaceRef.current = snapshot;
    const hydratedSnapshotColumns = hydrateTaskColumnsFromSnapshot(
      snapshot.columns,
      resolveColumnIcon,
    );
    const hydratedSnapshotTasks = applyAnalyticsToTasks(
      hydrateBoardTasksFromSnapshot(snapshot.tasks, hydratedSnapshotColumns, nextBoardId),
      snapshot.taskStatusHistory,
    );

    setBoards(snapshot.boards);
    setBoardColumns(hydratedSnapshotColumns);
    setCards(hydratedSnapshotTasks);
    setStatusHistory(snapshot.taskStatusHistory);
    statusHistoryRef.current = snapshot.taskStatusHistory;
  };

  const resetColumnEditor = () => {
    setColumnEditorMode(null);
    setEditingColumn(null);
    setColumnNameInput('');
    setColumnBaseStatusInput('');
    setColumnFormError(null);
  };

  const openCreateTaskModal = (
    columnId?: BoardColumnId,
    prefill?: CreateTaskInitialData | null,
  ) => {
    setEditingTaskId(null);
    setCreateTaskStartColumnId(columnId ?? null);
    setCreateTaskPrefill(prefill ?? null);
    setCreateTaskModalOpen(true);
  };

  const openEditTaskModal = (card: BoardCard) => {
    setSelectedCard(null);
    setEditingTaskId(card.id);
    setCreateTaskStartColumnId(card.columnId);
    setCreateTaskPrefill(null);
    setCreateTaskModalOpen(true);
  };

  const openCreateColumnDialog = () => {
    setColumnEditorMode('create');
    setEditingColumn(null);
    setColumnNameInput('');
    setColumnBaseStatusInput('');
    setColumnFormError(null);
  };

  const openEditColumnDialog = (column: BoardColumn) => {
    setColumnEditorMode('edit');
    setEditingColumn(column);
    setColumnNameInput(column.name);
    setColumnBaseStatusInput(column.baseStatus);
    setColumnFormError(null);
  };

  useEffect(() => {
    statusHistoryRef.current = statusHistory;
  }, [statusHistory]);

  useEffect(() => {
    const syncRouteCardId = () => {
      setPendingRouteCardId(getRouteCardId());
    };

    syncRouteCardId();
    window.addEventListener('hashchange', syncRouteCardId);

    return () => {
      window.removeEventListener('hashchange', syncRouteCardId);
    };
  }, []);

  useEffect(() => {
    if (!pendingRouteCardId) {
      return;
    }

    const routeCard = cards.find((card) => card.id === pendingRouteCardId);
    if (!routeCard) {
      return;
    }

    setSelectedCard(routeCard);
    setPendingRouteCardId(null);
    clearRouteCardId();
  }, [cards, pendingRouteCardId]);

  useEffect(() => {
    if (!selectedCard) {
      return;
    }

    const nextSelectedCard = cards.find((card) => card.id === selectedCard.id) ?? null;
    if (!nextSelectedCard) {
      setSelectedCard(null);
      return;
    }

    if (nextSelectedCard !== selectedCard) {
      setSelectedCard(nextSelectedCard);
    }
  }, [cards, selectedCard]);

  useEffect(() => {
    kanbanWorkspaceRepository.save({
      schemaVersion: 3,
      persistedAt: new Date().toISOString(),
      boards,
      columns: boardColumns.map((column) => ({
        ...column,
        iconName: column.iconName ?? 'CheckSquare',
      })),
      tasks: serializeTasksForSnapshot(cards, statusHistory),
      taskStatusHistory: statusHistory,
    });
  }, [boards, boardColumns, cards, statusHistory]);

  const applyCardsUpdate = (
    updater: (current: BoardCard[]) => BoardCard[],
    changeType: StatusHistoryChangeType,
    changedBy = ACTIVE_WORKFLOW_ACTOR,
  ) => {
    setCards((current) => {
      const fallbackChangedAt = new Date().toISOString();
      const rawNextCards = updater(current);
      const currentCardsMap = new Map(current.map((card) => [card.id, card]));
      const nextCards = rawNextCards.map((card) =>
        normalizeCardForBoardState(
          card,
          boardColumns,
          currentCardsMap.get(card.id),
          fallbackChangedAt,
        ),
      );
      const nextHistory = updateStatusHistoryForTaskChanges(
        current,
        nextCards,
        statusHistoryRef.current,
        changeType,
        changedBy,
      );
      const cardsWithAnalytics = applyAnalyticsToTasks(nextCards, nextHistory);

      statusHistoryRef.current = nextHistory;
      setStatusHistory(nextHistory);
      setBoards((currentBoards) =>
        currentBoards.map((board) =>
          board.id === activeBoardId
            ? { ...board, updatedAt: fallbackChangedAt }
            : board,
        ),
      );
      return cardsWithAnalytics;
    });
  };

  const applyBoardColumnsUpdate = (
    updater: (current: BoardColumn[]) => BoardColumn[],
    changeType: StatusHistoryChangeType,
    changedBy = ACTIVE_WORKFLOW_ACTOR,
  ) => {
    setBoardColumns((currentColumns) => {
      const boardColumnsForCurrentBoard = currentColumns.filter(
        (column) => column.boardId === activeBoardId,
      );
      const columnsFromOtherBoards = currentColumns.filter(
        (column) => column.boardId !== activeBoardId,
      );
      const updatedCurrentBoardColumns = updater(boardColumnsForCurrentBoard)
        .map((column, index) => ({
          ...column,
          order: index,
        }))
        .sort((left, right) => left.order - right.order);
      const nextColumns = [...columnsFromOtherBoards, ...updatedCurrentBoardColumns];

      setCards((currentCards) => {
        const fallbackChangedAt = new Date().toISOString();
        const currentCardsMap = new Map(currentCards.map((card) => [card.id, card]));
        const nextCards = currentCards.map((card) =>
          normalizeCardForBoardState(
            card,
            nextColumns,
            currentCardsMap.get(card.id),
            fallbackChangedAt,
          ),
        );
        const nextHistory = updateStatusHistoryForTaskChanges(
          currentCards,
          nextCards,
          statusHistoryRef.current,
          changeType,
          changedBy,
        );
        const cardsWithAnalytics = applyAnalyticsToTasks(nextCards, nextHistory);

        statusHistoryRef.current = nextHistory;
        setStatusHistory(nextHistory);
        return cardsWithAnalytics;
      });

      setColumnFilters((current) =>
        Object.fromEntries(
          nextColumns.map((column) => [column.id, current[column.id] ?? 'manual']),
        ) as Record<BoardColumnId, ColumnFilterOption>,
      );
      setHiddenColumns((current) =>
        current.filter((columnId) => nextColumns.some((column) => column.id === columnId)),
      );
      setBoards((currentBoards) =>
        currentBoards.map((board) =>
          board.id === activeBoardId
            ? { ...board, updatedAt: new Date().toISOString() }
            : board,
        ),
      );

      return nextColumns;
    });
  };

  useEffect(() => {
    if (!searchPanelOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    }, 20);

    return () => window.clearTimeout(timer);
  }, [searchPanelOpen]);

  useEffect(() => {
    if (!searchPanelOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      setSearchPanelOpen(false);
      setSearchQuery('');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchPanelOpen]);

  useEffect(() => {
    if (!organizeMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | globalThis.MouseEvent) => {
      const target = event.target as Node | null;
      if (!target || organizeMenuRef.current?.contains(target)) {
        return;
      }
      setOrganizeMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [organizeMenuOpen]);

  useEffect(() => {
    if (!boardMembersOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | globalThis.MouseEvent) => {
      const target = event.target as Node | null;
      if (!target || boardMembersRef.current?.contains(target)) {
        return;
      }
      setBoardMembersOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [boardMembersOpen]);

  useEffect(() => {
    if (!boardSettingsOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | globalThis.MouseEvent) => {
      const target = event.target as Node | null;
      if (!target || boardSettingsRef.current?.contains(target)) {
        return;
      }
      setBoardSettingsOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [boardSettingsOpen]);

  useEffect(() => {
    if (!boardNotificationsOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | globalThis.MouseEvent) => {
      const target = event.target as Node | null;
      if (!target || boardNotificationsRef.current?.contains(target)) {
        return;
      }
      setBoardNotificationsOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [boardNotificationsOpen]);

  const visibleColumns = currentBoardColumns.filter(
    (column) => !hiddenColumns.includes(column.id),
  );

  const filteredBoardCards = useMemo(() => {
    let boardCards = cards.filter(
      (card) => card.boardId === activeBoardId && isBoardTaskVisible(card),
    );

    if (boardScope === 'mine') {
      boardCards = boardCards.filter((card) =>
        card.assignees.some((assignee) => assignee.name === 'Ana Silva'),
      );
    }

    if (boardScope === 'user') {
      boardCards = boardCards.filter((card) =>
        card.assignees.some((assignee) => assignee.name === selectedUser),
      );
    }

    return boardCards;
  }, [activeBoardId, boardScope, cards, selectedUser]);

  const boardSearchResults = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return [];
    }

    return filteredBoardCards
      .filter((card) => {
        const searchableFields = [
          card.title,
          card.description,
          ...(card.tags ?? []),
          card.client?.name ?? '',
          ...card.assignees.map((assignee) => assignee.name),
        ];

        return searchableFields.some((field) =>
          field.toLowerCase().includes(normalizedQuery),
        );
      })
      .sort((left, right) => {
        const leftIndex = left.title.toLowerCase().indexOf(normalizedQuery);
        const rightIndex = right.title.toLowerCase().indexOf(normalizedQuery);
        const safeLeftIndex = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
        const safeRightIndex = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;

        if (safeLeftIndex !== safeRightIndex) {
          return safeLeftIndex - safeRightIndex;
        }

        return left.title.localeCompare(right.title);
      });
  }, [filteredBoardCards, searchQuery]);

  const cardsByColumn = useMemo(() => {
    return visibleColumns.reduce<Record<BoardColumnId, BoardCard[]>>((acc, column) => {
      let columnCards = filteredBoardCards.filter((card) => card.columnId === column.id);

      const filterOption = columnFilters[column.id];
      if (filterOption === 'manual') {
        acc[column.id] = columnCards;
        return acc;
      }

      columnCards = [...columnCards].sort((left, right) => {
        if (filterOption === 'recent') {
          return (
            new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
          );
        }

        if (filterOption === 'oldest') {
          return (
            new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
          );
        }

        return parseBoardDate(left.dueDate).getTime() - parseBoardDate(right.dueDate).getTime();
      });

      acc[column.id] = columnCards;
      return acc;
    }, {} as Record<BoardColumnId, BoardCard[]>);
  }, [columnFilters, filteredBoardCards, visibleColumns]);

  const calendarTasks = useMemo(
    () =>
      filteredBoardCards
        .filter((card) => parseTaskDueDate(card.dueDate).date)
        .map((card) => {
          const column = getColumnById(currentBoardColumns, card.columnId);
          return {
            id: card.id,
            title: card.title,
            dueDate: card.dueDate,
            priority: card.priority,
            status: card.status,
            columnName: column?.name || 'Sem coluna',
            columnAccentColor: column?.accentColor || '#ff5623',
            assignees: card.assignees,
            clientName: card.client?.name || null,
          };
        })
        .sort(
          (left, right) =>
            parseBoardDate(left.dueDate).getTime() - parseBoardDate(right.dueDate).getTime(),
        ),
    [currentBoardColumns, filteredBoardCards],
  );

  const draggedCard = cards.find((card) => card.id === dragPreview?.cardId);
  const boardHistoryCards = useMemo(
    () =>
      cards
        .filter(
          (card) =>
            card.boardId === activeBoardId &&
            (card.resolution === 'archived' || card.resolution === 'cancelled'),
        )
        .sort((left, right) => {
          const leftDate = left.archivedAt || left.cancelledAt || left.updatedAt || left.createdAt;
          const rightDate = right.archivedAt || right.cancelledAt || right.updatedAt || right.createdAt;
          return new Date(rightDate).getTime() - new Date(leftDate).getTime();
        }),
    [cards],
  );
  const filteredHistoryCards = useMemo(
    () =>
      boardHistoryCards.filter((card) => {
        if (historyFilter === 'all') return true;
        return card.resolution === historyFilter;
      }),
    [boardHistoryCards, historyFilter],
  );
  const historyItems = useMemo<BoardHistoryListItem[]>(
    () =>
      filteredHistoryCards.map((card) => {
        const resolution = card.resolution === 'archived' ? 'archived' : 'cancelled';
        const safeAssignees = Array.isArray(card.assignees)
          ? card.assignees
              .filter((assignee) => assignee?.name)
              .map((assignee) => ({
                name: assignee.name,
                image: assignee.image,
              }))
          : [];

        return {
          id: card.id,
          title: card.title || 'Tarefa sem título',
          clientName: card.client?.name || 'Sem cliente',
          previousColumnLabel:
            getColumnById(currentBoardColumns, card.previousColumnId || card.columnId)?.name || 'Sem coluna',
          dueDateLabel: formatTaskDueDate(card.dueDate) || 'Sem prazo',
          credits: typeof card.credits === 'number' ? card.credits : null,
          assignees: safeAssignees,
          resolution,
          resolutionLabel: resolution === 'archived' ? 'Arquivada' : 'Cancelada',
          resolutionDateLabel: formatTaskHistoryEventDate(
            resolution === 'archived' ? card.archivedAt : card.cancelledAt,
          ),
          resolutionBadgeClass:
            resolution === 'archived'
              ? 'bg-[#F3F4F6] text-[#525252] dark:bg-[#222426] dark:text-[#D4D4D4]'
              : 'bg-[#FEE2E2] text-[#DC2626] dark:bg-[#311415] dark:text-[#FF8A8A]',
        };
      }),
    [currentBoardColumns, filteredHistoryCards],
  );
  const organizeLabel =
    boardScope === 'mine'
      ? 'Minhas'
      : boardScope === 'user'
        ? selectedUser.split(' ')[0] || 'Usuario'
        : 'Todas';
  const formatDateForTaskPrefill = (value: Date) =>
    `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(
      value.getDate(),
    ).padStart(2, '0')}`;
  const handleCalendarMonthChange = (nextMonth: Date) => {
    setCalendarMonth(nextMonth);
    setSelectedCalendarDate((current) => {
      if (!current) {
        return null;
      }

      if (
        current.getFullYear() === nextMonth.getFullYear() &&
        current.getMonth() === nextMonth.getMonth()
      ) {
        return current;
      }

      const safeDay = Math.min(
        current.getDate(),
        new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate(),
      );

      return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), safeDay);
    });
  };

  const handleCreateTaskFromCalendarDate = (date: Date) => {
    const selectedDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    setSelectedCalendarDate(selectedDay);
    setCalendarMonth(new Date(selectedDay.getFullYear(), selectedDay.getMonth(), 1));
    openCreateTaskModal(undefined, {
      boardId: activeBoardId,
      dueDate: formatDateForTaskPrefill(selectedDay),
    });
  };

  const toggleColumnVisibility = (columnId: BoardColumnId) => {
    setHiddenColumns((current) =>
      current.includes(columnId)
        ? current.filter((key) => key !== columnId)
        : [...current, columnId],
    );
  };

  const updateColumnFilter = (columnId: BoardColumnId, value: ColumnFilterOption) => {
    setColumnFilters((current) => ({
      ...current,
      [columnId]: current[columnId] === value ? 'manual' : value,
    }));
  };

  const handleCreateTask = (payload: CreateTaskSubmitData) => {
    const targetColumn = getColumnById(currentBoardColumns, payload.columnId);
    if (!targetColumn) {
      return;
    }

    const changedAt = new Date().toISOString();
    const nextTaskId = payload.taskId ?? `task-${Date.now()}`;
    const colorMap: Record<string, BoardCard['tagColors'][number]> = {
      '#ff5623': 'orange',
      '#3b82f6': 'blue',
      '#019364': 'green',
      '#987dfe': 'purple',
      '#ffbee9': 'pink',
      '#feba31': 'yellow',
      '#f32c2c': 'red',
      '#e5e5e5': 'gray',
    };
    const subtaskSummary = payload.subtasks.length
      ? {
          completed: payload.subtasks.filter((subtask) => subtask.done).length,
          total: payload.subtasks.length,
        }
      : undefined;

    const buildCard = (existingCard?: BoardCard): BoardCard => ({
      ...(existingCard ?? {}),
      id: payload.taskId ?? existingCard?.id ?? nextTaskId,
      boardId: payload.boardId || existingCard?.boardId || activeBoardId,
      columnId: targetColumn.id,
      createdAt: existingCard?.createdAt ?? changedAt,
      statusChangedAt: changedAt,
      updatedAt: changedAt,
      type: existingCard?.type ?? 'detailed',
      title: payload.title,
      description: payload.description || 'Nova tarefa criada no board.',
      priority: payload.priority,
      status: getTaskStatusForColumn(targetColumn),
      resolution: existingCard?.resolution ?? null,
      dueDate: payload.dueDate || existingCard?.dueDate || 'Sem prazo',
      tags: payload.tags.map((tag) => tag.label),
      tagColors: payload.tags.map((tag) => colorMap[tag.color.bg] || 'gray'),
      assignees: payload.assignees,
      clientId: payload.client || null,
      progress: subtaskSummary ? Math.round((subtaskSummary.completed / subtaskSummary.total) * 100) : existingCard?.progress ?? 0,
      showProgressBar: Boolean(subtaskSummary),
      showDateAlert: existingCard?.showDateAlert ?? false,
      credits: payload.credits,
      attachments: payload.attachments.length,
      attachmentsList: payload.attachments,
      comments: existingCard?.comments ?? 0,
      subtasks: subtaskSummary,
      subtasksList: payload.subtasks,
      client: payload.client ? { name: payload.client } : undefined,
    });

    applyCardsUpdate((current) => {
      if (payload.taskId) {
        return current.map((card) => (card.id === payload.taskId ? buildCard(card) : card));
      }

      const newCard = buildCard();
      const insertAt = current.findIndex((card) => card.columnId === targetColumn.id);
      if (insertAt === -1) {
        return [...current, newCard];
      }
      return [...current.slice(0, insertAt), newCard, ...current.slice(insertAt)];
    }, 'manual');
    if (!payload.taskId) {
      setCardsCompactState([nextTaskId]);
    }
    setCreateTaskModalOpen(false);
    setCreateTaskStartColumnId(null);
    setEditingTaskId(null);
    setCreateTaskPrefill(null);
  };

  const updateBoardMetadata = (payload: BoardUpdateInput) => {
    if (!currentBoard) {
      return;
    }

    const { snapshot } = boardsRepository.update(
      initialWorkspaceRef.current ?? createInitialKanbanWorkspaceSnapshot(),
      currentBoard.id,
      payload,
    );

    applyWorkspaceSnapshot(snapshot);
    onWorkspaceMetadataChange?.();
  };

  const handleSubmitBoardUpdate = (payload: BoardCreateInput | BoardUpdateInput) => {
    updateBoardMetadata({
      name: payload.name,
      description: payload.description,
      memberUserIds: payload.memberUserIds ?? [],
    });
    setEditBoardModalOpen(false);
  };

  const toggleBoardMember = (memberId: string) => {
    if (!currentBoard) {
      return;
    }

    const nextMemberIds = currentBoard.access.memberUserIds.includes(memberId)
      ? currentBoard.access.memberUserIds.filter((id) => id !== memberId)
      : [...currentBoard.access.memberUserIds, memberId];

    updateBoardMetadata({
      name: currentBoard.name,
      description: currentBoard.description,
      memberUserIds: nextMemberIds,
    });
  };

  const deleteCurrentBoard = () => {
    if (!currentBoard || boards.length <= 1) {
      setDeleteBoardDialogOpen(false);
      return;
    }

    const { snapshot } = boardsRepository.delete(
      initialWorkspaceRef.current ?? createInitialKanbanWorkspaceSnapshot(),
      currentBoard.id,
    );
    const fallbackBoardId = snapshot.boards[0]?.id ?? DEFAULT_BOARD_ID;
    applyWorkspaceSnapshot(snapshot, fallbackBoardId);
    onWorkspaceMetadataChange?.();
    setDeleteBoardDialogOpen(false);
    onOpenBoard?.(fallbackBoardId);
  };

  const saveColumn = () => {
    const trimmedName = columnNameInput.trim();

    if (!columnBaseStatusInput) {
      setColumnFormError('Selecione a etapa de workflow desta coluna.');
      return;
    }

    if (!trimmedName) {
      setColumnFormError('Defina um nome para a coluna.');
      return;
    }

    setColumnFormError(null);

    if (columnEditorMode === 'edit' && editingColumn) {
      applyBoardColumnsUpdate(
        (current) =>
          current.map((column) => {
            if (column.id !== editingColumn.id) {
              return column;
            }

            const stageMeta = WORKFLOW_STAGE_META[columnBaseStatusInput];
            return {
              ...column,
              name: trimmedName,
              baseStatus: columnBaseStatusInput,
              accentColor: stageMeta.accentColor,
              bgClass: stageMeta.bgClass,
              icon: stageMeta.icon,
              updatedAt: new Date().toISOString(),
            };
          }),
        'manual',
      );
      resetColumnEditor();
      return;
    }

    if (columnEditorMode === 'create') {
      const stageMeta = WORKFLOW_STAGE_META[columnBaseStatusInput];
      applyBoardColumnsUpdate(
        (current) => [
          ...current,
          {
            id: `column-${Date.now()}`,
            boardId: activeBoardId,
            name: trimmedName,
            baseStatus: columnBaseStatusInput,
            order: current.length,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            accentColor: stageMeta.accentColor,
            bgClass: stageMeta.bgClass,
            icon: stageMeta.icon,
          },
        ],
        'manual',
      );
      resetColumnEditor();
    }
  };

  const deleteColumn = (columnId: BoardColumnId) => {
    applyBoardColumnsUpdate(
      (current) => current.filter((column) => column.id !== columnId),
      'manual',
    );
  };

  const archiveColumnTasks = (columnId: BoardColumnId) => {
    applyCardsUpdate(
      (current) =>
        current.map((card) =>
        card.columnId === columnId
          ? { ...card, resolution: 'archived' }
          : card,
        ),
      'programmatic',
    );
  };

  const cancelCard = (cardId: string) => {
    const now = new Date().toISOString();
    applyCardsUpdate(
      (current) =>
        current.map((card) => {
          if (card.id !== cardId) return card;
          return {
            ...card,
            resolution: 'cancelled',
            activityLog: [
              ...(card.activityLog ?? []),
              {
                id: `activity-${now}-cancel`,
                icon: 'cancel' as const,
                actor: ACTIVE_WORKFLOW_ACTOR,
                action: 'cancelou esta tarefa',
                timestamp: now,
              },
            ],
          };
        }),
      'programmatic',
    );
  };

  const archiveCard = (cardId: string) => {
    const now = new Date().toISOString();
    applyCardsUpdate(
      (current) =>
        current.map((card) => {
          if (card.id !== cardId) return card;
          return {
            ...card,
            resolution: 'archived',
            activityLog: [
              ...(card.activityLog ?? []),
              {
                id: `activity-${now}-archive`,
                icon: 'archive' as const,
                actor: ACTIVE_WORKFLOW_ACTOR,
                action: 'arquivou esta tarefa',
                timestamp: now,
              },
            ],
          };
        }),
      'programmatic',
    );
  };

  const restoreCardFromHistory = (cardId: string) => {
    applyCardsUpdate(
      (current) =>
        current.map((card) => {
          if (card.id !== cardId) {
            return card;
          }

          const safeColumnId = getDefaultTaskColumnId(currentBoardColumns, card.columnId);
          return {
            ...card,
            columnId: safeColumnId,
            resolution: null,
          };
        }),
      'programmatic',
    );
    setCardsCompactState([cardId]);
  };

  const deleteCardPermanently = (cardId: string) => {
    setCards((current) => current.filter((card) => card.id !== cardId));
    setStatusHistory((current) => current.filter((entry) => entry.taskId !== cardId));
    statusHistoryRef.current = statusHistoryRef.current.filter((entry) => entry.taskId !== cardId);
    setSelectedCard((current) => (current?.id === cardId ? null : current));
    setHistoryDeleteCandidate((current) => (current?.id === cardId ? null : current));
    setBoards((currentBoards) =>
      currentBoards.map((board) =>
        board.id === activeBoardId
          ? { ...board, updatedAt: new Date().toISOString() }
          : board,
      ),
    );
  };

  const duplicateCard = (cardId: string) => {
    const duplicatedCardId = `${cardId}-copy-${Date.now()}`;
    applyCardsUpdate((current) => {
      const source = current.find((card) => card.id === cardId);
      if (!source) {
        return current;
      }

      return [
        {
          ...source,
          id: duplicatedCardId,
          title: `${source.title} (copia)`,
          createdAt: new Date().toISOString().slice(0, 10),
          statusChangedAt: new Date().toISOString(),
          resolution: source.status === 'done' ? 'completed' : null,
        },
        ...current,
      ];
    }, 'programmatic');
    setCardsCompactState([duplicatedCardId]);
  };

  const copyCardLink = async (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    const boardId = card?.boardId ?? activeBoardId;
    const params = new URLSearchParams({ board: boardId, card: cardId });
    const link = `${window.location.origin}${window.location.pathname}#/kanban-workspace?${params.toString()}`;

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(link);
    }
  };

  const sendCardToBoard = (cardId: string, targetBoardId: string, targetColumnId: string) => {
    const now = new Date().toISOString();
    const targetBoard = boards.find((b) => b.id === targetBoardId);
    const targetColumn = boardColumns.find((col) => col.id === targetColumnId);
    const targetBoardName = targetBoard?.name ?? 'outro board';
    const targetColumnName = targetColumn?.name ?? 'coluna desconhecida';
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
            statusChangedAt: now,
            updatedAt: now,
            activityLog: [
              ...(card.activityLog ?? []),
              {
                id: `activity-${now}-send`,
                icon: 'send' as const,
                actor: ACTIVE_WORKFLOW_ACTOR,
                action: `enviou esta tarefa para o board "${targetBoardName}", coluna "${targetColumnName}"`,
                timestamp: now,
              },
            ],
          };
        }),
      'programmatic',
    );
    setCardsCompactState([cardId]);
    setSendToBoardModal({ open: false, card: null });
  };

  const setCardsCompactState = (
    cardIds: string[],
    mode: 'compact' | 'preserve' = 'compact',
  ) => {
    if (mode === 'preserve' || cardIds.length === 0) {
      return;
    }

    setCompactCardIds((current) => {
      const next = new Set(current);
      cardIds.forEach((cardId) => next.add(cardId));
      return [...next];
    });
  };

  const getCompletedColumnId = () =>
    currentBoardColumns.find((column) => column.baseStatus === 'done')?.id || 'column-done';

  const toggleCompactCard = (cardId: string) => {
    setCompactCardIds((current) =>
      current.includes(cardId)
        ? current.filter((id) => id !== cardId)
        : [...current, cardId],
    );
  };

  const moveColumnToPosition = (
    currentColumns: BoardColumn[],
    movingColumnId: BoardColumnId,
    targetColumnId: BoardColumnId,
    placement: 'before' | 'after' = 'after',
  ) => {
    if (movingColumnId === targetColumnId) {
      return currentColumns;
    }

    const movingColumn = currentColumns.find((column) => column.id === movingColumnId);
    if (!movingColumn) {
      return currentColumns;
    }

    const remainingColumns = currentColumns.filter((column) => column.id !== movingColumnId);
    const targetIndex = remainingColumns.findIndex((column) => column.id === targetColumnId);
    if (targetIndex === -1) {
      return currentColumns;
    }

    const insertIndex = placement === 'before' ? targetIndex : targetIndex + 1;
    const nextColumns = [...remainingColumns];
    nextColumns.splice(insertIndex, 0, movingColumn);
    return nextColumns;
  };

  const handleColumnDragStart = (
    columnId: BoardColumnId,
    event: React.DragEvent<HTMLElement>,
  ) => {
    event.stopPropagation();
    event.dataTransfer.effectAllowed = 'move';
    const emptyImage = new Image();
    emptyImage.src = EMPTY_DRAG_IMAGE_SRC;
    event.dataTransfer.setDragImage(emptyImage, 0, 0);
    setDraggedColumnId(columnId);
    setColumnDropIndicator(null);
  };

  const handleColumnDragOver = (
    targetColumnId: BoardColumnId,
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    if (!draggedColumnId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const rect = event.currentTarget.getBoundingClientRect();
    const placement = event.clientX < rect.left + rect.width / 2 ? 'before' : 'after';

    if (draggedColumnId === targetColumnId) {
      setColumnDropIndicator(null);
      return;
    }

    setColumnDropIndicator({
      targetColumnId,
      placement,
    });
  };

  const clearColumnDragState = () => {
    setDraggedColumnId(null);
    setColumnDropIndicator(null);
  };

  const handleColumnDrop = (
    targetColumnId: BoardColumnId,
    placement: 'before' | 'after' = 'after',
  ) => {
    if (!draggedColumnId) {
      return;
    }

    applyBoardColumnsUpdate(
      (current) => moveColumnToPosition(current, draggedColumnId, targetColumnId, placement),
      'manual',
    );
    clearColumnDragState();
  };

  const handleDragStart = (
    cardId: string,
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    const emptyImage = new Image();
    emptyImage.src = EMPTY_DRAG_IMAGE_SRC;
    event.dataTransfer.setDragImage(emptyImage, 0, 0);
    setDraggedCardId(cardId);
    setDragPreview({
      cardId,
      x: event.clientX + 16,
      y: event.clientY + 16,
    });
  };

  const handleDrag = (event: React.DragEvent<HTMLDivElement>) => {
    if (!draggedCardId || (event.clientX === 0 && event.clientY === 0)) {
      return;
    }

    setDragPreview({
      cardId: draggedCardId,
      x: event.clientX + 16,
      y: event.clientY + 16,
    });
  };

  const moveCardToPosition = (
    currentCards: BoardCard[],
    movingCardId: string,
    destinationColumnId: BoardColumnId,
    targetCardId?: string | null,
    placement: 'before' | 'after' = 'after',
  ) => {
    const movingCard = currentCards.find((card) => card.id === movingCardId);
    if (!movingCard) {
      return currentCards;
    }

    const remainingCards = currentCards.filter((card) => card.id !== movingCardId);
    const cardsFromOtherBoards = remainingCards.filter((card) => card.boardId !== activeBoardId);
    const currentBoardCards = remainingCards.filter((card) => card.boardId === activeBoardId);
    const hiddenCards = currentBoardCards.filter((card) => !isBoardTaskVisible(card));
    const activeCards = currentBoardCards.filter((card) => isBoardTaskVisible(card));

    const columnsMap = currentBoardColumns.reduce<Record<BoardColumnId, BoardCard[]>>(
      (acc, column) => {
        acc[column.id] = activeCards.filter((card) => card.columnId === column.id);
        return acc;
      },
      {} as Record<BoardColumnId, BoardCard[]>,
    );

    const destinationList = [...(columnsMap[destinationColumnId] || [])];
    const destinationColumn = getColumnById(currentBoardColumns, destinationColumnId);
    const sourceColumn = getColumnById(currentBoardColumns, movingCard.columnId);
    const columnChanged = movingCard.columnId !== destinationColumnId;
    const now = new Date().toISOString();
    const dragActivityEntry = columnChanged
      ? {
          id: `activity-${now}-move`,
          icon: 'move' as const,
          actor: ACTIVE_WORKFLOW_ACTOR,
          action: `moveu de "${sourceColumn?.name ?? movingCard.columnId}" para "${destinationColumn?.name ?? destinationColumnId}"`,
          timestamp: now,
        }
      : null;
    const nextCard = normalizeCardForBoardState({
      ...movingCard,
      columnId: destinationColumnId,
      previousColumnId: destinationColumnId,
      previousStatus: destinationColumn
        ? getTaskStatusForColumn(destinationColumn)
        : movingCard.status,
      activityLog: dragActivityEntry
        ? [...(movingCard.activityLog ?? []), dragActivityEntry]
        : (movingCard.activityLog ?? []),
    }, boardColumns, movingCard, now);

    if (!targetCardId) {
      destinationList.push(nextCard);
    } else {
      const targetIndex = destinationList.findIndex((card) => card.id === targetCardId);
      const insertIndex =
        targetIndex === -1
          ? destinationList.length
          : placement === 'before'
            ? targetIndex
            : targetIndex + 1;
      destinationList.splice(insertIndex, 0, nextCard);
    }

    columnsMap[destinationColumnId] = destinationList;

    return [
      ...cardsFromOtherBoards,
      ...currentBoardColumns.flatMap((column) => columnsMap[column.id] || []),
      ...hiddenCards,
    ];
  };

  const handleDrop = (
    columnId: BoardColumnId,
    targetCardId?: string | null,
    placement: 'before' | 'after' = 'after',
  ) => {
    if (!draggedCardId) {
      return;
    }

    applyCardsUpdate(
      (current) =>
        moveCardToPosition(current, draggedCardId, columnId, targetCardId, placement),
      'drag-and-drop',
    );
    setDraggedCardId(null);
    setDragOverColumn(null);
    setDropIndicator(null);
    setDragPreview(null);
  };

  const clearDragState = () => {
    setDraggedCardId(null);
    setDragOverColumn(null);
    setDropIndicator(null);
    setDragPreview(null);
  };

  const handleBoardMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest('[data-no-pan="true"]')) {
      return;
    }

    const container = boardScrollRef.current;
    if (!container) {
      return;
    }

    panStateRef.current = {
      isPanning: true,
      startX: event.clientX,
      startScrollLeft: container.scrollLeft,
      moved: false,
    };

    container.classList.add('is-panning');
  };

  const handleBoardMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const container = boardScrollRef.current;
    if (!container || !panStateRef.current.isPanning) {
      return;
    }

    const deltaX = event.clientX - panStateRef.current.startX;
    if (Math.abs(deltaX) > 3) {
      panStateRef.current.moved = true;
      suppressCardClickRef.current = true;
    }

    container.scrollLeft = panStateRef.current.startScrollLeft - deltaX;
    event.preventDefault();
  };

  const stopBoardPan = () => {
    const container = boardScrollRef.current;
    if (container) {
      container.classList.remove('is-panning');
    }
    panStateRef.current.isPanning = false;
  };

  const toggleCardComplete = (cardId: string) => {
    const targetCard = cards.find((card) => card.id === cardId);
    if (!targetCard) {
      return;
    }

    if (completingCardIds.includes(cardId) || movingCardIds.includes(cardId)) {
      return;
    }

    if (targetCard.status === 'done' && targetCard.resolution === 'completed') {
      applyCardsUpdate(
        (current) =>
          current.map((card) => {
          if (card.id !== cardId) {
            return card;
          }

          return {
            ...card,
            columnId: card.previousColumnId || 'column-todo',
            progress: card.previousProgress ?? card.progress,
            resolution: null,
          };
          }),
        'programmatic',
      );
      return;
    }

    const completedColumnId = getCompletedColumnId();
    setCompletingCardIds((current) => [...current, cardId]);
    window.setTimeout(() => {
      applyCardsUpdate(
        (current) =>
          current.map((card) => {
          if (card.id !== cardId) {
            return card;
          }

          return {
            ...card,
            previousColumnId: card.columnId,
            previousStatus: card.status,
            previousProgress: card.progress,
            progress: 100,
            resolution: null,
          };
          }),
        'programmatic',
      );
      setMovingCardIds((current) => [...current, cardId]);
      setCompletingCardIds((current) =>
        current.filter((currentId) => currentId !== cardId),
      );
    }, 360);

    window.setTimeout(() => {
      applyCardsUpdate(
        (current) =>
          current.map((card) => {
          if (card.id !== cardId) {
            return card;
          }

          const now = new Date().toISOString();
          return {
            ...card,
            columnId: completedColumnId,
            progress: 100,
            resolution: 'completed',
            activityLog: [
              ...(card.activityLog ?? []),
              {
                id: `activity-${now}-complete`,
                icon: 'complete' as const,
                actor: ACTIVE_WORKFLOW_ACTOR,
                action: 'marcou esta tarefa como concluída',
                timestamp: now,
              },
            ],
          };
          }),
        'programmatic',
      );
      setCardsCompactState([cardId]);
      setMovingCardIds((current) =>
        current.filter((currentId) => currentId !== cardId),
      );
    }, 960);
  };

  const toggleCardSubtask = (cardId: string, subtaskId: string) => {
    applyCardsUpdate(
      (current) =>
        current.map((card) => {
          if (card.id !== cardId) {
            return card;
          }

          const nextSubtasksList = (card.subtasksList ?? []).map((subtask, index) => {
            const normalizedId = subtask.id ?? `subtask-${index}`;
            return normalizedId === subtaskId
              ? { ...subtask, id: normalizedId, done: !subtask.done }
              : { ...subtask, id: normalizedId };
          });

          const completed = nextSubtasksList.filter((subtask) => subtask.done).length;
          const total = nextSubtasksList.length;

          return {
            ...card,
            subtasksList: nextSubtasksList,
            subtasks: total > 0 ? { completed, total } : undefined,
            progress: total > 0 ? Math.round((completed / total) * 100) : card.progress,
            showProgressBar: total > 0,
            updatedAt: new Date().toISOString(),
          };
        }),
      'manual',
    );
  };

  const modalTask = selectedCard
    ? {
        columnId: selectedCard.columnId,
        title: selectedCard.title,
        description: selectedCard.description,
        priority: selectedCard.priority,
        status: selectedCard.status,
        statusLabel: getColumnById(currentBoardColumns, selectedCard.columnId)?.name,
        subtasks: selectedCard.subtasks,
        subtasksList: selectedCard.subtasksList?.map((subtask) => ({
          id: subtask.id,
          title: subtask.title,
          done: subtask.done,
          dueDate: subtask.dueDate,
          assignee: subtask.assignee,
        })),
        progress: selectedCard.progress,
        dueDate: selectedCard.dueDate,
        dateAlert: selectedCard.dateAlert,
        tags: selectedCard.tags.map((label, index) => ({
          label,
          color: selectedCard.tagColors?.[index] || 'gray',
        })),
        assignees: selectedCard.assignees,
        attachments: selectedCard.attachments,
        attachmentsList: selectedCard.attachmentsList,
        comments: [
          {
            id: 'c1',
            author: selectedCard.assignees[0] || { name: 'Ana Silva' },
            text: 'Card em acompanhamento dentro do board.',
            timestamp: 'Hoje as 10:20',
          },
        ],
        credits: selectedCard.credits,
        client: selectedCard.client?.name,
        clientId: selectedCard.clientId,
        createdAt: formatTaskCreatedAt(selectedCard.createdAt),
        activityLog: selectedCard.activityLog ?? [],
      }
    : null;

  const editingTask = editingTaskId
    ? cards.find((card) => card.id === editingTaskId) ?? null
    : null;

  const editingTaskInitialData: CreateTaskInitialData | null = editingTask
    ? {
        taskId: editingTask.id,
        boardId: editingTask.boardId,
        columnId: editingTask.columnId,
        title: editingTask.title,
        description: editingTask.description,
        priority: editingTask.priority,
        dueDate: editingTask.dueDate,
        credits: editingTask.credits ?? 0,
        client: editingTask.client?.name ?? '',
        assignees: editingTask.assignees,
        tags: editingTask.tags.map((label, index) => ({
          label,
          color: (
            [
              { bg: '#ff5623', text: '#ffffff', label: 'Laranja' },
              { bg: '#feba31', text: '#7c3a00', label: 'Amarelo' },
              { bg: '#019364', text: '#ffffff', label: 'Verde' },
              { bg: '#987dfe', text: '#ffffff', label: 'Roxo' },
              { bg: '#3b82f6', text: '#ffffff', label: 'Azul' },
              { bg: '#f32c2c', text: '#ffffff', label: 'Vermelho' },
              { bg: '#ffbee9', text: '#9d174d', label: 'Rosa' },
              { bg: '#e5e5e5', text: '#525252', label: 'Cinza' },
            ].find((color) => {
              const mapped = {
                orange: '#ff5623',
                blue: '#3b82f6',
                green: '#019364',
                purple: '#987dfe',
                pink: '#ffbee9',
                yellow: '#feba31',
                red: '#f32c2c',
                gray: '#e5e5e5',
              }[editingTask.tagColors?.[index] ?? 'gray'];
              return color.bg === mapped;
            }) ?? { bg: '#e5e5e5', text: '#525252', label: 'Cinza' }
          ),
        })),
        subtasks: editingTask.subtasksList ?? [],
        attachments: editingTask.attachmentsList ?? [],
      }
    : null;
  const createTaskInitialData = editingTaskInitialData ?? createTaskPrefill;

  const renderCard = (card: BoardCard) => {
    const isCompleting = completingCardIds.includes(card.id);
    const isMovingToCompleted = movingCardIds.includes(card.id);
    const isCompact = compactCardIds.includes(card.id);
    const handleOpenCard = () => {
      if (suppressCardClickRef.current) {
        suppressCardClickRef.current = false;
        return;
      }
      if (isCompleting || isMovingToCompleted) {
        return;
      }
      setSelectedCard(card);
    };

    const cardActions = (
      <div data-no-pan="true" className="flex items-center gap-1">
        <button
          className="opacity-0 group-hover:opacity-100 rounded-md p-1 transition-all hover:bg-[#f5f5f5] dark:hover:bg-[#232325]"
          onClick={(event) => {
            event.stopPropagation();
            toggleCompactCard(card.id);
          }}
        >
          {isCompact ? (
            <Maximize2 className="h-4 w-4 text-[#a3a3a3]" />
          ) : (
            <Minimize2 className="h-4 w-4 text-[#a3a3a3]" />
          )}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="opacity-0 group-hover:opacity-100 rounded-md p-1 transition-all hover:bg-[#f5f5f5] dark:hover:bg-[#232325]"
              onClick={(event) => event.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4 text-[#a3a3a3]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52 rounded-2xl border-[#E5E7E4] bg-white p-2 dark:border-[#2D2F30] dark:bg-[#171819]"
            onClick={(event) => event.stopPropagation()}
          >
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                openEditTaskModal(card);
              }}
              className="rounded-xl px-3 py-2.5"
            >
              <Pencil className="h-4 w-4" />
              Editar tarefa
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                duplicateCard(card.id);
              }}
              className="rounded-xl px-3 py-2.5"
            >
              <Copy className="h-4 w-4" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                void copyCardLink(card.id);
              }}
              className="rounded-xl px-3 py-2.5"
            >
              <Link2 className="h-4 w-4" />
              Copiar link
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                setSendToBoardModal({ open: true, card });
              }}
              className="rounded-xl px-3 py-2.5"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Enviar para outro board
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                cancelCard(card.id);
              }}
              className="rounded-xl px-3 py-2.5"
            >
              <Trash2 className="h-4 w-4" />
              Cancelar tarefa
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                archiveCard(card.id);
              }}
              className="rounded-xl px-3 py-2.5"
            >
              <Archive className="h-4 w-4" />
              Arquivar tarefa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );

    if (isCompact) {
      return (
        <div className="group relative">
          <TaskCard
            title={card.title}
            status={card.status}
            assignee={{
              name: card.assignees[0]?.name || 'Sem responsavel',
              avatar: card.assignees[0]?.image,
            }}
            dueDate={card.dueDate}
            commentsCount={card.comments}
            attachmentsCount={card.attachments}
            priority={card.priority === 'urgent' ? 'high' : card.priority}
            credits={card.credits}
            actions={cardActions}
            hideDescription
            showCompleteButton
            onToggleComplete={() => toggleCardComplete(card.id)}
            isCompleting={isCompleting}
            onClick={handleOpenCard}
          />
        </div>
      );
    }

    return (
      <DetailedTaskCard
        title={card.title}
        description={card.description}
        priority={card.priority}
        status={card.status}
        subtasks={card.subtasks}
        progress={card.progress}
        showProgressBar={card.showProgressBar ?? true}
        showDateAlert={card.showDateAlert ?? true}
        dueDate={card.dueDate}
        dateAlert={card.dateAlert}
        tags={card.tags.map((label, index) => ({
          label,
          color: card.tagColors?.[index] || 'gray',
        }))}
        assignees={card.assignees}
        attachments={card.attachments}
        comments={card.comments}
        credits={card.credits}
        client={card.client}
        actions={cardActions}
        onClick={handleOpenCard}
        onToggleComplete={() => toggleCardComplete(card.id)}
        isCompleting={isCompleting}
        isMovingToCompleted={isMovingToCompleted}
      />
    );
  };

  return (
    <section className="min-h-screen bg-[#F6F8F6] px-0 dark:bg-[#0f0f10]">
      <div className="flex min-h-screen items-start">
        {false && (
        <aside
          className={cn(
            'sticky top-0 h-screen shrink-0 overflow-hidden border-r border-[#E5E7E4] bg-white dark:border-[#232425] dark:bg-[#121313] transition-all',
            collapsedSidebar ? 'w-[84px]' : 'w-[252px]',
          )}
        >
          <div className="flex h-full flex-col p-4">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#ff5623] text-white shadow-[0_14px_34px_-18px_rgba(255,86,35,0.8)]">
                  <FolderKanban className="h-5 w-5" />
                </div>
                {!collapsedSidebar && (
                  <div>
                    <p className="text-sm font-semibold text-[#171717] dark:text-white">
                      WePlanner
                    </p>
                    <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                      Workspace
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setCollapsedSidebar((current) => !current)}
                className="rounded-xl p-2 text-[#737373] transition-colors hover:bg-[#F6F8F6] dark:text-[#A3A3A3] dark:hover:bg-[#1A1B1C]"
              >
                {collapsedSidebar ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Visao geral', icon: LayoutDashboard, active: false },
                { label: 'Board', icon: FolderKanban, active: true },
                { label: 'Equipe', icon: Users, active: false },
              ].map((item) => (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="rounded-2xl border-[#E5E7E4] bg-white text-[#171717] hover:bg-[#F6F8F6] dark:border-[#2D2F30] dark:bg-[#171819] dark:text-white dark:hover:bg-[#1E2021]"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-[220px] rounded-2xl border-[#E5E7E4] bg-white p-2 dark:border-[#2D2F30] dark:bg-[#171819]"
                    >
                      <DropdownMenuLabel>Configurações do board</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setEditBoardModalOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar board
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setBoardMembersOpen(true)}>
                        <Users className="mr-2 h-4 w-4" />
                        Gerenciar membros
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={boards.length <= 1}
                        onClick={() => setDeleteBoardDialogOpen(true)}
                        className="text-[#dc2626] focus:text-[#dc2626] dark:text-[#ffb4b8] dark:focus:text-[#ffb4b8]"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir board
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                {canManageBoards && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="rounded-2xl border-[#E5E7E4] bg-white text-[#171717] hover:bg-[#F6F8F6] dark:border-[#2D2F30] dark:bg-[#171819] dark:text-white dark:hover:bg-[#1E2021]"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-[220px] rounded-2xl border-[#E5E7E4] bg-white p-2 dark:border-[#2D2F30] dark:bg-[#171819]"
                    >
                      <DropdownMenuLabel>Configurações do board</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setEditBoardModalOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar board
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setBoardMembersOpen(true)}>
                        <Users className="mr-2 h-4 w-4" />
                        Gerenciar membros
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={boards.length <= 1}
                        onClick={() => setDeleteBoardDialogOpen(true)}
                        className="text-[#dc2626] focus:text-[#dc2626] dark:text-[#ffb4b8] dark:focus:text-[#ffb4b8]"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir board
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <button
                  key={item.label}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-colors',
                    item.active
                      ? 'bg-[#F6F8F6] text-[#171717] dark:bg-[#1A1B1C] dark:text-white'
                      : 'text-[#525252] hover:bg-[#F6F8F6] dark:text-[#A3A3A3] dark:hover:bg-[#1A1B1C]',
                    collapsedSidebar && 'justify-center',
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsedSidebar && <span>{item.label}</span>}
                </button>
                </>
              ))}
            </div>

            <div className="mt-auto space-y-2">
              {onBackToDesignSystem && (
                <Button
                  variant="outline"
                  className={cn(
                    'w-full rounded-2xl dark:border-[#2D2F30]',
                    collapsedSidebar && 'px-0',
                  )}
                  onClick={onBackToDesignSystem}
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  {!collapsedSidebar && 'Design System'}
                </Button>
              )}
            </div>
          </div>
        </aside>
        )}

        <div className="min-w-0 flex-1 bg-[#F6F8F6] dark:bg-[#0f0f10] flex flex-col">
          <div className="border-b border-[#E5E7E4] px-6 py-6 dark:border-[#232425]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="min-w-0 text-3xl font-bold tracking-tight text-[#171717] dark:text-white">
                    {currentBoard?.name || 'Meu quadro'}
                  </h1>
                  <div className="relative" ref={boardMembersRef} data-no-pan="true">
                    <button
                      type="button"
                      onClick={() => canManageBoards && setBoardMembersOpen((current) => !current)}
                      className={cn(
                        'rounded-2xl border border-transparent transition-colors',
                        canManageBoards && 'hover:border-[#E5E7E4] hover:bg-white/70 dark:hover:border-[#2D2F30] dark:hover:bg-[#171819]',
                      )}
                    >
                      <AvatarStack avatars={currentBoardMembers} max={5} size="md" />
                    </button>

                    {canManageBoards && boardMembersOpen && (
                      <div className="absolute left-0 top-[calc(100%+12px)] z-[90] w-[380px] rounded-[24px] border border-[#E5E7E4] bg-white p-4 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.35)] dark:border-[#2D2F30] dark:bg-[#121313]">
                        <div className="mb-3">
                          <p className="text-sm font-semibold text-[#171717] dark:text-white">
                            Gerenciar membros do board
                          </p>
                          <p className="mt-1 text-xs text-[#737373] dark:text-[#A3A3A3]">
                            Adicione ou remova usuários deste board sem sair do quadro.
                          </p>
                        </div>

                        <div className="relative">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#A3A3A3]" />
                          <Input
                            value={boardMemberSearch}
                            onChange={(event) => setBoardMemberSearch(event.target.value)}
                            placeholder="Buscar membros..."
                            className="h-10 rounded-2xl border-[#E5E7E4] bg-white pl-9 dark:border-[#2D2F30] dark:bg-[#171819]"
                          />
                        </div>

                        <div className="mt-3 max-h-[280px] space-y-2 overflow-y-auto pr-1">
                          {filteredBoardMemberDirectory.map((member) => {
                            const isSelected = currentBoard?.access.memberUserIds.includes(member.id ?? '');
                            return (
                              <button
                                key={member.id ?? member.name}
                                type="button"
                                onClick={() => toggleBoardMember(member.id ?? '')}
                                className={cn(
                                  'flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-left transition-colors',
                                  isSelected
                                    ? 'border-[#ff5623] bg-[#FFF4EE] dark:border-[#ff8c69] dark:bg-[#26150f]'
                                    : 'border-[#E5E7E4] bg-white hover:bg-[#F6F8F6] dark:border-[#2D2F30] dark:bg-[#171819] dark:hover:bg-[#1A1B1C]',
                                )}
                              >
                                <div className="flex min-w-0 items-center gap-3">
                                  <Avatar className="h-9 w-9">
                                    <AvatarImage src={member.image} alt={member.name} />
                                    <AvatarFallback
                                      className="text-[10px] font-semibold text-white"
                                      style={{ backgroundColor: member.color ?? '#ff5623' }}
                                    >
                                      {member.name
                                        .split(' ')
                                        .map((part) => part[0])
                                        .join('')
                                        .slice(0, 2)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-[#171717] dark:text-white">
                                      {member.name}
                                    </p>
                                    <p className="truncate text-[11px] text-[#A3A3A3]">
                                      {member.role || 'Membro'}
                                    </p>
                                  </div>
                                </div>
                                {isSelected ? (
                                  <span className="text-xs font-semibold text-[#c2410c] dark:text-[#ffb39c]">
                                    Remover
                                  </span>
                                ) : (
                                  <span className="text-xs font-semibold text-[#525252] dark:text-[#D4D4D4]">
                                    Adicionar
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {currentBoard?.description && (
                  <p className="mt-2 max-w-[56ch] text-sm leading-6 text-[#737373] dark:text-[#A3A3A3]">
                    {currentBoard.description}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  data-no-pan="true"
                  className={cn(
                    'h-11 w-11 rounded-2xl border-[#E5E7E4] bg-white p-0 text-[#171717] hover:bg-[#F6F8F6] dark:border-[#2D2F30] dark:bg-[#171819] dark:text-white dark:hover:bg-[#1E2021]',
                    (searchPanelOpen || searchQuery) &&
                      'border-[#ff5623]/40 bg-[#FFF4EE] text-[#c2410c] dark:border-[#ff8c69]/35 dark:bg-[#26150f] dark:text-[#ffb39c]',
                  )}
                  onClick={() => {
                    if (searchPanelOpen) {
                      setSearchPanelOpen(false);
                      setSearchQuery('');
                      return;
                    }
                    setSearchPanelOpen(true);
                  }}
                >
                  <Search className="h-4 w-4" />
                </Button>
                <div ref={organizeMenuRef} className="relative" data-no-pan="true">
                  <button
                    type="button"
                    onClick={() => setOrganizeMenuOpen((current) => !current)}
                    className="flex h-10 items-center gap-2 rounded-2xl border border-[#E5E7E4] bg-white px-3.5 text-sm font-medium text-[#171717] transition-colors hover:bg-[#F6F8F6] dark:border-[#2D2F30] dark:bg-[#171819] dark:text-[#F5F5F5] dark:hover:bg-[#1E2021]"
                  >
                    <ArrowDownWideNarrow className="h-3.5 w-3.5" />
                    <span>Organizar por: {organizeLabel}</span>
                    <ChevronsUpDown className="h-3.5 w-3.5 opacity-60" />
                  </button>

                  {organizeMenuOpen && (
                    <div className="absolute right-0 top-[calc(100%+10px)] z-[90] w-[320px] rounded-[24px] border border-[#E5E7E4] bg-white p-2 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.35)] dark:border-[#2D2F30] dark:bg-[#121313]">
                      <div className="px-3 py-2 text-sm font-semibold text-[#171717] dark:text-white">
                        Visualizacao do quadro
                      </div>
                      <div className="space-y-1 border-t border-[#F1F3F1] px-1 pt-2 dark:border-[#232425]">
                        <button
                          onClick={() => {
                            setBoardScope('all');
                            setOrganizeMenuOpen(false);
                          }}
                          className={cn(
                            'flex w-full items-center rounded-2xl px-3 py-2.5 text-left text-sm transition-colors',
                            boardScope === 'all'
                              ? 'bg-[#FFF4EE] text-[#c2410c] dark:bg-[#26150f] dark:text-[#ffb39c]'
                              : 'text-[#525252] hover:bg-[#F6F8F6] dark:text-[#D4D4D4] dark:hover:bg-[#1A1B1C]',
                          )}
                        >
                          Todas as tarefas
                        </button>
                        <button
                          onClick={() => {
                            setBoardScope('mine');
                            setOrganizeMenuOpen(false);
                          }}
                          className={cn(
                            'flex w-full items-center rounded-2xl px-3 py-2.5 text-left text-sm transition-colors',
                            boardScope === 'mine'
                              ? 'bg-[#FFF4EE] text-[#c2410c] dark:bg-[#26150f] dark:text-[#ffb39c]'
                              : 'text-[#525252] hover:bg-[#F6F8F6] dark:text-[#D4D4D4] dark:hover:bg-[#1A1B1C]',
                          )}
                        >
                          Minhas tarefas
                        </button>
                      </div>
                      <div className="mt-2 border-t border-[#F1F3F1] px-1 pt-2 dark:border-[#232425]">
                        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A3A3A3]">
                          Selecionar usuario
                        </p>
                        <div className="space-y-1">
                          {TEAM.map((member) => (
                            <button
                              key={member.name}
                              onClick={() => {
                                setSelectedUser(member.name);
                                setBoardScope('user');
                                setOrganizeMenuOpen(false);
                              }}
                              className={cn(
                                'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition-colors',
                                boardScope === 'user' && selectedUser === member.name
                                  ? 'bg-[#FFF4EE] text-[#c2410c] dark:bg-[#26150f] dark:text-[#ffb39c]'
                                  : 'text-[#525252] hover:bg-[#F6F8F6] dark:text-[#D4D4D4] dark:hover:bg-[#1A1B1C]',
                              )}
                            >
                              <img
                                src={member.image}
                                alt={member.name}
                                className="h-7 w-7 rounded-full object-cover"
                              />
                              <span className="font-medium">{member.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className="inline-flex items-center gap-1 rounded-2xl border border-[#E5E7E4] bg-white/90 p-1 dark:border-[#2D2F30] dark:bg-[#171819]"
                  data-no-pan="true"
                >
                  <button
                    type="button"
                    onClick={() => setBoardViewMode('kanban')}
                    className={cn(
                      'inline-flex h-9 items-center gap-2 rounded-xl transition-all',
                      boardViewMode === 'kanban'
                        ? 'bg-[#FFF4EE] px-3 text-sm font-medium text-[#c2410c] shadow-[0_12px_24px_-18px_rgba(255,86,35,0.65)] dark:bg-[#26150f] dark:text-[#ffb39c]'
                        : 'w-9 justify-center text-[#737373] hover:bg-[#F6F8F6] dark:text-[#A3A3A3] dark:hover:bg-[#1A1B1C]',
                    )}
                  >
                    <FolderKanban className="h-4 w-4" />
                    {boardViewMode === 'kanban' ? <span>Kanban</span> : null}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBoardViewMode('calendar')}
                    className={cn(
                      'inline-flex h-9 items-center gap-2 rounded-xl transition-all',
                      boardViewMode === 'calendar'
                        ? 'bg-[#FFF4EE] px-3 text-sm font-medium text-[#c2410c] shadow-[0_12px_24px_-18px_rgba(255,86,35,0.65)] dark:bg-[#26150f] dark:text-[#ffb39c]'
                        : 'w-9 justify-center text-[#737373] hover:bg-[#F6F8F6] dark:text-[#A3A3A3] dark:hover:bg-[#1A1B1C]',
                    )}
                  >
                    <Calendar className="h-4 w-4" />
                    {boardViewMode === 'calendar' ? <span>Calendário</span> : null}
                  </button>
                </div>
                <Button
                  className="rounded-2xl bg-[#ff5623] text-white hover:bg-[#c2410c]"
                  onClick={() => openCreateTaskModal()}
                >
                  <Plus className="h-4 w-4" />
                  Criar tarefa
                </Button>
                <Button
                  className="rounded-2xl bg-[#171717] text-white hover:bg-[#2c2c2c] dark:bg-white dark:text-[#171717] dark:hover:bg-[#e8e8e8]"
                  onClick={openCreateColumnDialog}
                >
                  <Plus className="h-4 w-4" />
                  Criar coluna
                </Button>
                <div ref={boardNotificationsRef} className="relative" data-no-pan="true">
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      'relative rounded-2xl border-[#E5E7E4] bg-white text-[#171717] hover:bg-[#F6F8F6] dark:border-[#2D2F30] dark:bg-[#171819] dark:text-white dark:hover:bg-[#1E2021]',
                      boardNotificationsOpen &&
                        'border-[#ffcfbf] bg-[#FFF4EE] text-[#c2410c] hover:bg-[#FFF4EE] dark:border-[#513126] dark:bg-[#26150f] dark:text-[#ffb39c] dark:hover:bg-[#26150f]',
                    )}
                    onClick={() => setBoardNotificationsOpen((current) => !current)}
                  >
                    <Bell className="h-4 w-4" />
                    {currentBoardUnreadNotificationCount > 0 ? (
                      <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f32c2c] px-1 text-[10px] font-bold text-white shadow-[0_8px_18px_-10px_rgba(243,44,44,0.95)]">
                        {currentBoardUnreadNotificationCount > 9
                          ? '9+'
                          : currentBoardUnreadNotificationCount}
                      </span>
                    ) : null}
                  </Button>

                  {boardNotificationsOpen && (
                    <BoardNotificationsPopover
                      boardName={currentBoard?.name || 'Meu quadro'}
                      notifications={currentBoardNotifications}
                      unreadCount={currentBoardUnreadNotificationCount}
                      onOpenNotification={(notification) => {
                        onOpenNotification?.(notification);
                      }}
                      onMarkAllRead={() => {
                        onMarkBoardNotificationsRead?.(activeBoardId);
                      }}
                      onClose={() => setBoardNotificationsOpen(false)}
                    />
                  )}
                </div>
                <div ref={boardSettingsRef} className="relative" data-no-pan="true">
                  <Button
                    variant="outline"
                    className="rounded-2xl border-[#E5E7E4] bg-white text-[#171717] hover:bg-[#F6F8F6] dark:border-[#2D2F30] dark:bg-[#171819] dark:text-white dark:hover:bg-[#1E2021]"
                    onClick={() => setBoardSettingsOpen((current) => !current)}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>

                  {boardSettingsOpen && (
                    <div className="absolute right-0 top-[calc(100%+10px)] z-[95] w-[220px] rounded-2xl border border-[#E5E7E4] bg-white p-2 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.35)] dark:border-[#2D2F30] dark:bg-[#171819]">
                      <div className="px-3 py-2 text-sm font-semibold text-[#171717] dark:text-white">
                        Configuracoes do board
                      </div>
                      <div className="my-1 h-px bg-[#F1F3F1] dark:bg-[#232425]" />
                      <button
                        type="button"
                        onClick={() => {
                          setHistoryModalOpen(true);
                          setBoardSettingsOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-[#525252] transition-colors hover:bg-[#F6F8F6] dark:text-[#D4D4D4] dark:hover:bg-[#1A1B1C]"
                      >
                        <History className="h-4 w-4" />
                          Histórico
                      </button>

                      {canManageBoards && (
                        <>
                          <div className="my-1 h-px bg-[#F1F3F1] dark:bg-[#232425]" />
                          <button
                            type="button"
                            onClick={() => {
                              setEditBoardModalOpen(true);
                              setBoardSettingsOpen(false);
                            }}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-[#525252] transition-colors hover:bg-[#F6F8F6] dark:text-[#D4D4D4] dark:hover:bg-[#1A1B1C]"
                          >
                            <Pencil className="h-4 w-4" />
                            Editar board
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setBoardMembersOpen(true);
                              setBoardSettingsOpen(false);
                            }}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-[#525252] transition-colors hover:bg-[#F6F8F6] dark:text-[#D4D4D4] dark:hover:bg-[#1A1B1C]"
                          >
                            <Users className="h-4 w-4" />
                            Gerenciar membros
                          </button>
                          <div className="my-1 h-px bg-[#F1F3F1] dark:bg-[#232425]" />
                          <button
                            type="button"
                            disabled={boards.length <= 1}
                            onClick={() => {
                              setDeleteBoardDialogOpen(true);
                              setBoardSettingsOpen(false);
                            }}
                            className={cn(
                              'flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                              boards.length <= 1
                                ? 'cursor-not-allowed text-[#D4D4D4] dark:text-[#5E6062]'
                                : 'text-[#dc2626] hover:bg-[#FFF1F2] dark:text-[#ffb4b8] dark:hover:bg-[#281416]',
                            )}
                          >
                            <Trash2 className="h-4 w-4" />
                            Excluir board
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {boardViewMode === 'kanban' && hiddenColumns.length > 0 && (
            <div className="px-6 pt-4">
              <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#E5E7E4] bg-white px-4 py-3 dark:border-[#2D2F30] dark:bg-[#171819]">
                <span className="text-sm font-medium text-[#525252] dark:text-[#D4D4D4]">
                  Colunas ocultas:
                </span>
                {currentBoardColumns.filter((column) =>
                  hiddenColumns.includes(column.id),
                ).map((column) => (
                  <button
                    key={column.id}
                    onClick={() => toggleColumnVisibility(column.id)}
                    className="rounded-full bg-[#F3F5F3] px-3 py-1.5 text-xs font-semibold text-[#525252] dark:bg-[#1E2021] dark:text-[#D4D4D4]"
                  >
                    Mostrar {column.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1">
            {boardViewMode === 'calendar' ? (
              <BoardCalendarView
                month={calendarMonth}
                selectedDate={selectedCalendarDate}
                tasks={calendarTasks}
                onMonthChange={handleCalendarMonthChange}
                onSelectDate={(date) => {
                  setSelectedCalendarDate(date);
                  if (date) {
                    setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                  }
                }}
                onOpenTask={(taskId) => {
                  const card = cards.find((item) => item.id === taskId);
                  if (card) {
                    setSelectedCard(card);
                  }
                }}
                onCreateTaskAtDate={handleCreateTaskFromCalendarDate}
              />
            ) : (
              <div
                ref={boardScrollRef}
                className="board-scrollbar flex cursor-grab items-start gap-4 overflow-x-auto overflow-y-visible px-6 py-6 active:cursor-grabbing"
                onMouseDown={handleBoardMouseDown}
                onMouseMove={handleBoardMouseMove}
                onMouseUp={stopBoardPan}
                onMouseLeave={stopBoardPan}
              >
                {visibleColumns.map((column) => {
                  const columnCards = cardsByColumn[column.id] || [];
                  const isDropTarget = dragOverColumn === column.id;
                  const isColumnDragTarget = columnDropIndicator?.targetColumnId === column.id;

                  return (
                    <div
                      key={column.id}
                      className={cn(
                        'relative shrink-0 transition-opacity',
                        draggedColumnId === column.id && 'opacity-40',
                      )}
                      onDragOver={(event) => {
                        if (draggedColumnId) {
                          handleColumnDragOver(column.id, event);
                          return;
                        }
                        event.preventDefault();
                        setDragOverColumn(column.id);
                        if (!columnCards.length) {
                          setDropIndicator({
                            columnKey: column.id,
                            targetCardId: null,
                            placement: 'after',
                          });
                        }
                      }}
                      onDragLeave={() => {
                        if (dragOverColumn === column.id) {
                          setDragOverColumn(null);
                        }
                      }}
                      onDrop={(event) => {
                        if (draggedColumnId) {
                          event.preventDefault();
                          handleColumnDrop(
                            column.id,
                            columnDropIndicator?.targetColumnId === column.id
                              ? columnDropIndicator.placement
                              : 'after',
                          );
                          return;
                        }

                        handleDrop(
                          column.id,
                          dropIndicator?.columnKey === column.id
                            ? dropIndicator.targetCardId
                            : null,
                          dropIndicator?.columnKey === column.id
                            ? dropIndicator.placement
                            : 'after',
                        );
                      }}
                    >
                      {isColumnDragTarget && columnDropIndicator?.placement === 'before' ? (
                        <div className="absolute -left-2 top-4 z-20 h-[calc(100%-32px)] w-1 rounded-full bg-[#ff5623]" />
                      ) : null}
                      {isColumnDragTarget && columnDropIndicator?.placement === 'after' ? (
                        <div className="absolute -right-2 top-4 z-20 h-[calc(100%-32px)] w-1 rounded-full bg-[#ff5623]" />
                      ) : null}
                      <KanbanColumn
                        title={column.name}
                        icon={column.icon}
                        count={columnCards.length}
                        accentColor={column.accentColor}
                        headerLeading={
                          <button
                            type="button"
                            draggable
                            data-no-pan="true"
                            onMouseDown={(event) => event.stopPropagation()}
                            onDragStart={(event) => handleColumnDragStart(column.id, event)}
                            onDragEnd={clearColumnDragState}
                            className="rounded-lg p-1.5 text-[#737373] transition-colors hover:bg-white/70 hover:text-[#171717] active:cursor-grabbing dark:text-[#A3A3A3] dark:hover:bg-[#1b1c1d] dark:hover:text-white"
                            title="Reordenar coluna"
                          >
                            <ChevronsUpDown className="h-4 w-4 cursor-grab" />
                          </button>
                        }
                        className={cn(
                          'min-w-[340px] max-w-[340px] shrink-0 border-[#E5E7E4] dark:border-[#232425]',
                          column.bgClass,
                          isDropTarget && 'ring-2 ring-[#ff5623]/35',
                        )}
                        actions={
                          <div data-no-pan="true" className="flex items-center gap-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="rounded-lg p-1.5 text-[#737373] transition-colors hover:bg-white/70 dark:text-[#A3A3A3] dark:hover:bg-[#1b1c1d]">
                                  <Filter className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-52 rounded-2xl border-[#E5E7E4] bg-white p-2 dark:border-[#2D2F30] dark:bg-[#171819]"
                              >
                                <DropdownMenuLabel>Filtrar coluna</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {COLUMN_FILTER_OPTIONS.map((option) => (
                                  <DropdownMenuItem
                                    key={option.value}
                                    onClick={() => updateColumnFilter(column.id, option.value)}
                                    className={cn(
                                      'rounded-xl px-3 py-2.5',
                                      columnFilters[column.id] === option.value &&
                                        'bg-[#FFF4EE] text-[#c2410c] dark:bg-[#26150f] dark:text-[#ffb39c]',
                                    )}
                                  >
                                    {option.label}
                                  </DropdownMenuItem>
                                ))}
                                {columnFilters[column.id] !== 'manual' && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => updateColumnFilter(column.id, columnFilters[column.id])}
                                      className="rounded-xl px-3 py-2.5"
                                    >
                                      Voltar para ordem manual
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <button
                              onClick={() => toggleColumnVisibility(column.id)}
                              className="rounded-lg p-1.5 text-[#737373] transition-colors hover:bg-white/70 dark:text-[#A3A3A3] dark:hover:bg-[#1b1c1d]"
                            >
                              <EyeOff className="h-4 w-4" />
                            </button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="rounded-lg p-1.5 text-[#737373] transition-colors hover:bg-white/70 dark:text-[#A3A3A3] dark:hover:bg-[#1b1c1d]">
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-60 rounded-2xl border-[#E5E7E4] bg-white p-2 dark:border-[#2D2F30] dark:bg-[#171819]"
                              >
                                <DropdownMenuLabel>{column.name}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => openCreateTaskModal(column.id)}
                                  className="rounded-xl px-3 py-2.5"
                                >
                                  <Plus className="h-4 w-4" />
                                  Adicionar tarefa
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openEditColumnDialog(column)}
                                  className="rounded-xl px-3 py-2.5"
                                >
                                  <Pencil className="h-4 w-4" />
                                  Editar coluna
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => archiveColumnTasks(column.id)}
                                  className="rounded-xl px-3 py-2.5"
                                >
                                  <Archive className="h-4 w-4" />
                                  Arquivar todas as tarefas
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setAutomationColumn(column)}
                                  className="rounded-xl px-3 py-2.5"
                                >
                                  <WandSparkles className="h-4 w-4" />
                                  Criar automacao
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => deleteColumn(column.id)}
                                  variant="destructive"
                                  className="rounded-xl px-3 py-2.5"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Deletar coluna
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        }
                      >
                        {columnCards.map((card) => (
                          <div
                            key={card.id}
                            data-no-pan="true"
                            draggable={!movingCardIds.includes(card.id)}
                            onDragStart={(event) => handleDragStart(card.id, event)}
                            onDrag={handleDrag}
                            onDragEnd={clearDragState}
                            onDragOver={(event) => {
                              if (draggedColumnId) {
                                return;
                              }
                              event.preventDefault();
                              event.stopPropagation();
                              const rect = event.currentTarget.getBoundingClientRect();
                              const placement =
                                event.clientY < rect.top + rect.height / 2
                                  ? 'before'
                                  : 'after';
                              setDragOverColumn(column.id);
                              setDropIndicator({
                                columnKey: column.id,
                                targetCardId: card.id,
                                placement,
                              });
                            }}
                            className={cn(
                              'group relative cursor-grab active:cursor-grabbing',
                              movingCardIds.includes(card.id) &&
                                'animate-card-fly-to-completed pointer-events-none',
                              draggedCardId === card.id && 'opacity-0',
                            )}
                          >
                            {dropIndicator?.columnKey === column.id &&
                              dropIndicator?.targetCardId === card.id &&
                              dropIndicator.placement === 'before' && (
                                <div className="mb-2 h-[3px] rounded-full bg-[#ff5623]" />
                              )}
                            {renderCard(card)}
                            {dropIndicator?.columnKey === column.id &&
                              dropIndicator?.targetCardId === card.id &&
                              dropIndicator.placement === 'after' && (
                                <div className="mt-2 h-[3px] rounded-full bg-[#ff5623]" />
                              )}
                          </div>
                        ))}

                        {columnCards.length === 0 && (
                          <div className="rounded-2xl border border-dashed border-[#D5DAD5] bg-white/70 px-4 py-8 text-center text-sm text-[#737373] dark:border-[#2F3132] dark:bg-[#161718] dark:text-[#A3A3A3]">
                            Solte um card aqui
                          </div>
                        )}
                      </KanbanColumn>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {searchPanelOpen && (
        <div className="fixed inset-0 z-[130] flex items-start justify-center bg-[rgba(10,10,10,0.26)] px-4 pb-6 pt-[10vh] backdrop-blur-md">
          <div
            className="absolute inset-0"
            onClick={() => {
              setSearchPanelOpen(false);
              setSearchQuery('');
            }}
          />

          <div className="relative z-[1] w-full max-w-4xl overflow-hidden rounded-[32px] border border-[#E5E7E4] bg-[rgba(255,255,255,0.98)] shadow-[0_36px_80px_-40px_rgba(15,23,42,0.5)] backdrop-blur-xl dark:border-[#2D2F30] dark:bg-[rgba(18,19,19,0.98)] dark:shadow-[0_40px_90px_-46px_rgba(0,0,0,0.75)]">
            <div className="border-b border-[#EEF1ED] px-6 py-5 dark:border-[#232425]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[26px] font-bold tracking-[-0.04em] text-[#171717] dark:text-white">
                    Pesquisar tarefas
                  </h3>
                  <p className="mt-1 text-sm text-[#737373] dark:text-[#A3A3A3]">
                    {'Busque por t\u00edtulo, cliente, tag, descri\u00e7\u00e3o ou respons\u00e1vel dentro deste board.'}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-2xl text-[#737373] hover:bg-[#F6F8F6] hover:text-[#171717] dark:text-[#A3A3A3] dark:hover:bg-[#1A1B1C] dark:hover:text-white"
                  onClick={() => {
                    setSearchPanelOpen(false);
                    setSearchQuery('');
                  }}
                >
                  Fechar
                </Button>
              </div>

              <div className="relative mt-5">
                <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" />
                <Input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Digite para encontrar uma tarefa..."
                  className="h-14 rounded-[22px] border-[#E5E7E4] bg-white pl-12 pr-4 text-sm shadow-[0_12px_30px_-28px_rgba(15,23,42,0.24)] dark:border-[#2D2F30] dark:bg-[#171819]"
                />
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-4 py-4">
              {!searchQuery.trim() ? (
                <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[#DDE2DD] bg-[#FBFCFB] px-6 text-center dark:border-[#2A2C2D] dark:bg-[#171819]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#FFF4EE] text-[#c2410c] dark:bg-[#26150f] dark:text-[#ffb39c]">
                    <Search className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-[#171717] dark:text-white">
                    Comece a digitar para buscar
                  </p>
                  <p className="mt-1 max-w-[34ch] text-sm text-[#737373] dark:text-[#A3A3A3]">
                    {'Os resultados v\u00e3o aparecer aqui assim que voc\u00ea pesquisar.'}
                  </p>
                </div>
              ) : boardSearchResults.length === 0 ? (
                <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[#DDE2DD] bg-[#FBFCFB] px-6 text-center dark:border-[#2A2C2D] dark:bg-[#171819]">
                  <p className="text-sm font-semibold text-[#171717] dark:text-white">
                    Nenhuma tarefa encontrada
                  </p>
                  <p className="mt-1 max-w-[36ch] text-sm text-[#737373] dark:text-[#A3A3A3]">
                    {'Tente buscar por outro nome, cliente, tag ou respons\u00e1vel.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {boardSearchResults.map((card) => {
                    const column = getColumnById(currentBoardColumns, card.columnId);
                    const assigneeLabel = card.assignees.length
                      ? card.assignees.map((assignee) => assignee.name).join(', ')
                      : 'Sem respons�veis';
                    const cardDescription = getRichTextPlainText(card.description);

                    return (
                      <button
                        key={card.id}
                        type="button"
                        className="group flex w-full items-center justify-between gap-4 rounded-[24px] border border-[#E5E7E4] bg-white px-4 py-4 text-left transition-all duration-200 hover:border-[#D5DBD5] hover:bg-[#FCFDFC] hover:shadow-[0_14px_30px_-24px_rgba(23,23,23,0.18)] dark:border-[#232425] dark:bg-[#121313] dark:hover:border-[#343638] dark:hover:bg-[#171819] dark:hover:shadow-[0_18px_36px_-28px_rgba(0,0,0,0.45)]"
                        onClick={() => {
                          setSelectedCard(card);
                          setSearchPanelOpen(false);
                          setSearchQuery('');
                        }}
                      >
                        <div className="min-w-0 flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: column?.accentColor || '#ff5623' }}
                            />
                            <p className="truncate text-[15px] font-semibold tracking-[-0.02em] text-[#171717] dark:text-white">
                              {card.title}
                            </p>
                            <StatusBadge
                              status={card.status}
                              labelOverride={column?.name || 'Sem coluna'}
                            />
                            {card.dateAlert === 'overdue' ? (
                              <span className="inline-flex items-center rounded-full bg-[#FEF0F0] px-2.5 py-1 text-xs font-semibold text-[#dc2626] dark:bg-[#291516] dark:text-[#fca5a5]">
                                Atrasada
                              </span>
                            ) : card.dateAlert === 'approaching' ? (
                              <span className="inline-flex items-center rounded-full bg-[#FFF8E5] px-2.5 py-1 text-xs font-semibold text-[#b45309] dark:bg-[#241b0c] dark:text-[#fcd34d]">
                                {'Prazo pr�ximo'}
                              </span>
                            ) : null}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#737373] dark:text-[#A3A3A3]">
                            <span className="inline-flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5 opacity-75" />
                              {card.client?.name || cardDescription || 'Sem contexto'}
                            </span>
                            <span
                              className={cn(
                                'inline-flex items-center gap-1.5',
                                card.dateAlert === 'overdue'
                                  ? 'font-semibold text-[#dc2626] dark:text-[#fca5a5]'
                                  : card.dateAlert === 'approaching'
                                    ? 'font-semibold text-[#b45309] dark:text-[#fcd34d]'
                                    : '',
                              )}
                            >
                              <Calendar className="h-3.5 w-3.5 opacity-75" />
                              {formatTaskDueDate(card.dueDate) || 'Sem prazo'}
                            </span>
                            <span className="truncate text-sm text-[#737373] dark:text-[#A3A3A3]">
                              {assigneeLabel}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0">
                          <AvatarStack avatars={card.assignees} max={4} size="sm" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {boardViewMode === 'kanban' && dragPreview && draggedCard && (
        <div
          className="pointer-events-none fixed left-0 top-0 z-[120] w-[340px]"
          style={{
            transform: `translate(${dragPreview.x}px, ${dragPreview.y}px)`,
          }}
        >
          <div className="scale-[1.01] drop-shadow-[0_26px_44px_rgba(16,16,16,0.24)]">
            {renderCard(draggedCard)}
          </div>
        </div>
      )}

      <Dialog open={!!automationColumn} onOpenChange={(open) => !open && setAutomationColumn(null)}>
        <DialogContent className="max-w-lg rounded-[28px] border-[#E5E7E4] bg-white p-6 dark:border-[#2D2F30] dark:bg-[#121313]">
          <DialogHeader>
            <DialogTitle className="text-[#171717] dark:text-white">
              Criar automacao
            </DialogTitle>
            <DialogDescription>
              Sugestoes rapidas para a coluna {automationColumn?.name?.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            {[
              'Mover para revisao quando o progresso atingir 100%',
              'Notificar responsaveis quando a entrega estiver proxima',
              'Arquivar tarefas concluidas apos 7 dias',
            ].map((option) => (
              <button
                key={option}
                onClick={() => setAutomationColumn(null)}
                className="rounded-2xl border border-[#E5E7E4] bg-white px-4 py-3 text-left text-sm font-medium text-[#525252] transition-colors hover:border-[#ff5623]/20 hover:bg-[#FFF4EE] hover:text-[#c2410c] dark:border-[#2D2F30] dark:bg-[#171819] dark:text-[#D4D4D4] dark:hover:bg-[#26150f] dark:hover:text-[#ffb39c]"
              >
                {option}
              </button>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-2xl dark:border-[#2D2F30]"
              onClick={() => setAutomationColumn(null)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!columnEditorMode} onOpenChange={(open) => !open && resetColumnEditor()}>
        <DialogContent className="max-w-lg rounded-[28px] border-[#E5E7E4] bg-white p-6 dark:border-[#2D2F30] dark:bg-[#121313]">
          <DialogHeader>
            <DialogTitle className="text-[#171717] dark:text-white">
              {columnEditorMode === 'edit' ? 'Editar coluna' : 'Criar coluna'}
            </DialogTitle>
            <DialogDescription>
              Defina o nome visível da coluna e a etapa semântica do workflow usada para analytics e histórico.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5">
            <div className="grid gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A3A3A3]">
                Nome da coluna
              </label>
              <Input
                value={columnNameInput}
                onChange={(event) => {
                  setColumnNameInput(event.target.value);
                  if (columnFormError) {
                    setColumnFormError(null);
                  }
                }}
                placeholder="Ex.: Produção, Correções do cliente..."
                className={cn(
                  'h-11 rounded-2xl border-[#E5E7E4] bg-white dark:border-[#2D2F30] dark:bg-[#171819]',
                  columnFormError && !columnNameInput.trim() && 'border-[#f32c2c] focus-visible:ring-[#f32c2c]/20',
                )}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A3A3A3]">
                Etapa de workflow
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                {BASE_WORKFLOW_STATUS_OPTIONS.map((statusOption) => {
                  const stageMeta = WORKFLOW_STAGE_META[statusOption];
                  const isSelected = columnBaseStatusInput === statusOption;

                  return (
                    <button
                      key={statusOption}
                      type="button"
                      onClick={() => {
                        setColumnBaseStatusInput(statusOption);
                        setColumnFormError(null);
                      }}
                      className={cn(
                        'rounded-[20px] border px-4 py-3 text-left transition-all',
                        isSelected
                          ? 'border-[#ff5623] bg-[#FFF4EE] shadow-[0_18px_30px_-24px_rgba(255,86,35,0.75)] dark:border-[#ff8c69] dark:bg-[#26150f]'
                          : 'border-[#E5E7E4] bg-white hover:border-[#ff5623]/30 hover:bg-[#FFF8F3] dark:border-[#2D2F30] dark:bg-[#171819] dark:hover:border-[#ff8c69]/35 dark:hover:bg-[#1d1714]',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-white"
                          style={{ backgroundColor: stageMeta.accentColor }}
                        >
                          <stageMeta.icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-[#171717] dark:text-white">
                            {stageMeta.label}
                          </p>
                          <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                            {statusOption}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {columnFormError && (
              <div className="rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#b42318] dark:border-[#5f1d22] dark:bg-[#2a1316] dark:text-[#ffb4b8]">
                {columnFormError}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-2xl dark:border-[#2D2F30]"
              onClick={resetColumnEditor}
            >
              Cancelar
            </Button>
            <Button
              className="rounded-2xl bg-[#171717] text-white hover:bg-[#2c2c2c] dark:bg-white dark:text-[#171717] dark:hover:bg-[#ececec]"
              onClick={saveColumn}
            >
              Salvar coluna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {historyModalOpen && (
        <Dialog
          open={historyModalOpen}
          onOpenChange={(open) => {
            setHistoryModalOpen(open);
            if (!open) {
              setHistoryDeleteCandidate(null);
              setHistoryFilter('all');
            }
          }}
        >
          <DialogContent className="max-w-[860px] rounded-[32px] border-[#E5E7E4] bg-[#F8FAF8] p-0 dark:border-[#2D2F30] dark:bg-[#111214]">
          <DialogHeader className="border-b border-[#E5E7E4] px-6 py-5 text-left dark:border-[#232425]">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-[#171717] dark:text-white">
              <History className="h-5 w-5 text-[#ff5623]" />
              Histórico do board
            </DialogTitle>
            <DialogDescription className="text-sm text-[#737373] dark:text-[#A3A3A3]">
              Visualize tarefas arquivadas e canceladas deste quadro sem poluir as colunas ativas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { value: 'all' as const, label: 'Todas', count: boardHistoryCards.length },
                  {
                    value: 'archived' as const,
                    label: 'Arquivadas',
                    count: boardHistoryCards.filter((card) => card.resolution === 'archived').length,
                  },
                  {
                    value: 'cancelled' as const,
                    label: 'Canceladas',
                    count: boardHistoryCards.filter((card) => card.resolution === 'cancelled').length,
                  },
                ].map((option) => {
                  const isActive = historyFilter === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setHistoryFilter(option.value)}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition-colors',
                        isActive
                          ? 'border-[#ff5623] bg-[#FFF4EE] text-[#c2410c] dark:border-[#ff8c69] dark:bg-[#26150f] dark:text-[#ffb39c]'
                          : 'border-[#E5E7E4] bg-white text-[#525252] hover:bg-[#F6F8F6] dark:border-[#2D2F30] dark:bg-[#171819] dark:text-[#D4D4D4] dark:hover:bg-[#1A1B1C]',
                      )}
                    >
                      <span>{option.label}</span>
                      <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] dark:bg-white/10">
                        {option.count}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-sm text-[#737373] dark:text-[#A3A3A3]">
                {historyItems.length} tarefa{historyItems.length === 1 ? '' : 's'} no histórico
              </p>
            </div>

            {historyItems.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-[#D9DEDA] bg-white px-6 py-12 text-center dark:border-[#2A2C2D] dark:bg-[#171819]">
                <History className="mx-auto h-9 w-9 text-[#c8ceca] dark:text-[#4A4D4F]" />
                <p className="mt-4 text-base font-semibold text-[#171717] dark:text-white">
                  Nenhuma tarefa neste filtro
                </p>
                <p className="mt-1 text-sm text-[#737373] dark:text-[#A3A3A3]">
                  Quando você arquivar ou cancelar tarefas neste board, elas aparecem aqui.
                </p>
              </div>
            ) : (
              <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
                {filteredHistoryCards.map((card) => {
                  const resolutionLabel =
                    card.resolution === 'archived' ? 'Arquivada' : 'Cancelada';
                  const resolutionClass =
                    card.resolution === 'archived'
                      ? 'bg-[#F3F4F6] text-[#525252] dark:bg-[#222426] dark:text-[#D4D4D4]'
                      : 'bg-[#FEE2E2] text-[#DC2626] dark:bg-[#311415] dark:text-[#FF8A8A]';
                  const resolutionDate = card.resolution === 'archived'
                    ? card.archivedAt
                    : card.cancelledAt;
                  const resolutionDateLabel = formatTaskHistoryEventDate(resolutionDate);
                  const safeAssignees = Array.isArray(card.assignees)
                    ? card.assignees
                        .filter((assignee) => assignee?.name)
                        .map((assignee) => ({
                          name: assignee.name,
                          image: assignee.image,
                        }))
                    : [];
                  const previousColumnLabel =
                    getColumnById(
                      currentBoardColumns,
                      card.previousColumnId || card.columnId,
                    )?.name || 'Sem coluna';

                  return (
                    <div
                      key={card.id}
                      className="rounded-[24px] border border-[#E5E7E4] bg-white px-4 py-4 dark:border-[#2D2F30] dark:bg-[#171819]"
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3">
                          <div className="min-w-0 flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                            <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', resolutionClass)}>
                              {resolutionLabel}
                            </span>
                            <span className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                              {card.resolution === 'archived' ? 'Arquivada em' : 'Cancelada em'} {resolutionDateLabel}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <h3 className="line-clamp-2 text-[17px] font-semibold leading-[1.35] text-[#171717] dark:text-white">
                              {card.title}
                            </h3>
                            <p className="mt-1 text-sm text-[#737373] dark:text-[#A3A3A3]">
                              {card.client?.name || 'Sem cliente'} · Coluna anterior: {previousColumnLabel}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-dashed border-[#E5E7E4] pt-3 text-sm text-[#525252] dark:border-[#2D2F30] dark:text-[#D4D4D4]">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4 text-[#A3A3A3]" />
                              {formatTaskDueDate(card.dueDate) || 'Sem prazo'}
                            </span>
                            {card.credits !== undefined && (
                              <span className="flex items-center gap-1.5 rounded-full bg-[#FEF3C7] px-2.5 py-1 text-xs font-semibold text-[#92400E] dark:border dark:border-[#69511a] dark:bg-[#2a220f] dark:text-[#d8a744]">
                                <Diamond className="h-3.5 w-3.5" />
                                {card.credits} créditos
                              </span>
                            )}
                            {safeAssignees.length > 0 ? (
                              <AvatarStack avatars={safeAssignees} max={4} size="sm" />
                            ) : (
                              <span className="text-xs text-[#A3A3A3]">Sem responsáveis</span>
                            )}
                          </div>
                        </div>

                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            variant="outline"
                            className="rounded-2xl dark:border-[#2D2F30]"
                            onClick={() => restoreCardFromHistory(card.id)}
                          >
                            <RotateCcw className="h-4 w-4" />
                            Restaurar tarefa
                          </Button>
                          <Button
                            variant="outline"
                            className="rounded-2xl border-[#fecaca] text-[#dc2626] hover:bg-[#fff1f2] dark:border-[#5f1d22] dark:text-[#ffb4b8] dark:hover:bg-[#2a1316]"
                            onClick={() => setHistoryDeleteCandidate(card)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Excluir permanentemente
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          </DialogContent>
        </Dialog>
      )}

      {historyDeleteCandidate && (
        <Dialog
          open={!!historyDeleteCandidate}
          onOpenChange={(open) => {
            if (!open) {
              setHistoryDeleteCandidate(null);
            }
          }}
        >
          <DialogContent className="max-w-[480px] rounded-[28px] border-[#E5E7E4] bg-[#F8FAF8] p-0 dark:border-[#2D2F30] dark:bg-[#111214]">
          <DialogHeader className="border-b border-[#E5E7E4] px-6 py-5 text-left dark:border-[#232425]">
            <DialogTitle className="text-lg font-bold text-[#171717] dark:text-white">
              Excluir tarefa permanentemente
            </DialogTitle>
            <DialogDescription className="text-sm text-[#737373] dark:text-[#A3A3A3]">
              Essa ação remove a tarefa do board e do histórico deste quadro. Ela não poderá ser restaurada depois.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-5">
            <div className="rounded-2xl border border-[#E5E7E4] bg-white px-4 py-3 dark:border-[#2D2F30] dark:bg-[#171819]">
              <p className="text-sm font-semibold text-[#171717] dark:text-white">
                {historyDeleteCandidate?.title}
              </p>
              <p className="mt-1 text-sm text-[#737373] dark:text-[#A3A3A3]">
                {historyDeleteCandidate?.client?.name || 'Sem cliente'}
              </p>
            </div>
          </div>

          <DialogFooter className="px-6 pb-6">
            <Button
              variant="outline"
              className="rounded-2xl dark:border-[#2D2F30]"
              onClick={() => setHistoryDeleteCandidate(null)}
            >
              Cancelar
            </Button>
            <Button
              className="rounded-2xl bg-[#dc2626] text-white hover:bg-[#b91c1c]"
              onClick={() => {
                if (historyDeleteCandidate) {
                  deleteCardPermanently(historyDeleteCandidate.id);
                }
              }}
            >
              Excluir permanentemente
            </Button>
          </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <CreateBoardModal
        isOpen={editBoardModalOpen}
        mode="edit"
        initialData={
          currentBoard
            ? {
                name: currentBoard.name,
                description: currentBoard.description,
                memberUserIds: currentBoard.access.memberUserIds,
              }
            : null
        }
        onClose={() => setEditBoardModalOpen(false)}
        onSubmit={handleSubmitBoardUpdate}
      />

      <Dialog
        open={deleteBoardDialogOpen}
        onOpenChange={(open) => {
          setDeleteBoardDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-[500px] rounded-[28px] border-[#E5E7E4] bg-[#F8FAF8] p-0 dark:border-[#2D2F30] dark:bg-[#111214]">
          <DialogHeader className="border-b border-[#E5E7E4] px-6 py-5 text-left dark:border-[#232425]">
            <DialogTitle className="text-lg font-bold text-[#171717] dark:text-white">
              Excluir board
            </DialogTitle>
            <DialogDescription className="text-sm text-[#737373] dark:text-[#A3A3A3]">
              Essa ação remove o board, as colunas, as tarefas e o histórico deste ambiente.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-5">
            <div className="rounded-2xl border border-[#E5E7E4] bg-white px-4 py-3 dark:border-[#2D2F30] dark:bg-[#171819]">
              <p className="text-sm font-semibold text-[#171717] dark:text-white">
                {currentBoard?.name || 'Board atual'}
              </p>
              <p className="mt-1 text-sm text-[#737373] dark:text-[#A3A3A3]">
                {boards.length <= 1
                  ? 'Você precisa manter pelo menos um board ativo no workspace.'
                  : currentBoard?.description || 'Sem descrição'}
              </p>
            </div>
          </div>

          <DialogFooter className="px-6 pb-6">
            <Button
              variant="outline"
              className="rounded-2xl dark:border-[#2D2F30]"
              onClick={() => setDeleteBoardDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              disabled={boards.length <= 1}
              className="rounded-2xl bg-[#dc2626] text-white hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-60"
              onClick={deleteCurrentBoard}
            >
              Excluir board
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateTaskModal
        isOpen={createTaskModalOpen}
        onClose={() => {
          setCreateTaskModalOpen(false);
          setCreateTaskStartColumnId(null);
          setEditingTaskId(null);
          setCreateTaskPrefill(null);
        }}
        boardId={activeBoardId}
        columns={currentBoardColumns.map((column) => ({
          id: column.id,
          name: column.name,
          baseStatus: column.baseStatus,
          order: column.order,
        }))}
        defaultColumnId={getDefaultTaskColumnId(currentBoardColumns, createTaskStartColumnId ?? undefined)}
        onCreateTask={handleCreateTask}
        initialTask={createTaskInitialData}
        mode={editingTask ? 'edit' : 'create'}
      />

      {modalTask && (
        <TaskDetailModal
          isOpen={!!selectedCard}
          onClose={() => setSelectedCard(null)}
          onEditTask={() => {
            if (selectedCard) {
              openEditTaskModal(selectedCard);
            }
          }}
          onDuplicateTask={() => {
            if (selectedCard) {
              duplicateCard(selectedCard.id);
            }
          }}
          onCopyTaskLink={() => {
            if (selectedCard) {
              void copyCardLink(selectedCard.id);
            }
          }}
          onCancelTask={() => {
            if (selectedCard) {
              cancelCard(selectedCard.id);
              setSelectedCard(null);
            }
          }}
          onArchiveTask={() => {
            if (selectedCard) {
              archiveCard(selectedCard.id);
              setSelectedCard(null);
            }
          }}
          onOpenClientLibrary={(clientId, clientName) => {
            const resolvedClientId =
              clientId ||
              (clientName ? clientLibraryRepository.getByClientName(clientName)?.id ?? null : null);

            setSelectedClientLibraryId(resolvedClientId);
          }}
          onCompleteTask={() => {
            if (selectedCard) {
              toggleCardComplete(selectedCard.id);
              window.setTimeout(() => setSelectedCard(null), 420);
            }
          }}
          onToggleSubtask={(subtaskId) => {
            if (selectedCard) {
              toggleCardSubtask(selectedCard.id, subtaskId);
            }
          }}
          task={modalTask}
        />
      )}

      <ClientLibraryModal
        isOpen={!!selectedClientLibraryId}
        clientId={selectedClientLibraryId}
        onClose={() => setSelectedClientLibraryId(null)}
      />

      <SendToBoardModal
        open={sendToBoardModal.open}
        onClose={() => setSendToBoardModal({ open: false, card: null })}
        taskTitle={sendToBoardModal.card?.title}
        boards={boards}
        boardColumns={boardColumns}
        currentBoardId={sendToBoardModal.card?.boardId ?? activeBoardId}
        onConfirm={(targetBoardId, targetColumnId) => {
          if (sendToBoardModal.card) {
            sendCardToBoard(sendToBoardModal.card.id, targetBoardId, targetColumnId);
          }
        }}
      />
    </section>
  );
}

