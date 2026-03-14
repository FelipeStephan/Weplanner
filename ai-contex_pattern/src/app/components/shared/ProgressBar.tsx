interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'primary' | 'success' | 'info' | 'danger' | 'blue';
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  color = 'primary',
  size = 'sm',
  showLabel = false,
}: ProgressBarProps) {
  const percent = Math.min(Math.round((value / max) * 100), 100);

  const colorClasses = {
    primary: 'bg-[#ff5623]',
    success: 'bg-[#019364]',
    info: 'bg-[#987dfe]',
    danger: 'bg-[#f32c2c]',
    blue: 'bg-[#3b82f6]',
  };

  const heightClass = size === 'sm' ? 'h-1.5' : 'h-2';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-[#525252] font-medium">Progress</span>
          <span className="text-xs text-[#525252] font-medium">{percent}%</span>
        </div>
      )}
      <div className={`w-full ${heightClass} bg-[#e5e5e5] rounded-full overflow-hidden`}>
        <div
          className={`${heightClass} ${colorClasses[color]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
