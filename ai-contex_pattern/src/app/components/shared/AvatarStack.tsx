interface AvatarStackProps {
  avatars: Array<{
    name: string;
    image?: string;
    initials?: string;
  }>;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  onAvatarClick?: (avatar: { name: string; image?: string }, event: React.MouseEvent<HTMLDivElement>) => void;
}

export function AvatarStack({ avatars, max = 3, size = 'sm', onAvatarClick }: AvatarStackProps) {
  const shown = avatars.slice(0, max);
  const remaining = avatars.length - max;

  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  };

  const colors = [
    'bg-[#ff5623]',
    'bg-[#987dfe]',
    'bg-[#019364]',
    'bg-[#feba31]',
    'bg-[#3b82f6]',
    'bg-[#ec4899]',
  ];

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex items-center -space-x-2">
      {shown.map((avatar, i) => (
        <div
          key={i}
          className={`${sizeClasses[size]} rounded-full border-2 border-white dark:border-[#1e1e1e] flex items-center justify-center overflow-hidden ring-0 ${
            onAvatarClick ? 'cursor-pointer hover:ring-2 hover:ring-[#ff5623]/30 hover:z-10 transition-all' : ''
          }`}
          title={avatar.name}
          onClick={(e) => onAvatarClick?.(avatar, e)}
        >
          {avatar.image ? (
            <img
              src={avatar.image}
              alt={avatar.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${colors[i % colors.length]} text-white font-medium`}>
              {avatar.initials || getInitials(avatar.name)}
            </div>
          )}
        </div>
      ))}
      {remaining > 0 && (
        <div className={`${sizeClasses[size]} rounded-full border-2 border-white dark:border-[#1e1e1e] bg-[#525252] text-white flex items-center justify-center font-medium`}>
          +{remaining}
        </div>
      )}
    </div>
  );
}
