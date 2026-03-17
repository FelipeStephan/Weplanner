export type AppRole = 'client' | 'manager' | 'collaborator';

export type BoardTemplateKey = 'operations-kanban';

export interface BoardAccessRecord {
  managerAccess: 'all';
  memberUserIds: string[];
}

export interface BoardViewerContext {
  role: AppRole;
  userId?: string | null;
}

export interface BoardCreateInput {
  name: string;
  description?: string;
  templateKey?: BoardTemplateKey;
  memberUserIds?: string[];
}

export interface BoardUpdateInput {
  name: string;
  description?: string;
  memberUserIds?: string[];
}
