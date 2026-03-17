import {
  clearPersistedKanbanWorkspaceSnapshot,
  loadPersistedKanbanWorkspaceSnapshot,
  savePersistedKanbanWorkspaceSnapshot,
  type PersistedKanbanWorkspaceSnapshot,
} from '../app/data/kanban-workspace-persistence';

export const kanbanWorkspaceRepository = {
  load(seedSnapshot: PersistedKanbanWorkspaceSnapshot) {
    return loadPersistedKanbanWorkspaceSnapshot(seedSnapshot);
  },
  save(snapshot: PersistedKanbanWorkspaceSnapshot) {
    savePersistedKanbanWorkspaceSnapshot(snapshot);
  },
  clear() {
    clearPersistedKanbanWorkspaceSnapshot();
  },
};
