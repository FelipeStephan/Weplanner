import type { WorkflowStatus } from "../../domain/kanban/contracts";

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baixa', activeBg: 'bg-[#16a34a]', passiveBg: 'bg-[#dcfce7]', passiveText: 'text-[#16a34a]' },
  { value: 'medium', label: 'Média', activeBg: 'bg-[#ca8a04]', passiveBg: 'bg-[#fef9c3]', passiveText: 'text-[#a16207]' },
  { value: 'high', label: 'Alta', activeBg: 'bg-[#dc2626]', passiveBg: 'bg-[#fee2e2]', passiveText: 'text-[#dc2626]' },
  { value: 'urgent', label: 'Urgente', activeBg: 'bg-[#7e22ce]', passiveBg: 'bg-[#f3e8ff]', passiveText: 'text-[#7e22ce]' },
] as const;

export const WORKFLOW_STAGE_LABELS: Record<WorkflowStatus, string> = {
  backlog: 'Backlog',
  todo: 'A Fazer',
  in_progress: 'Em Progresso',
  review: 'Revisão',
  adjustments: 'Ajustes',
  approval: 'Aprovação',
  done: 'Concluído',
};

export const TAG_PALETTE_CREATE = [
  { bg: '#ff5623', text: '#ffffff', label: 'Laranja' },
  { bg: '#feba31', text: '#7c3a00', label: 'Amarelo' },
  { bg: '#019364', text: '#ffffff', label: 'Verde' },
  { bg: '#987dfe', text: '#ffffff', label: 'Roxo' },
  { bg: '#3b82f6', text: '#ffffff', label: 'Azul' },
  { bg: '#f32c2c', text: '#ffffff', label: 'Vermelho' },
  { bg: '#ffbee9', text: '#9d174d', label: 'Rosa' },
  { bg: '#e5e5e5', text: '#525252', label: 'Cinza' },
] as const;

export const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px'];

export const TEXT_COLORS = [
  '#171717', '#ff5623', '#019364', '#987dfe', '#3b82f6', '#f32c2c', '#ca8a04',
];

// ─── Mock clients (used in task forms) ───────────────────────────────────────

export const MOCK_TASK_FORM_CLIENTS = [
  { id: '1', name: 'Arcadia',     status: 'active',   color: '#3b82f6' },
  { id: '2', name: 'Nexus Tech',  status: 'active',   color: '#8b5cf6' },
  { id: '3', name: 'Global Corp', status: 'inactive', color: '#64748b' },
  { id: '4', name: 'Stark Ind.',  status: 'active',   color: '#ef4444' },
  { id: '5', name: 'Wayne Ent.',  status: 'active',   color: '#10b981' },
  { id: '6', name: 'Acme Corp',   status: 'active',   color: '#f59e0b' },
  { id: '7', name: 'Cyberdyne',   status: 'inactive', color: '#3f3f46' },
  { id: '8', name: 'Umbrella',    status: 'active',   color: '#ec4899' },
] as const;
