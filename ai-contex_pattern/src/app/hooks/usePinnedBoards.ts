import { useState } from 'react';

const STORAGE_KEY = 'weplanner-pinned-boards';

function readStorage(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

/**
 * Persists the set of pinned board IDs in localStorage.
 * Pinned boards appear as a compact list in the sidebar.
 */
export function usePinnedBoards() {
  const [pinnedIds, setPinnedIds] = useState<string[]>(readStorage);

  const togglePin = (boardId: string) => {
    setPinnedIds((prev) => {
      const next = prev.includes(boardId)
        ? prev.filter((id) => id !== boardId)
        : [...prev, boardId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const isPinned = (boardId: string) => pinnedIds.includes(boardId);

  return { pinnedIds, togglePin, isPinned };
}
