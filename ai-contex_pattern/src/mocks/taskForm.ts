import type { BoardColumn, TaskAttachment } from '../domain/kanban/contracts';
import type { ClientRecord, UserRecord } from '../domain/shared/entities';

export type TaskFormColumnOption = Pick<BoardColumn, 'id' | 'name' | 'baseStatus' | 'order'>;

export const MOCK_TASK_FORM_COLUMNS: TaskFormColumnOption[] = [
  { id: 'column-todo', name: 'A Fazer', baseStatus: 'todo', order: 0 },
  { id: 'column-progress', name: 'Em Progresso', baseStatus: 'in_progress', order: 1 },
  { id: 'column-review', name: 'Revisão interna', baseStatus: 'review', order: 2 },
  { id: 'column-approval', name: 'Aguardando cliente', baseStatus: 'approval', order: 3 },
  { id: 'column-done', name: 'Concluído', baseStatus: 'done', order: 4 },
];

export const MOCK_TASK_FORM_TEAM: Array<UserRecord & { color: string }> = [
  { name: 'Ana Silva', role: 'Gestora de Projetos', color: '#ff5623' },
  { name: 'Carlos Lima', role: 'Desenvolvedor Frontend', color: '#987dfe' },
  { name: 'Mariana Costa', role: 'Designer UI/UX', color: '#019364' },
  { name: 'Rafael Santos', role: 'Desenvolvedor Backend', color: '#3b82f6' },
  { name: 'Julia Ferreira', role: 'QA Engineer', color: '#f32c2c' },
  { name: 'Pedro Alves', role: 'Product Manager', color: '#feba31' },
];

export const MOCK_TASK_FORM_CLIENTS: ClientRecord[] = [
  { name: 'Acme Corp', sector: 'Tecnologia' },
  { name: 'Nubank', sector: 'Fintech' },
  { name: 'iFood', sector: 'Delivery' },
  { name: 'Vivo', sector: 'Telecom' },
  { name: 'WePlanner', sector: 'SaaS' },
  { name: 'Nike Brasil', sector: 'Moda' },
  { name: 'Ambev', sector: 'Bebidas' },
];

export const MOCK_TASK_FORM_ATTACHMENTS: TaskAttachment[] = [
  { id: '1', name: 'briefing-campanha.pdf', type: 'pdf', size: '2.4 MB' },
  { id: '2', name: 'wireframe-v2.png', type: 'image', size: '1.8 MB' },
  { id: '3', name: 'especificacao-tecnica.docx', type: 'doc', size: '340 KB' },
  { id: '4', name: 'logo-cliente.png', type: 'image', size: '256 KB' },
];
