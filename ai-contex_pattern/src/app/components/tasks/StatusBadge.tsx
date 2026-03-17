interface StatusBadgeProps {
  status:
    | 'backlog'
    | 'todo'
    | 'in_progress'
    | 'in-progress'
    | 'adjustments'
    | 'approval'
    | 'done'
    | 'internal-approval'
    | 'review'
    | 'completed'
    | 'blocked'
    | 'archived'
    | 'new';
  size?: 'sm' | 'md';
  labelOverride?: string;
}

export function StatusBadge({
  status,
  size = 'sm',
  labelOverride,
}: StatusBadgeProps) {
  const statusConfig = {
    new: {
      label: 'Novo',
      className:
        'bg-[#dbeafe] text-[#2563eb] dark:bg-[#122033] dark:text-[#3b82f6] dark:border dark:border-[#1d4d88]',
      pulse: true,
    },
    todo: {
      label: 'A Fazer',
      className:
        'bg-[#f5f5f5] text-[#525252] dark:bg-[#232325] dark:text-[#8f8f92] dark:border dark:border-[#3a3a3d]',
    },
    backlog: {
      label: 'Backlog',
      className:
        'bg-[#eef2ff] text-[#4f46e5] dark:bg-[#172036] dark:text-[#8b95ff] dark:border dark:border-[#3444a8]',
    },
    in_progress: {
      label: 'Em Progresso',
      className:
        'bg-[#e9d5ff] text-[#7e22ce] dark:bg-[#231537] dark:text-[#a855f7] dark:border dark:border-[#4d2383]',
    },
    'in-progress': {
      label: 'Em Progresso',
      className:
        'bg-[#e9d5ff] text-[#7e22ce] dark:bg-[#231537] dark:text-[#a855f7] dark:border dark:border-[#4d2383]',
    },
    adjustments: {
      label: 'Ajustes',
      className:
        'bg-[#ffedd5] text-[#ea580c] dark:bg-[#2a1d12] dark:text-[#f59e0b] dark:border dark:border-[#7c4a12]',
    },
    approval: {
      label: 'Aprovação',
      className:
        'bg-[#fff3d6] text-[#c78700] dark:bg-[#2a220f] dark:text-[#e3ae2b] dark:border dark:border-[#69511a]',
    },
    done: {
      label: 'Concluído',
      className:
        'bg-[#dcfce7] text-[#16a34a] dark:bg-[#12261c] dark:text-[#7ee2b8] dark:border dark:border-[#1f5a45]',
    },
    'internal-approval': {
      label: 'Aprovação Interna',
      className:
        'bg-[#fff3d6] text-[#c78700] dark:bg-[#2a220f] dark:text-[#e3ae2b] dark:border dark:border-[#69511a]',
    },
    review: {
      label: 'Revisão',
      className:
        'bg-[#ffedd5] text-[#ea580c] dark:bg-[#2a220f] dark:text-[#d89b18] dark:border dark:border-[#69511a]',
    },
    completed: {
      label: 'Concluído',
      className:
        'bg-[#dcfce7] text-[#16a34a] dark:bg-[#12261c] dark:text-[#7ee2b8] dark:border dark:border-[#1f5a45]',
    },
    blocked: {
      label: 'Bloqueado',
      className:
        'bg-[#fee2e2] text-[#dc2626] dark:bg-[#311514] dark:text-[#ff4d4f] dark:border dark:border-[#7c2323]',
    },
    archived: {
      label: 'Arquivado',
      className:
        'bg-[#f5f5f5] text-[#737373] dark:bg-[#232325] dark:text-[#8f8f92] dark:border dark:border-[#3a3a3d]',
    },
  };

  const current = statusConfig[status];
  const sizeClasses =
    size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${sizeClasses} rounded-xl font-semibold transition-colors duration-150 ${current.className} ${
        'pulse' in current && current.pulse ? 'animate-pulse' : ''
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labelOverride || current.label}
    </span>
  );
}
