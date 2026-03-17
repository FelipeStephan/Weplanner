import { MoreHorizontal, Plus, type LucideIcon } from 'lucide-react';
import { cn } from '../ui/utils';

interface KanbanColumnProps {
  title: string;
  icon?: LucideIcon;
  count?: number;
  children: React.ReactNode;
  accentColor?: string;
  className?: string;
  contentClassName?: string;
  headerMeta?: React.ReactNode;
  headerLeading?: React.ReactNode;
  actions?: React.ReactNode;
}

export function KanbanColumn({
  title,
  icon: Icon,
  count,
  children,
  accentColor = '#ff5623',
  className,
  contentClassName,
  headerMeta,
  headerLeading,
  actions,
}: KanbanColumnProps) {
  return (
    <div
      className={cn(
        'bg-[#f9fafb] dark:bg-[#141414] rounded-2xl border border-[#e5e5e5] dark:border-[#2a2a2a] min-w-[320px] flex flex-col',
        className,
      )}
    >
      {/* Column Header */}
      <div className="flex items-start justify-between gap-3 p-4 pb-2">
        <div className="flex items-center gap-2">
          {headerLeading}
          {Icon && <Icon className="h-4 w-4" style={{ color: accentColor }} />}
          <h3 className="font-semibold text-sm text-[#171717] dark:text-white uppercase tracking-wide">{title}</h3>
          {count !== undefined && (
            <span className="px-1.5 py-0.5 rounded-md bg-[#e5e5e5] dark:bg-[#2a2a2a] text-[10px] font-semibold text-[#737373] dark:text-[#a3a3a3]">
              {count}
            </span>
          )}
        </div>
        {actions ?? (
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-[#e5e5e5] dark:hover:bg-[#2a2a2a] transition-colors">
              <MoreHorizontal className="h-4 w-4 text-[#a3a3a3]" />
            </button>
            <button
              className="p-1.5 rounded-lg text-white transition-colors"
              style={{ backgroundColor: accentColor }}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {headerMeta && <div className="px-4 pb-2">{headerMeta}</div>}

      {/* Cards */}
      <div className={cn('flex-1 p-3 pt-1 space-y-3 overflow-y-auto', contentClassName)}>
        {children}
      </div>
    </div>
  );
}
