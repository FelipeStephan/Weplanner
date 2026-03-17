import { Check, FolderKanban, Pencil, Plus, Search, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { BOARD_DIRECTORY_USERS } from '../../../demo/boardDirectory';
import type { BoardCreateInput, BoardUpdateInput } from '../../../domain/boards/contracts';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';

interface BoardFormInitialData {
  name: string;
  description?: string;
  memberUserIds?: string[];
}

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: BoardCreateInput | BoardUpdateInput) => void;
  mode?: 'create' | 'edit';
  initialData?: BoardFormInitialData | null;
}

const DEFAULT_TEMPLATE_LABEL = 'Board operacional padrão';

const getUserInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export function CreateBoardModal({
  isOpen,
  onClose,
  onSubmit,
  mode = 'create',
  initialData,
}: CreateBoardModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setName(initialData?.name ?? '');
    setDescription(initialData?.description ?? '');
    setSelectedMemberIds(initialData?.memberUserIds ?? []);
    setMemberSearch('');
    setError(null);
  }, [initialData, isOpen]);

  const filteredMembers = useMemo(
    () =>
      BOARD_DIRECTORY_USERS.filter((member) =>
        `${member.name} ${member.role ?? ''}`.toLowerCase().includes(memberSearch.toLowerCase()),
      ),
    [memberSearch],
  );

  const selectedMembers = useMemo(
    () => BOARD_DIRECTORY_USERS.filter((member) => selectedMemberIds.includes(member.id ?? '')),
    [selectedMemberIds],
  );

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMemberIds((current) =>
      current.includes(memberId) ? current.filter((id) => id !== memberId) : [...current, memberId],
    );
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setSelectedMemberIds([]);
    setMemberSearch('');
    setError(null);
  };

  const closeModal = () => {
    resetForm();
    onClose();
  };

  const submit = () => {
    if (!name.trim()) {
      setError('Defina um nome para o board.');
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      templateKey: 'operations-kanban',
      memberUserIds: selectedMemberIds,
    });

    resetForm();
  };

  const title = mode === 'edit' ? 'Editar board' : 'Criar novo board';
  const descriptionText =
    mode === 'edit'
      ? 'Atualize o nome, a descrição e os membros que fazem parte deste board.'
      : 'Crie um board a partir do template operacional padrão e defina quem fará parte desse ambiente.';
  const submitLabel = mode === 'edit' ? 'Salvar alterações' : 'Criar board';
  const titleIcon = mode === 'edit' ? Pencil : Plus;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="!w-[calc(100vw-2rem)] !max-w-[640px] sm:!w-full sm:!max-w-[640px] max-h-[calc(100vh-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-[28px] border-[#E5E7E4] bg-white p-0 dark:border-[#2D2F30] dark:bg-[#111214]">
        <DialogHeader className="border-b border-[#E5E7E4] px-6 py-6 text-left dark:border-[#232425]">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold text-[#171717] dark:text-white">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ff5623] text-white">
              <titleIcon className="h-4 w-4" />
            </span>
            {title}
          </DialogTitle>
          <DialogDescription className="max-w-[56ch] text-sm leading-6 text-[#737373] dark:text-[#A3A3A3]">
            {descriptionText}
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 gap-5 overflow-y-auto px-6 py-6">
          <div className="grid gap-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A3A3A3]">
              Nome do board
            </label>
            <Input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError(null);
              }}
              placeholder="Ex.: Operação iFood, Squad Conteúdo, Performance Mídia..."
              className="h-12 rounded-2xl border-[#E5E7E4] bg-white dark:border-[#2D2F30] dark:bg-[#171819]"
            />
          </div>

          <div className="rounded-[24px] border border-[#E5E7E4] bg-[#F8FAF8] p-5 dark:border-[#2D2F30] dark:bg-[#171819]">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#171717] text-white dark:bg-white dark:text-[#171717]">
                <FolderKanban className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#171717] dark:text-white">
                  {DEFAULT_TEMPLATE_LABEL}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#737373] dark:text-[#A3A3A3]">
                  Cria automaticamente as colunas A Fazer, Em Progresso, Revisão, Aprovação Interna e Concluído.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A3A3A3]">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              placeholder="Descreva o objetivo operacional deste board, o contexto do squad e o tipo de entrega que será acompanhado aqui."
              className="min-h-[144px] rounded-[20px] border border-[#E5E7E4] bg-white px-4 py-3 text-sm text-[#171717] outline-none transition-colors placeholder:text-[#B5B5B5] focus:border-[#ff5623] dark:border-[#2D2F30] dark:bg-[#171819] dark:text-[#F5F5F5]"
            />
          </div>

          <div className="rounded-[24px] border border-[#E5E7E4] bg-[#F8FAF8] p-5 dark:border-[#2D2F30] dark:bg-[#171819]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A3A3A3]">
                  Membros do board
                </p>
                <p className="mt-1 text-xs text-[#737373] dark:text-[#A3A3A3]">
                  Quem estiver aqui poderá visualizar este board conforme o papel atual.
                </p>
              </div>
              <span className="rounded-full bg-black/5 px-2.5 py-1 text-[11px] font-semibold text-[#525252] dark:bg-white/10 dark:text-[#D4D4D4]">
                {selectedMembers.length} membro{selectedMembers.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="mt-4 flex min-h-[62px] flex-wrap items-center gap-2 rounded-2xl border border-dashed border-[#D9DEDA] bg-white px-3 py-3 dark:border-[#343638] dark:bg-[#121313]">
              {selectedMembers.length > 0 ? (
                selectedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#E5E7E4] bg-[#F8FAF8] px-2.5 py-1.5 dark:border-[#2D2F30] dark:bg-[#171819]"
                  >
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarImage src={member.image} alt={member.name} />
                      <AvatarFallback
                        className="text-[10px] font-semibold text-white"
                        style={{ backgroundColor: member.color ?? '#ff5623' }}
                      >
                        {getUserInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-[#171717] dark:text-white">
                        {member.name}
                      </p>
                      <p className="truncate text-[10px] text-[#A3A3A3]">
                        {member.role || 'Membro'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleMemberSelection(member.id ?? '')}
                      className="rounded-full p-1 text-[#A3A3A3] transition-colors hover:bg-black/5 hover:text-[#525252] dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#A3A3A3]">Nenhum membro vinculado ainda.</p>
              )}
            </div>
          </div>

          <div className="grid gap-3 rounded-[24px] border border-[#E5E7E4] bg-[#F8FAF8] p-5 dark:border-[#2D2F30] dark:bg-[#171819]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A3A3A3]">
                Selecionar membros
              </p>
              <p className="mt-1 text-xs text-[#737373] dark:text-[#A3A3A3]">
                Busque colaboradores, gestores ou usuários do tipo cliente para vincular este board.
              </p>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#A3A3A3]" />
              <Input
                value={memberSearch}
                onChange={(event) => setMemberSearch(event.target.value)}
                placeholder="Buscar por nome ou papel..."
                className="h-11 rounded-2xl border-[#E5E7E4] bg-white pl-9 dark:border-[#2D2F30] dark:bg-[#121313]"
              />
            </div>

            <div className="grid max-h-[320px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {filteredMembers.map((member) => {
                const selected = selectedMemberIds.includes(member.id ?? '');
                return (
                  <button
                    key={member.id ?? member.name}
                    type="button"
                    onClick={() => toggleMemberSelection(member.id ?? '')}
                    className={cn(
                      'flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-left transition-colors',
                      selected
                        ? 'border-[#ff5623] bg-[#FFF4EE] dark:border-[#ff8c69] dark:bg-[#26150f]'
                        : 'border-[#E5E7E4] bg-white hover:bg-[#F6F8F6] dark:border-[#2D2F30] dark:bg-[#121313] dark:hover:bg-[#1A1B1C]',
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarImage src={member.image} alt={member.name} />
                        <AvatarFallback
                          className="text-[10px] font-semibold text-white"
                          style={{ backgroundColor: member.color ?? '#ff5623' }}
                        >
                          {getUserInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#171717] dark:text-white">
                          {member.name}
                        </p>
                        <p className="truncate text-[11px] text-[#A3A3A3]">
                          {member.role || 'Membro do workspace'}
                        </p>
                      </div>
                    </div>
                    {selected ? (
                      <Check className="h-4 w-4 shrink-0 text-[#ff5623] dark:text-[#ffb39c]" />
                    ) : (
                      <Users className="h-4 w-4 shrink-0 text-[#A3A3A3]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#b42318] dark:border-[#5f1d22] dark:bg-[#2a1316] dark:text-[#ffb4b8]">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" className="rounded-2xl dark:border-[#2D2F30]" onClick={closeModal}>
            Cancelar
          </Button>
          <Button
            className="rounded-2xl bg-[#171717] text-white hover:bg-[#2c2c2c] dark:bg-white dark:text-[#171717] dark:hover:bg-[#ececec]"
            onClick={submit}
          >
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
