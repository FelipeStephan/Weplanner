import { useState, useMemo } from "react";
import type { NotificationItem } from "../components/shared/NotificationCard";
import { MOCK_NOTIFICATIONS } from "../data/notifications";
import { DEFAULT_BOARD_ID } from "../../demo/kanbanWorkspaceSeed";

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    MOCK_NOTIFICATIONS.map((notification) => ({
      ...notification,
      boardId: notification.boardId || DEFAULT_BOARD_ID,
    })),
  );

  const [overviewFocusSignal, setOverviewFocusSignal] = useState(0);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  const markAsRead = (notificationId: string) => {
    setNotifications((current) =>
      current.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n,
      ),
    );
  };

  const markAllRead = () => {
    setNotifications((current) =>
      current.map((n) => ({ ...n, isRead: true })),
    );
  };

  const markBoardRead = (boardId: string) => {
    setNotifications((current) =>
      current.map((n) =>
        n.boardId === boardId ? { ...n, isRead: true } : n,
      ),
    );
  };

  const bumpOverviewFocus = () =>
    setOverviewFocusSignal((current) => current + 1);

  return {
    notifications,
    unreadCount,
    overviewFocusSignal,
    markAsRead,
    markAllRead,
    markBoardRead,
    bumpOverviewFocus,
  };
}
