import { useMemo, useState } from 'react';
import { FolderKanban, Pin, Search, Users, Plus, Edit3 } from 'lucide-react';
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
  isActive,
  onTogglePin,
  onOpen,
}: {
  board: BoardRecord;
  isPinned: boolean;
  isActive?: boolean;
  onTogglePin: () => void;
  onOpen: () => void;
}) {
  const memberCount = board.access.memberUserIds.length;

  return (
    <article className="group relative flex flex-col rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-[#2a2a2a] dark:bg-[#111111]">
      {/* Top row */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff3ef] dark:bg-[#2a1508]">
          <FolderKanban className="h-5 w-5 text-[#ff5623]" />
        </div>
        <div className="flex items-center gap-1">
          {/* Pin button */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
            title={isPinned ? 'Remover do sidebar' : 'Fixar no sidebar'}
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
              isPinned
                ? 'bg-[#fff3ef] text-[#ff5623] dark:bg-[#2a1508]'
                : 'text-[#d4d4d4] hover:bg-[#f5f5f5] hover:text-[#ff5623] dark:text-[#3a3a3a] dark:hover:bg-[#1e1e1e] dark:hover:text-[#ff8c69]'
            }`}
          >
            <Pin className={`h-3.5 w-3.5 transition-transform ${isPinned ? 'rotate-45' : ''}`} />
          </button>
          {/* Edit button */}
          <button
            type="button"
            className="flex h-7 items-center gap-1 rounded-lg border border-[#e5e5e5] bg-white px-2.5 text-[11px] font-semibold text-[#737373] transition-colors hover:border-[#d4d4d4] hover:text-[#171717] dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-[#a3a3a3] dark:hover:text-[#f5f5f5]"
          >
            <Edit3 className="h-3 w-3" />
            Editar
          </button>
        </div>
      </div>

      {/* Name */}
      <h3 className="mb-1 text-[15px] font-bold text-[#171717] dark:text-[#f5f5f5]">
        {board.name}
      </h3>

      {/* Description */}
      <p className="mb-4 flex-1 text-[13px] leading-relaxed text-[#a3a3a3]">
        {board.description || 'Sem descrição'}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[#f5f5f5] pt-4 dark:border-[#1e1e1e]">
        <span className="flex items-center gap-1.5 text-[12px] text-[#a3a3a3]">
          <Users className="h-3.5 w-3.5" />
          {memberCount} {memberCount === 1 ? 'membro' : 'membros'}
        </span>
        <button
          type="button"
          onClick={onOpen}
          className="rounded-lg px-3 py-1.5 text-[12px] font-semibold text-[#525252] transition-colors hover:bg-[#f5f5f5] hover:text-[#ff5623] dark:text-[#a3a3a3] dark:hover:bg-[#1e1e1e] dark:hover:text-[#ff8c69]"
        >
          Abrir board
        </button>
      </div>

      {/* Active indicator */}
      {isActive && (
        <span className="absolute left-0 top-4 h-8 w-1 rounded-r-full bg-[#ff5623]" />
      )}
    </article>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#e5e5e5] bg-white p-5 dark:border-[#2a2a2a] dark:bg-[#111111]">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#a3a3a3]">{label}</p>
      <p className="text-[28px] font-bold text-[#171717] dark:text-[#f5f5f5]">{value}</p>
    </div>
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
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#0a0a0a]">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-[#e5e5e5] bg-white px-8 py-6 dark:border-[#2a2a2a] dark:bg-[#111111]">
        <div className="mx-auto max-w-[1200px]">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#a3a3a3]">
            Workspace Boards
          </p>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-[#171717] dark:text-[#f5f5f5]">Boards</h1>
            {canCreateBoards && onCreateBoard && (
              <button
                type="button"
                onClick={onCreateBoard}
                className="flex items-center gap-2 rounded-xl bg-[#171717] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#333] dark:bg-white dark:text-[#171717] dark:hover:bg-[#e5e5e5]"
              >
                <Plus className="h-4 w-4" />
                Criar board
              </button>
            )}
          </div>
          <p className="mt-1 text-sm text-[#a3a3a3]">
            Escolha um board para abrir o Kanban ou crie um novo ambiente.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-8 py-6">
        {/* ── Stats ──────────────────────────────────────────────────────────── */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <StatCard label="Total de boards" value={boards.length} />
          <StatCard label="Membros vinculados" value={uniqueMembers} />
          <StatCard label="Resultado da busca" value={filtered.length} />
        </div>

        {/* ── Search ─────────────────────────────────────────────────────────── */}
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[#e5e5e5] bg-white px-4 py-3 dark:border-[#2a2a2a] dark:bg-[#111111]">
          <Search className="h-4 w-4 shrink-0 text-[#a3a3a3]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar board por nome ou descrição..."
            className="flex-1 bg-transparent text-sm text-[#171717] placeholder:text-[#c7c7c7] focus:outline-none dark:text-[#f5f5f5]"
          />
        </div>

        {/* ── Grid ───────────────────────────────────────────────────────────── */}
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
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#e5e5e5] py-20 dark:border-[#2a2a2a]">
            <FolderKanban className="mb-3 h-8 w-8 text-[#d4d4d4]" />
            <p className="text-sm font-semibold text-[#a3a3a3]">Nenhum board encontrado</p>
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

        {/* ── Pin hint ───────────────────────────────────────────────────────── */}
        {boards.length > 0 && pinnedIds.length === 0 && (
          <p className="mt-6 flex items-center gap-1.5 text-[12px] text-[#c7c7c7] dark:text-[#3a3a3a]">
            <Pin className="h-3 w-3" />
            Clique no ícone de pin em um board para fixá-lo no sidebar.
          </p>
        )}
      </div>
    </div>
  );
}
