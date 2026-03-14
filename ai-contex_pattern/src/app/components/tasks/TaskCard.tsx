import { Calendar, Check, MessageCircle, Paperclip } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface TaskCardProps {
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed' | 'blocked' | 'archived' | 'new';
  assignee: {
    name: string;
    avatar?: string;
  };
  dueDate?: string;
  commentsCount?: number;
  attachmentsCount?: number;
  priority?: 'low' | 'medium' | 'high';
  credits?: number;
  onClick?: () => void;
  actions?: React.ReactNode;
  hideDescription?: boolean;
  showCompleteButton?: boolean;
  onToggleComplete?: () => void;
  isCompleting?: boolean;
}

export function TaskCard({ 
  title, 
  description,
  status, 
  assignee, 
  dueDate,
  commentsCount = 0,
  attachmentsCount = 0,
  priority = 'medium',
  credits,
  onClick,
  actions,
  hideDescription = false,
  showCompleteButton = false,
  onToggleComplete,
  isCompleting = false,
}: TaskCardProps) {
  const isCompleted = status === 'completed' || isCompleting;
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className="group bg-white border border-[#e5e5e5] rounded-2xl p-4 hover:border-[#d4d4d4] hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <StatusBadge status={status} />
        {actions && <div className="flex items-center gap-1">{actions}</div>}
      </div>

      <div className="mb-3 relative">
        {showCompleteButton && (
          <button
            className={`group/check absolute left-0 top-0 z-10 flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-300 will-change-transform ${
              isCompleted
                ? 'border-[#16a34a] bg-[#16a34a] text-white opacity-100 shadow-[0_10px_24px_-14px_rgba(22,163,74,0.75)]'
                : 'border-[#d4d4d4] bg-white text-white opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto hover:border-[#16a34a] hover:bg-[#16a34a]'
            } ${isCompleting ? 'scale-110 shadow-[0_16px_36px_-18px_rgba(22,163,74,0.95)]' : ''}`}
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
        <h3 className="font-medium text-[#171717] group-hover:text-[#ff5623] transition-colors line-clamp-2">
          <span
            className={`block transition-all duration-300 ${
              showCompleteButton && (isCompleted ? 'pl-9' : 'group-hover:pl-9')
            }`}
          >
            {title}
          </span>
        </h3>
      </div>
      
      {/* Description */}
      {description && !hideDescription && (
        <p className="text-sm text-[#525252] mb-4 line-clamp-2">
          {description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#e5e5e5]">
        {/* Assignee */}
        <div className="flex items-center">
          <Avatar className="h-6 w-6">
            <AvatarImage src={assignee.avatar} alt={assignee.name} />
            <AvatarFallback className="text-xs bg-[#f5f5f5] text-[#525252]">
              {getInitials(assignee.name)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-3 text-xs text-[#737373]">
          {credits !== undefined && (
            <span className="flex items-center gap-1 bg-[#fef3c7] text-[#92400e] px-2 py-0.5 rounded-lg font-semibold">
              ◈ {credits}
            </span>
          )}
          {dueDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {dueDate}
            </span>
          )}
          {commentsCount > 0 && (
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {commentsCount}
            </span>
          )}
          {attachmentsCount > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip className="h-3 w-3" />
              {attachmentsCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
