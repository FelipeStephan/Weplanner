import {
  AlertTriangle,
  Calendar,
  Check,
  CheckSquare,
  Clock,
  Diamond,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
} from 'lucide-react';
import { AvatarStack } from '../shared/AvatarStack';
import { PriorityBadge } from '../shared/PriorityBadge';
import { ProgressBar } from '../shared/ProgressBar';
import { TagBadge } from '../shared/TagBadge';
import { StatusBadge } from './StatusBadge';
import { formatTaskDueDate, getTaskDueDateState } from '../../utils/taskDueDate';
import { getRichTextPlainText } from '../../utils/richText';

interface DetailedTaskCardProps {
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
  subtasks?: { completed: number; total: number };
  progress: number;
  dueDate: string;
  dateAlert?: 'approaching' | 'overdue';
  tags: Array<{
    label: string;
    color:
      | 'orange'
      | 'blue'
      | 'green'
      | 'purple'
      | 'pink'
      | 'yellow'
      | 'red'
      | 'gray';
  }>;
  assignees: Array<{ name: string; image?: string }>;
  attachments?: number;
  comments?: number;
  credits?: number;
  client?: { name: string; image?: string };
  onClick?: () => void;
  actions?: React.ReactNode;
  showCompleteButton?: boolean;
  showProgressBar?: boolean;
  showDateAlert?: boolean;
  onToggleComplete?: () => void;
  isCompleting?: boolean;
  isMovingToCompleted?: boolean;
}

export function DetailedTaskCard({
  title,
  description,
  priority,
  status,
  subtasks,
  progress,
  dueDate,
  dateAlert,
  tags,
  assignees,
  attachments = 0,
  comments = 0,
  credits,
  client,
  onClick,
  actions,
  showCompleteButton = true,
  showProgressBar = true,
  showDateAlert = true,
  onToggleComplete,
  isCompleting = false,
  isMovingToCompleted = false,
}: DetailedTaskCardProps) {
  const progressColor = 'success';
  const descriptionPreview = getRichTextPlainText(description);
  const isCompleted =
    status === 'done' || status === 'completed' || isCompleting || isMovingToCompleted;
  const hasSubtasks = Boolean(subtasks && subtasks.total > 0);
  const dueDateState = getTaskDueDateState(dueDate);
  const normalizedDateAlert =
    dueDateState === 'overdue'
      ? 'overdue'
      : dueDateState === 'warning'
        ? 'approaching'
        : dateAlert;
  const formattedDueDate = formatTaskDueDate(dueDate);

  const dateAlertConfig = {
    approaching: {
      bg: 'bg-[#fef9c3] dark:bg-[#2a220f]',
      text: 'text-[#a16207] dark:text-[#d89b18]',
      border: 'border-[#feba31]/30 dark:border-[#69511a]',
      icon: Clock,
      label: 'Prazo se aproximando',
    },
    overdue: {
      bg: 'bg-[#fee2e2] dark:bg-[#311514]',
      text: 'text-[#dc2626] dark:text-[#ff4d4f]',
      border: 'border-[#f32c2c]/30 dark:border-[#7c2323]',
      icon: AlertTriangle,
      label: 'Atrasado',
    },
  };

  const alertInfo = normalizedDateAlert ? dateAlertConfig[normalizedDateAlert] : null;

  return (
    <div
      className={`border rounded-[26px] p-5 transition-all duration-300 cursor-pointer group ${
        isCompleted
          ? 'bg-white border-[#e5e5e5] shadow-[0_16px_28px_-24px_rgba(15,23,42,0.16)] dark:bg-[#151516] dark:border-[#2a2a2a] dark:shadow-[0_16px_28px_-24px_rgba(0,0,0,0.45)]'
          : 'bg-white border-[#e5e5e5] hover:shadow-md dark:bg-[#151516] dark:border-[#2a2a2a]'
      } ${isCompleting ? 'scale-[1.015] ring-2 ring-[#ff5623]/25 shadow-[0_22px_40px_-22px_rgba(255,86,35,0.38)]' : ''}`}
      onClick={onClick}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={priority} size="sm" />
          {status === 'new' && <StatusBadge status="new" />}
        </div>

        <div className="flex items-center gap-2">
          {actions ?? (
            <button
              className="opacity-0 group-hover:opacity-100 rounded-md p-1 transition-all hover:bg-[#f5f5f5] dark:hover:bg-[#232325]"
              onClick={(event) => event.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4 text-[#a3a3a3]" />
            </button>
          )}
        </div>
      </div>

      {alertInfo && showDateAlert && (
        <div
          className={`mb-3 flex items-center gap-2 rounded-xl border px-3 py-2 ${alertInfo.bg} ${alertInfo.text} ${alertInfo.border}`}
        >
          <alertInfo.icon className="h-3.5 w-3.5 shrink-0" />
          <span className="text-xs font-semibold">{alertInfo.label}</span>
          <span className="ml-auto text-[10px] font-medium opacity-70">
            {formattedDueDate}
          </span>
        </div>
      )}

      <div className="mb-1.5 relative">
        {showCompleteButton && (
          <button
            className={`group/check absolute left-0 top-0.5 z-10 flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-300 will-change-transform ${
              isCompleted
                ? 'border-[#16a34a] bg-[#16a34a] text-white opacity-100 shadow-[0_10px_24px_-14px_rgba(22,163,74,0.75)]'
                : 'border-[#d4d4d4] bg-white text-white opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto hover:border-[#16a34a] hover:bg-[#16a34a] dark:border-[#3a3a3a] dark:bg-[#181819] dark:hover:border-[#22c55e] dark:hover:bg-[#16a34a]'
            } ${isCompleting ? 'scale-110 shadow-[0_16px_36px_-18px_rgba(22,163,74,0.65)]' : ''}`}
            onClick={(event) => {
              event.stopPropagation();
              onToggleComplete?.();
            }}
          >
            <Check
              className={`h-3 w-3 transition-all duration-200 ${
                isCompleted
                  ? 'scale-100 opacity-100'
                  : 'scale-75 opacity-0 group-hover/check:scale-100 group-hover/check:opacity-100'
              } ${isCompleting ? 'animate-pulse' : ''}`}
            />
          </button>
        )}
        <h3
          className={`line-clamp-2 text-[19px] font-semibold leading-[1.3] text-[#171717] transition-all duration-300 group-hover:text-[#ff5623] dark:text-white ${
            showCompleteButton && (isCompleted ? 'pl-9' : 'group-hover:pl-9')
          }`}
        >
          {title}
        </h3>
      </div>

      {descriptionPreview && (
        <p className="mb-4 line-clamp-2 text-sm text-[#737373] dark:text-[#9a9a9f]">
          {descriptionPreview}
        </p>
      )}

      {hasSubtasks && (
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#987dfe]">
            <CheckSquare className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Subtarefas</span>
          </div>
          <span className="text-xs font-semibold text-[#525252] dark:text-[#d6d6d9]">
            {subtasks?.completed}/{subtasks?.total}
          </span>
        </div>
      )}

      {showProgressBar && (
        <div className={hasSubtasks ? '' : 'mt-1'}>
          <ProgressBar value={progress} color={progressColor} size="sm" showLabel />
        </div>
      )}

      <div className={`${showProgressBar ? 'mt-3' : 'mt-1'} mb-3 flex items-center justify-between`}>
        <div className="flex items-center gap-1.5 text-xs text-[#737373] dark:text-[#9a9a9f]">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            Entrega:{' '}
            <span
              className={`font-medium ${
                dueDateState === 'overdue'
                  ? 'text-[#f32c2c] dark:text-[#ff4d4f]'
                  : dueDateState === 'warning'
                    ? 'text-[#ca8a04] dark:text-[#d89b18]'
                    : 'text-[#737373] dark:text-[#9a9a9f]'
              }`}
            >
              {formattedDueDate}
            </span>
          </span>
        </div>
        {status !== 'new' && <StatusBadge status={status} />}
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {tags.map((tag, index) => (
          <TagBadge key={index} label={tag.label} color={tag.color} />
        ))}
      </div>

      {client && (
        <div className="mb-3 flex items-center justify-between rounded-xl bg-[#f5f5f5] px-3 py-2 dark:bg-[#232325]">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#a3a3a3] dark:text-[#8f8f92]">
            Cliente
          </span>
          <div className="flex items-center gap-1.5">
            {client.image ? (
              <img
                src={client.image}
                alt={client.name}
                className="h-5 w-5 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#987dfe] text-[8px] font-semibold text-white">
                {client.name.charAt(0)}
              </div>
            )}
            <span className="text-xs font-semibold text-[#525252] dark:text-[#d6d6d9]">
              {client.name}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-dashed border-[#e5e5e5] pt-3 dark:border-[#2f3132]">
        <AvatarStack avatars={assignees} max={4} size="sm" />
        <div className="flex items-center gap-3 text-xs text-[#a3a3a3] dark:text-[#8f8f92]">
          {credits !== undefined && (
            <span className="flex items-center gap-1 rounded-lg bg-[#fef3c7] px-2 py-0.5 font-semibold text-[#92400e] dark:border dark:border-[#69511a] dark:bg-[#2a220f] dark:text-[#d8a744]">
              <Diamond className="h-3 w-3" />
              {credits}
            </span>
          )}
          {attachments > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip className="h-3.5 w-3.5" />
              {attachments}
            </span>
          )}
          {comments > 0 && (
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {comments}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
