import { useState } from 'react';
import {
  X,
  User,
  FolderKanban,
  Shield,
  Activity,
  Mail,
  Phone,
  MapPin,
  Building2,
  Save,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '../ui/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import type { TeamMember } from '../../../domain/team/contracts';
import { resolvePermissions, PERMISSION_LABELS, DEFAULT_PERMISSIONS } from '../../../domain/team/contracts';
import type { BoardRecord } from '../../../domain/kanban/contracts';
import type { AppRole } from '../../../domain/boards/contracts';

interface TeamMemberPanelProps {
  member: TeamMember;
  isOpen: boolean;
  onClose: () => void;
  viewerRole: AppRole;
  viewerId: string;
  boards: BoardRecord[];
  onSave?: (id: string, patch: Partial<TeamMember>) => void;
  onDelete?: (id: string) => void;
}

type PanelTab = 'profile' | 'boards' | 'permissions' | 'activity';

const ROLE_OPTIONS: Array<{ value: AppRole; label: string }> = [
  { value: 'manager', label: 'Gestor' },
  { value: 'collaborator', label: 'Colaborador' },
  { value: 'client', label: 'Cliente' },
];

export function TeamMemberPanel({
  member,
  isOpen,
  onClose,
  viewerRole,
  viewerId,
  boards,
  onSave,
  onDelete,
}: TeamMemberPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>('profile');
  const [editedName, setEditedName] = useState(member.name);
  const [editedJobTitle, setEditedJobTitle] = useState(member.jobTitle ?? '');
  const [editedDepartment, setEditedDepartment] = useState(member.department ?? '');
  const [editedRole, setEditedRole] = useState<AppRole>(member.role);
  const [editedBoardIds, setEditedBoardIds] = useState<string[]>(member.boardIds);
  const [editedPermissions, setEditedPermissions] = useState<Partial<typeof DEFAULT_PERMISSIONS.collaborator>>(
    member.permissions ?? {},
  );

  const isManager = viewerRole === 'manager';
  const isOwnProfile = viewerId === member.id;
  const canEditProfile = isManager || isOwnProfile;
  const canEditRole = isManager && !isOwnProfile;
  const canEditBoards = isManager;
  const canEditPermissions = isManager && member.role !== 'client';

  const effectivePermissions = resolvePermissions(editedRole, editedPermissions);

  const initials = member.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleSave = () => {
    onSave?.(member.id, {
      name: editedName,
      jobTitle: editedJobTitle,
      department: editedDepartment,
      role: editedRole,
      boardIds: editedBoardIds,
      permissions: editedPermissions,
    });
    onClose();
  };

  const toggleBoardAccess = (boardId: string) => {
    setEditedBoardIds((current) =>
      current.includes(boardId) ? current.filter((id) => id !== boardId) : [...current, boardId],
    );
  };

  const togglePermission = (key: keyof typeof DEFAULT_PERMISSIONS.collaborator) => {
    setEditedPermissions((current) => ({
      ...current,
      [key]: !(effectivePermissions[key]),
    }));
  };

  const [confirmDelete, setConfirmDelete] = useState(false);

  const resetPermissions = () => setEditedPermissions({});

  const handleDelete = () => {
    onDelete?.(member.id);
    setConfirmDelete(false);
    onClose();
  };

  if (!isOpen) return null;

  const TABS: Array<{ id: PanelTab; label: string; icon: typeof User }> = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'boards', label: 'Boards', icon: FolderKanban },
    { id: 'permissions', label: 'Permissões', icon: Shield },
    { id: 'activity', label: 'Atividade', icon: Activity },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[420px] flex-col bg-white shadow-2xl dark:bg-[#121313]">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-[#F0F2F0] p-6 dark:border-[#1E2020]">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarImage src={member.image} alt={member.name} />
            <AvatarFallback
              className="text-sm font-bold text-white"
              style={{ backgroundColor: member.color ?? '#525252' }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[16px] font-semibold text-[#171717] dark:text-white">
              {member.name}
            </p>
            <p className="truncate text-sm text-[#737373] dark:text-[#A3A3A3]">
              {member.jobTitle ?? member.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#A3A3A3] hover:bg-[#F4F4F4] dark:hover:bg-[#1C1C1C]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#F0F2F0] dark:border-[#1E2020]">
          {TABS.filter((tab) => {
            if (tab.id === 'permissions') return canEditPermissions;
            return true;
          }).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 px-3 py-3.5 text-[12px] font-semibold transition-colors',
                activeTab === tab.id
                  ? 'border-b-2 border-[#ff5623] text-[#ff5623]'
                  : 'text-[#737373] hover:text-[#525252] dark:text-[#A3A3A3] dark:hover:text-white',
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Perfil */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <Field
                label="Nome completo"
                value={editedName}
                onChange={setEditedName}
                editable={canEditProfile}
                icon={<User className="h-4 w-4" />}
              />
              <Field
                label="E-mail"
                value={member.email}
                editable={false}
                icon={<Mail className="h-4 w-4" />}
              />
              <Field
                label="Cargo"
                value={editedJobTitle}
                onChange={setEditedJobTitle}
                editable={isManager}
                icon={<Building2 className="h-4 w-4" />}
              />
              <Field
                label="Departamento"
                value={editedDepartment}
                onChange={setEditedDepartment}
                editable={isManager}
                icon={<Building2 className="h-4 w-4" />}
              />
              {(isManager || isOwnProfile) && member.phone && (
                <Field
                  label="Telefone"
                  value={member.phone}
                  editable={isOwnProfile}
                  icon={<Phone className="h-4 w-4" />}
                />
              )}
              {(isManager || isOwnProfile) && member.location && (
                <Field
                  label="Localização"
                  value={member.location}
                  editable={isOwnProfile}
                  icon={<MapPin className="h-4 w-4" />}
                />
              )}

              {/* Papel */}
              {isManager && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A3A3A3]">
                    Papel no sistema
                  </label>
                  {canEditRole ? (
                    <select
                      value={editedRole}
                      onChange={(e) => setEditedRole(e.target.value as AppRole)}
                      className="w-full rounded-2xl border border-[#E8EBE8] bg-white px-4 py-2.5 text-sm text-[#171717] focus:outline-none dark:border-[#2D2F30] dark:bg-[#171819] dark:text-white"
                    >
                      {ROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-[#525252] dark:text-[#D4D4D4]">
                      {ROLE_OPTIONS.find((r) => r.value === member.role)?.label}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Boards */}
          {activeTab === 'boards' && (
            <div className="space-y-3">
              <p className="text-sm text-[#737373] dark:text-[#A3A3A3]">
                {canEditBoards
                  ? 'Ative ou desative o acesso a cada board.'
                  : 'Boards aos quais este membro tem acesso.'}
              </p>
              {boards.map((board) => {
                const hasAccess = editedBoardIds.includes(board.id);
                return (
                  <div
                    key={board.id}
                    className={cn(
                      'flex items-center justify-between gap-3 rounded-2xl border px-4 py-3',
                      hasAccess
                        ? 'border-[#ff5623]/20 bg-[#FFF4EE] dark:border-[#ff8c69]/20 dark:bg-[#26150f]'
                        : 'border-[#E8EBE8] dark:border-[#2D2F30]',
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          'h-2.5 w-2.5 rounded-full',
                          hasAccess ? 'bg-[#ff5623]' : 'bg-[#D4D4D4] dark:bg-[#525252]',
                        )}
                      />
                      <span className="text-sm font-medium text-[#171717] dark:text-white">
                        {board.name}
                      </span>
                    </div>
                    {canEditBoards && (
                      <button
                        onClick={() => toggleBoardAccess(board.id)}
                        className={cn(
                          'h-5 w-9 rounded-full transition-colors',
                          hasAccess ? 'bg-[#ff5623]' : 'bg-[#D4D4D4] dark:bg-[#525252]',
                        )}
                      >
                        <span
                          className={cn(
                            'block h-4 w-4 rounded-full bg-white shadow transition-transform',
                            hasAccess ? 'translate-x-[18px]' : 'translate-x-0.5',
                          )}
                        />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Permissões */}
          {activeTab === 'permissions' && canEditPermissions && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#F6F8F6] px-4 py-3 dark:bg-[#1A1B1C]">
                <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                  Padrão do cargo <strong>{ROLE_OPTIONS.find(r => r.value === member.role)?.label}</strong>:{' '}
                  todas as permissões abaixo estão desativadas. Marque exceções individuais.
                </p>
              </div>

              <div className="space-y-2">
                {(Object.keys(PERMISSION_LABELS) as Array<keyof typeof PERMISSION_LABELS>).map((key) => {
                  const { label, description } = PERMISSION_LABELS[key];
                  const isActive = effectivePermissions[key];
                  const isDefault = DEFAULT_PERMISSIONS[member.role][key];
                  const isOverride = !isDefault && isActive;

                  return (
                    <button
                      key={key}
                      onClick={() => togglePermission(key)}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors',
                        isActive
                          ? 'border-[#ff5623]/20 bg-[#FFF4EE] dark:border-[#ff8c69]/20 dark:bg-[#26150f]'
                          : 'border-[#E8EBE8] bg-white dark:border-[#2D2F30] dark:bg-[#171819]',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 h-4 w-4 shrink-0 rounded border-2 transition-colors',
                          isActive
                            ? 'border-[#ff5623] bg-[#ff5623]'
                            : 'border-[#D4D4D4] dark:border-[#525252]',
                        )}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold text-[#171717] dark:text-white">
                            {label}
                          </span>
                          {isOverride && (
                            <span className="rounded-full bg-[#F3F0FF] px-2 py-0.5 text-[10px] font-semibold text-[#6d28d9] dark:bg-[#1e1640] dark:text-[#c4b5fd]">
                              exceção
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[12px] text-[#737373] dark:text-[#A3A3A3]">
                          {description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={resetPermissions}
                className="w-full rounded-2xl border-[#E8EBE8] dark:border-[#2D2F30]"
              >
                Restaurar padrões do cargo
              </Button>
            </div>
          )}

          {/* Atividade */}
          {activeTab === 'activity' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="h-8 w-8 text-[#D4D4D4] dark:text-[#525252]" />
              <p className="mt-3 text-sm font-medium text-[#737373] dark:text-[#A3A3A3]">
                Feed de atividades em breve
              </p>
              <p className="mt-1 text-xs text-[#A3A3A3] dark:text-[#737373]">
                Quando disponível, mostrará as ações recentes deste membro.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {(canEditProfile || canEditBoards || canEditPermissions) && (
          <div className="border-t border-[#F0F2F0] px-6 py-4 dark:border-[#1E2020]">
            {/* Delete zone — only for managers editing another member */}
            {canEditRole && onDelete && (
              <div className="mb-3">
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex w-full items-center gap-2 rounded-2xl border border-[#fecaca] px-4 py-2.5 text-sm font-medium text-[#dc2626] transition-colors hover:bg-[#fff1f2] dark:border-[#5f1d22] dark:text-[#ffb4b8] dark:hover:bg-[#2a1316]"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir membro do workspace
                  </button>
                ) : (
                  <div className="rounded-2xl border border-[#fecaca] bg-[#fff1f2] p-4 dark:border-[#5f1d22] dark:bg-[#2a1316]">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#dc2626] dark:text-[#ffb4b8]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#dc2626] dark:text-[#ffb4b8]">
                          Excluir {member.name}?
                        </p>
                        <p className="mt-0.5 text-[12px] text-[#737373] dark:text-[#A3A3A3]">
                          Esta ação é permanente. As tarefas atribuídas a este membro serão mantidas com seu nome como registro histórico.
                        </p>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => setConfirmDelete(false)}
                            className="flex-1 rounded-xl border border-[#E8EBE8] bg-white px-3 py-1.5 text-[12px] font-medium text-[#525252] dark:border-[#2D2F30] dark:bg-[#171819] dark:text-[#D4D4D4]"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleDelete}
                            className="flex-1 rounded-xl bg-[#dc2626] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#b91c1c]"
                          >
                            Sim, excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="rounded-2xl border-[#E8EBE8] dark:border-[#2D2F30]"
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} className="rounded-2xl bg-[#ff5623] text-white hover:bg-[#c2410c]">
                <Save className="mr-1.5 h-4 w-4" />
                Salvar
              </Button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

// Campo editável reutilizável
function Field({
  label,
  value,
  onChange,
  editable = false,
  icon,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  editable?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A3A3A3]">
        {label}
      </label>
      {editable && onChange ? (
        <div className="relative">
          {icon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A3A3A3]">{icon}</span>
          )}
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              'w-full rounded-2xl border border-[#E8EBE8] bg-white py-2.5 pr-4 text-sm text-[#171717] placeholder-[#A3A3A3] focus:outline-none focus:ring-2 focus:ring-[#ff5623]/30 dark:border-[#2D2F30] dark:bg-[#171819] dark:text-white',
              icon ? 'pl-10' : 'pl-4',
            )}
          />
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-[#525252] dark:text-[#D4D4D4]">
          {icon && <span className="text-[#A3A3A3]">{icon}</span>}
          <span>{value || '—'}</span>
        </div>
      )}
    </div>
  );
}
