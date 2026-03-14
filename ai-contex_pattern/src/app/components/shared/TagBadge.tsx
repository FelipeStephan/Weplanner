interface TagBadgeProps {
  label: string;
  color?: 'orange' | 'blue' | 'green' | 'purple' | 'pink' | 'yellow' | 'red' | 'gray';
}

export function TagBadge({ label, color = 'gray' }: TagBadgeProps) {
  const colorMap = {
    orange: 'bg-[#ffedd5] text-[#ea580c]',
    blue: 'bg-[#dbeafe] text-[#2563eb]',
    green: 'bg-[#dcfce7] text-[#16a34a]',
    purple: 'bg-[#e9d5ff] text-[#7e22ce]',
    pink: 'bg-[#fce7f3] text-[#db2777]',
    yellow: 'bg-[#fef9c3] text-[#a16207]',
    red: 'bg-[#fee2e2] text-[#dc2626]',
    gray: 'bg-[#f5f5f5] text-[#525252]',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold ${colorMap[color]}`}>
      {label}
    </span>
  );
}
