import { cn } from '../ui/utils';
import type { TeamMember } from '../../../domain/team/contracts';
import { resolvePermissions } from '../../../domain/team/contracts';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { MoreHorizontal, Mail, Pencil, UserX, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface TeamMemberCardProps {
  member: TeamMember;
  viewerRole: 'manager' | 'collaborator' | 'client';
  boards?: Array<{ id: string; name: string }>;
  onEdit?: (member: TeamMember) => void;
  onDeactivate?: (member: TeamMember) => void;
  onReactivate?: (member: TeamMember) => void;
  onClick?: (member: TeamMember) => void;
}

const ROLE_BADGE: Record<TeamMember['role'], { label: string; className: string }> = {
  manager: {
    label: 'Gestor',
    className: 'bg-[#FFF1EA] text-[#c2410c] dark:bg-[#26150f] dark:text-[#ffb39c]',
  },
  collaborator: {
    label: 'Colaborador',
    className: 'bg-[#F3F0FF] text-[#6d28d9] dark:bg-[#1e1640] dark:text-[#c4b5fd]',
  },
  client: {
    label: 'Cliente',
    className: 'bg-[#FFFBEB] text-[#92400e] dark:bg-[#221c0a] dark:text-[#fcd34d]',
  },
};

const STATUS_DOT: Record<TeamMember['status'], string> = {
  active: 'bg-[#019364]',
  invited: 'bg-[#feba31]',
  inactive: 'bg-[#D4D4D4] dark:bg-[#525252]',
};

const STATUS_LABEL: Record<TeamMember['status'], string> = {
  active: 'Ativo',
  invited: 'Convite pendente',
  inactive: 'Inativo',
};

export function TeamMemberCard({
  member,
  viewerRole,
  boards = [],
  onEdit,
  onDeactivate,
  onReactivate,
  onClick,
}: TeamMemberCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const effectivePermissions = resolvePermissions(member.role, member.permissions);
  const hasPermissionOverrides =
    member.role === 'collaborator' &&
    Object.keys(member.permissions ?? {}).length > 0;
  const memberBoards = boards.filter((b) => member.boardIds.includes(b.id));
  const isManager = viewerRole === 'manager';
  const badge = ROLE_BADGE[member.role];

  const initials = member.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        'relative flex flex-col gap-3 rounded-3xl border bg-white p-5 transition-all dark:bg-[#121313]',
        member.status === 'inactive'
          ? 'border-[#EBEBEB] opacity-60 dark:border-[#222]'
          : 'border-[#E8EBE8] dark:border-[#232425] hover:border-[#D4D4D4] dark:hover:border-[#333]',
        onClick && 'cursor-pointer',
      )}
      onClick={() => onClick?.(member)}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <Avatar className="h-11 w-11">
            <AvatarImage src={member.image} alt={member.name} />
            <AvatarFallback
              className="text-xs font-bold text-white"
              style={{ backgroundColor: member.color ?? '#525252' }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <span
            className={cn(
              'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-[#121313]',
              STATUS_DOT[member.status],
            )}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-[#171717] dark:text-white">
            {member.name}
          </p>
          <p className="truncate text-xs text-[#737373] dark:text-[#A3A3A3]">
            {member.jobTitle ?? member.email}
          </p>
        </div>

        {/* Menu de ações (só para manager) */}
        {isManager && (
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-[#A3A3A3] transition-colors hover:bg-[#F4F4F4] hover:text-[#525252] dark:hover:bg-[#1C1C1C] dark:hover:text-white"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-9 z-50 min-w-[160px] overflow-hidden rounded-2xl border border-[#E8EBE8] bg-white py-1 shadow-lg dark:border-[#282828] dark:bg-[#1A1B1C]">
                <button
                  onClick={() => { setMenuOpen(false); onEdit?.(member); }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[#525252] hover:bg-[#F6F8F6] dark:text-[#D4D4D4] dark:hover:bg-[#242526]"
                >
                  <Pencil className="h-3.5 w-3.5" /> Editar perfil
                </button>
                {member.status === 'active' ? (
                  <button
                    onClick={() => { setMenuOpen(false); onDeactivate?.(member); }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[#dc2626] hover:bg-[#FEF2F2] dark:text-[#fca5a5] dark:hover:bg-[#291516]"
                  >
                    <UserX className="h-3.5 w-3.5" /> Desativar
                  </button>
                ) : member.status === 'inactive' ? (
                  <button
                    onClick={() => { setMenuOpen(false); onReactivate?.(member); }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[#019364] hover:bg-[#EDF9F4] dark:text-[#79d9b0] dark:hover:bg-[#12231c]"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Reativar
                  </button>
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', badge.className)}>
          {badge.label}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-[#F6F8F6] px-2.5 py-0.5 text-[11px] font-medium text-[#737373] dark:bg-[#1C1D1E] dark:text-[#A3A3A3]">
          <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_DOT[member.status])} />
          {STATUS_LABEL[member.status]}
        </span>
        {hasPermissionOverrides && (
          <span className="rounded-full bg-[#F3F0FF] px-2.5 py-0.5 text-[11px] font-semibold text-[#6d28d9] dark:bg-[#1e1640] dark:text-[#c4b5fd]">
            Permissões personalizadas
          </span>
        )}
      </div>

      {/* Boards */}
      {memberBoards.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {memberBoards.slice(0, 3).map((board) => (
            <span
              key={board.id}
              className="rounded-xl bg-[#F6F8F6] px-2 py-0.5 text-[11px] text-[#737373] dark:bg-[#1C1D1E] dark:text-[#A3A3A3]"
            >
              {board.name}
            </span>
          ))}
          {memberBoards.length > 3 && (
            <span className="rounded-xl bg-[#F6F8F6] px-2 py-0.5 text-[11px] text-[#A3A3A3] dark:bg-[#1C1D1E]">
              +{memberBoards.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Email (apenas manager ou colaborador vê email dos outros) */}
      {(viewerRole === 'manager' || viewerRole === 'collaborator') && member.status !== 'inactive' && (
        <div className="flex items-center gap-1.5 text-[11px] text-[#A3A3A3] dark:text-[#737373]">
          <Mail className="h-3 w-3 shrink-0" />
          <span className="truncate">{member.email}</span>
        </div>
      )}
    </div>
  );
}
