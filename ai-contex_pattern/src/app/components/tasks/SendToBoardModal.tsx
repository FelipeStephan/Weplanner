import { useState, useEffect } from 'react';
import { ArrowRightLeft, ChevronRight, FolderKanban, LayoutGrid, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';

interface BoardRecord {
  id: string;
  name: string;
  description?: string;
}

interface BoardColumn {
  id: string;
  boardId: string;
  name: string;
  baseStatus: string;
  accentColor: string;
}

interface SendToBoardModalProps {
  open: boolean;
  onClose: () => void;
  taskTitle?: string;
  boards: BoardRecord[];
  boardColumns: BoardColumn[];
  currentBoardId: string;
  onConfirm: (targetBoardId: string, targetColumnId: string) => void;
}

export function SendToBoardModal({
  open,
  onClose,
  taskTitle,
  boards,
  boardColumns,
  currentBoardId,
  onConfirm,
}: SendToBoardModalProps) {
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [step, setStep] = useState<'board' | 'column'>('board');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedBoardId(null);
      setSelectedColumnId(null);
      setStep('board');
    }
  }, [open]);

  const availableBoards = boards.filter((b) => b.id !== currentBoardId);

  const selectedBoard = availableBoards.find((b) => b.id === selectedBoardId) ?? null;

  const columnsForSelectedBoard = boardColumns.filter(
    (col) => col.boardId === selectedBoardId,
  );

  const selectedColumn = columnsForSelectedBoard.find(
    (col) => col.id === selectedColumnId,
  ) ?? null;

  const handleSelectBoard = (boardId: string) => {
    setSelectedBoardId(boardId);
    setSelectedColumnId(null);
    setStep('column');
  };

  const handleBack = () => {
    setStep('board');
    setSelectedBoardId(null);
    setSelectedColumnId(null);
  };

  const handleConfirm = () => {
    if (!selectedBoardId || !selectedColumnId) return;
    onConfirm(selectedBoardId, selectedColumnId);
  };

  const canConfirm = Boolean(selectedBoardId && selectedColumnId);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent
        className="w-full max-w-md rounded-3xl border border-[#e5e5e5] bg-white p-0 shadow-2xl dark:border-[#2a2a2a] dark:bg-[#151516]"
        style={{ fontFamily: 'inherit' }}
      >
        {/* Header */}
        <DialogHeader className="flex flex-row items-center gap-3 border-b border-[#f0f0f0] px-6 py-5 dark:border-[#222324]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ff5623]/10">
            <ArrowRightLeft className="h-4 w-4 text-[#ff5623]" />
          </div>
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-base font-semibold text-[#171717] dark:text-white">
              Enviar para outro board
            </DialogTitle>
            {taskTitle && (
              <p className="mt-0.5 truncate text-xs text-[#737373] dark:text-[#9a9a9f]">
                {taskTitle}
              </p>
            )}
          </div>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-6 pt-4">
          <button
            onClick={step === 'column' ? handleBack : undefined}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
              step === 'board'
                ? 'text-[#ff5623]'
                : 'cursor-pointer text-[#737373] hover:text-[#ff5623] dark:text-[#9a9a9f]'
            }`}
          >
            <FolderKanban className="h-3.5 w-3.5" />
            Board
          </button>
          <ChevronRight className="h-3 w-3 text-[#d4d4d4] dark:text-[#3a3a3a]" />
          <span
            className={`flex items-center gap-1.5 text-xs font-medium ${
              step === 'column'
                ? 'text-[#ff5623]'
                : 'text-[#d4d4d4] dark:text-[#3a3a3a]'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Coluna
          </span>
        </div>

        {/* Content */}
        <div className="px-6 pb-2 pt-3">
          {step === 'board' && (
            <div>
              <p className="mb-3 text-xs text-[#737373] dark:text-[#9a9a9f]">
                Selecione o board de destino
              </p>
              {availableBoards.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#e5e5e5] py-8 text-center dark:border-[#2a2a2a]">
                  <FolderKanban className="h-8 w-8 text-[#d4d4d4] dark:text-[#3a3a3a]" />
                  <p className="text-sm text-[#a3a3a3] dark:text-[#737373]">
                    Nenhum outro board disponível
                  </p>
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {availableBoards.map((board) => (
                    <li key={board.id}>
                      <button
                        onClick={() => handleSelectBoard(board.id)}
                        className="flex w-full items-center gap-3 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] px-4 py-3.5 text-left transition-all hover:border-[#ff5623]/30 hover:bg-[#fff8f6] hover:shadow-sm dark:border-[#2a2a2a] dark:bg-[#1c1c1e] dark:hover:border-[#ff5623]/30 dark:hover:bg-[#221a17]"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#ff5623]/10">
                          <FolderKanban className="h-4 w-4 text-[#ff5623]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-semibold text-[#171717] dark:text-white">
                            {board.name}
                          </p>
                          {board.description && (
                            <p className="truncate text-xs text-[#737373] dark:text-[#9a9a9f]">
                              {board.description}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-[#d4d4d4] dark:text-[#3a3a3a]" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {step === 'column' && selectedBoard && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-[#ff5623]/10">
                  <FolderKanban className="h-3 w-3 text-[#ff5623]" />
                </div>
                <span className="text-xs font-semibold text-[#171717] dark:text-white">
                  {selectedBoard.name}
                </span>
                <span className="text-xs text-[#737373] dark:text-[#9a9a9f]">→ Selecione a coluna de destino</span>
              </div>
              {columnsForSelectedBoard.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#e5e5e5] py-8 text-center dark:border-[#2a2a2a]">
                  <LayoutGrid className="h-8 w-8 text-[#d4d4d4] dark:text-[#3a3a3a]" />
                  <p className="text-sm text-[#a3a3a3] dark:text-[#737373]">
                    Este board não tem colunas configuradas
                  </p>
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {columnsForSelectedBoard.map((col) => {
                    const isSelected = col.id === selectedColumnId;
                    return (
                      <li key={col.id}>
                        <button
                          onClick={() => setSelectedColumnId(col.id)}
                          className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
                            isSelected
                              ? 'border-[#ff5623]/40 bg-[#fff8f6] shadow-sm ring-1 ring-[#ff5623]/20 dark:bg-[#221a17]'
                              : 'border-[#e5e5e5] bg-[#fafafa] hover:border-[#d4d4d4] hover:bg-white dark:border-[#2a2a2a] dark:bg-[#1c1c1e] dark:hover:border-[#3a3a3a] dark:hover:bg-[#202022]'
                          }`}
                        >
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: col.accentColor }}
                          />
                          <span className="flex-1 truncate text-sm font-medium text-[#171717] dark:text-white">
                            {col.name}
                          </span>
                          {isSelected && (
                            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#ff5623]">
                              <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 fill-white">
                                <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-[#f0f0f0] px-6 py-4 dark:border-[#222324]">
          {step === 'column' ? (
            <button
              onClick={handleBack}
              className="text-sm font-medium text-[#737373] transition-colors hover:text-[#171717] dark:text-[#9a9a9f] dark:hover:text-white"
            >
              ← Voltar
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="rounded-xl px-4 text-sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="rounded-xl bg-[#ff5623] px-5 text-sm text-white hover:bg-[#e04d1e] disabled:opacity-40"
            >
              <ArrowRightLeft className="mr-1.5 h-3.5 w-3.5" />
              Enviar para{' '}
              {selectedBoard && selectedColumn
                ? `"${selectedBoard.name}"`
                : 'board'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
