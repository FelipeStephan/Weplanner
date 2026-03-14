import { AlertTriangle, Calendar, Clock, Flag } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface SimpleTaskCardProps {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  dateAlert?: 'approaching' | 'overdue';
  status?:
    | 'new'
    | 'todo'
    | 'in-progress'
    | 'review'
    | 'completed'
    | 'blocked'
    | 'archived';
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
    medium: { className: 'bg-[#fef9c3] text-[#a16207]', label: 'Media' },
    high: { className: 'bg-[#fee2e2] text-[#dc2626]', label: 'Alta' },
  };

  const currentPriority = priorityConfig[priority];

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const dateAlertConfig = {
    approaching: {
      bg: 'bg-[#fef9c3] dark:bg-[#2a220f]',
      text: 'text-[#a16207] dark:text-[#d89b18]',
      icon: Clock,
    },
    overdue: {
      bg: 'bg-[#fee2e2] dark:bg-[#311514]',
      text: 'text-[#dc2626] dark:text-[#ff4d4f]',
      icon: AlertTriangle,
    },
  };

  const alertInfo = dateAlert ? dateAlertConfig[dateAlert] : null;

  return (
    <div
      className="cursor-pointer rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-[#2a2a2a] dark:bg-[#151516]"
      onClick={onClick}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold ${currentPriority.className}`}
          >
            <Flag className="h-3 w-3" />
            {currentPriority.label}
          </span>
          {status && <StatusBadge status={status} />}
        </div>
        {alertInfo ? (
          <span
            className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold ${alertInfo.bg} ${alertInfo.text}`}
          >
            <alertInfo.icon className="h-3 w-3" />
            {dueDate}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 rounded-xl bg-[#f5f5f5] px-2.5 py-1 text-xs font-semibold text-[#525252] dark:bg-[#232325] dark:text-[#8f8f92]">
            <Calendar className="h-3 w-3" />
            {dueDate}
          </span>
        )}
      </div>

      <h3 className="mb-2 font-semibold text-[#171717] dark:text-white">
        {title}
      </h3>

      {description && (
        <p className="mb-4 line-clamp-3 text-sm text-[#737373] dark:text-[#9a9a9f]">
          {description}
        </p>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 rounded-xl bg-[#f5f5f5] px-2.5 py-1 text-xs font-semibold text-[#525252] dark:bg-[#232325] dark:text-[#8f8f92]"
          >
            <span className="text-[#a3a3a3]">#</span>
            {tag}
          </span>
        ))}
      </div>

      {client && (
        <div className="mb-4 flex items-center justify-between rounded-xl bg-[#f5f5f5] px-3 py-2 dark:bg-[#232325]">
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

      <div className="flex items-center justify-between border-t border-dashed border-[#e5e5e5] pt-4 dark:border-[#2f3132]">
        <div className="flex items-center">
          {assignee.image ? (
            <img
              src={assignee.image}
              alt={assignee.name}
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff5623] text-[10px] font-medium text-white">
              {getInitials(assignee.name)}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {credits !== undefined && (
            <span className="flex items-center gap-1 rounded-lg bg-[#fef3c7] px-2 py-0.5 text-xs font-semibold text-[#92400e] dark:border dark:border-[#69511a] dark:bg-[#2a220f] dark:text-[#d8a744]">
              ◈ {credits}
            </span>
          )}
          <div className="relative h-8 w-8">
            <svg className="h-8 w-8 -rotate-90" viewBox="0 0 32 32">
              <circle
                cx="16"
                cy="16"
                r="12"
                fill="none"
                stroke="#e5e5e5"
                strokeWidth="3"
              />
              <circle
                cx="16"
                cy="16"
                r="12"
                fill="none"
                stroke={progress > 0 ? '#3b82f6' : '#e5e5e5'}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${(progress / 100) * 75.4} 75.4`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-semibold text-[#525252] dark:text-[#d6d6d9]">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
