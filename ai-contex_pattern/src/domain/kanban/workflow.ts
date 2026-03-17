import type { LucideIcon } from 'lucide-react';
import type { PersistedKanbanWorkspaceSnapshot } from '../../app/data/kanban-workspace-persistence';
import { parseTaskDueDate } from '../../app/utils/taskDueDate';
import type {
  BoardColumn,
  BoardTask,
  StatusHistoryChangeType,
  TaskStatusHistoryRecord,
  WorkflowStatus,
} from './contracts';

const COLUMN_STATUS_MAP: Record<WorkflowStatus, WorkflowStatus> = {
  backlog: 'backlog',
  todo: 'todo',
  in_progress: 'in_progress',
  review: 'review',
  adjustments: 'adjustments',
  approval: 'approval',
  done: 'done',
};

export const ACTIVE_WORKFLOW_ACTOR = 'Ana Silva';

export const sortColumnsByOrder = <T extends { order: number }>(columns: T[]) =>
  [...columns].sort((left, right) => left.order - right.order);

export const getSystemStatusForColumn = (column: Pick<BoardColumn, 'baseStatus'>) =>
  COLUMN_STATUS_MAP[column.baseStatus];

export const getColumnById = <T extends { id: string }>(columns: T[], columnId?: string | null) =>
  columns.find((column) => column.id === columnId);

export const getDefaultBoardColumnId = (
  columns: Array<Pick<BoardColumn, 'id' | 'order' | 'baseStatus'>>,
  explicitColumnId?: string,
) => {
  const sortedColumns = sortColumnsByOrder(columns);
  if (explicitColumnId && sortedColumns.some((column) => column.id === explicitColumnId)) {
    return explicitColumnId;
  }
  return sortedColumns.find((column) => column.baseStatus === 'todo')?.id || sortedColumns[0]?.id || '';
};

export const isTaskVisibleInBoard = (task: Pick<BoardTask, 'resolution'>) =>
  task.resolution !== 'cancelled' &&
  task.resolution !== 'archived' &&
  task.resolution !== 'rejected';

export const parseBoardDate = (value: string) => parseTaskDueDate(value).date ?? new Date(2026, 0, 1);

export const formatCreatedAt = (value: string) =>
  new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const formatHistoryEventDate = (value?: string | null) => {
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

export const calculateDurationInSeconds = (enteredAt: string, exitedAt: string) =>
  Math.max(
    0,
    Math.floor((new Date(exitedAt).getTime() - new Date(enteredAt).getTime()) / 1000),
  );

export const normalizeTaskForBoardState = (
  task: BoardTask,
  columns: BoardColumn[],
  previousTask?: BoardTask,
  fallbackChangedAt?: string,
  boardIdFallback?: string,
): BoardTask => {
  const targetColumn = getColumnById(columns, task.columnId);
  const normalizedStatus = targetColumn ? getSystemStatusForColumn(targetColumn) : task.status;
  const taskTouched = !previousTask || previousTask !== task;
  const workflowChanged =
    !previousTask ||
    previousTask.columnId !== task.columnId ||
    previousTask.status !== normalizedStatus;
  const resolutionChanged = previousTask?.resolution !== task.resolution;
  const nextStatusChangedAt = workflowChanged
    ? task.statusChangedAt ??
      fallbackChangedAt ??
      previousTask?.statusChangedAt ??
      task.createdAt
    : task.statusChangedAt ?? previousTask?.statusChangedAt ?? task.createdAt;
  const nextUpdatedAt = taskTouched
    ? fallbackChangedAt ??
      task.updatedAt ??
      previousTask?.updatedAt ??
      nextStatusChangedAt
    : task.updatedAt ?? previousTask?.updatedAt ?? nextStatusChangedAt;
  const resolutionTimestamp =
    fallbackChangedAt ?? nextUpdatedAt ?? nextStatusChangedAt ?? task.createdAt;

  return {
    ...task,
    boardId: task.boardId ?? boardIdFallback ?? previousTask?.boardId ?? '',
    type: task.type ?? 'detailed',
    title: task.title ?? 'Tarefa sem titulo',
    description: task.description ?? '',
    priority: task.priority ?? 'medium',
    dueDate: task.dueDate ?? '',
    tags: Array.isArray(task.tags) ? task.tags : [],
    tagColors: Array.isArray(task.tagColors) ? task.tagColors : [],
    assignees: Array.isArray(task.assignees) ? task.assignees : [],
    attachments: task.attachments ?? 0,
    attachmentsList: Array.isArray(task.attachmentsList) ? task.attachmentsList : [],
    comments: task.comments ?? 0,
    subtasksList: Array.isArray(task.subtasksList) ? task.subtasksList : [],
    progress: typeof task.progress === 'number' ? task.progress : 0,
    showProgressBar: task.showProgressBar ?? Boolean(task.subtasks?.total),
    showDateAlert: task.showDateAlert ?? false,
    status: normalizedStatus,
    statusChangedAt: nextStatusChangedAt,
    updatedAt: nextUpdatedAt,
    resolution:
      normalizedStatus === 'done'
        ? task.resolution === 'cancelled' ||
          task.resolution === 'archived' ||
          task.resolution === 'rejected'
          ? task.resolution
          : 'completed'
        : task.resolution === 'completed'
          ? null
          : (task.resolution ?? null),
    completedAt:
      task.resolution === 'completed' || normalizedStatus === 'done'
        ? task.completedAt ??
          (resolutionChanged ? resolutionTimestamp : previousTask?.completedAt ?? resolutionTimestamp)
        : null,
    cancelledAt:
      task.resolution === 'cancelled'
        ? task.cancelledAt ??
          (resolutionChanged ? resolutionTimestamp : previousTask?.cancelledAt ?? resolutionTimestamp)
        : null,
    archivedAt:
      task.resolution === 'archived'
        ? task.archivedAt ??
          (resolutionChanged ? resolutionTimestamp : previousTask?.archivedAt ?? resolutionTimestamp)
        : null,
    clientId: task.clientId ?? task.client?.name ?? null,
    client: task.client ?? (task.clientId ? { name: task.clientId } : undefined),
    totalTimeInProgress: task.totalTimeInProgress ?? previousTask?.totalTimeInProgress ?? 0,
    totalTimeInReview: task.totalTimeInReview ?? previousTask?.totalTimeInReview ?? 0,
    totalTimeInAdjustments: task.totalTimeInAdjustments ?? previousTask?.totalTimeInAdjustments ?? 0,
    totalTimeInApproval: task.totalTimeInApproval ?? previousTask?.totalTimeInApproval ?? 0,
    reviewCycles: task.reviewCycles ?? previousTask?.reviewCycles ?? 0,
    adjustmentCycles: task.adjustmentCycles ?? previousTask?.adjustmentCycles ?? 0,
  };
};

export const buildInitialStatusHistory = (tasks: BoardTask[]): TaskStatusHistoryRecord[] =>
  tasks.map((task) => ({
    id: `history-${task.id}-${task.statusChangedAt ?? task.createdAt}`,
    taskId: task.id,
    fromColumnId: null,
    toColumnId: task.columnId,
    fromStatus: null,
    toStatus: task.status,
    enteredAt: task.statusChangedAt ?? task.createdAt,
    exitedAt: null,
    durationInSeconds: null,
    changedBy: ACTIVE_WORKFLOW_ACTOR,
    changeType: 'system-init',
    createdAt: task.statusChangedAt ?? task.createdAt,
  }));

export const applyAnalyticsToTasks = (
  tasks: BoardTask[],
  history: TaskStatusHistoryRecord[],
): BoardTask[] =>
  tasks.map((task) => {
    const taskHistory = history.filter((entry) => entry.taskId === task.id);
    const sumDuration = (status: WorkflowStatus) =>
      taskHistory
        .filter((entry) => entry.toStatus === status)
        .reduce((total, entry) => total + (entry.durationInSeconds ?? 0), 0);

    return {
      ...task,
      totalTimeInProgress: sumDuration('in_progress'),
      totalTimeInReview: sumDuration('review'),
      totalTimeInAdjustments: sumDuration('adjustments'),
      totalTimeInApproval: sumDuration('approval'),
      reviewCycles: taskHistory.filter((entry) => entry.toStatus === 'review').length,
      adjustmentCycles: taskHistory.filter((entry) => entry.toStatus === 'adjustments').length,
    };
  });

export const hydrateColumnsFromSnapshot = (
  columns: PersistedKanbanWorkspaceSnapshot['columns'],
  resolveIcon: (iconName: string | undefined, baseStatus: WorkflowStatus) => LucideIcon,
): Array<BoardColumn & { icon: LucideIcon }> =>
  sortColumnsByOrder(columns).map((column) => ({
    ...column,
    icon: resolveIcon(column.iconName, column.baseStatus),
  }));

export const hydrateTasksFromSnapshot = (
  tasks: PersistedKanbanWorkspaceSnapshot['tasks'],
  columns: BoardColumn[],
  boardIdFallback: string,
): BoardTask[] =>
  tasks.map((task) =>
    normalizeTaskForBoardState(
      {
        ...task,
        attachmentsList: (task as BoardTask).attachmentsList,
        subtasksList: (task as BoardTask).subtasksList,
        clientId: task.clientId ?? task.client?.name ?? null,
      },
      columns,
      undefined,
      task.statusChangedAt,
      boardIdFallback,
    ),
  );

export const serializeTasksForSnapshot = (
  tasks: BoardTask[],
  history: TaskStatusHistoryRecord[],
): PersistedKanbanWorkspaceSnapshot['tasks'] =>
  applyAnalyticsToTasks(tasks, history).map((task) => ({
    ...task,
    totalTimeInProgress: task.totalTimeInProgress ?? 0,
    totalTimeInReview: task.totalTimeInReview ?? 0,
    totalTimeInAdjustments: task.totalTimeInAdjustments ?? 0,
    totalTimeInApproval: task.totalTimeInApproval ?? 0,
    reviewCycles: task.reviewCycles ?? 0,
    adjustmentCycles: task.adjustmentCycles ?? 0,
  }));

export const updateStatusHistoryForTaskChanges = (
  previousTasks: BoardTask[],
  nextTasks: BoardTask[],
  currentHistory: TaskStatusHistoryRecord[],
  changeType: StatusHistoryChangeType,
  changedBy: string,
): TaskStatusHistoryRecord[] => {
  const previousTasksMap = new Map(previousTasks.map((task) => [task.id, task]));
  const nextTasksMap = new Map(nextTasks.map((task) => [task.id, task]));
  const nextHistory = currentHistory.map((entry) => ({ ...entry }));

  nextTasksMap.forEach((nextTask, taskId) => {
    const previousTask = previousTasksMap.get(taskId);

    if (!previousTask) {
      nextHistory.push({
        id: `history-${taskId}-${nextTask.statusChangedAt ?? nextTask.createdAt}`,
        taskId,
        fromColumnId: null,
        toColumnId: nextTask.columnId,
        fromStatus: null,
        toStatus: nextTask.status,
        enteredAt: nextTask.statusChangedAt ?? nextTask.createdAt,
        exitedAt: null,
        durationInSeconds: null,
        changedBy,
        changeType,
        createdAt: nextTask.statusChangedAt ?? nextTask.createdAt,
      });
      return;
    }

    const workflowChanged =
      previousTask.columnId !== nextTask.columnId || previousTask.status !== nextTask.status;

    if (!workflowChanged) {
      return;
    }

    const exitedAt = nextTask.statusChangedAt ?? previousTask.statusChangedAt ?? nextTask.createdAt;
    const activeEntry = [...nextHistory]
      .reverse()
      .find((entry) => entry.taskId === taskId && entry.exitedAt === null);

    if (activeEntry) {
      activeEntry.exitedAt = exitedAt;
      activeEntry.durationInSeconds = calculateDurationInSeconds(activeEntry.enteredAt, exitedAt);
    }

    nextHistory.push({
      id: `history-${taskId}-${exitedAt}`,
      taskId,
      fromColumnId: previousTask.columnId,
      toColumnId: nextTask.columnId,
      fromStatus: previousTask.status,
      toStatus: nextTask.status,
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
