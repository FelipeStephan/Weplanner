import { useState } from 'react';
import {
  X, Building2, Save, Trash2, ChevronDown, Plus, ExternalLink,
  Users, LayoutGrid, CreditCard, BookOpen, User,
  HardDrive, Palette, Share2, Link, MoreHorizontal,
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import type { ClientRecord, ClientLibraryResource, ClientLibraryResourceType } from '../../../domain/clients/contracts';
import { CLIENT_STATUS_LABELS, CLIENT_STATUS_COLORS, CLIENT_LIBRARY_TYPE_LABELS } from '../../../domain/clients/contracts';
import type { UserRecord } from '../../../domain/shared/entities';
import type { BoardRecord } from '../../../domain/kanban/contracts';
import type { TeamMember } from '../../../domain/team/contracts';

// ─── Types ───────────────────────────────────────────────────────────────────

type PanelTab = 'profile' | 'library' | 'team' | 'boards' | 'credits';

interface ClientPanelProps {
  client: ClientRecord;
  isOpen: boolean;
  onClose: () => void;
  canEdit: boolean;
  managers: Array<UserRecord & { id: string; color?: string }>;
  boards: BoardRecord[];
  members: TeamMember[];
  consumedCredits?: number;
  onSave: (id: string, patch: Partial<ClientRecord>) => void;
  onDelete?: (id: string) => void;
  onInviteClient?: (clientId: string) => void;
}

// ─── Resource type icons ─────────────────────────────────────────────────────

const RESOURCE_ICONS: Record<ClientLibraryResourceType, React.ReactNode> = {
  drive:  <HardDrive className="h-4 w-4" />,
  brand:  <Palette className="h-4 w-4" />,
  social: <Share2 className="h-4 w-4" />,
  links:  <Link className="h-4 w-4" />,
  other:  <MoreHorizontal className="h-4 w-4" />,
};

const RESOURCE_TYPE_OPTIONS: ClientLibraryResourceType[] = ['drive', 'brand', 'social', 'links', 'other'];

// ─── Small helpers ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] dark:text-[#525252]">
      {children}
    </p>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[#525252] dark:text-[#A3A3A3]">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({
  value, onChange, placeholder, type = 'text',
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-[#E5E7E4] bg-[#FAFAFA] px-3 py-2 text-sm text-[#171717] placeholder-[#A3A3A3] focus:border-[#ff5623] focus:outline-none focus:ring-2 focus:ring-[#ff5623]/20 dark:border-[#2D2F30] dark:bg-[#1E2020] dark:text-white"
    />
  );
}

// ─── Tab: Profile ─────────────────────────────────────────────────────────────

function ProfileTab({
  client, canEdit, managers, onChange,
}: {
  client: ClientRecord;
  canEdit: boolean;
  managers: Array<UserRecord & { id: string; color?: string }>;
  onChange: (patch: Partial<ClientRecord>) => void;
}) {
  const [logoPreviewError, setLogoPreviewError] = useState(false);

  return (
    <div className="space-y-5">
      <SectionLabel>Identidade</SectionLabel>

      {/* Logo preview */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-dashed border-[#D4D4D4] bg-[#FAFAFA] dark:border-[#2D2F30] dark:bg-[#1E2020]">
          {client.logoUrl && !logoPreviewError ? (
            <img
              src={client.logoUrl}
              alt={client.name}
              onError={() => setLogoPreviewError(true)}
              className="h-full w-full rounded-2xl object-contain p-2"
            />
          ) : (
            <Building2 className="h-6 w-6 text-[#D4D4D4] dark:text-[#525252]" />
          )}
        </div>
        <div className="flex-1">
          <Field label="Logo (URL)">
            <Input
              value={client.logoUrl ?? ''}
              onChange={(v) => { onChange({ logoUrl: v }); setLogoPreviewError(false); }}
              placeholder="https://..."
            />
          </Field>
        </div>
      </div>

      <Field label="Nome">
        <Input
          value={client.name}
          onChange={(v) => onChange({ name: v })}
          placeholder="Nome do cliente"
        />
      </Field>

      <Field label="Setor">
        <Input
          value={client.sector ?? ''}
          onChange={(v) => onChange({ sector: v || undefined })}
          placeholder="Ex: Tecnologia, Varejo..."
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Responsável">
          <div className="relative">
            <select
              disabled={!canEdit}
              value={client.responsibleUserId ?? ''}
              onChange={(e) => onChange({ responsibleUserId: e.target.value || undefined })}
              className="w-full appearance-none rounded-xl border border-[#E5E7E4] bg-[#FAFAFA] px-3 py-2 text-sm text-[#171717] focus:border-[#ff5623] focus:outline-none dark:border-[#2D2F30] dark:bg-[#1E2020] dark:text-white disabled:opacity-50"
            >
              <option value="">Nenhum</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#A3A3A3]" />
          </div>
        </Field>

        <Field label="Status">
          <div className="relative">
            <select
              disabled={!canEdit}
              value={client.status}
              onChange={(e) => onChange({ status: e.target.value as ClientRecord['status'] })}
              className="w-full appearance-none rounded-xl border border-[#E5E7E4] bg-[#FAFAFA] px-3 py-2 text-sm text-[#171717] focus:border-[#ff5623] focus:outline-none dark:border-[#2D2F30] dark:bg-[#1E2020] dark:text-white disabled:opacity-50"
            >
              {(Object.keys(CLIENT_STATUS_LABELS) as (keyof typeof CLIENT_STATUS_LABELS)[]).map((key) => (
                <option key={key} value={key}>{CLIENT_STATUS_LABELS[key]}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#A3A3A3]" />
          </div>
        </Field>
      </div>
    </div>
  );
}

// ─── Tab: Library ─────────────────────────────────────────────────────────────

function LibraryTab({
  client, canEdit, onUpdateLibrary,
}: {
  client: ClientRecord;
  canEdit: boolean;
  onUpdateLibrary: (resources: ClientLibraryResource[]) => void;
}) {
  const resources = client.libraryResources ?? [];

  function updateResource(index: number, patch: Partial<ClientLibraryResource>) {
    const next = resources.map((r, i) => (i === index ? { ...r, ...patch } : r));
    onUpdateLibrary(next);
  }

  function removeResource(index: number) {
    onUpdateLibrary(resources.filter((_, i) => i !== index));
  }

  function addResource() {
    const newId = `${client.id}-extra-${Date.now()}`;
    onUpdateLibrary([
      ...resources,
      { id: newId, label: 'Novo link', type: 'other', href: '' },
    ]);
  }

  return (
    <div className="space-y-3">
      <SectionLabel>Recursos do cliente</SectionLabel>
      {resources.length === 0 && (
        <p className="text-sm text-[#A3A3A3] dark:text-[#525252]">Nenhum recurso cadastrado.</p>
      )}
      {resources.map((res, i) => (
        <div
          key={res.id}
          className="rounded-2xl border border-[#E8EBE8] bg-[#FAFAFA] p-3 dark:border-[#232425] dark:bg-[#1A1B1C]"
        >
          <div className="flex items-center gap-2">
            {/* Type selector */}
            <div className="relative">
              <select
                disabled={!canEdit}
                value={res.type}
                onChange={(e) => updateResource(i, { type: e.target.value as ClientLibraryResourceType })}
                className="appearance-none rounded-lg border border-[#E5E7E4] bg-white py-1.5 pl-2 pr-6 text-xs text-[#525252] focus:outline-none dark:border-[#2D2F30] dark:bg-[#1E2020] dark:text-[#A3A3A3] disabled:opacity-50"
              >
                {RESOURCE_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>{CLIENT_LIBRARY_TYPE_LABELS[t]}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#A3A3A3]" />
            </div>

            {/* Icon */}
            <span className="flex-shrink-0 text-[#A3A3A3]">
              {RESOURCE_ICONS[res.type]}
            </span>
          </div>

          <div className="mt-2 space-y-1.5">
            <input
              disabled={!canEdit}
              type="text"
              value={res.label}
              onChange={(e) => updateResource(i, { label: e.target.value })}
              placeholder="Label"
              className="w-full rounded-lg border border-[#E5E7E4] bg-white px-2.5 py-1.5 text-sm text-[#171717] placeholder-[#A3A3A3] focus:border-[#ff5623] focus:outline-none dark:border-[#2D2F30] dark:bg-[#1E2020] dark:text-white disabled:opacity-50"
            />
            <div className="flex gap-1.5">
              <input
                disabled={!canEdit}
                type="url"
                value={res.href ?? ''}
                onChange={(e) => updateResource(i, { href: e.target.value })}
                placeholder="https://..."
                className="flex-1 rounded-lg border border-[#E5E7E4] bg-white px-2.5 py-1.5 text-xs text-[#525252] placeholder-[#A3A3A3] focus:border-[#ff5623] focus:outline-none dark:border-[#2D2F30] dark:bg-[#1E2020] dark:text-[#A3A3A3] disabled:opacity-50"
              />
              {res.href && (
                <a
                  href={res.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center rounded-lg border border-[#E5E7E4] px-2 text-[#A3A3A3] hover:text-[#ff5623] dark:border-[#2D2F30]"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              {canEdit && (
                <button
                  onClick={() => removeResource(i)}
                  className="flex items-center justify-center rounded-lg border border-[#E5E7E4] px-2 text-[#A3A3A3] hover:border-[#fca5a5] hover:text-[#dc2626] dark:border-[#2D2F30]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {canEdit && (
        <button
          onClick={addResource}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#D4D4D4] py-2.5 text-sm text-[#A3A3A3] hover:border-[#ff5623] hover:text-[#ff5623] dark:border-[#2D2F30]"
        >
          <Plus className="h-4 w-4" />
          Adicionar link
        </button>
      )}
    </div>
  );
}

// ─── Tab: Team ────────────────────────────────────────────────────────────────

function TeamTab({
  client, members, canEdit, onInviteClient,
}: {
  client: ClientRecord;
  members: TeamMember[];
  canEdit: boolean;
  onInviteClient?: (clientId: string) => void;
}) {
  const linkedMembers = members.filter((m) => m.clientId === client.id);

  return (
    <div className="space-y-3">
      <SectionLabel>Usuários vinculados</SectionLabel>
      {linkedMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#D4D4D4] py-8 text-center dark:border-[#2D2F30]">
          <Users className="h-8 w-8 text-[#D4D4D4] dark:text-[#525252]" />
          <p className="mt-2 text-sm text-[#A3A3A3] dark:text-[#525252]">
            Nenhum usuário vinculado
          </p>
          <p className="text-xs text-[#D4D4D4] dark:text-[#525252]">
            Convide para dar acesso
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {linkedMembers.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-2xl border border-[#E8EBE8] bg-[#FAFAFA] px-4 py-3 dark:border-[#232425] dark:bg-[#1A1B1C]"
            >
              {m.image ? (
                <img src={m.image} alt={m.name} className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff5623]/10 text-xs font-bold text-[#ff5623]">
                  {m.name[0]}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#171717] dark:text-white">{m.name}</p>
                <p className="truncate text-xs text-[#737373] dark:text-[#A3A3A3]">{m.email}</p>
              </div>
              <span className="rounded-full bg-[#F5F5F5] px-2.5 py-0.5 text-[11px] font-medium text-[#737373] dark:bg-[#1E2020] dark:text-[#A3A3A3]">
                {m.status === 'invited' ? 'Convidado' : 'Ativo'}
              </span>
            </div>
          ))}
        </div>
      )}
      {canEdit && (
        <Button
          onClick={() => onInviteClient?.(client.id)}
          variant="outline"
          className="w-full rounded-2xl border-[#E5E7E4] text-sm dark:border-[#2D2F30]"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Convidar usuário cliente
        </Button>
      )}
    </div>
  );
}

// ─── Tab: Boards ─────────────────────────────────────────────────────────────

function BoardsTab({
  client, boards, canEdit, onChange,
}: {
  client: ClientRecord;
  boards: BoardRecord[];
  canEdit: boolean;
  onChange: (patch: Partial<ClientRecord>) => void;
}) {
  const [selectingBoard, setSelectingBoard] = useState(false);
  const linked = boards.filter((b) => client.boardIds.includes(b.id));
  const available = boards.filter((b) => !client.boardIds.includes(b.id));

  function linkBoard(boardId: string) {
    onChange({ boardIds: [...client.boardIds, boardId] });
    setSelectingBoard(false);
  }

  function unlinkBoard(boardId: string) {
    onChange({ boardIds: client.boardIds.filter((id) => id !== boardId) });
  }

  return (
    <div className="space-y-3">
      <SectionLabel>Boards vinculados</SectionLabel>
      {linked.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#D4D4D4] py-8 text-center dark:border-[#2D2F30]">
          <LayoutGrid className="h-8 w-8 text-[#D4D4D4] dark:text-[#525252]" />
          <p className="mt-2 text-sm text-[#A3A3A3] dark:text-[#525252]">
            Nenhum board vinculado
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {linked.map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-3 rounded-2xl border border-[#E8EBE8] bg-[#FAFAFA] px-4 py-3 dark:border-[#232425] dark:bg-[#1A1B1C]"
            >
              <LayoutGrid className="h-4 w-4 flex-shrink-0 text-[#A3A3A3]" />
              <span className="flex-1 truncate text-sm text-[#171717] dark:text-white">{b.name}</span>
              {canEdit && (
                <button
                  onClick={() => unlinkBoard(b.id)}
                  className="text-[#A3A3A3] hover:text-[#dc2626]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {canEdit && available.length > 0 && (
        <>
          {selectingBoard ? (
            <div className="rounded-2xl border border-[#E8EBE8] dark:border-[#232425]">
              {available.map((b) => (
                <button
                  key={b.id}
                  onClick={() => linkBoard(b.id)}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm text-[#171717] hover:bg-[#F5F5F5] dark:text-white dark:hover:bg-[#1E2020] first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <LayoutGrid className="h-3.5 w-3.5 text-[#A3A3A3]" />
                  {b.name}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={() => setSelectingBoard(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#D4D4D4] py-2.5 text-sm text-[#A3A3A3] hover:border-[#ff5623] hover:text-[#ff5623] dark:border-[#2D2F30]"
            >
              <Plus className="h-4 w-4" />
              Vincular board
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ─── Tab: Credits ─────────────────────────────────────────────────────────────

function CreditsTab({
  client, consumedCredits = 0, canEdit, onChange,
}: {
  client: ClientRecord;
  consumedCredits?: number;
  canEdit: boolean;
  onChange: (patch: Partial<ClientRecord>) => void;
}) {
  const contracted = client.contractedCredits ?? 0;
  const available = Math.max(contracted - consumedCredits, 0);
  const fraction = contracted > 0 ? Math.min(consumedCredits / contracted, 1) : 0;
  const isOver = contracted > 0 && consumedCredits > contracted;

  return (
    <div className="space-y-5">
      {/* Toggle */}
      <div className="flex items-center justify-between rounded-2xl border border-[#E8EBE8] p-4 dark:border-[#232425]">
        <div>
          <p className="text-sm font-medium text-[#171717] dark:text-white">Sistema de créditos</p>
          <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">
            {client.creditsEnabled
              ? 'Ativo — cliente aparece nos relatórios de crédito'
              : 'Desativado — cliente oculto nos KPIs de crédito'}
          </p>
        </div>
        {canEdit ? (
          <button
            type="button"
            onClick={() => onChange({ creditsEnabled: !client.creditsEnabled })}
            className={cn(
              'relative h-6 w-11 flex-shrink-0 overflow-hidden rounded-full transition-colors duration-200',
              client.creditsEnabled ? 'bg-[#ff5623]' : 'bg-[#D4D4D4] dark:bg-[#2D2F30]',
            )}
          >
            <span
              className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200"
              style={{ left: client.creditsEnabled ? 'calc(100% - 22px)' : '2px' }}
            />
          </button>
        ) : (
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-medium',
              client.creditsEnabled
                ? 'bg-[#DCFCE7] text-[#15803d] dark:bg-[#14532d]/30 dark:text-[#4ade80]'
                : 'bg-[#F5F5F5] text-[#737373] dark:bg-[#1E2020] dark:text-[#A3A3A3]',
            )}
          >
            {client.creditsEnabled ? 'Ativo' : 'Inativo'}
          </span>
        )}
      </div>

      {client.creditsEnabled && (
        <>
          {/* Contracted field */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#525252] dark:text-[#A3A3A3]">
              Créditos contratados
            </label>
            {canEdit ? (
              <input
                type="number"
                min="0"
                value={client.contractedCredits ?? ''}
                onChange={(e) =>
                  onChange({
                    contractedCredits: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="Ex: 300"
                className="w-full rounded-xl border border-[#E5E7E4] bg-[#FAFAFA] px-3 py-2 text-sm text-[#171717] placeholder-[#A3A3A3] focus:border-[#ff5623] focus:outline-none dark:border-[#2D2F30] dark:bg-[#1E2020] dark:text-white"
              />
            ) : (
              <p className="text-2xl font-bold text-[#171717] dark:text-white">
                {contracted > 0 ? contracted : '—'}
              </p>
            )}
          </div>

          {/* Summary */}
          {contracted > 0 && (
            <div className="rounded-2xl border border-[#E8EBE8] p-4 dark:border-[#232425]">
              <div className="mb-3 grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">Consumidos</p>
                  <p className={cn('mt-1 text-xl font-bold', isOver ? 'text-[#dc2626]' : 'text-[#171717] dark:text-white')}>
                    {consumedCredits}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">Contratados</p>
                  <p className="mt-1 text-xl font-bold text-[#171717] dark:text-white">{contracted}</p>
                </div>
                <div>
                  <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">Disponíveis</p>
                  <p className={cn('mt-1 text-xl font-bold', isOver ? 'text-[#dc2626]' : 'text-[#019364]')}>
                    {isOver ? `-${consumedCredits - contracted}` : available}
                  </p>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#F0F2F0] dark:bg-[#1E2020]">
                <div
                  className={cn('h-full rounded-full', isOver ? 'bg-[#dc2626]' : 'bg-[#ff5623]')}
                  style={{ width: `${fraction * 100}%` }}
                />
              </div>
              <p className="mt-1.5 text-right text-xs text-[#A3A3A3]">
                {Math.round(fraction * 100)}% utilizado
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

const TABS: { id: PanelTab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile',  label: 'Perfil',    icon: <User className="h-3.5 w-3.5" /> },
  { id: 'library',  label: 'Biblioteca',icon: <BookOpen className="h-3.5 w-3.5" /> },
  { id: 'team',     label: 'Equipe',    icon: <Users className="h-3.5 w-3.5" /> },
  { id: 'boards',   label: 'Boards',    icon: <LayoutGrid className="h-3.5 w-3.5" /> },
  { id: 'credits',  label: 'Créditos',  icon: <CreditCard className="h-3.5 w-3.5" /> },
];

export function ClientPanel({
  client, isOpen, onClose, canEdit, managers, boards, members,
  consumedCredits, onSave, onDelete, onInviteClient,
}: ClientPanelProps) {
  const [tab, setTab] = useState<PanelTab>('profile');
  const [draft, setDraft] = useState<ClientRecord>(client);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Sync when client prop changes (e.g. saves from outside)
  const syncedClient = draft.id === client.id ? draft : client;

  function patch(p: Partial<ClientRecord>) {
    setDraft((prev) => ({ ...prev, ...p }));
    setDirty(true);
  }

  function handleSave() {
    onSave(syncedClient.id, syncedClient);
    setDirty(false);
  }

  function handleLibraryUpdate(resources: ClientLibraryResource[]) {
    patch({ libraryResources: resources });
  }

  if (!isOpen) return null;

  const statusColor = CLIENT_STATUS_COLORS[syncedClient.status];

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 flex h-full w-full max-w-[480px] flex-col border-l border-[#E5E7E4] bg-white shadow-2xl dark:border-[#232425] dark:bg-[#0f0f10]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#F0F2F0] px-6 py-5 dark:border-[#1E2020]">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-[#E5E7E4] bg-[#FAFAFA] dark:border-[#2D2F30] dark:bg-[#1A1B1C]">
              {syncedClient.logoUrl ? (
                <img
                  src={syncedClient.logoUrl}
                  alt={syncedClient.name}
                  className="h-full w-full rounded-2xl object-contain p-1"
                />
              ) : (
                <Building2 className="h-5 w-5 text-[#A3A3A3]" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="truncate font-semibold text-[#171717] dark:text-white">
                {syncedClient.name}
              </h2>
              <div className="flex items-center gap-2">
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: statusColor }}
                />
                <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                  {CLIENT_STATUS_LABELS[syncedClient.status]}
                  {syncedClient.sector && ` · ${syncedClient.sector}`}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-2 flex-shrink-0 rounded-xl p-1.5 text-[#A3A3A3] hover:bg-[#F5F5F5] dark:hover:bg-[#1E2020]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#F0F2F0] px-2 dark:border-[#1E2020]">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-1.5 border-b-2 px-3 py-3 text-xs font-medium transition-colors',
                tab === t.id
                  ? 'border-[#ff5623] text-[#ff5623]'
                  : 'border-transparent text-[#737373] hover:text-[#171717] dark:text-[#A3A3A3] dark:hover:text-white',
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === 'profile' && (
            <ProfileTab
              client={syncedClient}
              canEdit={canEdit}
              managers={managers}
              onChange={patch}
            />
          )}
          {tab === 'library' && (
            <LibraryTab
              client={syncedClient}
              canEdit={canEdit}
              onUpdateLibrary={handleLibraryUpdate}
            />
          )}
          {tab === 'team' && (
            <TeamTab
              client={syncedClient}
              members={members}
              canEdit={canEdit}
              onInviteClient={onInviteClient}
            />
          )}
          {tab === 'boards' && (
            <BoardsTab
              client={syncedClient}
              boards={boards}
              canEdit={canEdit}
              onChange={patch}
            />
          )}
          {tab === 'credits' && (
            <CreditsTab
              client={syncedClient}
              consumedCredits={consumedCredits}
              canEdit={canEdit}
              onChange={patch}
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#F0F2F0] px-6 py-4 dark:border-[#1E2020]">
          {showDeleteConfirm ? (
            <div className="space-y-3 rounded-2xl border border-[#fca5a5] bg-[#FEF2F2] p-4 dark:border-[#7f1d1d] dark:bg-[#1c0a0a]">
              <p className="text-sm font-medium text-[#dc2626] dark:text-[#fca5a5]">
                Excluir {syncedClient.name}? Esta ação é permanente.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-xl border-[#fca5a5] text-[#dc2626] dark:border-[#7f1d1d]"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={() => { onDelete?.(syncedClient.id); onClose(); }}
                  className="flex-1 rounded-xl bg-[#dc2626] text-white hover:bg-[#b91c1c]"
                >
                  Sim, excluir
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {canEdit && onDelete && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7E4] text-[#A3A3A3] hover:border-[#fca5a5] hover:text-[#dc2626] dark:border-[#2D2F30]"
                  title="Excluir cliente"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              {canEdit && dirty && (
                <Button
                  onClick={handleSave}
                  className="ml-auto rounded-2xl bg-[#ff5623] text-white hover:bg-[#c2410c]"
                >
                  <Save className="mr-1.5 h-4 w-4" />
                  Salvar alterações
                </Button>
              )}
              {!dirty && (
                <p className="ml-auto text-xs text-[#A3A3A3] dark:text-[#525252]">
                  {canEdit ? 'Edite os campos acima para salvar' : 'Apenas visualização'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
