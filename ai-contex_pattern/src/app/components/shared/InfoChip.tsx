import { type LucideIcon } from 'lucide-react';

interface InfoChipProps {
  label: string;
  icon?: LucideIcon;
  color?: 'blue' | 'orange' | 'green' | 'purple' | 'pink' | 'red' | 'gray';
}

export function InfoChip({ label, icon: Icon, color = 'blue' }: InfoChipProps) {
  const colorMap = {
    blue: 'bg-[#dbeafe] text-[#2563eb] dark:bg-[#122033] dark:text-[#3b82f6] dark:border dark:border-[#1d4d88]',
    orange: 'bg-[#ffedd5] text-[#ea580c] dark:bg-[#2d1b12] dark:text-[#ff6b2c] dark:border dark:border-[#6a3114]',
    green: 'bg-[#dcfce7] text-[#16a34a] dark:bg-[#0f2a1f] dark:text-[#00b26b] dark:border dark:border-[#0d5a39]',
    purple: 'bg-[#e9d5ff] text-[#7e22ce] dark:bg-[#231537] dark:text-[#a855f7] dark:border dark:border-[#4d2383]',
    pink: 'bg-[#fce7f3] text-[#db2777] dark:bg-[#301726] dark:text-[#ec4899] dark:border dark:border-[#7b2051]',
    red: 'bg-[#fee2e2] text-[#dc2626] dark:bg-[#311514] dark:text-[#ff4d4f] dark:border dark:border-[#7c2323]',
    gray: 'bg-[#f5f5f5] text-[#525252] dark:bg-[#232325] dark:text-[#8f8f92] dark:border dark:border-[#3a3a3d]',
  };

  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold ${colorMap[color]}`}>
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </span>
  );
}
