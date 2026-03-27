import { useState, useMemo } from 'react';
import { Building2, Search, X, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { ClientCard } from './ClientCard';
import { ClientPanel } from './ClientPanel';
import { CreateClientModal } from './CreateClientModal';
import type { ClientRecord } from '../../../domain/clients/contracts';
import { CLIENT_STATUS_LABELS } from '../../../domain/clients/contracts';
import type { UserRecord } from '../../../domain/shared/entities';
import type { BoardRecord } from '../../../domain/kanban/contracts';
import type { TeamMember } from '../../../domain/team/contracts';

// ─── Types ───────────────────────────────────────────────────────────────────

type FilterStatus = 'all' | 'active' | 'onboarding' | 'inactive' | 'no-credits';

const FILTER_LABELS: Record<FilterStatus, string> = {
  all: 'Todos',
  active: 'Ativos',
  onboarding: 'Em onboarding',
  inactive: 'Inativos',
  'no-credits': 'Sem créditos',
};

interface ClientsPageProps {
  clients: ClientRecord[];
  boards: BoardRecord[];
  members: TeamMember[];
  users: Array<UserRecord & { id: string; color?: string }>;
  canEdit: boolean;
  /** Map of clientId → total credits consumed (from workspaceSnapshot) */
  consumedCreditsMap?: Record<string, number>;
  onCreateClient: (input: import('../../../domain/clients/contracts').ClientCreateInput) => void;
  onUpdateClient: (id: string, patch: Partial<ClientRecord>) => void;
  onDeleteClient: (id: string) => void;
  onInviteClient?: (clientId: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────

export function ClientsPage({
  clients,
  boards,
  members,
  users,
  canEdit,
  consumedCreditsMap = {},
  onCreateClient,
  onUpdateClient,
  onDeleteClient,
  onInviteClient,
}: ClientsPageProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const managers = useMemo(
    () => users.filter((u) => (u as UserRecord & { id: string; role?: string }).role === 'Gestora de Projetos' || (members.find((m) => m.id === u.id)?.role === 'manager')),
    [users, members],
  );

  const activeCount = clients.filter((c) => c.status === 'active').length;

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const matchesQuery =
        !query ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        (c.sector ?? '').toLowerCase().includes(query.toLowerCase());

      const matchesFilter =
        filter === 'all' ? true
        : filter === 'no-credits' ? !c.creditsEnabled
        : c.status === filter;

      return matchesQuery && matchesFilter;
    });
  }, [clients, query, filter]);

  // When a client is updated in the panel, also refresh the selectedClient state
  function handleUpdate(id: string, patch: Partial<ClientRecord>) {
    onUpdateClient(id, patch);
    if (selectedClient?.id === id) {
      setSelectedClient((prev) => prev ? { ...prev, ...patch } : prev);
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F8F6] dark:bg-[#0f0f10]">
      {/* ── Header ── */}
      <div className="border-b border-[#E5E7E4] px-6 py-6 dark:border-[#232425]">
        <div className="mx-auto flex max-w-[1560px] flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#ff5623]" />
              <h1 className="text-3xl font-bold tracking-tight text-[#171717] dark:text-white">
                Clientes
              </h1>
            </div>
            <p className="mt-1 text-base text-[#737373] dark:text-[#A3A3A3]">
              {activeCount} {activeCount === 1 ? 'cliente ativo' : 'clientes ativos'} ·{' '}
              {clients.length} total
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-11 rounded-2xl border border-[#E5E7E4] bg-white pl-10 pr-4 text-sm text-[#171717] placeholder-[#A3A3A3] focus:outline-none focus:ring-2 focus:ring-[#ff5623]/30 dark:border-[#2D2F30] dark:bg-[#171819] dark:text-white"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-[#525252]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {canEdit && (
              <Button
                onClick={() => setCreateModalOpen(true)}
                className="rounded-2xl bg-[#ff5623] text-white hover:bg-[#c2410c]"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Novo cliente
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto max-w-[1560px] space-y-8 px-6 py-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(FILTER_LABELS) as FilterStatus[]).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'rounded-2xl border px-4 py-2 text-sm font-semibold transition-colors',
                filter === key
                  ? 'border-[#171717] bg-[#171717] text-white dark:border-[#f5f5f5] dark:bg-[#f5f5f5] dark:text-[#171717]'
                  : 'border-[#E5E7E4] bg-white text-[#525252] hover:bg-[#f5f5f5] dark:border-[#2D2F30] dark:bg-[#171819] dark:text-[#F5F5F5] dark:hover:bg-[#1e2021]',
              )}
            >
              {FILTER_LABELS[key]}
            </button>
          ))}
        </div>

        {/* Client grid */}
        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filtered.map((client) => {
              const responsible = users.find((u) => u.id === client.responsibleUserId);
              const boardCount = client.boardIds.filter((id) =>
                boards.some((b) => b.id === id),
              ).length;
              return (
                <ClientCard
                  key={client.id}
                  client={client}
                  responsible={responsible}
                  consumedCredits={consumedCreditsMap[client.id] ?? 0}
                  boardCount={boardCount}
                  onClick={setSelectedClient}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Building2 className="h-10 w-10 text-[#D4D4D4] dark:text-[#525252]" />
            <p className="mt-3 text-sm font-medium text-[#737373] dark:text-[#A3A3A3]">
              {query ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado ainda'}
            </p>
            {canEdit && !query && (
              <Button
                onClick={() => setCreateModalOpen(true)}
                className="mt-4 rounded-2xl bg-[#ff5623] text-white hover:bg-[#c2410c]"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Criar primeiro cliente
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ── Client panel ── */}
      {selectedClient && (
        <ClientPanel
          client={selectedClient}
          isOpen={!!selectedClient}
          onClose={() => setSelectedClient(null)}
          canEdit={canEdit}
          managers={managers as Array<UserRecord & { id: string; color?: string }>}
          boards={boards}
          members={members}
          consumedCredits={consumedCreditsMap[selectedClient.id] ?? 0}
          onSave={handleUpdate}
          onDelete={canEdit ? (id) => { onDeleteClient(id); setSelectedClient(null); } : undefined}
          onInviteClient={onInviteClient}
        />
      )}

      {/* ── Create modal ── */}
      <CreateClientModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={onCreateClient}
        managers={managers as Array<UserRecord & { id: string; color?: string }>}
      />
    </div>
  );
}
