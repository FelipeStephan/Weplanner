import { Flag } from 'lucide-react';

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  size?: 'sm' | 'md';
}

export function PriorityBadge({ priority, size = 'sm' }: PriorityBadgeProps) {
  const config = {
    low: {
      label: 'Baixa',
      className: 'bg-[#dcfce7] text-[#16a34a]',
    },
    medium: {
      label: 'Média',
      className: 'bg-[#ffedd5] text-[#ea580c]',
    },
    high: {
      label: 'Alta',
      className: 'bg-[#fee2e2] text-[#dc2626]',
    },
    urgent: {
      label: 'Urgente',
      className: 'bg-[#fee2e2] text-[#dc2626]',
    },
  };

  const c = config[priority];
  const sizeClasses = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-xl font-semibold ${sizeClasses} ${c.className}`}>
      <Flag className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {c.label}
    </span>
  );
}
