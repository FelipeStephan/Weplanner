import { Calendar, Flag, Clock, AlertTriangle } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface SimpleTaskCardProps {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  dateAlert?: 'approaching' | 'overdue';
  status?: 'new' | 'todo' | 'in-progress' | 'review' | 'completed' | 'blocked' | 'archived';
  tags: string[];
  assignee: { name: string; image?: string };
  progress: number;
  credits?: number;
  client?: { name: string; image?: string };
  onClick?: () => void;
}

export function SimpleTaskCard({
  title,
  description,
  priority,
  dueDate,
  dateAlert,
  status,
  tags,
  assignee,
  progress,
  credits,
  client,
  onClick,
}: SimpleTaskCardProps) {
  const priorityConfig = {
    low: { className: 'bg-[#dcfce7] text-[#16a34a]', label: 'Baixa' },
    medium: { className: 'bg-[#ffedd5] text-[#ea580c]', label: 'Média' },
    high: { className: 'bg-[#fee2e2] text-[#dc2626]', label: 'Alta' },
  };

  const pc = priorityConfig[priority];

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const dateAlertConfig = {
    approaching: {
      bg: 'bg-[#fef9c3]',
      text: 'text-[#a16207]',
      icon: Clock,
    },
    overdue: {
      bg: 'bg-[#fee2e2]',
      text: 'text-[#dc2626]',
      icon: AlertTriangle,
    },
  };

  const alertInfo = dateAlert ? dateAlertConfig[dateAlert] : null;

  return (
    <div
      className="bg-white rounded-2xl border border-[#e5e5e5] p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold ${pc.className}`}>
            <Flag className="h-3 w-3" />
            {pc.label}
          </span>
          {status && <StatusBadge status={status} />}
        </div>
        {alertInfo ? (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold ${alertInfo.bg} ${alertInfo.text}`}>
            <alertInfo.icon className="h-3 w-3" />
            {dueDate}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#f5f5f5] text-[#525252]">
            <Calendar className="h-3 w-3" />
            {dueDate}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-[#171717] mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-[#737373] mb-4 line-clamp-3">{description}</p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#f5f5f5] text-xs text-[#525252] font-semibold"
          >
            <span className="text-[#a3a3a3]">#</span>
            {tag}
          </span>
        ))}
      </div>

      {/* Client */}
      {client && (
        <div className="flex items-center justify-between mb-4 px-3 py-2 bg-[#f5f5f5] rounded-xl">
          <span className="text-[10px] font-semibold text-[#a3a3a3] uppercase tracking-wide">Cliente</span>
          <div className="flex items-center gap-1.5">
            {client.image ? (
              <img src={client.image} alt={client.name} className="w-5 h-5 rounded-full object-cover" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-[#987dfe] flex items-center justify-center text-white text-[8px] font-semibold">
                {client.name.charAt(0)}
              </div>
            )}
            <span className="text-xs font-semibold text-[#525252]">{client.name}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-dashed border-[#e5e5e5]">
        <div className="flex items-center gap-2">
          {assignee.image ? (
            <img src={assignee.image} alt={assignee.name} className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#ff5623] flex items-center justify-center text-white text-[10px] font-medium">
              {getInitials(assignee.name)}
            </div>
          )}
          <span className="text-sm text-[#525252] font-medium">{assignee.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {credits !== undefined && (
            <span className="flex items-center gap-1 bg-[#fef3c7] text-[#92400e] px-2 py-0.5 rounded-lg text-xs font-semibold">
              ◈ {credits}
            </span>
          )}
          {/* Progress circle */}
          <div className="relative w-8 h-8">
            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="12" fill="none" stroke="#e5e5e5" strokeWidth="3" />
              <circle
                cx="16" cy="16" r="12" fill="none"
                stroke={progress > 0 ? '#ff5623' : '#e5e5e5'}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${(progress / 100) * 75.4} 75.4`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-semibold text-[#525252]">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}