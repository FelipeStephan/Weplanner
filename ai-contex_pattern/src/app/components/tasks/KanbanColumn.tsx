import { MoreHorizontal, Plus, type LucideIcon } from 'lucide-react';

interface KanbanColumnProps {
  title: string;
  icon?: LucideIcon;
  count?: number;
  children: React.ReactNode;
  accentColor?: string;
}

export function KanbanColumn({
  title,
  icon: Icon,
  count,
  children,
  accentColor = '#ff5623',
}: KanbanColumnProps) {
  return (
    <div className="bg-[#f9fafb] rounded-2xl border border-[#e5e5e5] min-w-[320px] flex flex-col">
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4" style={{ color: accentColor }} />}
          <h3 className="font-semibold text-sm text-[#171717] uppercase tracking-wide">{title}</h3>
          {count !== undefined && (
            <span className="px-1.5 py-0.5 rounded-md bg-[#e5e5e5] text-[10px] font-semibold text-[#737373]">
              {count}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-lg hover:bg-[#e5e5e5] transition-colors">
            <MoreHorizontal className="h-4 w-4 text-[#a3a3a3]" />
          </button>
          <button
            className="p-1.5 rounded-lg text-white transition-colors"
            style={{ backgroundColor: accentColor }}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 p-3 pt-1 space-y-3 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
