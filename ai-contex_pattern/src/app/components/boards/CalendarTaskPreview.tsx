import { Clock, Users } from 'lucide-react';
import type { CalendarBoardTask } from './BoardCalendarView';
import { formatTaskDueDate } from '../../utils/taskDueDate';
import { cn } from '../ui/utils';

type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  urgent: 'Urgente',
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

const getPriorityClasses = (priority: TaskPriority) => {
  if (priority === 'urgent') return 'bg-[#FFF0F1] text-[#C51D34]';
  if (priority === 'high') return 'bg-[#FFF4EE] text-[#C2410C]';
  if (priority === 'medium') return 'bg-[#FFF8DD] text-[#9A6700]';
  return 'bg-[#EAF7F0] text-[#0F8A58]';
};

const withAlpha = (hexColor: string, alpha: string) => {
  if (!/^#[\da-fA-F]{6}$/.test(hexColor)) return undefined;
  return `${hexColor}${alpha}`;
};

interface CalendarTaskPreviewProps {
  task: CalendarBoardTask;
  anchorRect: DOMRect;
}

const PREVIEW_WIDTH = 264;
const PREVIEW_OFFSET = 10;

function calcPosition(anchorRect: DOMRect): { left: number; top: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Try right side first
  let left = anchorRect.right + PREVIEW_OFFSET;
  let top = anchorRect.top;

  // If no room on the right, try left
  if (left + PREVIEW_WIDTH > vw - 16) {
    left = anchorRect.left - PREVIEW_WIDTH - PREVIEW_OFFSET;
  }

  // If still off-screen, center below the anchor
  if (left < 8) {
    left = Math.max(8, anchorRect.left + anchorRect.width / 2 - PREVIEW_WIDTH / 2);
    top = anchorRect.bottom + PREVIEW_OFFSET;
  }

  // Clamp vertically (estimate max preview height = 320px)
  if (top + 320 > vh - 16) top = Math.max(8, vh - 320 - 16);
  if (top < 8) top = 8;

  return { left, top };
}

export function CalendarTaskPreview({ task, anchorRect }: CalendarTaskPreviewProps) {
  const { left, top } = calcPosition(anchorRect);

  const visibleAssignees = task.assignees.slice(0, 2);
  const extraAssignees = task.assignees.length - 2;
  const assigneeLabel = visibleAssignees.map((a) => a.name).join(', ');

  return (
    <div
      className="pointer-events-none fixed z-[350] overflow-hidden rounded-2xl border border-[#E5E7E4] bg-white shadow-[0_24px_60px_-20px_rgba(15,23,42,0.28),0_8px_24px_-8px_rgba(0,0,0,0.08)] dark:border-[#2D2F30] dark:bg-[#121313]"
      style={{ left, top, width: PREVIEW_WIDTH }}
    >
      {/* Cover image */}
      {task.coverImage && (
        <div className="h-[112px] w-full overflow-hidden">
          <img
            src={task.coverImage}
            alt="Capa da tarefa"
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Column accent bar */}
      <div
        className="h-[3px] w-full"
        style={{ backgroundColor: task.columnAccentColor }}
      />

      <div className="p-4">
        {/* Title */}
        <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-[#171717] dark:text-white">
          {task.title}
        </p>

        {/* Badges */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[11px] font-medium',
              getPriorityClasses(task.priority as TaskPriority),
            )}
          >
            {PRIORITY_LABELS[task.priority as TaskPriority]}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-medium"
            style={{
              backgroundColor: withAlpha(task.columnAccentColor, '18') ?? '#FFF4EE',
              color: task.columnAccentColor,
            }}
          >
            {task.columnName}
          </span>
        </div>

        {/* Due date */}
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#737373] dark:text-[#A3A3A3]">
          <Clock className="h-3 w-3 shrink-0" />
          <span>{formatTaskDueDate(task.dueDate)}</span>
        </div>

        {/* Assignees */}
        {task.assignees.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#525252] dark:text-[#C6C7C8]">
            <Users className="h-3 w-3 shrink-0 text-[#A3A3A3]" />
            <span className="truncate">
              {assigneeLabel}
              {extraAssignees > 0 && (
                <span className="ml-1 font-semibold text-[#737373]">+{extraAssignees}</span>
              )}
            </span>
          </div>
        )}

        {/* Client */}
        {task.clientName && (
          <div className="mt-2.5 rounded-xl bg-[#F6F8F6] px-2.5 py-1.5 text-[11px] font-medium text-[#525252] dark:bg-[#1A1B1C] dark:text-[#D4D4D4]">
            {task.clientName}
          </div>
        )}
      </div>
    </div>
  );
}
