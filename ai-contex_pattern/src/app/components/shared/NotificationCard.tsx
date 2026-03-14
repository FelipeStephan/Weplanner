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
}

const typeConfig = {
  mention: {
    icon: AtSign,
    iconBg: 'bg-[#dbeafe] dark:bg-[#3b82f6]/20',
    iconColor: 'text-[#2563eb] dark:text-[#60a5fa]',
    accent: 'border-l-[#3b82f6]',
  },
  comment: {
    icon: MessageCircle,
    iconBg: 'bg-[#f3e8ff] dark:bg-[#987dfe]/20',
    iconColor: 'text-[#7e22ce] dark:text-[#c084fc]',
    accent: 'border-l-[#987dfe]',
  },
  completed: {
    icon: CheckCircle2,
    iconBg: 'bg-[#dcfce7] dark:bg-[#019364]/20',
    iconColor: 'text-[#16a34a] dark:text-[#4ade80]',
    accent: 'border-l-[#019364]',
  },
  overdue: {
    icon: AlertTriangle,
    iconBg: 'bg-[#fee2e2] dark:bg-[#f32c2c]/20',
    iconColor: 'text-[#dc2626] dark:text-[#f87171]',
    accent: 'border-l-[#f32c2c]',
  },
  attachment: {
    icon: Paperclip,
    iconBg: 'bg-[#fff7ed] dark:bg-[#ff5623]/20',
    iconColor: 'text-[#ea580c] dark:text-[#fb923c]',
    accent: 'border-l-[#ff5623]',
  },
  assigned: {
    icon: UserPlus,
    iconBg: 'bg-[#fce7f3] dark:bg-[#ec4899]/20',
    iconColor: 'text-[#db2777] dark:text-[#f472b6]',
    accent: 'border-l-[#ec4899]',
  },
};

const avatarColors = [
  'bg-[#ff5623]',
  'bg-[#987dfe]',
  'bg-[#019364]',
  'bg-[#3b82f6]',
  'bg-[#ec4899]',
];

export function NotificationCard({ notification }: { notification: NotificationItem }) {
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
      className={`flex items-start gap-3 p-4 rounded-xl border-l-[3px] ${config.accent} transition-all ${
        notification.isRead
          ? 'bg-white dark:bg-[#1e1e1e] border border-[#e5e5e5] dark:border-[#333] border-l-[3px]'
          : 'bg-[#fffbf7] dark:bg-[#ff5623]/5 border border-[#ff5623]/10 dark:border-[#ff5623]/20 border-l-[3px]'
      } hover:shadow-md`}
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

export function NotificationList({ notifications }: { notifications: NotificationItem[] }) {
  return (
    <div className="space-y-3">
      {notifications.map((n) => (
        <NotificationCard key={n.id} notification={n} />
      ))}
    </div>
  );
}
