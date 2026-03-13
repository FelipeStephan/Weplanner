import * as React from "react"
import { cn } from "../lib/utils"
import { Button } from "../button"

export interface MeetingCardProps {
  department?: string
  sprint?: string
  title: string
  timeRange: string
  mode: "Video Call" | "In Person" | string
  assignees?: { name: string; avatar?: string }[]
  onJoin?: () => void
  className?: string
}

export function MeetingCard({
  department,
  sprint,
  title,
  timeRange,
  mode,
  assignees = [],
  onJoin,
  className,
}: MeetingCardProps) {
  return (
    <div
      className={cn(
        "bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5 flex flex-col gap-4 transition-all duration-150 hover:border-[#3a3a3a] hover:shadow-lg hover:shadow-black/20",
        className
      )}
    >
      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        {department && (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#987dfe]/20 text-[#987dfe]">
            {department}
          </span>
        )}
        {sprint && (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#ff5623]/20 text-[#ff5623]">
            {sprint}
          </span>
        )}
        {/* Avatar stack */}
        {assignees.length > 0 && (
          <div className="flex -space-x-2 ml-auto">
            {assignees.slice(0, 4).map((a, i) =>
              a.avatar ? (
                <img
                  key={i}
                  src={a.avatar}
                  alt={a.name}
                  className="size-6 rounded-full object-cover border-2 border-[#141414]"
                />
              ) : (
                <div
                  key={i}
                  className="size-6 rounded-full bg-[#2a2a2a] border-2 border-[#141414] flex items-center justify-center text-[10px] text-[#a3a3a3] font-medium"
                >
                  {a.name.charAt(0)}
                </div>
              )
            )}
            {assignees.length > 4 && (
              <div className="size-6 rounded-full bg-[#525252] border-2 border-[#141414] flex items-center justify-center text-[10px] text-white font-medium">
                +{assignees.length - 4}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-[18px] font-bold text-[#f5f5f5] leading-snug">
        {title}
      </h3>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-[12px] text-[#737373]">
          <span>{timeRange}</span>
          <span className="text-[#2a2a2a]">•</span>
          <span>{mode}</span>
        </div>
        {onJoin && (
          <Button variant="info" size="sm" onClick={onJoin}>
            Entrar Agora
          </Button>
        )}
      </div>
    </div>
  )
}
