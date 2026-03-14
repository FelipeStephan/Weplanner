import { Calendar, MessageCircle, Paperclip } from 'lucide-react';
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
}: TaskCardProps) {
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
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-[#171717] group-hover:text-[#ff5623] transition-colors line-clamp-2">
            {title}
          </h3>
        </div>
        <StatusBadge status={status} />
      </div>
      
      {/* Description */}
      {description && (
        <p className="text-sm text-[#525252] mb-4 line-clamp-2">
          {description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#e5e5e5]">
        {/* Assignee */}
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={assignee.avatar} alt={assignee.name} />
            <AvatarFallback className="text-xs bg-[#f5f5f5] text-[#525252]">
              {getInitials(assignee.name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-[#525252]">{assignee.name}</span>
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
