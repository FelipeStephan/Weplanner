import { TaskDetailModal } from "../tasks/TaskDetailModal";
import { ClientLibraryModal } from "./ClientLibraryModal";
import { UserProfileCard } from "./UserProfileCard";
import { EditProfileModal } from "./EditProfileModal";
import { CreateBoardModal } from "../boards/CreateBoardModal";
import { CreateTaskModal } from "../tasks/CreateTaskModal";
import { OnboardingModal } from "../onboarding/OnboardingModal";
import { MODAL_TASK_DATA } from "../../data/modalTasks";
import { AVATAR_URLS } from "../../data/avatars";
import { clientLibraryRepository } from "../../../repositories/clientLibraryRepository";
import type { BoardCreateInput } from "../../../domain/boards/contracts";

interface GlobalModalsProps {
  // Task detail modal
  selectedTask: string | null;
  modalOpen: boolean;
  taskDataOverrides: Record<string, any>;
  onCloseTaskModal: () => void;
  onUpdateTaskField: (updates: Record<string, any>) => void;
  // Client library modal
  selectedClientLibraryId: string | null;
  onCloseClientLibrary: () => void;
  onOpenClientLibrary: (clientId: string | null, clientName?: string) => void;
  // User profile card (triggered by avatar click)
  profileUser: { name: string; image?: string } | null;
  profileAnchor: HTMLElement | null;
  profileMode?: 'own' | 'other';
  onCloseProfile: () => void;
  onEditProfile?: () => void;
  onLogout?: () => void;
  // Demo user profile card (design system showcase)
  profileDemoOpen: boolean;
  profileDemoAnchor: HTMLElement | null;
  onCloseProfileDemo: () => void;
  // Create board modal
  createBoardModalOpen: boolean;
  onCloseCreateBoard: () => void;
  onSubmitCreateBoard: (payload: BoardCreateInput) => void;
  // Create task modal
  showCreateModal: boolean;
  onCloseCreateTask: () => void;
  // Onboarding modal
  showOnboarding: boolean;
  onCloseOnboarding: () => void;
  userName: string;
  // Edit profile modal
  editProfileOpen: boolean;
  onCloseEditProfile: () => void;
  currentUserData: {
    name: string;
    image?: string;
    email?: string;
    phone?: string;
    title?: string;
  };
  onSaveProfile?: (updates: Record<string, any>) => void;
}

export function GlobalModals({
  selectedTask,
  modalOpen,
  taskDataOverrides,
  onCloseTaskModal,
  onUpdateTaskField,
  selectedClientLibraryId,
  onCloseClientLibrary,
  onOpenClientLibrary,
  profileUser,
  profileAnchor,
  profileMode = 'other',
  onCloseProfile,
  onEditProfile,
  onLogout,
  profileDemoOpen,
  profileDemoAnchor,
  onCloseProfileDemo,
  createBoardModalOpen,
  onCloseCreateBoard,
  onSubmitCreateBoard,
  showCreateModal,
  onCloseCreateTask,
  showOnboarding,
  onCloseOnboarding,
  userName,
  editProfileOpen,
  onCloseEditProfile,
  currentUserData,
  onSaveProfile,
}: GlobalModalsProps) {
  const resolveProfileRole = (name: string | undefined) => {
    if (name === "Ana Silva") return "manager" as const;
    if (name === "Rafael Santos") return "client" as const;
    return "collaborator" as const;
  };

  const resolveProfileTitle = (name: string | undefined) => {
    if (name === "Ana Silva") return "Gestora de Projetos";
    if (name === "Carlos Lima") return "Desenvolvedor Frontend";
    if (name === "Mariana Costa") return "Designer UI/UX";
    if (name === "Rafael Santos") return "Diretor de Marketing";
    return "Analista de QA";
  };

  return (
    <>
      {/* Task Detail Modal */}
      {selectedTask && MODAL_TASK_DATA[selectedTask] && (
        <TaskDetailModal
          isOpen={modalOpen}
          onClose={onCloseTaskModal}
          onOpenClientLibrary={(clientId, clientName) => {
            const resolvedClientId =
              clientId ||
              (clientName
                ? clientLibraryRepository.getByClientName(clientName)?.id ?? null
                : null);
            onOpenClientLibrary(resolvedClientId);
          }}
          onUpdateTaskField={onUpdateTaskField}
          task={{
            ...MODAL_TASK_DATA[selectedTask],
            ...(taskDataOverrides[selectedTask] ?? {}),
          }}
        />
      )}

      {/* Client Library Modal */}
      <ClientLibraryModal
        isOpen={!!selectedClientLibraryId}
        clientId={selectedClientLibraryId}
        onClose={onCloseClientLibrary}
      />

      {/* User Profile Card */}
      <UserProfileCard
        user={{
          ...(profileUser || { name: "" }),
          role: resolveProfileRole(profileUser?.name),
          title: resolveProfileTitle(profileUser?.name),
        }}
        isOpen={!!profileUser}
        onClose={onCloseProfile}
        anchorEl={profileAnchor}
        mode={profileMode}
        onEditProfile={onEditProfile}
        onLogout={onLogout}
      />

      {/* Demo User Profile Card (design system showcase) */}
      <UserProfileCard
        user={{
          name: "Ana Silva",
          image: AVATAR_URLS[0],
          role: "manager",
          title: "Gestora de Projetos",
        }}
        isOpen={profileDemoOpen}
        onClose={onCloseProfileDemo}
        anchorEl={profileDemoAnchor}
      />

      {/* Create Board Modal */}
      <CreateBoardModal
        isOpen={createBoardModalOpen}
        onClose={onCloseCreateBoard}
        onSubmit={(payload) => onSubmitCreateBoard(payload as BoardCreateInput)}
      />

      {/* Create Task Modal */}
      <CreateTaskModal isOpen={showCreateModal} onClose={onCloseCreateTask} />

      {/* Onboarding Modal */}
      <OnboardingModal
        userName={userName}
        show={showOnboarding}
        onClose={onCloseOnboarding}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={editProfileOpen}
        onClose={onCloseEditProfile}
        user={currentUserData}
        onSave={onSaveProfile}
      />
    </>
  );
}
