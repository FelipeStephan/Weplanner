import { useState } from 'react';
import { X, Building2, Save, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import type { ClientRecord, ClientLibraryResource } from '../../../domain/clients/contracts';
import { CLIENT_STATUS_LABELS, CLIENT_STATUS_COLORS } from '../../../domain/clients/contracts';
import type { UserRecord } from '../../../domain/shared/entities';
import type { BoardRecord } from '../../../domain/kanban/contracts';
import type { TeamMember } from '../../../domain/team/contracts';
import type { PanelTab } from './ClientPanelTabs';
import { ProfileTab, LibraryTab, TeamTab, BoardsTab, CreditsTab, TABS } from './ClientPanelTabs';

// ─── Types ───────────────────────────────────────────────────────────────────


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
