import {
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Moon,
  MoreHorizontal,
  Plus,
  ScrollText,
  Settings,
  Sparkles,
  Sun,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useState, type MouseEvent as ReactMouseEvent } from 'react';
import WePlannerLogo from '../../../assets/logo-weplanner.png';
import type { BoardRecord } from '../../../domain/kanban/contracts';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../ui/utils';

export type AppShellPage = 'overview-dashboard' | 'design-system' | 'kanban-workspace' | 'boards-directory' | 'reports-dashboard' | 'team' | 'settings' | 'clients' | 'changelog';

interface AppShellSidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  activePage: AppShellPage;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenOverview: () => void;
  onOpenDesignSystem: () => void;
  onOpenBoard: () => void;
  onOpenReports: () => void;
  onOpenTeam?: () => void;
  onOpenSettings?: () => void;
  onOpenClients?: () => void;
  onOpenChangelog?: () => void;
  /** Only pinned boards — shown as a compact list below the Board menu item */
  pinnedBoards: BoardRecord[];
  activeBoardId?: string | null;
  onSelectBoard: (boardId: string) => void;
  userName: string;
  userImage?: string;
  userRole?: 'client' | 'manager' | 'collaborator';
  userTitle?: string;
  onUserClick?: (event: ReactMouseEvent<HTMLDivElement>) => void;
  notificationCount?: number;
}

const SIDEBAR_ITEMS: Array<{
  key: AppShellPage | 'team';
  label: string;
  icon: LucideIcon;
  managerOnly?: boolean;
}> = [
  { key: 'overview-dashboard', label: 'Visao geral', icon: LayoutDashboard },
  { key: 'boards-directory', label: 'Board', icon: FolderKanban },
  { key: 'reports-dashboard', label: 'Relatorios', icon: BarChart3 },
  { key: 'team', label: 'Equipe', icon: Users },
  { key: 'clients', label: 'Clientes', icon: Building2, managerOnly: true },
  { key: 'settings', label: 'Configurações', icon: Settings, managerOnly: true },
  { key: 'design-system', label: 'Design System', icon: Sparkles },
  { key: 'changelog', label: 'Atualizações', icon: ScrollText },
];

const isActiveItem = (activePage: AppShellPage, itemKey: AppShellPage | 'team') => {
  if (activePage === itemKey) return true;
  // Keep Board item highlighted when inside a kanban workspace
  if (itemKey === 'boards-directory' && activePage === 'kanban-workspace') return true;
  return false;
};

export function AppShellSidebar({
  collapsed,
  onToggleCollapsed,
  activePage,
  darkMode,
  onToggleDarkMode,
  onOpenOverview,
  onOpenDesignSystem,
  onOpenBoard,
  onOpenReports,
  onOpenTeam,
  onOpenSettings,
  onOpenClients,
  onOpenChangelog,
  pinnedBoards,
  activeBoardId,
  onSelectBoard,
  userName,
  userImage,
  userRole = 'collaborator',
  userTitle,
  onUserClick,
  notificationCount = 0,
}: AppShellSidebarProps) {
  const userRoleLabel =
    userTitle ||
    (userRole === 'manager'
      ? 'Gestor'
      : userRole === 'client'
        ? 'Cliente'
        : 'Colaborador');

  return (
    <aside
      className={cn(
        'sticky top-0 h-screen shrink-0 overflow-hidden border-r border-[#E5E7E4] bg-white dark:border-[#232425] dark:bg-[#121313] transition-all',
        collapsed ? 'w-[84px]' : 'w-[252px]',
      )}
    >
      <div className="flex h-full flex-col">
        <div className="mb-6">
          <div
            className={cn(
              'relative overflow-hidden border-b border-[#ECE7E2] bg-white shadow-[0_10px_24px_-24px_rgba(23,23,23,0.18)] dark:border-[#232425] dark:bg-[#171819] dark:shadow-none',
              collapsed ? 'h-[88px]' : 'h-[92px]',
            )}
          >
            <div
              className={cn(
                'relative z-10 flex h-full items-center px-5',
                collapsed ? 'justify-center' : 'justify-start pr-16',
              )}
            >
              <div
                className={cn(
                  'flex items-center text-[#171717] dark:text-white',
                  collapsed ? 'gap-0' : 'gap-[6px]',
                )}
              >
                {collapsed ? (
                  <img
                    src={WePlannerLogo}
                    alt="WePlanner"
                    className="h-11 w-11 shrink-0 object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.14)]"
                  />
                ) : (
                  <>
                    <img
                      src={WePlannerLogo}
                      alt="WePlanner"
                      className="h-9 w-8 shrink-0 object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.14)]"
                    />
                    <span className="text-[16px] font-[900] tracking-[-0.025em] leading-6 text-[#171717] dark:text-white">
                      WePlanner
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={onToggleCollapsed}
              className={cn(
                'absolute top-1/2 z-20 -translate-y-1/2 p-1.5 text-[#737373] transition-colors hover:text-[#171717] dark:text-white/80 dark:hover:text-white',
                collapsed ? 'right-2' : 'right-3',
              )}
              type="button"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>



        </div>

        <div className="space-y-2 px-4">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = isActiveItem(activePage, item.key);
            const action =
              item.key === 'overview-dashboard'
                ? onOpenOverview
                : item.key === 'boards-directory'
                ? onOpenBoard
                : item.key === 'reports-dashboard'
                  ? onOpenReports
                  : item.key === 'team'
                    ? onOpenTeam
                    : item.key === 'clients'
                      ? onOpenClients
                      : item.key === 'settings'
                        ? onOpenSettings
                        : item.key === 'design-system'
                          ? onOpenDesignSystem
                          : item.key === 'changelog'
                            ? onOpenChangelog
                            : undefined;

            // Hide settings item for non-managers
            if (item.managerOnly && userRole !== 'manager') return null;

            return (
              <div key={item.key} className="space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={action}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-colors',
                      isActive
                        ? 'bg-[#F6F8F6] text-[#171717] dark:bg-[#1A1B1C] dark:text-white'
                        : 'text-[#525252] hover:bg-[#F6F8F6] dark:text-[#A3A3A3] dark:hover:bg-[#1A1B1C]',
                      !action && !isActive && 'cursor-default opacity-70',
                      collapsed && 'justify-center',
                    )}
                    type="button"
                  >
                    <span className="relative flex shrink-0">
                      <item.icon className="h-4 w-4 shrink-0" />
                      {collapsed && item.key === 'overview-dashboard' && (
                        <>
                          {notificationCount > 0 ? (
                            <span className="absolute -right-2 -top-2 inline-flex min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-[#f32c2c] px-1 text-[10px] font-bold leading-4 text-white dark:border-[#121313]">
                              {notificationCount > 9 ? '9+' : notificationCount}
                            </span>
                          ) : null}
                        </>
                      )}
                    </span>
                    {!collapsed && (
                      <span className="flex min-w-0 flex-1 items-center gap-2">
                        <span>{item.label}</span>
                        {item.key === 'overview-dashboard' && (
                          <>
                            {notificationCount > 0 ? (
                              <span className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-[#f32c2c] px-2 py-0.5 text-[11px] font-semibold text-white">
                                {notificationCount > 99 ? '99+' : notificationCount}
                              </span>
                            ) : null}
                          </>
                        )}
                      </span>
                    )}
                  </button>

                </div>

                {/* Pinned boards — compact list, no expand/collapse, no create button */}
                {!collapsed && item.key === 'boards-directory' && pinnedBoards.length > 0 && (
                  <div className="space-y-0.5 pl-5 pt-1">
                    {pinnedBoards.map((board) => {
                      const isBoardActive = activeBoardId === board.id;
                      return (
                        <button
                          key={board.id}
                          type="button"
                          onClick={() => onSelectBoard(board.id)}
                          className={cn(
                            'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors',
                            isBoardActive
                              ? 'bg-[#FFF4EE] text-[#c2410c] dark:bg-[#26150f] dark:text-[#ffb39c]'
                              : 'text-[#666666] hover:bg-[#F6F8F6] dark:text-[#B4B4B4] dark:hover:bg-[#1A1B1C]',
                          )}
                        >
                          <span className={cn(
                            'h-2 w-2 shrink-0 rounded-full',
                            isBoardActive ? 'bg-[#ff5623]' : 'bg-[#D5D8D5] dark:bg-[#3A3D3F]',
                          )} />
                          <p className="truncate text-[13px] font-medium">{board.name}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-auto flex flex-col pt-4">
          <div className="px-4 mb-4">
            <div 
              className={cn(
                "flex items-center bg-[#F4F4F4] p-1 rounded-full dark:bg-[#1C1C1C]",
                collapsed ? "flex-col w-[44px] mx-auto gap-1" : "w-full relative"
              )}
            >
              {!collapsed && (
                <div 
                  className={cn(
                    "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-all duration-300 shadow-[0px_2px_4px_rgba(0,0,0,0.06)]", 
                    darkMode ? "bg-[#383838] left-[calc(50%+2px)]" : "bg-white left-1"
                  )} 
                />
              )}
              
              <button 
                onClick={() => { if(darkMode) onToggleDarkMode(); }} 
                className={cn(
                  "flex h-[36px] items-center justify-center rounded-full transition-all duration-300 z-10", 
                  collapsed ? "w-[36px]" : "flex-1 w-full",
                  !darkMode ? (collapsed ? "bg-white shadow-sm text-[#171717]" : "text-[#171717]") : "text-[#A3A3A3] hover:text-[#525252] dark:hover:text-[#D4D4D4]"
                )}
                title="Modo claro"
                type="button"
              >
                <Sun className="h-[18px] w-[18px]" />
              </button>

              <button 
                onClick={() => { if(!darkMode) onToggleDarkMode(); }} 
                className={cn(
                  "flex h-[36px] items-center justify-center rounded-full transition-all duration-300 z-10", 
                  collapsed ? "w-[36px]" : "flex-1 w-full",
                  darkMode ? (collapsed ? "bg-[#383838] shadow-sm text-white" : "text-white") : "text-[#8A8A8A] hover:text-[#525252] dark:hover:text-[#D4D4D4]"
                )}
                title="Modo escuro"
                type="button"
              >
                <Moon className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>

          <div
            className={cn(
              'pb-4',
              collapsed ? 'px-2' : 'px-4'
            )}
          >
            {collapsed ? (
              <div className="flex justify-center" onClick={onUserClick}>
                <Avatar className="h-10 w-10 cursor-pointer transition-all hover:ring-2 hover:ring-[#E5E5E5] dark:hover:ring-[#333333]">
                  <AvatarImage src={userImage} alt={userName} />
                  <AvatarFallback className="bg-[#E5E5E5] dark:bg-[#333333] text-xs font-semibold text-[#171717] dark:text-white">
                    {userName
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            ) : (
              <div
                onClick={onUserClick}
                className="flex cursor-pointer items-center gap-3 rounded-[14px] p-2 transition-colors hover:bg-[#F4F4F4] dark:hover:bg-[#1C1C1C]"
              >
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={userImage} alt={userName} />
                  <AvatarFallback className="bg-[#E5E5E5] dark:bg-[#333333] text-xs font-semibold text-[#171717] dark:text-white">
                    {userName
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium tracking-[-0.01em] text-[#171717] dark:text-white">
                    {userName}
                  </p>
                </div>
                <MoreHorizontal className="h-4 w-4 shrink-0 text-[#A3A3A3]" />
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
