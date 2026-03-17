export type PersistedWorkflowStatus =
  | 'backlog'
  | 'todo'
  | 'in_progress'
  | 'review'
  | 'adjustments'
  | 'approval'
  | 'done';

export type PersistedTaskResolution =
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'archived'
  | null;

export type PersistedStatusHistoryChangeType =
  | 'system-init'
  | 'drag-and-drop'
  | 'programmatic'
  | 'manual';

export interface PersistedBoardAccessRecord {
  managerAccess: 'all';
  memberUserIds: string[];
}

export interface PersistedBoardRecord {
  id: string;
  name: string;
  description?: string;
  templateKey?: 'operations-kanban';
  access: PersistedBoardAccessRecord;
  createdAt: string;
  updatedAt: string;
}

export interface PersistedColumnRecord {
  id: string;
  boardId: string;
  name: string;
  baseStatus: PersistedWorkflowStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
  accentColor: string;
  bgClass: string;
  iconName: string;
}

export interface PersistedTaskAssignee {
  id?: string;
  name: string;
  image?: string;
}

export interface PersistedTaskRecord {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string;
  status: PersistedWorkflowStatus;
  resolution: PersistedTaskResolution;
  statusChangedAt: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  archivedAt: string | null;
  dueDate: string;
  clientId: string | null;
  assignees: PersistedTaskAssignee[];
  type: 'simple' | 'detailed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dateAlert?: 'approaching' | 'overdue';
  tags: string[];
  tagColors?: Array<'orange' | 'blue' | 'green' | 'purple' | 'pink' | 'yellow' | 'red' | 'gray'>;
  progress: number;
  showProgressBar?: boolean;
  showDateAlert?: boolean;
  credits?: number;
  attachments?: number;
  comments?: number;
  subtasks?: { completed: number; total: number };
  client?: { name: string; image?: string };
  previousColumnId?: string;
  previousStatus?: PersistedWorkflowStatus;
  previousProgress?: number;
  totalTimeInProgress: number;
  totalTimeInReview: number;
  totalTimeInAdjustments: number;
  totalTimeInApproval: number;
  reviewCycles: number;
  adjustmentCycles: number;
}

export interface PersistedTaskStatusHistoryRecord {
  id: string;
  taskId: string;
  fromColumnId: string | null;
  toColumnId: string;
  fromStatus: PersistedWorkflowStatus | null;
  toStatus: PersistedWorkflowStatus;
  enteredAt: string;
  exitedAt: string | null;
  durationInSeconds: number | null;
  changedBy: string;
  changeType: PersistedStatusHistoryChangeType;
  createdAt: string;
}

export interface PersistedKanbanWorkspaceSnapshot {
  schemaVersion: 3;
  persistedAt: string;
  boards: PersistedBoardRecord[];
  columns: PersistedColumnRecord[];
  tasks: PersistedTaskRecord[];
  taskStatusHistory: PersistedTaskStatusHistoryRecord[];
}

const STORAGE_KEY = 'weplanner:kanban-workspace:v4';

const LEGACY_CLIENT_ACCESS_TO_USER: Record<string, string> = {
  'client-arcadia': 'user-luiza-arcadia',
  'client-weplanner': 'user-felipe-weplanner',
  'client-ifood': 'user-bruna-ifood',
  'client-nubank': 'user-pedro-nubank',
  'client-ambev': 'user-carla-ambev',
};

const isBrowser = () => typeof window !== 'undefined' && !!window.localStorage;

const normalizeBoardAccess = (
  access?:
    | (Partial<PersistedBoardAccessRecord> & {
        collaboratorUserIds?: string[];
        clientIds?: string[];
      })
    | null,
): PersistedBoardAccessRecord => ({
  managerAccess: 'all',
  memberUserIds: Array.from(
    new Set(
      [
        ...(Array.isArray(access?.memberUserIds) ? access.memberUserIds : []),
        ...(Array.isArray(access?.collaboratorUserIds) ? access.collaboratorUserIds : []),
        ...(Array.isArray(access?.clientIds)
          ? access.clientIds
              .map((clientId) => LEGACY_CLIENT_ACCESS_TO_USER[clientId])
              .filter(Boolean)
          : []),
      ].filter(Boolean),
    ),
  ),
});

const normalizeSnapshot = (
  snapshot: PersistedKanbanWorkspaceSnapshot | (Omit<PersistedKanbanWorkspaceSnapshot, 'schemaVersion'> & { schemaVersion?: number }),
): PersistedKanbanWorkspaceSnapshot => ({
  ...snapshot,
  schemaVersion: 3,
  boards: Array.isArray(snapshot.boards)
    ? snapshot.boards.map((board) => ({
        ...board,
        templateKey: board.templateKey ?? 'operations-kanban',
        access: normalizeBoardAccess(board.access),
      }))
    : [],
  columns: Array.isArray(snapshot.columns) ? snapshot.columns : [],
  tasks: Array.isArray(snapshot.tasks) ? snapshot.tasks : [],
  taskStatusHistory: Array.isArray(snapshot.taskStatusHistory) ? snapshot.taskStatusHistory : [],
});

export const loadPersistedKanbanWorkspaceSnapshot = (
  seedSnapshot: PersistedKanbanWorkspaceSnapshot,
): PersistedKanbanWorkspaceSnapshot => {
  if (!isBrowser()) {
    return seedSnapshot;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedSnapshot));
      return seedSnapshot;
    }

    const parsed = JSON.parse(raw) as PersistedKanbanWorkspaceSnapshot;
    if (
      !parsed ||
      !Array.isArray(parsed.boards) ||
      !Array.isArray(parsed.columns) ||
      !Array.isArray(parsed.tasks) ||
      !Array.isArray(parsed.taskStatusHistory)
    ) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedSnapshot));
      return seedSnapshot;
    }

    if (parsed.schemaVersion !== 3) {
      const migratedSnapshot = normalizeSnapshot(parsed);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedSnapshot));
      return migratedSnapshot;
    }

    return normalizeSnapshot(parsed);
  } catch {
    return seedSnapshot;
  }
};

export const savePersistedKanbanWorkspaceSnapshot = (
  snapshot: PersistedKanbanWorkspaceSnapshot,
) => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...normalizeSnapshot(snapshot),
      persistedAt: new Date().toISOString(),
    } satisfies PersistedKanbanWorkspaceSnapshot),
  );
};

export const clearPersistedKanbanWorkspaceSnapshot = () => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
};
