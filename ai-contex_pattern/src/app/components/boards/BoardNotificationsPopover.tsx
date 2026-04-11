import { AtSign, Bell, CheckCheck, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { NotificationCard, type NotificationItem } from '../shared/NotificationCard';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

type BoardNotificationFilter = 'all' | 'mentions' | 'updates';

const BOARD_NOTIFICATION_FILTERS: Array<{
  id: BoardNotificationFilter;
  label: string;
  icon: typeof Bell;
}> = [
  { id: 'all', label: 'Todas', icon: Bell },
  { id: 'mentions', label: 'Men\u00e7\u00f5es', icon: AtSign },
  { id: 'updates', label: 'Atualiza\u00e7\u00f5es', icon: Sparkles },
];

const isMentionNotification = (notification: NotificationItem) =>
  notification.type === 'mention' ||
  notification.message.toLowerCase().includes('mencion');

export function BoardNotificationsPopover({
  boardName,
  notifications,
  unreadCount,
  onOpenNotification,
  onMarkAllRead,
  onClose,
}: {
  boardName: string;
  notifications: NotificationItem[];
  unreadCount: number;
  onOpenNotification: (notification: NotificationItem) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}) {
  const [activeFilter, setActiveFilter] = useState<BoardNotificationFilter>('all');
  const [visibleCount, setVisibleCount] = useState(5);

  const notificationsByFilter = useMemo(
    () => ({
      all: notifications,
      mentions: notifications.filter(isMentionNotification),
      updates: notifications.filter((notification) => !isMentionNotification(notification)),
    }),
    [notifications],
  );

  const filteredNotifications = notificationsByFilter[activeFilter];
  const visibleNotifications = filteredNotifications.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(5);
  }, [activeFilter, notifications]);

  return (
    <div className="absolute right-0 top-[calc(100%+12px)] z-[110] w-[460px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[30px] border border-[#E9ECE8] bg-[rgba(255,255,255,0.98)] shadow-[0_28px_64px_-30px_rgba(15,23,42,0.42)] backdrop-blur-xl dark:border-[#2A2C2D] dark:bg-[rgba(18,19,19,0.98)] dark:shadow-[0_30px_70px_-38px_rgba(0,0,0,0.72)]">
      <div className="border-b border-[#EEF1ED] px-5 py-5 dark:border-[#242627]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-[24px] font-bold tracking-[-0.04em] text-[#171717] dark:text-white">
                {'Notificações'}
              </h3>
              {unreadCount > 0 ? (
                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#f32c2c] px-2 text-xs font-semibold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-[#737373] dark:text-[#A3A3A3]">
              {'Atualizações do board '} {boardName}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            disabled={unreadCount === 0}
            className="rounded-2xl px-3 text-sm font-semibold text-[#c2410c] hover:bg-[#FFF4EE] hover:text-[#c2410c] disabled:cursor-default disabled:text-[#B6B6B6] disabled:hover:bg-transparent dark:text-[#ffb39c] dark:hover:bg-[#26150f] dark:hover:text-[#ffb39c] dark:disabled:text-[#5E6062]"
            onClick={onMarkAllRead}
          >
            <CheckCheck className="h-4 w-4" />
            Ler todas
          </Button>
        </div>

        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {BOARD_NOTIFICATION_FILTERS.map((filter) => {
            const Icon = filter.icon;
            const active = activeFilter === filter.id;
            const count = notificationsByFilter[filter.id].length;

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-2xl border px-3 py-1.5 text-[13px] font-semibold transition-all',
                  active
                    ? 'border-[#ffcfbf] bg-[#FFF4EE] text-[#c2410c] shadow-[0_14px_30px_-24px_rgba(255,86,35,0.5)] dark:border-[#513126] dark:bg-[#26150f] dark:text-[#ffb39c]'
                    : 'border-[#ECEFEA] bg-[#F8FAF8] text-[#737373] hover:border-[#E0E5E0] hover:text-[#171717] dark:border-[#242627] dark:bg-[#171819] dark:text-[#A3A3A3] dark:hover:border-[#2F3233] dark:hover:text-white',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{filter.label}</span>
                <span
                  className={cn(
                    'inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[10px] font-bold',
                    active
                      ? 'bg-[#c2410c] text-white dark:bg-[#ffb39c] dark:text-[#26150f]'
                      : 'bg-white text-[#737373] dark:bg-[#111212] dark:text-[#D4D4D4]',
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="max-h-[560px] overflow-y-auto px-3 py-3"
        onScroll={(event) => {
          const target = event.currentTarget;
          const reachedBottom =
            target.scrollTop + target.clientHeight >= target.scrollHeight - 24;

          if (reachedBottom && visibleCount < filteredNotifications.length) {
            setVisibleCount((current) => Math.min(current + 4, filteredNotifications.length));
          }
        }}
      >
        {filteredNotifications.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[26px] border border-dashed border-[#E2E7E2] bg-[#FBFCFB] px-6 text-center dark:border-[#2A2C2D] dark:bg-[#171819]">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#FFF4EE] text-[#c2410c] dark:bg-[#26150f] dark:text-[#ffb39c]">
              <Bell className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-semibold text-[#171717] dark:text-white">
              {'Nenhuma notificação neste filtro'}
            </p>
            <p className="mt-1 max-w-[28ch] text-sm text-[#737373] dark:text-[#A3A3A3]">
              Quando algo novo acontecer neste board, vamos mostrar aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {visibleNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                className="rounded-[24px] p-3.5"
                onClick={() => {
                  onOpenNotification(notification);
                  onClose();
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
