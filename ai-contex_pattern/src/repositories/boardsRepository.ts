import type {
  PersistedBoardRecord,
  PersistedColumnRecord,
  PersistedKanbanWorkspaceSnapshot,
} from '../app/data/kanban-workspace-persistence';
import { createBoardFromTemplate, DEFAULT_BOARD_TEMPLATE_KEY } from '../demo/kanbanWorkspaceSeed';
import type { BoardCreateInput, BoardUpdateInput, BoardViewerContext } from '../domain/boards/contracts';
import { kanbanWorkspaceRepository } from './kanbanWorkspaceRepository';

const slugifyBoardName = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'novo-board';

const ensureUniqueBoardId = (snapshot: PersistedKanbanWorkspaceSnapshot, baseId: string) => {
  let nextId = baseId;
  let index = 2;

  while (snapshot.boards.some((board) => board.id === nextId)) {
    nextId = `${baseId}-${index}`;
    index += 1;
  }

  return nextId;
};

const isBoardVisibleToViewer = (
  board: PersistedBoardRecord,
  viewer: BoardViewerContext,
) => {
  if (viewer.role === 'manager') {
    return true;
  }

  return !!viewer.userId && board.access.memberUserIds.includes(viewer.userId);
};

export const boardsRepository = {
  loadWorkspace(seedSnapshot: PersistedKanbanWorkspaceSnapshot) {
    return kanbanWorkspaceRepository.load(seedSnapshot);
  },
  list(seedSnapshot: PersistedKanbanWorkspaceSnapshot): PersistedBoardRecord[] {
    return kanbanWorkspaceRepository.load(seedSnapshot).boards;
  },
  listVisible(
    seedSnapshot: PersistedKanbanWorkspaceSnapshot,
    viewer: BoardViewerContext,
  ): PersistedBoardRecord[] {
    return kanbanWorkspaceRepository
      .load(seedSnapshot)
      .boards.filter((board) => isBoardVisibleToViewer(board, viewer));
  },
  getById(
    seedSnapshot: PersistedKanbanWorkspaceSnapshot,
    boardId: string,
  ): PersistedBoardRecord | undefined {
    return kanbanWorkspaceRepository.load(seedSnapshot).boards.find((board) => board.id === boardId);
  },
  listColumns(
    seedSnapshot: PersistedKanbanWorkspaceSnapshot,
    boardId: string,
  ): PersistedColumnRecord[] {
    return kanbanWorkspaceRepository
      .load(seedSnapshot)
      .columns.filter((column) => column.boardId === boardId);
  },
  create(
    seedSnapshot: PersistedKanbanWorkspaceSnapshot,
    input: BoardCreateInput,
  ) {
    const snapshot = kanbanWorkspaceRepository.load(seedSnapshot);
    const createdAt = new Date().toISOString();
    const baseId = `board-${slugifyBoardName(input.name)}`;
    const id = ensureUniqueBoardId(snapshot, baseId);
    const { board, columns } = createBoardFromTemplate(
      id,
      {
        ...input,
        templateKey: input.templateKey ?? DEFAULT_BOARD_TEMPLATE_KEY,
      },
      createdAt,
    );

    const nextSnapshot: PersistedKanbanWorkspaceSnapshot = {
      ...snapshot,
      boards: [...snapshot.boards, board],
      columns: [...snapshot.columns, ...columns],
      tasks: snapshot.tasks,
      taskStatusHistory: snapshot.taskStatusHistory,
      persistedAt: createdAt,
      schemaVersion: 3,
    };

    kanbanWorkspaceRepository.save(nextSnapshot);

    return {
      snapshot: nextSnapshot,
      board,
    };
  },
  update(
    seedSnapshot: PersistedKanbanWorkspaceSnapshot,
    boardId: string,
    input: BoardUpdateInput,
  ) {
    const snapshot = kanbanWorkspaceRepository.load(seedSnapshot);
    const updatedAt = new Date().toISOString();
    let updatedBoard: PersistedBoardRecord | null = null;

    const nextBoards = snapshot.boards.map((board) => {
      if (board.id !== boardId) {
        return board;
      }

      updatedBoard = {
        ...board,
        name: input.name.trim(),
        description: input.description?.trim() || '',
        access: {
          managerAccess: 'all',
          memberUserIds: Array.from(new Set(input.memberUserIds ?? [])),
        },
        updatedAt,
      };

      return updatedBoard;
    });

    const nextSnapshot: PersistedKanbanWorkspaceSnapshot = {
      ...snapshot,
      boards: nextBoards,
      persistedAt: updatedAt,
      schemaVersion: 3,
    };

    kanbanWorkspaceRepository.save(nextSnapshot);

    return {
      snapshot: nextSnapshot,
      board: updatedBoard,
    };
  },
  delete(
    seedSnapshot: PersistedKanbanWorkspaceSnapshot,
    boardId: string,
  ) {
    const snapshot = kanbanWorkspaceRepository.load(seedSnapshot);
    const updatedAt = new Date().toISOString();
    const boardTaskIds = snapshot.tasks
      .filter((task) => task.boardId === boardId)
      .map((task) => task.id);

    const nextSnapshot: PersistedKanbanWorkspaceSnapshot = {
      ...snapshot,
      boards: snapshot.boards.filter((board) => board.id !== boardId),
      columns: snapshot.columns.filter((column) => column.boardId !== boardId),
      tasks: snapshot.tasks.filter((task) => task.boardId !== boardId),
      taskStatusHistory: snapshot.taskStatusHistory.filter(
        (entry) => !boardTaskIds.includes(entry.taskId),
      ),
      persistedAt: updatedAt,
      schemaVersion: 3,
    };

    kanbanWorkspaceRepository.save(nextSnapshot);

    return {
      snapshot: nextSnapshot,
    };
  },
};
