import { Video } from 'lucide-react';
import { AvatarStack } from '../shared/AvatarStack';

interface MeetingCardProps {
  category: string;
  week?: string;
  title: string;
  timeStart: string;
  timeEnd: string;
  type: string;
  participants: Array<{ name: string; image?: string }>;
  onJoin?: () => void;
}

export function MeetingCard({
  category,
  week,
  title,
  timeStart,
  timeEnd,
  type,
  participants,
  onJoin,
}: MeetingCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#dbeafe] text-[#2563eb] text-xs font-semibold">
            <span className="w-3.5 h-3.5 rounded bg-[#2563eb]/20 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-sm bg-[#2563eb]" />
            </span>
            {category}
            {week && (
              <>
                <span className="w-1 h-1 rounded-full bg-[#2563eb]/40" />
                <span>{week}</span>
              </>
            )}
          </span>
        </div>
        <AvatarStack avatars={participants} max={3} size="sm" />
      </div>

      {/* Title */}
      <h3 className="font-bold text-[#171717] text-xl mb-3">{title}</h3>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[#a3a3a3]">
          <span className="font-medium">{timeStart} - {timeEnd}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#019364]" />
          <span>{type}</span>
        </div>
        <button
          onClick={onJoin}
          className="px-5 py-2 rounded-full bg-[#3b82f6] text-white text-sm font-semibold hover:bg-[#2563eb] transition-colors shadow-sm"
        >
          Entrar Agora
        </button>
      </div>
    </div>
  );
}