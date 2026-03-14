import { Calendar, Paperclip, MessageCircle, MoreHorizontal, CheckSquare, AlertTriangle, Clock } from 'lucide-react';
import { PriorityBadge } from '../shared/PriorityBadge';
import { TagBadge } from '../shared/TagBadge';
import { AvatarStack } from '../shared/AvatarStack';
import { ProgressBar } from '../shared/ProgressBar';
import { StatusBadge } from './StatusBadge';

interface DetailedTaskCardProps {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'review' | 'completed' | 'blocked' | 'archived' | 'new';
  subtasks: { completed: number; total: number };
  progress: number;
  dueDate: string;
  dateAlert?: 'approaching' | 'overdue';
  tags: Array<{ label: string; color: 'orange' | 'blue' | 'green' | 'purple' | 'pink' | 'yellow' | 'red' | 'gray' }>;
  assignees: Array<{ name: string; image?: string }>;
  attachments?: number;
  comments?: number;
  credits?: number;
  client?: { name: string; image?: string };
  onClick?: () => void;
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
}: DetailedTaskCardProps) {
  const progressColor = progress === 100 ? 'success' : progress >= 50 ? 'blue' : 'primary';

  const dateAlertConfig = {
    approaching: {
      bg: 'bg-[#fef9c3]',
      text: 'text-[#a16207]',
      border: 'border-[#feba31]/30',
      icon: Clock,
      label: 'Prazo se aproximando',
    },
    overdue: {
      bg: 'bg-[#fee2e2]',
      text: 'text-[#dc2626]',
      border: 'border-[#f32c2c]/30',
      icon: AlertTriangle,
      label: 'Atrasado',
    },
  };

  const alertInfo = dateAlert ? dateAlertConfig[dateAlert] : null;

  return (
    <div
      className="bg-white border border-[#e5e5e5] rounded-2xl p-5 hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      {/* Header: Priority + Status NOVO + Menu */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={priority} size="sm" />
          {status === 'new' && <StatusBadge status="new" />}
        </div>
        <button
          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-[#f5f5f5] transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4 text-[#a3a3a3]" />
        </button>
      </div>

      {/* Date Alert Badge */}
      {alertInfo && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${alertInfo.bg} ${alertInfo.text} mb-3`}>
          <alertInfo.icon className="h-3.5 w-3.5 shrink-0" />
          <span className="text-xs font-semibold">{alertInfo.label}</span>
          <span className="text-[10px] font-medium opacity-70 ml-auto">{dueDate}</span>
        </div>
      )}

      {/* Title */}
      <h3 className="font-semibold text-[#171717] mb-1.5 line-clamp-2 group-hover:text-[#ff5623] transition-colors">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-[#737373] mb-4 line-clamp-2">
          {description}
        </p>
      )}

      {/* Subtasks */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-[#987dfe]">
          <CheckSquare className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Subtarefas</span>
        </div>
        <span className="text-xs font-semibold text-[#525252]">
          {subtasks.completed}/{subtasks.total}
        </span>
      </div>

      {/* Progress */}
      <ProgressBar value={progress} color={progressColor} size="sm" showLabel />

      {/* Due date + Status */}
      <div className="flex items-center justify-between mt-3 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-[#737373]">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            Entrega: <span className={`font-medium ${dateAlert === 'overdue' ? 'text-[#f32c2c]' : dateAlert === 'approaching' ? 'text-[#ca8a04]' : 'text-[#ff5623]'}`}>{dueDate}</span>
          </span>
        </div>
        {status !== 'new' && <StatusBadge status={status} />}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {tags.map((tag, i) => (
          <TagBadge key={i} label={tag.label} color={tag.color} />
        ))}
      </div>

      {/* Client */}
      {client && (
        <div className="flex items-center justify-between mb-3 px-3 py-2 bg-[#f5f5f5] rounded-xl">
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

      {/* Footer: Avatars + Meta */}
      <div className="flex items-center justify-between pt-3 border-t border-dashed border-[#e5e5e5]">
        <AvatarStack avatars={assignees} max={4} size="sm" />
        <div className="flex items-center gap-3 text-xs text-[#a3a3a3]">
          {credits !== undefined && (
            <span className="flex items-center gap-1 bg-[#fef3c7] text-[#92400e] px-2 py-0.5 rounded-lg font-semibold">
              ◈ {credits}
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
