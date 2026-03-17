import { Building2, Calendar } from 'lucide-react';
import type { OverviewTaskListRow } from '../../../repositories/overviewRepository';
import { AvatarStack } from '../shared/AvatarStack';
import { StatusBadge } from '../tasks/StatusBadge';
import { cn } from '../ui/utils';

const STATUS_DOT_TONE: Record<OverviewTaskListRow['status'], string> = {
  backlog: 'bg-[#64748b]',
  todo: 'bg-[#ff5623]',
  in_progress: 'bg-[#987dfe]',
  review: 'bg-[#3b82f6]',
  adjustments: 'bg-[#f97316]',
  approval: 'bg-[#feba31]',
  done: 'bg-[#019364]',
};

interface OverviewTaskListItemProps {
  task: OverviewTaskListRow;
  onOpen?: (task: OverviewTaskListRow) => void;
}

export function OverviewTaskListItem({ task, onOpen }: OverviewTaskListItemProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen?.(task)}
      className="group flex w-full cursor-pointer flex-col gap-3 rounded-[24px] border border-[#E5E7E4] bg-white px-4 py-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D5DBD5] hover:bg-[#FCFDFC] hover:shadow-[0_14px_30px_-24px_rgba(23,23,23,0.28)] dark:border-[#232425] dark:bg-[#121313] dark:hover:border-[#343638] dark:hover:bg-[#171819] dark:hover:shadow-[0_18px_36px_-28px_rgba(0,0,0,0.55)] lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('h-2.5 w-2.5 rounded-full', STATUS_DOT_TONE[task.status])} />
          <p className="truncate text-[15px] font-semibold tracking-[-0.02em] text-[#171717] dark:text-white">
            {task.title}
          </p>
          <StatusBadge status={task.status} labelOverride={task.statusLabel} />
          {task.isOverdue ? (
            <span className="inline-flex items-center rounded-full bg-[#FEF0F0] px-2.5 py-1 text-xs font-semibold text-[#dc2626] dark:bg-[#291516] dark:text-[#fca5a5]">
              Atrasada
            </span>
          ) : task.dueState === 'warning' ? (
            <span className="inline-flex items-center rounded-full bg-[#FFF8E5] px-2.5 py-1 text-xs font-semibold text-[#b45309] dark:bg-[#241b0c] dark:text-[#fcd34d]">
              Prazo próximo
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#737373] dark:text-[#A3A3A3]">
          <span className="inline-flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 opacity-75" />
            {task.clientName}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1.5',
              task.dueState === 'overdue'
                ? 'font-semibold text-[#dc2626] dark:text-[#fca5a5]'
                : task.dueState === 'warning'
                  ? 'font-semibold text-[#b45309] dark:text-[#fcd34d]'
                  : '',
            )}
          >
            <Calendar className="h-3.5 w-3.5 opacity-75" />
            {task.dueDateLabel}
          </span>
        </div>
      </div>

      <div className="shrink-0 self-end lg:self-center">
        <AvatarStack avatars={task.assignees} max={4} size="sm" />
      </div>
    </button>
  );
}
