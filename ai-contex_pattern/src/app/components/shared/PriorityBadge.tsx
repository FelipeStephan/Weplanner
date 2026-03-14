import { Flag } from 'lucide-react';

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  size?: 'sm' | 'md';
}

export function PriorityBadge({
  priority,
  size = 'sm',
}: PriorityBadgeProps) {
  const config = {
    low: {
      label: 'Baixa',
      className:
        'bg-[#dcfce7] text-[#16a34a] dark:bg-[#0f2a1f] dark:text-[#00b26b] dark:border dark:border-[#0d5a39]',
    },
    medium: {
      label: 'Media',
      className:
        'bg-[#fef9c3] text-[#a16207] dark:bg-[#2a220f] dark:text-[#d89b18] dark:border dark:border-[#69511a]',
    },
    high: {
      label: 'Alta',
      className:
        'bg-[#fee2e2] text-[#dc2626] dark:bg-[#311514] dark:text-[#ff5a57] dark:border dark:border-[#7c2323]',
    },
    urgent: {
      label: 'Urgente',
      className:
        'bg-[#f3e8ff] text-[#7e22ce] dark:bg-[#231537] dark:text-[#a855f7] dark:border dark:border-[#4d2383]',
    },
  };

  const current = config[priority];
  const sizeClasses =
    size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-xl font-semibold ${sizeClasses} ${current.className}`}
    >
      <Flag className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {current.label}
    </span>
  );
}
