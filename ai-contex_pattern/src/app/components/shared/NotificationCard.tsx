import {
  AtSign,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  Paperclip,
  UserPlus,
  Clock,
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'mention' | 'comment' | 'completed' | 'overdue' | 'attachment' | 'assigned';
  actor: {
    name: string;
    image?: string;
  };
  message: string;
  taskTitle?: string;
  timestamp: string;
  isRead?: boolean;
  boardId?: string;
  taskId?: string;
}

const typeConfig = {
  mention: {
    icon: AtSign,
    iconBg: 'bg-[#3b82f6] dark:bg-[#3b82f6]',
    iconColor: 'text-white',
  },
  comment: {
    icon: MessageCircle,
    iconBg: 'bg-[#987dfe] dark:bg-[#987dfe]',
    iconColor: 'text-white',
  },
  completed: {
    icon: CheckCircle2,
    iconBg: 'bg-[#019364] dark:bg-[#019364]',
    iconColor: 'text-white',
  },
  overdue: {
    icon: AlertTriangle,
    iconBg: 'bg-[#f32c2c] dark:bg-[#f32c2c]',
    iconColor: 'text-white',
  },
  attachment: {
    icon: Paperclip,
    iconBg: 'bg-[#ff5623] dark:bg-[#ff5623]',
    iconColor: 'text-white',
  },
  assigned: {
    icon: UserPlus,
    iconBg: 'bg-[#ec4899] dark:bg-[#ec4899]',
    iconColor: 'text-white',
  },
};

const avatarColors = [
  'bg-[#ff5623]',
  'bg-[#987dfe]',
  'bg-[#019364]',
  'bg-[#3b82f6]',
  'bg-[#ec4899]',
];

export function NotificationCard({
  notification,
  onClick,
  className = '',
}: {
  notification: NotificationItem;
  onClick?: () => void;
  className?: string;
}) {
  const config = typeConfig[notification.type];
  const TypeIcon = config.icon;
  const colorIndex = notification.actor.name.charCodeAt(0) % avatarColors.length;

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 rounded-xl border p-4 transition-all ${
        notification.isRead
          ? 'border-[#E6E9E5] bg-white dark:border-[#2F3233] dark:bg-[#1E1E1E]'
          : 'border-[#FFD9CC] bg-[#FFF9F6] dark:border-[#493025] dark:bg-[#1B1513]'
      } ${onClick ? 'cursor-pointer hover:shadow-md' : ''} ${className}`}
    >
      {/* Actor Avatar */}
      <div className="shrink-0 relative">
        <div className="w-9 h-9 rounded-full overflow-hidden">
          {notification.actor.image ? (
            <img
              src={notification.actor.image}
              alt={notification.actor.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center ${avatarColors[colorIndex]} text-white text-[10px] font-semibold`}
            >
              {getInitials(notification.actor.name)}
            </div>
          )}
        </div>
        {/* Type icon badge */}
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full ${config.iconBg} flex items-center justify-center ring-2 ring-white dark:ring-[#1e1e1e]`}
        >
          <TypeIcon className={`h-2.5 w-2.5 ${config.iconColor}`} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#171717] dark:text-[#f5f5f5] leading-snug">
          <span className="font-semibold">{notification.actor.name}</span>{' '}
          <span className="text-[#525252] dark:text-[#a3a3a3]">{notification.message}</span>
          {notification.taskTitle && (
            <span className="font-semibold text-[#ff5623] dark:text-[#fb923c]">
              {' '}{notification.taskTitle}
            </span>
          )}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <Clock className="h-3 w-3 text-[#a3a3a3] dark:text-[#737373]" />
          <span className="text-[11px] text-[#a3a3a3] dark:text-[#737373]">{notification.timestamp}</span>
          {!notification.isRead && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5623] ml-1" />
          )}
        </div>
      </div>
    </div>
  );
}

export function NotificationList({
  notifications,
  onItemClick,
}: {
  notifications: NotificationItem[];
  onItemClick?: (notification: NotificationItem) => void;
}) {
  return (
    <div className="space-y-3">
      {notifications.map((n) => (
        <NotificationCard
          key={n.id}
          notification={n}
          onClick={onItemClick ? () => onItemClick(n) : undefined}
        />
      ))}
    </div>
  );
}
