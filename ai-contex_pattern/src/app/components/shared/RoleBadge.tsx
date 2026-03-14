import { User, Shield, Users } from 'lucide-react';

interface RoleBadgeProps {
  role: 'client' | 'manager' | 'collaborator';
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const roleConfig = {
    client: {
      label: 'Cliente',
      className: 'bg-[#ffedd5] text-[#ea580c]',
      icon: User,
    },
    manager: {
      label: 'Gestor',
      className: 'bg-[#e9d5ff] text-[#7e22ce]',
      icon: Shield,
    },
    collaborator: {
      label: 'Colaborador',
      className: 'bg-[#fce7f3] text-[#db2777]',
      icon: Users,
    },
  };

  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <span className={`
      inline-flex items-center gap-1.5
      px-2.5 py-1
      rounded-xl
      text-xs font-semibold
      transition-colors duration-150
      ${config.className}
    `}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
