import { useMemo, useState } from 'react';
import { FolderKanban, Pin, Search, Users, Plus, Edit3, LayoutGrid } from 'lucide-react';
import type { BoardRecord } from '../../domain/kanban/contracts';

interface BoardsDirectoryPageProps {
  boards: BoardRecord[];
  pinnedIds: string[];
  onTogglePin: (boardId: string) => void;
  onOpenBoard: (boardId: string) => void;
  onCreateBoard?: () => void;
  canCreateBoards?: boolean;
}

// ─── Board Card ───────────────────────────────────────────────────────────────

function BoardCard({
  board,
  isPinned,
  onTogglePin,
  onOpen,
}: {
  board: BoardRecord;
  isPinned: boolean;
  onTogglePin: () => void;
  onOpen: () => void;
}) {
  const memberCount = board.access.memberUserIds.length;

  return (
    <article
      onClick={onOpen}
      className="group relative flex cursor-pointer flex-col rounded-2xl border border-[#EBEBEB] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:border-[#ff5623]/25 hover:shadow-[0_8px_24px_-8px_rgba(255,86,35,0.14)] dark:border-[#252525] dark:bg-[#141414]"
    >
      {/* Top row */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-[#FFF3EF] dark:bg-[#2a1508]">
          <FolderKanban className="h-5 w-5 text-[#ff5623]" />
        </div>

        {/* Pin button */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
          title={isPinned ? 'Remover do sidebar' : 'Fixar no sidebar'}
          className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
            isPinned
              ? 'bg-[#FFF3EF] text-[#ff5623] dark:bg-[#2a1508]'
              : 'text-[#CFCFCF] hover:bg-[#F5F5F5] hover:text-[#ff5623] dark:text-[#383838] dark:hover:bg-[#1E1E1E] dark:hover:text-[#ff8c69]'
          }`}
        >
          <Pin className={`h-3.5 w-3.5 transition-transform ${isPinned ? 'rotate-45' : ''}`} />
        </button>
      </div>

      {/* Name */}
      <h3 className="mb-1.5 text-[15px] font-bold tracking-[-0.01em] text-[#171717] dark:text-[#f0f0f0]">
        {board.name}
      </h3>

      {/* Description */}
      <p className="mb-4 flex-1 text-[13px] leading-relaxed text-[#9E9E9E]">
        {board.description || 'Sem descrição'}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[#F0F0F0] pt-4 dark:border-[#1E1E1E]">
        <span className="flex items-center gap-1.5 text-[12px] text-[#ADADAD]">
          <Users className="h-3.5 w-3.5" />
          {memberCount} {memberCount === 1 ? 'membro' : 'membros'}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="flex h-7 items-center gap-1 rounded-lg border border-[#E8E8E8] bg-white px-2.5 text-[11px] font-semibold text-[#737373] transition-colors hover:border-[#D4D4D4] hover:text-[#171717] dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-[#a3a3a3] dark:hover:text-[#f5f5f5]"
          >
            <Edit3 className="h-3 w-3" />
            Editar
          </button>
          <span className="rounded-lg bg-[#F5F5F5] px-2.5 py-1 text-[11px] font-semibold text-[#ff5623] transition-colors group-hover:bg-[#FFF3EF] dark:bg-[#1E1E1E] dark:group-hover:bg-[#2a1508]">
            Abrir →
          </span>
        </div>
      </div>

      {/* Pinned indicator strip */}
      {isPinned && (
        <span className="absolute left-0 top-5 h-6 w-[3px] rounded-r-full bg-[#ff5623]" />
      )}
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function BoardsDirectoryPage({
  boards,
  pinnedIds,
  onTogglePin,
  onOpenBoard,
  onCreateBoard,
  canCreateBoards = false,
}: BoardsDirectoryPageProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      boards.filter(
        (b) =>
          b.name.toLowerCase().includes(search.toLowerCase()) ||
          (b.description ?? '').toLowerCase().includes(search.toLowerCase()),
      ),
    [boards, search],
  );

  const uniqueMembers = useMemo(
    () => new Set(boards.flatMap((b) => b.access.memberUserIds)).size,
    [boards],
  );

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#0a0a0a]">
      {/* ── Hero header with stats ──────────────────────────────────────────── */}
      <div className="px-8 pb-0 pt-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="overflow-hidden rounded-[28px] border border-[#EBEBEB] bg-white shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] dark:border-[#252525] dark:bg-[#141414]">
            {/* Header row */}
            <div className="flex items-center justify-between gap-4 border-b border-[#F0F0F0] px-8 py-6 dark:border-[#1E1E1E]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF3EF] dark:bg-[#2a1508]">
                  <LayoutGrid className="h-5 w-5 text-[#ff5623]" />
                </div>
                <div>
                  <h1 className="text-[20px] font-bold tracking-[-0.02em] text-[#171717] dark:text-white">
                    Boards
                  </h1>
                  <p className="text-[13px] text-[#9E9E9E]">
                    Gerencie e organize seus ambientes de trabalho
                  </p>
                </div>
              </div>

              {canCreateBoards && onCreateBoard && (
                <button
                  type="button"
                  onClick={onCreateBoard}
                  className="flex items-center gap-2 rounded-[14px] bg-[#171717] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#333] dark:bg-white dark:text-[#171717] dark:hover:bg-[#e5e5e5]"
                >
                  <Plus className="h-4 w-4" />
                  Criar board
                </button>
              )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 divide-x divide-[#F0F0F0] dark:divide-[#1E1E1E]">
              <div className="px-8 py-5">
                <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-widest text-[#ADADAD]">
                  Total de boards
                </p>
                <p className="text-[28px] font-bold tracking-[-0.03em] text-[#171717] dark:text-white">
                  {boards.length}
                </p>
              </div>
              <div className="px-8 py-5">
                <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-widest text-[#ADADAD]">
                  Membros vinculados
                </p>
                <p className="text-[28px] font-bold tracking-[-0.03em] text-[#171717] dark:text-white">
                  {uniqueMembers}
                </p>
              </div>
              <div className="px-8 py-5">
                <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-widest text-[#ADADAD]">
                  Fixados no sidebar
                </p>
                <p className="text-[28px] font-bold tracking-[-0.03em] text-[#ff5623]">
                  {pinnedIds.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1200px] px-8 py-6">
        {/* Search */}
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[#EBEBEB] bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:border-[#252525] dark:bg-[#141414]">
          <Search className="h-4 w-4 shrink-0 text-[#ADADAD]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar board por nome ou descrição..."
            className="flex-1 bg-transparent text-[13px] text-[#171717] placeholder:text-[#CFCFCF] focus:outline-none dark:text-[#f5f5f5]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-[11px] font-semibold text-[#ff5623] hover:underline"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Section label */}
        {filtered.length > 0 && (
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#ADADAD]">
            {search ? `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}` : 'Todos os boards'}
          </p>
        )}

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                isPinned={pinnedIds.includes(board.id)}
                onTogglePin={() => onTogglePin(board.id)}
                onOpen={() => onOpenBoard(board.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5E5E5] py-20 dark:border-[#252525]">
            <FolderKanban className="mb-3 h-8 w-8 text-[#D4D4D4]" />
            <p className="text-[13px] font-semibold text-[#ADADAD]">Nenhum board encontrado</p>
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="mt-2 text-[12px] text-[#ff5623] hover:underline"
              >
                Limpar busca
              </button>
            )}
          </div>
        )}

        {/* Pin hint */}
        {boards.length > 0 && pinnedIds.length === 0 && (
          <p className="mt-6 flex items-center gap-1.5 text-[12px] text-[#CFCFCF] dark:text-[#3a3a3a]">
            <Pin className="h-3 w-3" />
            Clique no ícone de pin em um board para fixá-lo no sidebar.
          </p>
        )}
      </div>
    </div>
  );
}
