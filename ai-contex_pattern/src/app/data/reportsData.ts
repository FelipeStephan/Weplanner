import type { PersistedWorkflowStatus } from "../data/kanban-workspace-persistence";

export const WORKFLOW_STATUS_META: Record<
  PersistedWorkflowStatus,
  { label: string; color: string }
> = {
  backlog: { label: "Backlog", color: "#64748b" },
  todo: { label: "A Fazer", color: "#ff5623" },
  in_progress: { label: "Em Progresso", color: "#987dfe" },
  review: { label: "Revisão", color: "#3b82f6" },
  adjustments: { label: "Ajustes", color: "#f97316" },
  approval: { label: "Aprovação", color: "#feba31" },
  done: { label: "Concluído", color: "#019364" },
};

export const ACTIVE_WORKFLOW_STATUSES: PersistedWorkflowStatus[] = [
  "todo",
  "in_progress",
  "review",
  "adjustments",
  "approval",
  "done",
];

export const KPI_TONE_CLASSES = {
  orange: {
    badge: "bg-[#FFF1EA] text-[#c2410c] dark:bg-[#2a1912] dark:text-[#ffb39c]",
    line: "#ff5623",
  },
  green: {
    badge: "bg-[#EDF9F4] text-[#047857] dark:bg-[#12231c] dark:text-[#79d9b0]",
    line: "#019364",
  },
  blue: {
    badge: "bg-[#EEF5FF] text-[#2563eb] dark:bg-[#111d30] dark:text-[#93c5fd]",
    line: "#3b82f6",
  },
  purple: {
    badge: "bg-[#F4F0FF] text-[#7c3aed] dark:bg-[#1d1831] dark:text-[#c4b5fd]",
    line: "#987dfe",
  },
  yellow: {
    badge: "bg-[#FFF8E5] text-[#b45309] dark:bg-[#241b0c] dark:text-[#fcd34d]",
    line: "#feba31",
  },
  red: {
    badge: "bg-[#FEF0F0] text-[#dc2626] dark:bg-[#291516] dark:text-[#fca5a5]",
    line: "#f32c2c",
  },
} as const;

export const CLIENT_CREDIT_CONTRACTS: Record<string, number> = {
  Natura: 480,
  Nike: 420,
  iFood: 560,
  Ambev: 390,
  Nubank: 450,
};
