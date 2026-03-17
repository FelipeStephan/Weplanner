import type {
  PersistedKanbanWorkspaceSnapshot,
  PersistedTaskRecord,
  PersistedTaskStatusHistoryRecord,
} from '../app/data/kanban-workspace-persistence';
import { kanbanWorkspaceRepository } from './kanbanWorkspaceRepository';

export const tasksRepository = {
  listByBoard(
    seedSnapshot: PersistedKanbanWorkspaceSnapshot,
    boardId: string,
  ): PersistedTaskRecord[] {
    return kanbanWorkspaceRepository
      .load(seedSnapshot)
      .tasks.filter((task) => task.boardId === boardId);
  },
  listStatusHistory(
    seedSnapshot: PersistedKanbanWorkspaceSnapshot,
    boardId: string,
  ): PersistedTaskStatusHistoryRecord[] {
    const taskIds = new Set(
      kanbanWorkspaceRepository
        .load(seedSnapshot)
        .tasks.filter((task) => task.boardId === boardId)
        .map((task) => task.id),
    );

    return kanbanWorkspaceRepository
      .load(seedSnapshot)
      .taskStatusHistory.filter((entry) => taskIds.has(entry.taskId));
  },
};
