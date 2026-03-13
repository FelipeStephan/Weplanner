import * as React from "react"
import { cn } from "../lib/utils"

type KPIColor = "primary" | "success" | "info" | "secondary" | "danger"

const colorMap: Record<KPIColor, { bg: string; icon: string; change: string }> = {
  primary:  { bg: "bg-[#ff5623]",  icon: "text-[#ffb49a]", change: "text-[#ffddcc]" },
  success:  { bg: "bg-[#019364]",  icon: "text-[#7ecfb3]", change: "text-[#ccefe5]" },
  info:     { bg: "bg-[#987dfe]",  icon: "text-[#cfc0ff]", change: "text-[#e9e3ff]" },
  secondary:{ bg: "bg-[#feba31]",  icon: "text-[#fde89a]", change: "text-[#fff4cc]" },
  danger:   { bg: "bg-[#f32c2c]",  icon: "text-[#f9a0a0]", change: "text-[#fdd8d8]" },
}

export interface KPICardProps {
  title: string
  value: string | number
  change?: string
  trend?: "up" | "down"
  color?: KPIColor
  icon?: React.ReactNode
  className?: string
}

export function KPICard({
  title,
  value,
  change,
  trend = "up",
  color = "primary",
  icon,
  className,
}: KPICardProps) {
  const { bg, icon: iconColor, change: changeColor } = colorMap[color]

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 min-w-[200px] flex-1",
        bg,
        className
      )}
    >
      {/* Círculo decorativo de fundo */}
      <div className="absolute -right-8 -top-8 size-32 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -right-2 -bottom-6 size-20 rounded-full bg-white/5 pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <span className="text-[13px] font-medium text-white/80 tracking-wide">
          {title}
        </span>
        {icon && (
          <span className={cn("opacity-80", iconColor)}>
            {icon}
          </span>
        )}
      </div>

      {/* Valor */}
      <p className="text-[36px] font-bold text-white leading-none mb-3">
        {value}
      </p>

      {/* Change indicator */}
      {change && (
        <div className="flex items-center gap-1">
          <span className={cn("text-[13px] font-medium", changeColor)}>
            {trend === "up" ? "↑" : "↓"} {change}
          </span>
        </div>
      )}
    </div>
  )
}
