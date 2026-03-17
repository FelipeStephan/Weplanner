import { formatDistanceToNowStrict, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type {
  PersistedBoardRecord,
  PersistedKanbanWorkspaceSnapshot,
  PersistedTaskRecord,
  PersistedTaskStatusHistoryRecord,
  PersistedWorkflowStatus,
} from '../app/data/kanban-workspace-persistence';
import { formatTaskDueDate, getTaskDueDateState, parseTaskDueDate } from '../app/utils/taskDueDate';
import { BOARD_DIRECTORY_CLIENTS, BOARD_DIRECTORY_USERS } from '../demo/boardDirectory';
import type { ClientLibraryResource } from '../demo/clientLibraryCatalog';
import type { BoardViewerContext } from '../domain/boards/contracts';
import { clientLibraryRepository } from './clientLibraryRepository';

export interface OverviewUserContext {
  id?: string;
  name: string;
  role: BoardViewerContext['role'];
  image?: string;
}

export interface OverviewKpiMetric {
  id: 'in-progress' | 'completed-today' | 'due-soon' | 'overdue';
  title: string;
  value: number;
  badge?: string;
  tone: 'purple' | 'green' | 'yellow' | 'red';
}

export interface OverviewTaskListRow {
  id: string;
  boardId: string;
  title: string;
  status: PersistedWorkflowStatus;
  statusLabel: string;
  clientName: string;
  dueDateLabel: string;
  isDueToday: boolean;
  dueState: 'normal' | 'warning' | 'overdue' | 'none';
  isOverdue: boolean;
  assignees: PersistedTaskRecord['assignees'];
}

export interface OverviewBoardCardRow {
  id: string;
  name: string;
  description?: string;
  activeTasks: number;
  overdueTasks: number;
}

export interface OverviewClientLibraryRow {
  id: string;
  name: string;
  sector?: string;
  image?: string;
  resources: ClientLibraryResource[];
}

export interface OverviewActivityRow {
  id: string;
  taskId: string;
  boardId: string;
  actorName: string;
  actorImage?: string;
  action: string;
  taskTitle: string;
  timestampLabel: string;
}

export interface OverviewAlertRow {
  id: string;
  taskId: string;
  boardId: string;
  tone: 'warning' | 'danger';
  title: string;
  description: string;
  priorityLabel: string;
}

export interface OverviewSnapshot {
  kpis: OverviewKpiMetric[];
  assignedCount: number;
  taskRows: OverviewTaskListRow[];
  boardRows: OverviewBoardCardRow[];
  clientRows: OverviewClientLibraryRow[];
  activityRows: OverviewActivityRow[];
  alertRows: OverviewAlertRow[];
}

const ACTIVE_STATUSES: PersistedWorkflowStatus[] = [
  'todo',
  'in_progress',
  'review',
  'adjustments',
  'approval',
];

const STATUS_LABELS: Record<PersistedWorkflowStatus, string> = {
  backlog: 'Backlog',
  todo: 'A Fazer',
  in_progress: 'Em Progresso',
  review: 'Revisão',
  adjustments: 'Ajustes',
  approval: 'Aprovação',
  done: 'Concluído',
};

const isVisibleToViewer = (board: PersistedBoardRecord, viewer: BoardViewerContext) => {
  if (viewer.role === 'manager') return true;
  return !!viewer.userId && board.access.memberUserIds.includes(viewer.userId);
};

const isTaskActive = (task: PersistedTaskRecord) => !task.resolution;

const getTaskScope = (
  task: PersistedTaskRecord,
  viewer: BoardViewerContext,
  user: OverviewUserContext,
) => {
  if (viewer.role === 'client') return true;

  const normalizedUserName = user.name.trim().toLowerCase();
  const normalizedUserId = user.id?.trim().toLowerCase();

  return task.assignees.some((assignee) => {
    const assigneeId = assignee.id?.trim().toLowerCase();
    const assigneeName = assignee.name.trim().toLowerCase();

    if (normalizedUserId && assigneeId === normalizedUserId) {
      return true;
    }

    if (normalizedUserId && assigneeId === normalizedUserName) {
      return true;
    }

    return assigneeName === normalizedUserName;
  });
};

const getTaskTimestamp = (task: PersistedTaskRecord) =>
  task.updatedAt || task.statusChangedAt || task.completedAt || task.createdAt;

const getRelativeTime = (value: string) => {
  const parsed = parseISO(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return formatDistanceToNowStrict(parsed, {
    addSuffix: true,
    locale: ptBR,
  });
};

const buildActivityRows = (
  tasks: PersistedTaskRecord[],
  history: PersistedTaskStatusHistoryRecord[],
): OverviewActivityRow[] => {
  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const historyRows = history
    .filter((entry) => taskById.has(entry.taskId))
    .map((entry) => {
      const task = taskById.get(entry.taskId)!;
      const actorName = entry.changedBy === 'system' ? 'Sistema' : entry.changedBy;

      let action = 'atualizou a tarefa';
      if (entry.toStatus === 'done') {
        action = 'concluiu tarefa';
      } else if (entry.changeType === 'drag-and-drop' || entry.changeType === 'programmatic') {
        action = 'moveu tarefa';
      }

      return {
        id: entry.id,
        taskId: task.id,
        boardId: task.boardId,
        actorName,
        action,
        taskTitle: task.title,
        createdAt: entry.createdAt,
        timestampLabel: getRelativeTime(entry.createdAt),
      };
    });

  const commentRows = tasks
    .filter((task) => (task.comments ?? 0) > 0)
    .map((task) => ({
      id: `comment-${task.id}`,
      taskId: task.id,
      boardId: task.boardId,
      actorName: task.assignees[0]?.name || 'Equipe',
      actorImage: task.assignees[0]?.image,
      action: 'comentou na tarefa',
      taskTitle: task.title,
      createdAt: getTaskTimestamp(task),
      timestampLabel: getRelativeTime(getTaskTimestamp(task)),
    }));

  const attachmentRows = tasks
    .filter((task) => (task.attachments ?? 0) > 0)
    .map((task) => ({
      id: `attachment-${task.id}`,
      taskId: task.id,
      boardId: task.boardId,
      actorName: task.assignees[0]?.name || 'Equipe',
      actorImage: task.assignees[0]?.image,
      action: 'anexou arquivo na tarefa',
      taskTitle: task.title,
      createdAt: getTaskTimestamp(task),
      timestampLabel: getRelativeTime(getTaskTimestamp(task)),
    }));

  return [...historyRows, ...commentRows, ...attachmentRows]
    .sort((left, right) => parseISO(right.createdAt).getTime() - parseISO(left.createdAt).getTime())
    .map(({ createdAt: _createdAt, ...row }) => row)
    .slice(0, 6);
};

const sortTasksForOverview = (tasks: PersistedTaskRecord[]) =>
  [...tasks].sort((left, right) => {
    const leftState = getTaskDueDateState(left.dueDate);
    const rightState = getTaskDueDateState(right.dueDate);
    const toneOrder = { overdue: 0, warning: 1, normal: 2, none: 3 };

    if (toneOrder[leftState] !== toneOrder[rightState]) {
      return toneOrder[leftState] - toneOrder[rightState];
    }

    const leftDate = parseTaskDueDate(left.dueDate).date?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const rightDate = parseTaskDueDate(right.dueDate).date?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return leftDate - rightDate;
  });

export const overviewRepository = {
  build(
    snapshot: PersistedKanbanWorkspaceSnapshot,
    viewer: BoardViewerContext,
    user: OverviewUserContext,
  ): OverviewSnapshot {
    const visibleBoards = snapshot.boards.filter((board) => isVisibleToViewer(board, viewer));
    const visibleBoardIds = new Set(visibleBoards.map((board) => board.id));
    const visibleTasks = snapshot.tasks.filter((task) => visibleBoardIds.has(task.boardId));
    const scopedTasks = visibleTasks.filter((task) => getTaskScope(task, viewer, user));
    const activeScopedTasks = scopedTasks.filter(isTaskActive);
    const today = new Date();

    const kpis: OverviewKpiMetric[] = [
      {
        id: 'in-progress',
        title: 'Em andamento',
        value: activeScopedTasks.filter((task) => ACTIVE_STATUSES.includes(task.status)).length,
        badge: 'Fluxo atual',
        tone: 'purple',
      },
      {
        id: 'completed-today',
        title: 'Concluídas hoje',
        value: scopedTasks.filter((task) => task.completedAt && isSameDay(parseISO(task.completedAt), today)).length,
        badge: 'Hoje',
        tone: 'green',
      },
      {
        id: 'due-soon',
        title: 'Próximas do prazo',
        value: activeScopedTasks.filter((task) => getTaskDueDateState(task.dueDate, today) === 'warning').length,
        badge: 'Atenção',
        tone: 'yellow',
      },
      {
        id: 'overdue',
        title: 'Atrasadas',
        value: activeScopedTasks.filter((task) => getTaskDueDateState(task.dueDate, today) === 'overdue').length,
        badge: 'Urgente',
        tone: 'red',
      },
    ];

    const taskRows = sortTasksForOverview(activeScopedTasks).map((task) => {
      const dueState = getTaskDueDateState(task.dueDate, today);
      const visibleColumn = snapshot.columns.find((column) => column.id === task.columnId);
      return {
        id: task.id,
        boardId: task.boardId,
        title: task.title,
        status: task.status,
        statusLabel: visibleColumn?.name || STATUS_LABELS[task.status],
        clientName: task.client?.name || BOARD_DIRECTORY_CLIENTS.find((client) => client.id === task.clientId)?.name || 'Sem cliente',
        dueDateLabel: formatTaskDueDate(task.dueDate) || 'Sem prazo',
        isDueToday: (() => {
          const parsed = parseTaskDueDate(task.dueDate).date;
          return parsed ? isSameDay(parsed, today) : false;
        })(),
        dueState,
        isOverdue: dueState === 'overdue',
        assignees: task.assignees,
      };
    });

    const boardRows = visibleBoards.map((board) => {
      const boardTasks = visibleTasks.filter((task) => task.boardId === board.id && isTaskActive(task));
      return {
        id: board.id,
        name: board.name,
        description: board.description,
        activeTasks: boardTasks.length,
        overdueTasks: boardTasks.filter((task) => getTaskDueDateState(task.dueDate, today) === 'overdue').length,
      };
    });

    const clientIds = Array.from(new Set(visibleTasks.map((task) => task.clientId).filter(Boolean))) as string[];
    const clientRows = clientLibraryRepository
      .listByClientIds(clientIds)
      .slice(0, 6) as OverviewClientLibraryRow[];

    const activityRows = buildActivityRows(
      visibleTasks,
      snapshot.taskStatusHistory.filter((entry) => visibleBoardIds.has(taskByIdBoardId(visibleTasks, entry.taskId))),
    );

    const alertRows = sortTasksForOverview(activeScopedTasks)
      .filter((task) => {
        const state = getTaskDueDateState(task.dueDate, today);
        return state === 'warning' || state === 'overdue';
      })
      .slice(0, 5)
      .map((task) => {
        const dueState = getTaskDueDateState(task.dueDate, today);
        return {
          id: task.id,
          taskId: task.id,
          boardId: task.boardId,
          tone: dueState === 'overdue' ? 'danger' : 'warning',
          title: task.title,
          description: `${formatTaskDueDate(task.dueDate)} · ${task.client?.name || 'Sem cliente'}`,
          priorityLabel:
            dueState === 'overdue'
              ? 'Em atraso'
              : task.priority === 'urgent'
                ? 'Prioridade alta'
                : 'Prazo próximo',
        };
      });

    return {
      kpis,
      assignedCount: activeScopedTasks.length,
      taskRows,
      boardRows,
      clientRows,
      activityRows,
      alertRows,
    };
  },
};

const taskByIdBoardId = (tasks: PersistedTaskRecord[], taskId: string) =>
  tasks.find((task) => task.id === taskId)?.boardId || '';
