// ─── TaskDetailModal types ────────────────────────────────────────────────────

export interface TaskDetailComment {
  id: string;
  author: { name: string; image?: string };
  text: string;
  timestamp: string;
}

export interface TaskDetailAttachment {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'image' | 'doc' | 'spreadsheet' | 'other';
  uploadedBy: string;
  uploadedAt: string;
}

export interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteTask?: () => void;
  onToggleSubtask?: (subtaskId: string) => void;
  onEditTask?: () => void;
  onDuplicateTask?: () => void;
  onCopyTaskLink?: () => void;
  onCancelTask?: () => void;
  onArchiveTask?: () => void;
  onOpenClientLibrary?: (clientId?: string | null, clientName?: string | null) => void;
  onUpdateTaskField?: (
    updates: Record<string, unknown>,
    actionDescription: string,
    actionIcon?: 'edit' | 'create' | 'move' | 'complete' | 'archive' | 'cancel' | 'send',
  ) => void;
  task: {
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status:
      | 'backlog'
      | 'todo'
      | 'in_progress'
      | 'in-progress'
      | 'adjustments'
      | 'approval'
      | 'done'
      | 'internal-approval'
      | 'review'
      | 'completed'
      | 'blocked'
      | 'archived'
      | 'new';
    statusLabel?: string;
    subtasks?: { completed: number; total: number };
    subtasksList?: Array<{
      id?: string;
      label?: string;
      title?: string;
      done: boolean;
      dueDate?: string;
      assignee?: { name: string; image?: string };
    }>;
    progress: number;
    dueDate: string;
    tags: Array<{
      label: string;
      color: 'orange' | 'blue' | 'green' | 'purple' | 'pink' | 'yellow' | 'red' | 'gray';
    }>;
    assignees: Array<{ name: string; image?: string }>;
    attachmentsList?: TaskDetailAttachment[];
    comments: TaskDetailComment[];
    createdAt?: string;
    coverImage?: string;
    credits?: number;
    client?: string;
    clientId?: string | null;
    activityLog?: Array<{
      id: string;
      icon: 'move' | 'complete' | 'archive' | 'cancel' | 'send' | 'create' | 'edit';
      actor: string;
      action: string;
      timestamp: string;
    }>;
  };
}
