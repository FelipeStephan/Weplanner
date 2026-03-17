import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Moon,
  Plus,
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

export type AppShellPage = 'overview-dashboard' | 'design-system' | 'kanban-workspace' | 'reports-dashboard';

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
  boards: BoardRecord[];
  activeBoardId?: string | null;
  onSelectBoard: (boardId: string) => void;
  onCreateBoard?: () => void;
  canCreateBoards?: boolean;
  userName: string;
  userImage?: string;
  userRole?: 'client' | 'manager' | 'collaborator';
  userTitle?: string;
  onUserClick?: (event: ReactMouseEvent<HTMLDivElement>) => void;
}

const SIDEBAR_ITEMS: Array<{
  key: AppShellPage | 'team';
  label: string;
  icon: LucideIcon;
}> = [
  { key: 'overview-dashboard', label: 'Visao geral', icon: LayoutDashboard },
  { key: 'kanban-workspace', label: 'Board', icon: FolderKanban },
  { key: 'reports-dashboard', label: 'Relatorios', icon: BarChart3 },
  { key: 'team', label: 'Equipe', icon: Users },
  { key: 'design-system', label: 'Design System', icon: Sparkles },
];

const isActiveItem = (activePage: AppShellPage, itemKey: AppShellPage | 'team') =>
  activePage === itemKey;

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
  boards,
  activeBoardId,
  onSelectBoard,
  onCreateBoard,
  canCreateBoards = false,
  userName,
  userImage,
  userRole = 'collaborator',
  userTitle,
  onUserClick,
}: AppShellSidebarProps) {
  const [isBoardsExpanded, setIsBoardsExpanded] = useState(true);
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

          <div className={cn('mt-4', collapsed ? 'px-4' : 'px-5')}>
            {collapsed ? (
              <div className="flex justify-center" onClick={onUserClick}>
                <Avatar className="h-11 w-11 cursor-pointer transition-all hover:ring-2 hover:ring-[#ff5623]/20">
                  <AvatarImage src={userImage} alt={userName} />
                  <AvatarFallback className="bg-[#ff5623] text-xs font-medium text-white">
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
                className="flex cursor-pointer items-center gap-3 px-1 py-1.5"
              >
                <Avatar className="h-11 w-11 shrink-0">
                  <AvatarImage src={userImage} alt={userName} />
                  <AvatarFallback className="bg-[#ff5623] text-xs font-medium text-white">
                    {userName
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold tracking-[-0.02em] text-[#171717] dark:text-white">
                    {userName}
                  </p>
                  <p className="truncate text-[12px] text-[#8A8A8A] dark:text-[#A3A3A3]">
                    {userRoleLabel}
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        <div className="space-y-2 px-4">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = isActiveItem(activePage, item.key);
            const action =
              item.key === 'overview-dashboard'
                ? onOpenOverview
                : item.key === 'kanban-workspace'
                ? onOpenBoard
                : item.key === 'reports-dashboard'
                  ? onOpenReports
                  : item.key === 'design-system'
                    ? onOpenDesignSystem
                    : undefined;

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
                      {collapsed && item.key === 'overview' && (
                        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#f32c2c] dark:border-[#121313]" />
                      )}
                    </span>
                    {!collapsed && (
                      <span className="flex min-w-0 flex-1 items-center gap-2">
                        <span>{item.label}</span>
                        {item.key === 'overview' && (
                          <span className="h-2 w-2 rounded-full bg-[#f32c2c]" />
                        )}
                        {item.key === 'kanban-workspace' && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setIsBoardsExpanded((current) => !current);
                            }}
                            className="ml-auto inline-flex items-center gap-2 rounded-lg p-1 text-[#8A8A8A] transition-colors hover:bg-[#EEF1EF] hover:text-[#171717] dark:text-[#A3A3A3] dark:hover:bg-[#242526] dark:hover:text-white"
                            aria-label={isBoardsExpanded ? 'Recolher boards' : 'Expandir boards'}
                          >
                            <ChevronDown
                              className={cn(
                                'h-4 w-4 transition-transform duration-200',
                                !isBoardsExpanded && '-rotate-90',
                              )}
                            />
                          </button>
                        )}
                      </span>
                    )}
                  </button>

                  {!collapsed && item.key === 'kanban-workspace' && canCreateBoards && onCreateBoard && (
                    <button
                      type="button"
                      onClick={onCreateBoard}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#E5E7E4] bg-white text-[#525252] transition-colors hover:border-[#ff5623]/25 hover:bg-[#FFF4EE] hover:text-[#c2410c] dark:border-[#2D2F30] dark:bg-[#171819] dark:text-[#D4D4D4] dark:hover:border-[#ff8c69]/35 dark:hover:bg-[#26150f] dark:hover:text-[#ffb39c]"
                      title="Criar board"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {!collapsed && item.key === 'kanban-workspace' && boards.length > 0 && isBoardsExpanded && (
                  <div className="space-y-1 pl-5">
                    {boards.map((board) => {
                      const isBoardActive = activeBoardId === board.id;

                      return (
                        <button
                          key={board.id}
                          type="button"
                          onClick={() => onSelectBoard(board.id)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition-colors',
                            isBoardActive
                              ? 'bg-[#FFF4EE] text-[#c2410c] dark:bg-[#26150f] dark:text-[#ffb39c]'
                              : 'text-[#666666] hover:bg-[#F6F8F6] dark:text-[#B4B4B4] dark:hover:bg-[#1A1B1C]',
                          )}
                        >
                          <span className={cn(
                            'h-2.5 w-2.5 rounded-full',
                            isBoardActive ? 'bg-[#ff5623]' : 'bg-[#D5D8D5] dark:bg-[#3A3D3F]',
                          )} />
                          <div className="min-w-0">
                            <p className="truncate font-medium">{board.name}</p>
                            {board.description && (
                              <p className="truncate text-[11px] text-[#A3A3A3] dark:text-[#737373]">
                                {board.description}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-auto border-t border-[#E5E7E4] px-4 pt-4 pb-4 dark:border-[#232425]">
          {collapsed ? (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={onToggleDarkMode}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E5E7E4] bg-[#F6F8F6] text-[#525252] transition-colors hover:bg-white dark:border-[#2D2F30] dark:bg-[#171819] dark:text-[#F5F5F5] dark:hover:bg-[#1e2021]"
                title={darkMode ? 'Modo claro' : 'Modo escuro'}
                type="button"
              >
                {darkMode ? <Sun className="h-4 w-4 text-[#feba31]" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E5E7E4] bg-[#F6F8F6] text-[#525252] transition-colors hover:bg-white dark:border-[#2D2F30] dark:bg-[#171819] dark:text-[#F5F5F5] dark:hover:bg-[#1e2021]"
                title="Sair"
                type="button"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleDarkMode}
                className="flex flex-1 items-center gap-2 rounded-2xl border border-[#E5E7E4] bg-[#F6F8F6] px-3 py-3 text-left transition-colors hover:bg-white dark:border-[#2D2F30] dark:bg-[#171819] dark:hover:bg-[#1e2021]"
                title={darkMode ? 'Modo claro' : 'Modo escuro'}
                type="button"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E5E7E4] bg-white text-[#525252] dark:border-[#353637] dark:bg-[#202223] dark:text-[#F5F5F5]">
                  {darkMode ? <Sun className="h-4 w-4 text-[#feba31]" /> : <Moon className="h-4 w-4" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold text-[#171717] dark:text-white">
                    Tema
                  </span>
                </span>
              </button>
              <button
                className="flex flex-1 items-center gap-2 rounded-2xl border border-[#E5E7E4] bg-[#F6F8F6] px-3 py-3 text-left transition-colors hover:bg-white dark:border-[#2D2F30] dark:bg-[#171819] dark:hover:bg-[#1e2021]"
                title="Sair"
                type="button"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E5E7E4] bg-white text-[#525252] dark:border-[#353637] dark:bg-[#202223] dark:text-[#F5F5F5]">
                  <LogOut className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold text-[#171717] dark:text-white">
                    Sair
                  </span>
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
