import type { PersistedKanbanWorkspaceSnapshot } from '../app/data/kanban-workspace-persistence';
import { kanbanWorkspaceRepository } from './kanbanWorkspaceRepository';

export const reportsRepository = {
  loadSnapshot(seedSnapshot: PersistedKanbanWorkspaceSnapshot) {
    return kanbanWorkspaceRepository.load(seedSnapshot);
  },
};
