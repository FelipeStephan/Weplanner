import { parseTaskDueDate } from './taskDueDate';
import { createInitialKanbanWorkspaceSnapshot } from '../../demo/kanbanWorkspaceSeed';
import {
  BOARD_ID,
  COLUMN_ICON_REGISTRY,
  COLUMN_STATUS_MAP,
  WORKFLOW_STAGE_META,
  MONTH_MAP,
  ACTIVE_WORKFLOW_ACTOR,
} from '../data/kanbanWorkspace';
import type {
  BoardCard,
  BoardColumn,
  BoardColumnId,
  StatusHistoryChangeType,
  TaskStatusHistoryRecord,
  WorkflowStatus,
} from '../types/kanbanWorkspace';
import type { PersistedKanbanWorkspaceSnapshot } from '../data/kanban-workspace-persistence';


// ─── Column icon resolver ────────────────────────────────────────────────────

export const resolveColumnIcon = (
  iconName: string | undefined,
  baseStatus: WorkflowStatus,
) => COLUMN_ICON_REGISTRY[iconName ?? ''] ?? WORKFLOW_STAGE_META[baseStatus].icon;

// ─── Route card helpers ──────────────────────────────────────────────────────

export const getRouteCardId = (): string | null => {
  if (typeof window === 'undefined') return null;
  const rawHash = window.location.hash.replace(/^#/, '');
  const [, queryString = ''] = rawHash.split('?');
  const query = new URLSearchParams(queryString);
  return query.get('card');
};

export const clearRouteCardId = (): void => {
  if (typeof window === 'undefined') return;
  const rawHash = window.location.hash.replace(/^#/, '');
  const [path, queryString = ''] = rawHash.split('?');
  const query = new URLSearchParams(queryString);
  if (!query.has('card')) return;
  query.delete('card');
  const nextQuery = query.toString();
  window.location.hash = `${path}${nextQuery ? `?${nextQuery}` : ''}`;
};

// ─── Date helpers ────────────────────────────────────────────────────────────

export const parseBoardDate = (value: string): Date =>
  parseTaskDueDate(value).date ?? new Date(2026, 0, 1);

export const formatCreatedAt = (value: string): string => {
  const date = new Date(value);
  const monthLabel = Object.keys(MONTH_MAP).find(
    (month) => MONTH_MAP[month] === date.getMonth(),
  );
  return `${String(date.getDate()).padStart(2, '0')} ${monthLabel}, ${date.getFullYear()}`;
};

export const formatHistoryEventDate = (value?: string | null): string => {
  if (!value) return 'sem registro';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'sem registro';
  return parsed.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// ─── Color helper ────────────────────────────────────────────────────────────

export const withAlpha = (hexColor: string, alpha: string): string | undefined => {
  if (!/^#[\da-fA-F]{6}$/.test(hexColor)) return undefined;
  return `${hexColor}${alpha}`;
};

// ─── Column helpers ──────────────────────────────────────────────────────────

export const getSystemStatusForColumn = (column: BoardColumn): WorkflowStatus =>
  COLUMN_STATUS_MAP[column.baseStatus];

export const getColumnById = (
  columns: BoardColumn[],
  columnId: BoardColumnId,
): BoardColumn | undefined => columns.find((column) => column.id === columnId);

export const getDefaultBoardColumnId = (
  columns: BoardColumn[],
  explicitColumnId?: BoardColumnId,
): BoardColumnId => {
  const sortedColumns = [...columns].sort((left, right) => left.order - right.order);
  if (explicitColumnId && sortedColumns.some((column) => column.id === explicitColumnId)) {
    return explicitColumnId;
  }
  return (
    sortedColumns.find((column) => column.baseStatus === 'todo')?.id ||
    sortedColumns[0]?.id ||
    ''
  );
};

export const isTaskVisibleInBoard = (card: BoardCard): boolean =>
  card.resolution !== 'cancelled' &&
  card.resolution !== 'archived' &&
  card.resolution !== 'rejected';

// ─── Card normalization ──────────────────────────────────────────────────────

export const normalizeCardForBoardState = (
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
        ? card.completedAt ??
          (resolutionChanged
            ? resolutionTimestamp
            : previousCard?.completedAt ?? resolutionTimestamp)
        : null,
    cancelledAt:
      card.resolution === 'cancelled'
        ? card.cancelledAt ??
          (resolutionChanged
            ? resolutionTimestamp
            : previousCard?.cancelledAt ?? resolutionTimestamp)
        : null,
    archivedAt:
      card.resolution === 'archived'
        ? card.archivedAt ??
          (resolutionChanged
            ? resolutionTimestamp
            : previousCard?.archivedAt ?? resolutionTimestamp)
        : null,
    clientId: card.clientId ?? card.client?.name ?? null,
    client: card.client ?? (card.clientId ? { name: card.clientId } : undefined),
    totalTimeInProgress: card.totalTimeInProgress ?? previousCard?.totalTimeInProgress ?? 0,
    totalTimeInReview: card.totalTimeInReview ?? previousCard?.totalTimeInReview ?? 0,
    totalTimeInAdjustments:
      card.totalTimeInAdjustments ?? previousCard?.totalTimeInAdjustments ?? 0,
    totalTimeInApproval: card.totalTimeInApproval ?? previousCard?.totalTimeInApproval ?? 0,
    reviewCycles: card.reviewCycles ?? previousCard?.reviewCycles ?? 0,
    adjustmentCycles: card.adjustmentCycles ?? previousCard?.adjustmentCycles ?? 0,
  };
};

// ─── Status history helpers ──────────────────────────────────────────────────

export const calculateDurationInSeconds = (enteredAt: string, exitedAt: string): number =>
  Math.max(
    0,
    Math.floor((new Date(exitedAt).getTime() - new Date(enteredAt).getTime()) / 1000),
  );

export const buildInitialStatusHistory = (
  cards: BoardCard[],
): TaskStatusHistoryRecord[] =>
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
    changeType: 'system-init' as StatusHistoryChangeType,
    createdAt: card.statusChangedAt ?? card.createdAt,
  }));

export const updateStatusHistoryForCardChanges = (
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

    if (!workflowChanged) return;

    const exitedAt =
      nextCard.statusChangedAt ?? previousCard.statusChangedAt ?? nextCard.createdAt;
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

// ─── Analytics ───────────────────────────────────────────────────────────────

export const applyAnalyticsToCards = (
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

// ─── Snapshot hydration ──────────────────────────────────────────────────────

export const createInitialWorkspaceSnapshot = (): PersistedKanbanWorkspaceSnapshot =>
  createInitialKanbanWorkspaceSnapshot();

export const hydrateColumnsFromSnapshot = (
  columns: PersistedKanbanWorkspaceSnapshot['columns'],
): BoardColumn[] =>
  columns
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((column) => ({
      ...column,
      icon:
        COLUMN_ICON_REGISTRY[column.iconName] ??
        WORKFLOW_STAGE_META[column.baseStatus as WorkflowStatus].icon,
    }));

export const hydrateTasksFromSnapshot = (
  tasks: PersistedKanbanWorkspaceSnapshot['tasks'],
  columns: BoardColumn[],
): BoardCard[] =>
  tasks.map((task) =>
    normalizeCardForBoardState(
      {
        ...task,
        clientId: task.clientId ?? task.client?.name ?? null,
      } as BoardCard,
      columns,
      undefined,
      task.statusChangedAt,
    ),
  );
