import type { AppRole } from '../boards/contracts';

// ─── Permissions ─────────────────────────────────────────────────────────────

export interface MemberPermissions {
  /** Ver e editar o campo de créditos nas tarefas */
  view_task_credits: boolean;
  /** Acesso à seção de relatórios operacionais */
  view_operational_reports: boolean;
  /** Acesso à seção de gestão de créditos */
  view_credits_reports: boolean;
  /** Criar e editar boards */
  manage_boards: boolean;
  /** Arquivar e cancelar tarefas */
  archive_cancel_tasks: boolean;
  /** Transferir tarefas entre boards */
  send_tasks_between_boards: boolean;
}

export const DEFAULT_PERMISSIONS: Record<AppRole, MemberPermissions> = {
  manager: {
    view_task_credits: true,
    view_operational_reports: true,
    view_credits_reports: true,
    manage_boards: true,
    archive_cancel_tasks: true,
    send_tasks_between_boards: true,
  },
  collaborator: {
    view_task_credits: false,
    view_operational_reports: false,
    view_credits_reports: false,
    manage_boards: false,
    archive_cancel_tasks: false,
    send_tasks_between_boards: false,
  },
  client: {
    view_task_credits: false,
    view_operational_reports: false,
    view_credits_reports: false,
    manage_boards: false,
    archive_cancel_tasks: false,
    send_tasks_between_boards: false,
  },
};

/** Retorna as permissões efetivas de um membro (padrão do cargo + overrides individuais). */
export function resolvePermissions(
  role: AppRole,
  overrides?: Partial<MemberPermissions>,
): MemberPermissions {
  if (role === 'client') {
    // Clientes têm permissões fixas — sem override
    return { ...DEFAULT_PERMISSIONS.client };
  }
  return {
    ...DEFAULT_PERMISSIONS[role],
    ...(overrides ?? {}),
  };
}

// ─── Permission labels (para UI) ─────────────────────────────────────────────

export const PERMISSION_LABELS: Record<keyof MemberPermissions, { label: string; description: string }> = {
  view_task_credits: {
    label: 'Ver créditos nas tarefas',
    description: 'Exibe o campo e badge de créditos nos cards e no modal de tarefa',
  },
  view_operational_reports: {
    label: 'Relatórios operacionais',
    description: 'Acesso ao dashboard de relatórios operacionais do workflow',
  },
  view_credits_reports: {
    label: 'Relatórios de créditos',
    description: 'Acesso à seção de gestão de créditos por cliente',
  },
  manage_boards: {
    label: 'Criar e editar boards',
    description: 'Pode criar boards novos, editar nome, membros e colunas',
  },
  archive_cancel_tasks: {
    label: 'Arquivar e cancelar tarefas',
    description: 'Pode arquivar ou cancelar tarefas em qualquer board acessível',
  },
  send_tasks_between_boards: {
    label: 'Transferir tarefas entre boards',
    description: 'Pode usar a função "Enviar para outro board"',
  },
};

// ─── TeamMember ───────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: AppRole;
  jobTitle?: string;
  department?: string;
  color?: string;
  status: 'active' | 'invited' | 'inactive';
  /** Apenas para role === 'client' — vínculo com ClientRecord */
  clientId?: string | null;
  /** Boards acessíveis */
  boardIds: string[];
  /** Override individual de permissões — não aplicável a clientes */
  permissions?: Partial<MemberPermissions>;
  joinedAt?: string;
  invitedAt?: string;
  invitedBy?: string;
  // Campos sensíveis — visíveis apenas pelo próprio usuário ou manager
  phone?: string;
  location?: string;
}

// ─── TeamInvite ───────────────────────────────────────────────────────────────

export type InviteRole = 'manager' | 'collaborator' | 'client';
export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

export interface TeamInvite {
  id: string;
  email: string;
  role: InviteRole;
  invitedBy: string;
  token: string;
  status: InviteStatus;
  expiresAt: string;
  createdAt: string;
  boardIds?: string[];
  /** Somente para convites de cliente */
  clientId?: string | null;
}
