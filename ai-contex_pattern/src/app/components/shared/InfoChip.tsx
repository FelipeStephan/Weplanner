import { type LucideIcon } from 'lucide-react';

interface InfoChipProps {
  label: string;
  icon?: LucideIcon;
  color?: 'blue' | 'orange' | 'green' | 'purple' | 'pink' | 'red' | 'gray';
}

export function InfoChip({ label, icon: Icon, color = 'blue' }: InfoChipProps) {
  const colorMap = {
    blue: 'bg-[#dbeafe] text-[#2563eb]',
    orange: 'bg-[#ffedd5] text-[#ea580c]',
    green: 'bg-[#dcfce7] text-[#16a34a]',
    purple: 'bg-[#e9d5ff] text-[#7e22ce]',
    pink: 'bg-[#fce7f3] text-[#db2777]',
    red: 'bg-[#fee2e2] text-[#dc2626]',
    gray: 'bg-[#f5f5f5] text-[#525252]',
  };

  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold ${colorMap[color]}`}>
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </span>
  );
}
