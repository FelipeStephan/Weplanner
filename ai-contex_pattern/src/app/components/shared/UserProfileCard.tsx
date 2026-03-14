import { useState, useRef, useEffect } from 'react';
import {
  Mail,
  Activity,
  MessageSquare,
  X,
  Shield,
  Briefcase,
  Code,
} from 'lucide-react';

interface UserProfileCardProps {
  user: {
    name: string;
    image?: string;
    email?: string;
    role?: 'client' | 'manager' | 'collaborator';
    title?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  anchorEl?: HTMLElement | null;
  onViewActivities?: () => void;
}

const roleConfig = {
  client: {
    label: 'Cliente',
    bg: 'bg-[#fff7ed] dark:bg-[#ff5623]/15',
    text: 'text-[#ea580c] dark:text-[#fb923c]',
    icon: Briefcase,
  },
  manager: {
    label: 'Gestor',
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
  onViewActivities,
}: UserProfileCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  useEffect(() => {
    if (isOpen && anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      const cardWidth = 300;
      const cardHeight = 260;
      let top = rect.bottom + 8;
      let left = rect.left + rect.width / 2 - cardWidth / 2;

      if (left < 16) left = 16;
      if (left + cardWidth > window.innerWidth - 16)
        left = window.innerWidth - cardWidth - 16;
      if (top + cardHeight > window.innerHeight - 16)
        top = rect.top - cardHeight - 8;

      setPosition({ top, left });
    }
  }, [isOpen, anchorEl]);

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

  if (!isOpen) return null;

  const role = user.role || 'collaborator';
  const rc = roleConfig[role];
  const RoleIcon = rc.icon;
  const email =
    user.email ||
    `${user.name.toLowerCase().replace(/\s+/g, '.')}@weplanner.com`;
  const title = user.title || rc.label;
  const colorIndex = user.name.charCodeAt(0) % avatarColors.length;

  return (
    <div className="fixed inset-0 z-[200]" onClick={onClose}>
      <div
        ref={cardRef}
        className="absolute w-[300px] bg-white dark:bg-[#1e1e1e] rounded-2xl border border-[#e5e5e5] dark:border-[#333] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        style={{ top: position.top, left: position.left }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Colored Header Bar */}
        <div className="h-16 bg-gradient-to-r from-[#ff5623] to-[#ff8a65] relative z-0">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1 rounded-lg bg-white/20 hover:bg-white/40 transition-colors"
          >
            <X className="h-3 w-3 text-white" />
          </button>
        </div>

        {/* Avatar overlapping header */}
        <div className="px-5 -mt-8 relative z-10">
          <div className="w-14 h-14 rounded-full border-3 border-white dark:border-[#1e1e1e] overflow-hidden shadow-md">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className={`w-full h-full flex items-center justify-center ${avatarColors[colorIndex]} text-white font-semibold text-lg`}
              >
                {getInitials(user.name)}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="px-5 pt-2.5 pb-4">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-[#171717] dark:text-[#f5f5f5] text-[15px]">
              {user.name}
            </h3>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold ${rc.bg} ${rc.text}`}
            >
              <RoleIcon className="h-2.5 w-2.5" />
              {rc.label}
            </span>
          </div>
          <p className="text-xs text-[#737373] dark:text-[#a3a3a3] mb-0.5">
            {title}
          </p>
          <p className="text-xs text-[#a3a3a3] dark:text-[#737373] flex items-center gap-1.5">
            <Mail className="h-3 w-3" />
            {email}
          </p>
        </div>

        {/* Actions */}
        <div className="px-3 pb-3 flex gap-2">
          <button
            onClick={() => {
              onViewActivities?.();
              onClose();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#f5f5f5] dark:bg-[#2a2a2a] text-[#525252] dark:text-[#d4d4d4] hover:bg-[#e5e5e5] dark:hover:bg-[#333] text-xs font-semibold transition-colors"
          >
            <Activity className="h-3.5 w-3.5" />
            Ver atividades
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#ff5623] text-white hover:bg-[#c2410c] text-xs font-semibold transition-colors">
            <MessageSquare className="h-3.5 w-3.5" />
            Mensagem
          </button>
        </div>
      </div>
    </div>
  );
}
