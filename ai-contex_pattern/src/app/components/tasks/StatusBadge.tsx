interface StatusBadgeProps {
  status: 'todo' | 'in-progress' | 'review' | 'completed' | 'blocked' | 'archived' | 'new';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const statusConfig = {
    'new': {
      label: 'Novo',
      className: 'bg-[#dbeafe] text-[#2563eb]',
      pulse: true,
    },
    'todo': {
      label: 'A Fazer',
      className: 'bg-[#f5f5f5] text-[#525252]',
    },
    'in-progress': {
      label: 'Em Progresso',
      className: 'bg-[#e9d5ff] text-[#7e22ce]',
    },
    'review': {
      label: 'Revisão',
      className: 'bg-[#ffedd5] text-[#ea580c]',
    },
    'completed': {
      label: 'Concluído',
      className: 'bg-[#dcfce7] text-[#16a34a]',
    },
    'blocked': {
      label: 'Bloqueado',
      className: 'bg-[#fee2e2] text-[#dc2626]',
    },
    'archived': {
      label: 'Arquivado',
      className: 'bg-[#f5f5f5] text-[#737373]',
    },
  };

  const config = statusConfig[status];
  const sizeClasses = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span className={`
      inline-flex items-center gap-1.5
      ${sizeClasses}
      rounded-xl
      font-semibold
      transition-colors duration-150
      ${config.className}
      ${'pulse' in config && config.pulse ? 'animate-pulse' : ''}
    `}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}
