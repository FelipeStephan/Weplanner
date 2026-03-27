import { useState, useMemo } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Clock,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { TeamMemberCard } from './TeamMemberCard';
import { TeamMemberPanel } from './TeamMemberPanel';
import { TeamInviteModal } from './TeamInviteModal';
import type { TeamMember, TeamInvite } from '../../../domain/team/contracts';
import type { BoardRecord } from '../../../domain/kanban/contracts';
import type { ClientRecord } from '../../../domain/shared/entities';
import type { AppRole } from '../../../domain/boards/contracts';

interface TeamPageProps {
  members: TeamMember[];
  invites: TeamInvite[];
  boards: BoardRecord[];
  clients: ClientRecord[];
  viewerRole: AppRole;
  viewerId: string;
  onUpdateMember?: (id: string, patch: Partial<TeamMember>) => void;
  onDeactivateMember?: (id: string) => void;
  onReactivateMember?: (id: string) => void;
  onDeleteMember?: (id: string) => void;
  onInvite?: (data: Pick<TeamInvite, 'email' | 'role' | 'clientId'>) => void;
  onCancelInvite?: (inviteId: string) => void;
  onResendInvite?: (inviteId: string) => void;
}

type FilterRole = 'all' | 'manager' | 'collaborator' | 'client' | 'inactive';

const FILTER_LABELS: Record<FilterRole, string> = {
  all: 'Todos',
  manager: 'Gestores',
  collaborator: 'Colaboradores',
  client: 'Clientes',
  inactive: 'Inativos',
};

function formatExpiresIn(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Expirado';
  if (days === 1) return 'expira amanhã';
  return `expira em ${days} dias`;
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function TeamPage({
  members,
  invites,
  boards,
  clients,
  viewerRole,
  viewerId,
  onUpdateMember,
  onDeactivateMember,
  onReactivateMember,
  onDeleteMember,
  onInvite,
  onCancelInvite,
  onResendInvite,
}: TeamPageProps) {
  const [query, setQuery] = useState('');
  const [filterRole, setFilterRole] = useState<FilterRole>('all');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [pendingExpanded, setPendingExpanded] = useState(true);

  const isManager = viewerRole === 'manager';
  const pendingInvites = invites.filter((inv) => inv.status === 'pending');

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesQuery =
        !query ||
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.email.toLowerCase().includes(query.toLowerCase()) ||
        (m.jobTitle ?? '').toLowerCase().includes(query.toLowerCase());

      const matchesFilter =
        filterRole === 'all'
          ? m.status !== 'inactive'
          : filterRole === 'inactive'
          ? m.status === 'inactive'
          : m.role === filterRole && m.status !== 'inactive';

      return matchesQuery && matchesFilter;
    });
  }, [members, query, filterRole]);

  const activeCount = members.filter((m) => m.status === 'active').length;
  const clientCount = members.filter((m) => m.role === 'client' && m.status === 'active').length;

  return (
    <div className="min-h-screen bg-[#F6F8F6] dark:bg-[#0f0f10]">
      {/* Header */}
      <div className="border-b border-[#E5E7E4] px-6 py-6 dark:border-[#232425]">
        <div className="mx-auto flex max-w-[1560px] flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#ff5623]" />
              <h1 className="text-3xl font-bold tracking-tight text-[#171717] dark:text-white">
                Equipe
              </h1>
            </div>
            <p className="mt-1 text-base text-[#737373] dark:text-[#A3A3A3]">
              {activeCount} membros ativos · {clientCount} clientes
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" />
              <input
                type="text"
                placeholder="Buscar membro..."
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

            {isManager && (
              <Button
                onClick={() => setInviteModalOpen(true)}
                className="rounded-2xl bg-[#ff5623] text-white hover:bg-[#c2410c]"
              >
                <UserPlus className="mr-1.5 h-4 w-4" />
                Convidar membro
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1560px] space-y-8 px-6 py-8">
        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(FILTER_LABELS) as FilterRole[]).map((key) => (
            <button
              key={key}
              onClick={() => setFilterRole(key)}
              className={cn(
                'rounded-2xl border px-4 py-2 text-sm font-semibold transition-colors',
                filterRole === key
                  ? 'border-[#171717] bg-[#171717] text-white dark:border-[#f5f5f5] dark:bg-[#f5f5f5] dark:text-[#171717]'
                  : 'border-[#E5E7E4] bg-white text-[#525252] hover:bg-[#f5f5f5] dark:border-[#2D2F30] dark:bg-[#171819] dark:text-[#F5F5F5] dark:hover:bg-[#1e2021]',
              )}
            >
              {FILTER_LABELS[key]}
            </button>
          ))}
        </div>

        {/* Lista de membros */}
        {filteredMembers.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                viewerRole={viewerRole}
                boards={boards}
                onClick={setSelectedMember}
                onEdit={isManager ? setSelectedMember : undefined}
                onDeactivate={isManager ? (m) => onDeactivateMember?.(m.id) : undefined}
                onReactivate={isManager ? (m) => onReactivateMember?.(m.id) : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-10 w-10 text-[#D4D4D4] dark:text-[#525252]" />
            <p className="mt-3 text-sm font-medium text-[#737373] dark:text-[#A3A3A3]">
              Nenhum membro encontrado
            </p>
          </div>
        )}

        {/* Convites pendentes */}
        {isManager && pendingInvites.length > 0 && (
          <div className="rounded-3xl border border-[#E8EBE8] bg-white dark:border-[#232425] dark:bg-[#121313]">
            <button
              onClick={() => setPendingExpanded((e) => !e)}
              className="flex w-full items-center justify-between px-6 py-4"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-[#feba31]" />
                <span className="font-semibold text-[#171717] dark:text-white">
                  Convites pendentes
                </span>
                <span className="rounded-full bg-[#FFFBEB] px-2.5 py-0.5 text-[11px] font-bold text-[#92400e] dark:bg-[#221c0a] dark:text-[#fcd34d]">
                  {pendingInvites.length}
                </span>
              </div>
              {pendingExpanded ? (
                <ChevronUp className="h-4 w-4 text-[#A3A3A3]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[#A3A3A3]" />
              )}
            </button>

            {pendingExpanded && (
              <div className="divide-y divide-[#F0F2F0] border-t border-[#F0F2F0] dark:divide-[#1E2020] dark:border-[#1E2020]">
                {pendingInvites.map((invite) => {
                  const isExpiring =
                    new Date(invite.expiresAt).getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000;
                  return (
                    <div
                      key={invite.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#171717] dark:text-white">
                          {invite.email}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-[#737373] dark:text-[#A3A3A3]">
                          <span>
                            {invite.role === 'manager'
                              ? 'Gestor'
                              : invite.role === 'client'
                              ? 'Cliente'
                              : 'Colaborador'}
                          </span>
                          <span>·</span>
                          <span>Enviado em {formatDate(invite.createdAt)}</span>
                          <span>·</span>
                          <span
                            className={cn(
                              isExpiring && 'font-semibold text-[#dc2626] dark:text-[#fca5a5]',
                            )}
                          >
                            {formatExpiresIn(invite.expiresAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onResendInvite?.(invite.id)}
                          className="rounded-xl border-[#E5E7E4] text-xs dark:border-[#2D2F30]"
                        >
                          <RefreshCw className="mr-1 h-3 w-3" /> Reenviar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCancelInvite?.(invite.id)}
                          className="rounded-xl border-[#E5E7E4] text-xs text-[#dc2626] hover:bg-[#FEF2F2] dark:border-[#2D2F30] dark:text-[#fca5a5]"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Panel de detalhe do membro */}
      {selectedMember && (
        <TeamMemberPanel
          member={selectedMember}
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          viewerRole={viewerRole}
          viewerId={viewerId}
          boards={boards}
          onSave={(id, patch) => {
            onUpdateMember?.(id, patch);
            setSelectedMember(null);
          }}
          onDelete={isManager ? (id) => { onDeleteMember?.(id); setSelectedMember(null); } : undefined}
        />
      )}

      {/* Modal de convite */}
      {isManager && (
        <TeamInviteModal
          isOpen={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          onSubmit={(data) => onInvite?.(data)}
          clients={clients}
        />
      )}
    </div>
  );
}
