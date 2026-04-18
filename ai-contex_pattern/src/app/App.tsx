import { useState, useEffect, useMemo } from "react";
import {
  AppShellSidebar,
} from "./components/shared/AppShellChrome";
import { KanbanWorkspacePage } from "./components/boards/KanbanWorkspacePage";
import { OverviewDashboardPage } from "./components/dashboard/OverviewDashboardPage";
import { ReportsDashboardPage } from "./components/reports/ReportsDashboardPage";
import { TeamPage } from "./components/team/TeamPage";
import { WorkspaceProvider } from "../context/WorkspaceContext";
import { WorkspaceSettingsProvider } from "../context/WorkspaceSettingsContext";
import { WorkspaceSettingsPage } from "./components/settings/WorkspaceSettingsPage";
import { teamRepository } from "../repositories/teamRepository";
import { TEAM_DEMO_MEMBERS, TEAM_DEMO_INVITES } from "../demo/teamDemoData";
import { CLIENTS_DEMO_SEED } from "../demo/clientsDemoData";
import { clientsRepository } from "../repositories/clientsRepository";
import { ClientsPage } from "./components/clients/ClientsPage";
import { BOARD_DIRECTORY_CLIENTS } from "../demo/boardDirectory";
import type { NotificationItem } from "./components/shared/NotificationCard";
import { LoginPage } from "./components/auth/LoginPage";
import { boardsRepository } from "../repositories/boardsRepository";
import { createInitialKanbanWorkspaceSnapshot, DEFAULT_BOARD_ID } from "../demo/kanbanWorkspaceSeed";
import { BOARD_DIRECTORY_USERS } from "../demo/boardDirectory";
import type { BoardCreateInput, BoardViewerContext } from "../domain/boards/contracts";
import { AVATAR_URLS } from "./data/avatars";
import { TEAM } from "./data/team";
import type { Role, PageView } from "./types/navigation";
import { getRouteStateFromHash } from "./utils/routeState";
import { GlobalModals } from "./components/shared/GlobalModals";
import { DesignSystemPage } from "./pages/DesignSystemPage";
import { useNotifications } from "./hooks/useNotifications";
import { useClientsData } from "./hooks/useClientsData";
import {
  openOverviewDashboardPage,
  openDesignSystemPage,
  openReportsDashboardPage,
  openTeamPage,
  openSettingsPage,
  openClientsPage,
} from "./utils/navigation";

export default function App() {
  const initialRouteState = useMemo(() => getRouteStateFromHash(), []);
  const [pageView, setPageView] =
    useState<PageView>(initialRouteState.pageView);
  const [selectedBoardId, setSelectedBoardId] = useState<string>(
    initialRouteState.boardId || DEFAULT_BOARD_ID,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<
    string | null
  >(null);
  const [taskDataOverrides, setTaskDataOverrides] = useState<Record<string, any>>({});
  const [activeRole, setActiveRole] = useState<Role>("manager");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);
  const [profileUser, setProfileUser] = useState<{
    name: string;
    image?: string;
  } | null>(null);
  const [profileAnchor, setProfileAnchor] =
    useState<HTMLElement | null>(null);
  const [profileDemoOpen, setProfileDemoOpen] = useState(false);
  const [profileDemoAnchor, setProfileDemoAnchor] =
    useState<HTMLElement | null>(null);
  const [createBoardModalOpen, setCreateBoardModalOpen] = useState(false);
  const [selectedClientLibraryId, setSelectedClientLibraryId] = useState<string | null>(null);

  // --- Hooks ---
  const {
    notifications,
    unreadCount: unreadNotificationCount,
    overviewFocusSignal: overviewNotificationFocusSignal,
    markAsRead: markNotificationAsRead,
    markAllRead: markAllNotificationsAsRead,
    markBoardRead: markBoardNotificationsAsRead,
    bumpOverviewFocus,
  } = useNotifications();
  const { clientsList, refreshClients } = useClientsData();
  const initialWorkspaceSeed = useMemo(
    () => createInitialKanbanWorkspaceSnapshot(),
    [],
  );
  const [workspaceSnapshot, setWorkspaceSnapshot] = useState(() =>
    boardsRepository.loadWorkspace(initialWorkspaceSeed),
  );

  const refreshWorkspaceSnapshot = () => {
    setWorkspaceSnapshot(boardsRepository.loadWorkspace(initialWorkspaceSeed));
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const activeViewerContext = useMemo<BoardViewerContext>(() => {
    if (activeRole === "client") {
      return {
        role: "client",
        userId: "user-luiza-arcadia",
      };
    }

    if (activeRole === "collaborator") {
      return {
        role: "collaborator",
        userId: "user-carlos",
      };
    }

    return {
      role: "manager",
      userId: "user-ana",
    };
  }, [activeRole]);

  const visibleBoards = useMemo(
    () => boardsRepository.listVisible(initialWorkspaceSeed, activeViewerContext),
    [activeViewerContext, initialWorkspaceSeed, workspaceSnapshot],
  );

  const activeShellUser = useMemo(() => {
    if (activeRole === "client") {
      return (
        BOARD_DIRECTORY_USERS.find((member) => member.id === "user-luiza-arcadia") || {
          name: "Luiza Arcadia",
          image: AVATAR_URLS[0],
        }
      );
    }

    const targetUserId =
      activeRole === "collaborator" ? "user-carlos" : "user-ana";

    return (
      BOARD_DIRECTORY_USERS.find((member) => member.id === targetUserId) || {
        name: "Ana Silva",
        image: AVATAR_URLS[0],
      }
    );
  }, [activeRole]);

  useEffect(() => {
    const syncPageFromHash = () => {
      const routeState = getRouteStateFromHash();
      setPageView(routeState.pageView);
      if (routeState.boardId) {
        setSelectedBoardId(routeState.boardId);
      }
    };

    syncPageFromHash();
    window.addEventListener("hashchange", syncPageFromHash);

    return () => {
      window.removeEventListener("hashchange", syncPageFromHash);
    };
  }, []);

  useEffect(() => {
    if (visibleBoards.length === 0) {
      return;
    }

    if (!visibleBoards.some((board) => board.id === selectedBoardId)) {
      setSelectedBoardId(visibleBoards[0].id);
    }
  }, [selectedBoardId, visibleBoards]);

  const openKanbanWorkspacePage = (boardId?: string, cardId?: string) => {
    const nextBoardId = boardId || selectedBoardId || visibleBoards[0]?.id || DEFAULT_BOARD_ID;
    setSelectedBoardId(nextBoardId);
    const params = new URLSearchParams({ board: nextBoardId });
    if (cardId) {
      params.set("card", cardId);
    }
    window.location.hash = `/kanban-workspace?${params.toString()}`;
  };


  const handleOpenNotification = (notification: NotificationItem) => {
    markNotificationAsRead(notification.id);
    if (notification.boardId || notification.taskId) {
      openKanbanWorkspacePage(notification.boardId, notification.taskId);
      return;
    }
    bumpOverviewFocus();
    openOverviewDashboardPage();
  };

  const handleCreateBoard = (payload: BoardCreateInput) => {
    const { board, snapshot } = boardsRepository.create(initialWorkspaceSeed, payload);
    setWorkspaceSnapshot(snapshot);
    setCreateBoardModalOpen(false);
    openKanbanWorkspacePage(board.id);
  };

  const handleAvatarClick = (
    avatar: { name: string; image?: string },
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    setProfileUser(avatar);
    setProfileAnchor(event.currentTarget);
  };

  if (pageView === "login") {
    return (
      <LoginPage
        onLoginSuccess={() => {
          openOverviewDashboardPage();
          setShowOnboarding(true);
        }}
        darkMode={darkMode}
      />
    );
  }

  return (
    <WorkspaceSettingsProvider>
    <WorkspaceProvider>
    <div
      className={`min-h-screen bg-[#f5f5f7] dark:bg-[#0a0a0a] transition-colors duration-300`}
    >
      <div className="flex min-h-screen">
        <AppShellSidebar
          collapsed={collapsedSidebar}
          onToggleCollapsed={() => setCollapsedSidebar((current) => !current)}
          activePage={pageView as any}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onOpenOverview={openOverviewDashboardPage}
          onOpenDesignSystem={openDesignSystemPage}
          onOpenBoard={() => openKanbanWorkspacePage()}
          onOpenReports={openReportsDashboardPage}
          onOpenTeam={openTeamPage}
          onOpenSettings={openSettingsPage}
          onOpenClients={openClientsPage}
          boards={visibleBoards}
          activeBoardId={selectedBoardId}
          onSelectBoard={(boardId) => openKanbanWorkspacePage(boardId)}
          onCreateBoard={() => setCreateBoardModalOpen(true)}
          canCreateBoards={activeRole === "manager"}
          userName={activeShellUser.name}
          userImage={activeShellUser.image}
          userRole={activeRole}
          userTitle={activeShellUser.title}
          notificationCount={unreadNotificationCount}
          onUserClick={(e) =>
            handleAvatarClick(
              {
                name: activeShellUser.name,
                image: activeShellUser.image,
                role: activeShellUser.role,
                title: activeShellUser.title,
              },
              e as any,
            )
          }
        />

      {/* Main Content */}
      <main
        className={`min-w-0 flex-1 ${
          pageView === "overview-dashboard" || pageView === "kanban-workspace" || pageView === "reports-dashboard" || pageView === "team" || pageView === "settings" || pageView === "clients"
            ? "w-full"
            : "px-4 md:px-6 py-6 md:py-8"
        }`}
      >
        {pageView === "overview-dashboard" && (
          <OverviewDashboardPage
            snapshot={workspaceSnapshot}
            viewer={activeViewerContext}
            currentUser={{
              id: activeShellUser.id,
              name: activeShellUser.name,
              image: activeShellUser.image,
              role: activeRole,
            }}
            onOpenBoard={openKanbanWorkspacePage}
            notifications={notifications}
            unreadNotificationCount={unreadNotificationCount}
            onOpenNotification={handleOpenNotification}
            onMarkAllNotificationsRead={markAllNotificationsAsRead}
            focusNotificationsSignal={overviewNotificationFocusSignal}
          />
        )}

        {pageView === "kanban-workspace" && (
          <KanbanWorkspacePage
            key={selectedBoardId}
            boardId={selectedBoardId}
            onBackToDesignSystem={openDesignSystemPage}
            onOpenBoard={openKanbanWorkspacePage}
            onWorkspaceMetadataChange={refreshWorkspaceSnapshot}
            canManageBoards={activeRole === "manager"}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            notifications={notifications}
            onOpenNotification={handleOpenNotification}
            onMarkBoardNotificationsRead={markBoardNotificationsAsRead}
          />
        )}

        {pageView === "reports-dashboard" && (
          <ReportsDashboardPage
            onBackToDesignSystem={openDesignSystemPage}
            onOpenBoard={openKanbanWorkspacePage}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            isManager={activeRole === "manager"}
          />
        )}

        {pageView === "team" && (
          <TeamPage
            members={teamRepository.listMembers(TEAM_DEMO_MEMBERS)}
            invites={teamRepository.listInvites(TEAM_DEMO_INVITES)}
            boards={visibleBoards}
            clients={BOARD_DIRECTORY_CLIENTS}
            viewerRole={activeRole}
            viewerId={activeViewerContext.userId ?? ""}
            onUpdateMember={(id, patch) => {
              teamRepository.updateMember(id, patch, TEAM_DEMO_MEMBERS);
              refreshWorkspaceSnapshot();
            }}
            onDeactivateMember={(id) => {
              teamRepository.deactivateMember(id, TEAM_DEMO_MEMBERS);
              refreshWorkspaceSnapshot();
            }}
            onReactivateMember={(id) => {
              teamRepository.updateMember(id, { status: "active" }, TEAM_DEMO_MEMBERS);
              refreshWorkspaceSnapshot();
            }}
            onDeleteMember={(id) => {
              teamRepository.deleteMember(id, TEAM_DEMO_MEMBERS);
              refreshWorkspaceSnapshot();
            }}
            onInvite={(data) => {
              teamRepository.createInvite(
                { ...data, boardIds: [], invitedBy: activeViewerContext.userId ?? "user-ana" },
                TEAM_DEMO_INVITES,
              );
              refreshWorkspaceSnapshot();
            }}
            onCancelInvite={(id) => {
              teamRepository.cancelInvite(id, TEAM_DEMO_INVITES);
              refreshWorkspaceSnapshot();
            }}
            onResendInvite={(id) => {
              teamRepository.resendInvite(id, TEAM_DEMO_INVITES);
              refreshWorkspaceSnapshot();
            }}
          />
        )}

        {pageView === "settings" && (
          <WorkspaceSettingsPage />
        )}

        {pageView === "clients" && (
          <ClientsPage
            clients={clientsList}
            boards={visibleBoards}
            members={teamRepository.listMembers(TEAM_DEMO_MEMBERS)}
            users={BOARD_DIRECTORY_USERS as Array<{ id: string; name: string; image?: string; color?: string }>}
            canEdit={activeRole === "manager"}
            onCreateClient={(input) => {
              clientsRepository.create(CLIENTS_DEMO_SEED, input);
              refreshClients();
            }}
            onUpdateClient={(id, patch) => {
              clientsRepository.update(id, patch, CLIENTS_DEMO_SEED);
              refreshClients();
            }}
            onDeleteClient={(id) => {
              clientsRepository.delete(id, CLIENTS_DEMO_SEED);
              refreshClients();
            }}
            onInviteClient={() => {
              window.location.hash = "/team";
            }}
          />
        )}

        {pageView === "design-system" && (
          <DesignSystemPage
            notifications={notifications}
            onOpenBoard={openKanbanWorkspacePage}
          />
        )}
      </main>
      </div>

      {/* Global Modals */}
      <GlobalModals
        selectedTask={selectedTask}
        modalOpen={modalOpen}
        taskDataOverrides={taskDataOverrides}
        onCloseTaskModal={() => { setModalOpen(false); setSelectedTask(null); }}
        onUpdateTaskField={(updates) => {
          setTaskDataOverrides((prev) => ({
            ...prev,
            [selectedTask!]: { ...prev[selectedTask!], ...updates },
          }));
        }}
        selectedClientLibraryId={selectedClientLibraryId}
        onCloseClientLibrary={() => setSelectedClientLibraryId(null)}
        onOpenClientLibrary={(clientId) => setSelectedClientLibraryId(clientId)}
        profileUser={profileUser}
        profileAnchor={profileAnchor}
        onCloseProfile={() => { setProfileUser(null); setProfileAnchor(null); }}
        profileDemoOpen={profileDemoOpen}
        profileDemoAnchor={profileDemoAnchor}
        onCloseProfileDemo={() => setProfileDemoOpen(false)}
        createBoardModalOpen={createBoardModalOpen}
        onCloseCreateBoard={() => setCreateBoardModalOpen(false)}
        onSubmitCreateBoard={(payload) => handleCreateBoard(payload)}
        showCreateModal={showCreateModal}
        onCloseCreateTask={() => setShowCreateModal(false)}
        showOnboarding={showOnboarding}
        onCloseOnboarding={() => setShowOnboarding(false)}
        userName={activeShellUser.name}
      />
    </div>
    </WorkspaceProvider>
    </WorkspaceSettingsProvider>
  );
}
