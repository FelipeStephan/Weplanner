import * as React from "react"
import { cn } from "../lib/utils"

// --- Tipos ---

type Priority = "Alta" | "Média" | "Baixa"
type Status = "Em Progresso" | "Concluído" | "Atrasado" | "Revisão" | "Novo"

const priorityStyles: Record<Priority, string> = {
  Alta:   "bg-[#fee2e2] text-[#f32c2c]",
  Média:  "bg-[#fff4cc] text-[#a16207]",
  Baixa:  "bg-[#dcfce7] text-[#019364]",
}

const statusStyles: Record<Status, string> = {
  "Em Progresso": "bg-[#987dfe]/20 text-[#987dfe]",
  "Concluído":    "bg-[#019364]/20 text-[#019364]",
  "Atrasado":     "bg-[#fee2e2] text-[#f32c2c]",
  "Revisão":      "bg-[#feba31]/20 text-[#feba31]",
  "Novo":         "bg-[#dbeafe] text-[#3b82f6]",
}

// --- Badge helpers ---

function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-medium", priorityStyles[priority])}>
      {priority}
    </span>
  )
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-medium", statusStyles[status])}>
      {status}
    </span>
  )
}

function Tag({ label }: { label: string }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#1e1e1e] text-[#a3a3a3]">
      {label}
    </span>
  )
}

// --- Simple Task Card ---

export interface SimpleTaskCardProps {
  priority: Priority
  status: Status
  dueDate: string
  title: string
  description?: string
  tags?: string[]
  assignee?: { name: string; avatar?: string }
  credits?: number
  client?: { name: string; image?: string }
  className?: string
}

export function SimpleTaskCard({
  priority,
  status,
  dueDate,
  title,
  description,
  tags = [],
  assignee,
  credits,
  client,
  className,
}: SimpleTaskCardProps) {
  return (
    <div
      className={cn(
        "bg-[#141414] border border-[#2a2a2a] rounded-2xl p-4 flex flex-col gap-3 transition-all duration-150 hover:border-[#3a3a3a] hover:shadow-lg hover:shadow-black/20",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={priority} />
          <StatusBadge status={status} />
        </div>
        <span className="text-[11px] text-[#737373]">{dueDate}</span>
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-semibold text-[#f5f5f5] leading-snug">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-[12px] text-[#737373] leading-relaxed line-clamp-2">
          {description}
        </p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => <Tag key={tag} label={tag} />)}
        </div>
      )}

      {/* Client */}
      {client && (
        <div className="flex items-center justify-between px-3 py-2 bg-[#1e1e1e] rounded-xl">
          <span className="text-[10px] font-semibold text-[#525252] uppercase tracking-wide">Cliente</span>
          <div className="flex items-center gap-1.5">
            {client.image ? (
              <img src={client.image} alt={client.name} className="size-5 rounded-full object-cover" />
            ) : (
              <div className="size-5 rounded-full bg-[#987dfe] flex items-center justify-center text-white text-[8px] font-semibold">
                {client.name.charAt(0)}
              </div>
            )}
            <span className="text-[12px] font-semibold text-[#a3a3a3]">{client.name}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      {(assignee || credits !== undefined) && (
        <div className="flex items-center justify-between pt-1 border-t border-[#2a2a2a]">
          {assignee && (
            <div className="flex items-center gap-2">
              {assignee.avatar ? (
                <img
                  src={assignee.avatar}
                  alt={assignee.name}
                  className="size-6 rounded-full object-cover"
                />
              ) : (
                <div className="size-6 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[10px] text-[#a3a3a3] font-medium">
                  {assignee.name.charAt(0)}
                </div>
              )}
              <span className="text-[12px] text-[#a3a3a3]">{assignee.name}</span>
            </div>
          )}
          {credits !== undefined && (
            <span className="flex items-center gap-1 bg-[#fef3c7] text-[#92400e] px-2.5 py-1 rounded-xl text-[11px] font-semibold ml-auto">
              ◈ {credits} cr
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// --- Detailed Task Card ---

export interface DetailedTaskCardProps {
  priority: Priority
  status: Status
  dueDateLabel?: string
  dueDateAlert?: boolean
  title: string
  description?: string
  subtasks?: { done: number; total: number }
  progress?: number
  deliveryDate?: string
  tags?: string[]
  assignees?: { name: string; avatar?: string }[]
  likes?: number
  comments?: number
  credits?: number
  client?: { name: string; image?: string }
  className?: string
}

export function DetailedTaskCard({
  priority,
  status,
  dueDateLabel,
  dueDateAlert,
  title,
  description,
  subtasks,
  progress,
  deliveryDate,
  tags = [],
  assignees = [],
  likes,
  comments,
  credits,
  client,
  className,
}: DetailedTaskCardProps) {
  return (
    <div
      className={cn(
        "bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5 flex flex-col gap-3 transition-all duration-150 hover:border-[#3a3a3a] hover:shadow-lg hover:shadow-black/20",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={priority} />
          {status === "Atrasado" && (
            <span className="text-[11px] font-medium text-[#f32c2c] bg-[#fee2e2] px-2 py-0.5 rounded-full">
              Atrasado
            </span>
          )}
        </div>
        {dueDateLabel && (
          <span className={cn(
            "text-[11px] px-2 py-0.5 rounded-full",
            dueDateAlert
              ? "bg-[#fee2e2] text-[#f32c2c]"
              : "text-[#737373]"
          )}>
            {dueDateLabel}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-[17px] font-bold text-[#f5f5f5] leading-snug">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-[12px] text-[#737373] leading-relaxed line-clamp-3">
          {description}
        </p>
      )}

      {/* Subtasks */}
      {subtasks && (
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-[#a3a3a3]">Subtarefas</span>
          <span className="text-[#f5f5f5] font-medium">
            {subtasks.done}/{subtasks.total}
          </span>
        </div>
      )}

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[#a3a3a3]">Progresso</span>
            <span className="text-[#f5f5f5] font-medium">{progress}%</span>
          </div>
          <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#ff5623] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Delivery date + status */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {deliveryDate && (
          <span className="text-[11px] text-[#737373]">
            Entrega: {deliveryDate}
          </span>
        )}
        <StatusBadge status={status} />
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => <Tag key={tag} label={tag} />)}
        </div>
      )}

      {/* Client */}
      {client && (
        <div className="flex items-center justify-between px-3 py-2 bg-[#1e1e1e] rounded-xl">
          <span className="text-[10px] font-semibold text-[#525252] uppercase tracking-wide">Cliente</span>
          <div className="flex items-center gap-1.5">
            {client.image ? (
              <img src={client.image} alt={client.name} className="size-5 rounded-full object-cover" />
            ) : (
              <div className="size-5 rounded-full bg-[#987dfe] flex items-center justify-center text-white text-[8px] font-semibold">
                {client.name.charAt(0)}
              </div>
            )}
            <span className="text-[12px] font-semibold text-[#a3a3a3]">{client.name}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-[#2a2a2a]">
        {/* Avatar stack */}
        <div className="flex -space-x-2">
          {assignees.slice(0, 4).map((a, i) =>
            a.avatar ? (
              <img
                key={i}
                src={a.avatar}
                alt={a.name}
                className="size-7 rounded-full object-cover border-2 border-[#141414]"
              />
            ) : (
              <div
                key={i}
                className="size-7 rounded-full bg-[#2a2a2a] border-2 border-[#141414] flex items-center justify-center text-[10px] text-[#a3a3a3] font-medium"
              >
                {a.name.charAt(0)}
              </div>
            )
          )}
          {assignees.length > 4 && (
            <div className="size-7 rounded-full bg-[#525252] border-2 border-[#141414] flex items-center justify-center text-[10px] text-white font-medium">
              +{assignees.length - 4}
            </div>
          )}
        </div>

        {/* Counters + Credits */}
        <div className="flex items-center gap-3 text-[12px] text-[#737373]">
          {likes !== undefined && <span>♡ {likes}</span>}
          {comments !== undefined && <span>◻ {comments}</span>}
          {credits !== undefined && (
            <span className="flex items-center gap-1 bg-[#fef3c7] text-[#92400e] px-2 py-0.5 rounded-lg font-semibold">
              ◈ {credits} cr
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
