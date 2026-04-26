import { useState, useRef, useEffect } from 'react';
import {
  Mail,
  Activity,
  X,
  Shield,
  Briefcase,
  Code,
  ChevronDown,
  Pencil,
  LogOut,
  Phone,
} from 'lucide-react';

type ProfileMode = 'own' | 'other';
type UserStatus = 'available' | 'busy' | 'away' | 'offline';

interface UserProfileCardProps {
  user: {
    name: string;
    image?: string;
    email?: string;
    phone?: string;
    role?: 'client' | 'manager' | 'collaborator';
    title?: string;
    username?: string;
    status?: UserStatus;
  };
  isOpen: boolean;
  onClose: () => void;
  anchorEl?: HTMLElement | null;
  /** 'own' = perfil do próprio usuário (mostra editar/sair); 'other' = perfil de outro usuário */
  mode?: ProfileMode;
  onViewActivities?: () => void;
  onEditProfile?: () => void;
  onLogout?: () => void;
  onChangeStatus?: (status: UserStatus) => void;
}

const roleConfig = {
  client: {
    label: 'Cliente',
    bg: 'bg-[#fff7ed] dark:bg-[#ff5623]/15',
    text: 'text-[#ea580c] dark:text-[#fb923c]',
    icon: Briefcase,
  },
  manager: {
    label: 'Administrador',
    bg: 'bg-[#dbeafe] dark:bg-[#3b82f6]/15',
    text: 'text-[#2563eb] dark:text-[#60a5fa]',
    icon: Shield,
  },
  collaborator: {
    label: 'Colaborador',
    bg: 'bg-[#f0fdf4] dark:bg-[#019364]/15',
    text: 'text-[#16a34a] dark:text-[#4ade80]',
    icon: Code,
  },
};

const statusConfig: Record<UserStatus, { label: string; dot: string; bg: string; text: string }> = {
  available: {
    label: 'Disponível',
    dot: 'bg-[#16a34a]',
    bg: 'bg-[#edf9f4] dark:bg-[#12261c]',
    text: 'text-[#1e1e1e] dark:text-[#7ee2b8]',
  },
  busy: {
    label: 'Ocupado',
    dot: 'bg-[#dc2626]',
    bg: 'bg-[#fee2e2] dark:bg-[#311514]',
    text: 'text-[#991b1b] dark:text-[#fca5a5]',
  },
  away: {
    label: 'Ausente',
    dot: 'bg-[#ca8a04]',
    bg: 'bg-[#fef9c3] dark:bg-[#2a220f]',
    text: 'text-[#854d0e] dark:text-[#fcd34d]',
  },
  offline: {
    label: 'Offline',
    dot: 'bg-[#a3a3a3]',
    bg: 'bg-[#f5f5f5] dark:bg-[#232325]',
    text: 'text-[#525252] dark:text-[#a3a3a3]',
  },
};

const avatarColors = [
  'bg-[#ff5623]',
  'bg-[#987dfe]',
  'bg-[#019364]',
  'bg-[#3b82f6]',
  'bg-[#ec4899]',
];

export function UserProfileCard({
  user,
  isOpen,
  onClose,
  anchorEl,
  mode = 'other',
  onViewActivities,
  onEditProfile,
  onLogout,
  onChangeStatus,
}: UserProfileCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const username =
    user.username || `@${user.name.toLowerCase().replace(/\s+/g, '')}`;
  const status: UserStatus = user.status || 'available';
  const sc = statusConfig[status];

  useEffect(() => {
    if (isOpen && anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      const cardWidth = 280;
      const cardHeight = mode === 'own' ? 320 : 250;
      let top = rect.bottom + 8;
      let left = rect.left + rect.width / 2 - cardWidth / 2;

      if (left < 16) left = 16;
      if (left + cardWidth > window.innerWidth - 16)
        left = window.innerWidth - cardWidth - 16;
      if (top + cardHeight > window.innerHeight - 16)
        top = rect.top - cardHeight - 8;
      if (top < 16) top = 16;

      setPosition({ top, left });
    }
  }, [isOpen, anchorEl, mode]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Reset status menu when card closes
  useEffect(() => {
    if (!isOpen) setStatusMenuOpen(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const role = user.role || 'collaborator';
  const rc = roleConfig[role];
  const RoleIcon = rc.icon;
  const email =
    user.email ||
    `${user.name.toLowerCase().replace(/\s+/g, '.')}@weplanner.com`;
  const phone = user.phone || '(21) 99914-5149';
  const title = user.title || rc.label;
  const colorIndex = user.name.charCodeAt(0) % avatarColors.length;

  const handleStatusSelect = (newStatus: UserStatus) => {
    onChangeStatus?.(newStatus);
    setStatusMenuOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[200]" onClick={onClose}>
      <div
        ref={cardRef}
        className="absolute w-[280px] bg-white dark:bg-[#1e1e1e] rounded-3xl border border-[#e5e5e5] dark:border-[#2d2f30] shadow-[0px_24px_60px_-20px_rgba(15,23,42,0.28),0px_8px_24px_-8px_rgba(0,0,0,0.08)] py-4 animate-in fade-in zoom-in-95 duration-150"
        style={{ top: position.top, left: position.left }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: avatar + status + close */}
        <div className="flex items-start gap-2 px-4">
          <div className="flex flex-1 items-center gap-2 min-w-0">
            {/* Avatar */}
            <div className="size-14 shrink-0 rounded-full border-2 border-white dark:border-[#1e1e1e] overflow-hidden shadow-md">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center ${avatarColors[colorIndex]} text-white font-semibold text-base`}
                >
                  {getInitials(user.name)}
                </div>
              )}
            </div>

            {/* Status + username */}
            <div className="flex flex-1 flex-col gap-1 min-w-0">
              {/* Status badge — clicável apenas no modo 'own' */}
              <div className="relative">
                <button
                  type="button"
                  disabled={mode !== 'own'}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (mode === 'own') setStatusMenuOpen((v) => !v);
                  }}
                  className={`inline-flex h-[23px] items-center gap-2 px-2 rounded-full ${sc.bg} ${
                    mode === 'own' ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                  } transition-opacity`}
                >
                  <span className="flex items-center gap-1">
                    <span className={`size-[7px] rounded-full ${sc.dot}`} />
                    <span
                      className={`text-[12px] font-medium leading-[22.5px] whitespace-nowrap ${sc.text}`}
                    >
                      {sc.label}
                    </span>
                  </span>
                  {mode === 'own' && (
                    <ChevronDown
                      className={`size-2 text-[#1e1e1e] dark:text-[#a3a3a3] transition-transform ${
                        statusMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>

                {/* Status dropdown menu */}
                {mode === 'own' && statusMenuOpen && (
                  <div
                    className="absolute left-0 top-full mt-1 z-10 w-[160px] rounded-xl bg-white dark:bg-[#1e1e1e] border border-[#e5e5e5] dark:border-[#2d2f30] shadow-lg overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(Object.keys(statusConfig) as UserStatus[]).map((key) => {
                      const opt = statusConfig[key];
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleStatusSelect(key)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-[#171717] dark:text-[#f5f5f5] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors"
                        >
                          <span className={`size-2 rounded-full ${opt.dot}`} />
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <p className="text-[14px] font-medium leading-[22.5px] text-[#525252] dark:text-[#a3a3a3] truncate">
                {username}
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 size-[20px] flex items-center justify-center rounded-[10px] bg-[#f5f5f5] dark:bg-[#2a2a2a] text-[#525252] dark:text-[#a3a3a3] hover:bg-[#e5e5e5] dark:hover:bg-[#333] transition-colors"
            aria-label="Fechar"
          >
            <X className="size-3" />
          </button>
        </div>

        {/* Info: name + role + contact */}
        <div className="flex flex-col gap-2 px-4 py-2">
          <h3 className="text-[24px] font-semibold leading-[1.1] text-[#171717] dark:text-white">
            {user.name}
          </h3>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[10px] text-[10px] font-semibold ${rc.bg} ${rc.text}`}
            >
              <RoleIcon className="size-2.5" />
              {rc.label}
            </span>
            <span className="text-[12px] font-normal text-[#737373] dark:text-[#a3a3a3] leading-4">
              {title}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Mail className="size-3 shrink-0 text-[#a3a3a3]" />
              <span className="text-[12px] text-[#a3a3a3] dark:text-[#737373] leading-4 truncate">
                {email}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="size-3 shrink-0 text-[#a3a3a3]" />
              <span className="text-[12px] text-[#a3a3a3] dark:text-[#737373] leading-4">
                {phone}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 pt-2">
          {/* "Ver atividades" — comum aos dois modos */}
          <button
            type="button"
            onClick={() => {
              onViewActivities?.();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl bg-[#f5f5f5] dark:bg-[#2a2a2a] text-[#525252] dark:text-[#d4d4d4] hover:bg-[#e5e5e5] dark:hover:bg-[#333] text-[12px] font-semibold transition-colors"
          >
            <Activity className="size-3.5" />
            Ver atividades
          </button>

          {/* Linha extra: editar perfil + sair (apenas modo 'own') */}
          {mode === 'own' && (
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onEditProfile?.();
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl bg-[#f5f5f5] dark:bg-[#2a2a2a] text-[#525252] dark:text-[#d4d4d4] hover:bg-[#e5e5e5] dark:hover:bg-[#333] text-[12px] font-semibold transition-colors"
              >
                <Pencil className="size-3.5" />
                Editar Perfil
              </button>
              <button
                type="button"
                onClick={() => {
                  onLogout?.();
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl bg-[#fee2e2] dark:bg-[#311514] text-[#dc2626] dark:text-[#fca5a5] hover:bg-[#fecaca] dark:hover:bg-[#3d1a19] text-[12px] font-semibold transition-colors"
              >
                <LogOut className="size-3.5" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
