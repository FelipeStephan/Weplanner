import type { ClientRecord, UserRecord } from '../shared/entities';
import type { BoardAccessRecord, BoardTemplateKey } from '../boards/contracts';

export type CardType = 'simple' | 'detailed';

export type WorkflowStatus =
  | 'backlog'
  | 'todo'
  | 'in_progress'
  | 'review'
  | 'adjustments'
  | 'approval'
  | 'done';

export type TaskResolution = 'completed' | 'cancelled' | 'rejected' | 'archived' | null;

export type StatusHistoryChangeType = 'system-init' | 'drag-and-drop' | 'programmatic' | 'manual';

export type TaskAssignee = Pick<UserRecord, 'id' | 'name' | 'image'>;

export type TaskClient = Pick<ClientRecord, 'id' | 'name' | 'image' | 'sector'>;

export interface TaskAttachment {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'doc' | 'spreadsheet' | 'other';
  size: string;
}

export interface TaskSubtask {
  id: string;
  title: string;
  done: boolean;
  assignee?: TaskAssignee;
  dueDate?: string;
}

export interface BoardRecord {
  id: string;
  name: string;
  description?: string;
  templateKey?: BoardTemplateKey;
  access: BoardAccessRecord;
  createdAt: string;
  updatedAt: string;
}

export interface BoardColumn {
  id: string;
  boardId: string;
  name: string;
  baseStatus: WorkflowStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
  accentColor: string;
  bgClass: string;
  iconName?: string;
}

export interface BoardTask {
  id: string;
  boardId: string;
  columnId: string;
  previousColumnId?: string;
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
  assignees: TaskAssignee[];
  clientId?: string | null;
  progress: number;
  showProgressBar?: boolean;
  showDateAlert?: boolean;
  credits?: number;
  attachments?: number;
  attachmentsList?: TaskAttachment[];
  comments?: number;
  subtasks?: { completed: number; total: number };
  subtasksList?: TaskSubtask[];
  client?: TaskClient;
  totalTimeInProgress?: number;
  totalTimeInReview?: number;
  totalTimeInAdjustments?: number;
  totalTimeInApproval?: number;
  reviewCycles?: number;
  adjustmentCycles?: number;
}

export interface TaskStatusHistoryRecord {
  id: string;
  taskId: string;
  fromColumnId: string | null;
  toColumnId: string;
  fromStatus: WorkflowStatus | null;
  toStatus: WorkflowStatus;
  enteredAt: string;
  exitedAt: string | null;
  durationInSeconds: number | null;
  changedBy: string;
  changeType: StatusHistoryChangeType;
  createdAt: string;
}
