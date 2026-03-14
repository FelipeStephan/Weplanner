import { ArrowUp, ArrowDown, LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  color?: 'primary' | 'success' | 'info' | 'secondary' | 'danger' | 'accent';
  icon?: LucideIcon;
}

export function KPICard({ 
  title, 
  value, 
  change, 
  trend = 'up',
  color = 'primary',
  icon: Icon 
}: KPICardProps) {
  const colorClasses = {
    primary: 'from-[#ff5623] to-[#c2410c]',
    success: 'from-[#019364] to-[#15803d]',
    info: 'from-[#987dfe] to-[#7e22ce]',
    secondary: 'from-[#feba31] to-[#ca8a04]',
    danger: 'from-[#f32c2c] to-[#be1f1f]',
    accent: 'from-[#ffbee9] to-[#e992d7]',
  };

  return (
    <div className={`
      relative overflow-hidden
      bg-gradient-to-br ${colorClasses[color]}
      rounded-xl
      p-6
      shadow-md hover:shadow-lg
      transition-shadow duration-250
    `}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-white/80 text-sm font-medium">
          {title}
        </p>
        {Icon && (
          <Icon className="h-5 w-5 text-white/60" />
        )}
      </div>
      
      <p className="text-white text-3xl font-bold mb-2">
        {value}
      </p>
      
      {change && (
        <div className="flex items-center gap-1 text-white/90 text-sm font-medium">
          {trend === 'up' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
          <span>{change}</span>
        </div>
      )}
      
      {/* Decorative gradient overlay */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
    </div>
  );
}
