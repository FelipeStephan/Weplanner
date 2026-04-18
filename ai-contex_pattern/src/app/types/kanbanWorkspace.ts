import type { LucideIcon } from 'lucide-react';
import type { TaskFormAttachment, TaskFormSubtask } from '../components/tasks/CreateTaskModal';
import type { NotificationItem } from '../components/shared/NotificationCard';

export type CardType = 'simple' | 'detailed';
export type BoardColumnId = string;
export type TaskResolution = 'completed' | 'cancelled' | 'rejected' | 'archived' | null;
export type WorkflowStatus =
  | 'backlog'
  | 'todo'
  | 'in_progress'
  | 'review'
  | 'adjustments'
  | 'approval'
  | 'done';
export type StatusHistoryChangeType = 'system-init' | 'drag-and-drop' | 'programmatic' | 'manual';
export type ColumnFilterOption = 'manual' | 'delivery-date' | 'recent' | 'oldest';
export type BoardScope = 'all' | 'mine' | 'user';
export type BoardViewMode = 'kanban' | 'calendar';
export type ColumnEditorMode = 'create' | 'edit';
export type HistoryFilterOption = 'all' | 'archived' | 'cancelled';

export interface KanbanWorkspacePageProps {
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

export interface BoardCard {
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
  /** URL da imagem de capa - opcional, usada na aba lateral do calendário */
  coverImage?: string | null;
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

export interface TaskStatusHistoryRecord {
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

export interface BoardHistoryListItem {
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

export interface BoardColumn {
  id: BoardColumnId;
  boardId: string;
  name: string;
  baseStatus: WorkflowStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
  accentColor: string;
  bgClass: string;
  icon: LucideIcon;
  iconName?: string;
}

export interface BoardRecord {
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
