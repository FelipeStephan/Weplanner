import { useEffect, useState } from 'react';
import {
  X,
  Calendar,
  Paperclip,
  MessageCircle,
  CheckSquare,
  Send,
  Clock,
  AlertTriangle,
  Link2,
  MoreHorizontal,
  FileText,
  Image,
  File,
  Download,
  Upload,
  ImagePlus,
  Activity,
  Edit3,
  ArrowRight,
  Building2,
  CheckCheck,
  Diamond,
} from 'lucide-react';
import { PriorityBadge } from '../shared/PriorityBadge';
import { TagBadge } from '../shared/TagBadge';
import { AvatarStack } from '../shared/AvatarStack';
import { ProgressBar } from '../shared/ProgressBar';
import { StatusBadge } from './StatusBadge';
import { formatTaskDueDate, getTaskDueDateState } from '../../utils/taskDueDate';
import { getRichTextPlainText, toDisplayRichTextHtml } from '../../utils/richText';

interface Comment {
  id: string;
  author: { name: string; image?: string };
  text: string;
  timestamp: string;
}

interface Attachment {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'image' | 'doc' | 'spreadsheet' | 'other';
  uploadedBy: string;
  uploadedAt: string;
}

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteTask?: () => void;
  onToggleSubtask?: (subtaskId: string) => void;
  onEditTask?: () => void;
  onDuplicateTask?: () => void;
  onCopyTaskLink?: () => void;
  onCancelTask?: () => void;
  onArchiveTask?: () => void;
  onOpenClientLibrary?: (clientId?: string | null, clientName?: string | null) => void;
  task: {
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'backlog' | 'todo' | 'in_progress' | 'in-progress' | 'adjustments' | 'approval' | 'done' | 'internal-approval' | 'review' | 'completed' | 'blocked' | 'archived' | 'new';
    statusLabel?: string;
    subtasks?: { completed: number; total: number };
    subtasksList?: Array<{ id?: string; label?: string; title?: string; done: boolean; dueDate?: string; assignee?: { name: string; image?: string } }>;
    progress: number;
    dueDate: string;
    tags: Array<{ label: string; color: 'orange' | 'blue' | 'green' | 'purple' | 'pink' | 'yellow' | 'red' | 'gray' }>;
    assignees: Array<{ name: string; image?: string }>;
    attachmentsList?: Attachment[];
    comments: Comment[];
    createdAt?: string;
    coverImage?: string;
    credits?: number;
    client?: string;
    clientId?: string | null;
  };
}

export function TaskDetailModal({
  isOpen,
  onClose,
  onCompleteTask,
  onToggleSubtask,
  onEditTask,
  onDuplicateTask,
  onCopyTaskLink,
  onCancelTask,
  onArchiveTask,
  onOpenClientLibrary,
  task,
}: TaskDetailModalProps) {
  const [commentText, setCommentText] = useState('');
  const [sidebarView, setSidebarView] = useState<'comments' | 'activities'>('comments');
  const [isEditingCredits, setIsEditingCredits] = useState(false);
  const [editCredits, setEditCredits] = useState(task.credits ?? 0);
  const [taskCompleted, setTaskCompleted] = useState(task.status === 'completed' || task.status === 'done');
  const [completingAnim, setCompletingAnim] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    setEditCredits(task.credits ?? 0);
    setTaskCompleted(task.status === 'completed' || task.status === 'done');
    setCompletingAnim(false);
    setShowActionsMenu(false);
    setSidebarView('comments');
  }, [isOpen, task.credits, task.status, task.title]);

  if (!isOpen) return null;

  const taskTags = Array.isArray(task.tags) ? task.tags : [];
  const taskAssignees = Array.isArray(task.assignees) ? task.assignees : [];
  const taskComments = Array.isArray(task.comments) ? task.comments : [];
  const attachmentsList = Array.isArray(task.attachmentsList) ? task.attachmentsList : [];
  const descriptionText = getRichTextPlainText(task.description);
  const dueDateState = getTaskDueDateState(task.dueDate);
  const displayDueDate = formatTaskDueDate(task.dueDate);

  const subtasks = (task.subtasksList ?? []).map((item, i) => ({
    id: item.id ?? `subtask-${i}`,
    label: item.label ?? item.title ?? '',
    done: item.done,
    dueDate: item.dueDate,
    assignee: item.assignee,
  }));
  const totalSubtasks = subtasks.length || task.subtasks?.total || 0;
  const completedSubtasks = subtasks.length ? subtasks.filter((subtask) => subtask.done).length : (task.subtasks?.completed ?? 0);
  const hasSubtasks = totalSubtasks > 0;
  const progress = hasSubtasks && totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : task.progress;

  const alerts = {
    warning: { bg: 'bg-[#fef9c3] dark:bg-[#2a220f]', text: 'text-[#a16207] dark:text-[#d89b18]', icon: Clock, label: 'Prazo se aproximando' },
    overdue: { bg: 'bg-[#fee2e2] dark:bg-[#311514]', text: 'text-[#dc2626] dark:text-[#ff4d4f]', icon: AlertTriangle, label: 'Atrasado' },
  } as const;
  const alertInfo = dueDateState === 'overdue' ? alerts.overdue : dueDateState === 'warning' ? alerts.warning : null;

  const fileIcon = (type: string) => (type === 'image' ? Image : type === 'pdf' || type === 'doc' ? FileText : File);
  const fileColor = (type: string) =>
    type === 'pdf' ? 'bg-[#fee2e2] text-[#dc2626]' :
    type === 'image' ? 'bg-[#e9d5ff] text-[#7e22ce]' :
    type === 'doc' ? 'bg-[#dbeafe] text-[#2563eb]' :
    type === 'spreadsheet' ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[#f5f5f5] text-[#525252]';

  const activityItems = [
    { id: 'a1', icon: Edit3, actor: 'Ana Silva', action: 'criou esta tarefa', timestamp: task.createdAt ? `${task.createdAt} às 09:00` : '01 Mar, 2026 às 09:00' },
    { id: 'a2', icon: ArrowRight, actor: 'Carlos Lima', action: 'moveu o status de A fazer para Em progresso', timestamp: '05 Mar, 2026 às 10:30' },
    { id: 'a3', icon: Paperclip, actor: 'Mariana Costa', action: 'anexou 2 arquivos', timestamp: '06 Mar, 2026 às 14:20' },
    { id: 'a4', icon: MessageCircle, actor: 'Rafael Santos', action: 'comentou na tarefa', timestamp: '08 Mar, 2026 às 16:45' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex h-[92vh] w-[min(96vw,1480px)] flex-col overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white dark:border-[#2a2a2a] dark:bg-[#141414]">
        <div className="shrink-0 border-b border-[#e5e5e5] px-6 py-4 dark:border-[#2a2a2a]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PriorityBadge priority={task.priority} size="md" />
              <StatusBadge status={task.status} size="md" labelOverride={task.statusLabel} />
              {task.credits !== undefined && (
                <div className="relative">
                  <button onClick={() => setIsEditingCredits((v) => !v)} className="flex items-center gap-1.5 rounded-lg border border-[#f3d27a] bg-[#fef3c7] px-2.5 py-1.5 text-[#92400e] dark:border-[#69511a] dark:bg-[#2a220f] dark:text-[#d8a744]">
                    <span className="text-[11px] font-semibold uppercase tracking-wide">Créditos usados</span>
                    <span className="flex items-center gap-1 text-sm font-bold"><Diamond className="h-3.5 w-3.5" />{editCredits}</span>
                  </button>
                  {isEditingCredits && (
                    <div className="absolute left-0 top-full z-[200] mt-1.5 min-w-[150px] rounded-xl border border-[#e5e5e5] bg-white p-3 shadow-xl dark:border-[#2a2a2a] dark:bg-[#1e1e1e]">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">Ajustar créditos</p>
                      <input type="number" value={editCredits} onChange={(e) => setEditCredits(Number(e.target.value))} min={0} className="h-8 w-full rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-2 text-sm font-semibold dark:border-[#2a2a2a] dark:bg-[#141414]" />
                      <button onClick={() => setIsEditingCredits(false)} className="mt-2 w-full rounded-lg bg-[#ff5623] py-1.5 text-xs font-semibold text-white">Salvar</button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-lg p-1.5 hover:bg-[#f5f5f5] dark:hover:bg-[#232325]"><Link2 className="h-4 w-4 text-[#a3a3a3]" /></button>
              <div className="relative">
                <button onClick={() => setShowActionsMenu((v) => !v)} className="rounded-lg p-1.5 hover:bg-[#f5f5f5] dark:hover:bg-[#232325]"><MoreHorizontal className="h-4 w-4 text-[#a3a3a3]" /></button>
                {showActionsMenu && (
                  <div className="absolute right-0 top-full z-[200] mt-1.5 w-44 rounded-xl border border-[#e5e5e5] bg-white p-1.5 shadow-xl dark:border-[#2a2a2a] dark:bg-[#171717]">
                    <button onClick={() => { setShowActionsMenu(false); onEditTask?.(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-[#f5f5f5] dark:hover:bg-[#232325]"><Edit3 className="h-4 w-4" />Editar tarefa</button>
                    <button onClick={() => { setShowActionsMenu(false); onDuplicateTask?.(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-[#f5f5f5] dark:hover:bg-[#232325]"><FileText className="h-4 w-4" />Duplicar</button>
                    <button onClick={() => { setShowActionsMenu(false); onCopyTaskLink?.(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-[#f5f5f5] dark:hover:bg-[#232325]"><Link2 className="h-4 w-4" />Copiar link</button>
                    <div className="my-1 h-px bg-[#ececec] dark:bg-[#2a2a2a]" />
                    <button onClick={() => { setShowActionsMenu(false); onCancelTask?.(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-[#f5f5f5] dark:hover:bg-[#232325]"><X className="h-4 w-4" />Cancelar tarefa</button>
                    <button onClick={() => { setShowActionsMenu(false); onArchiveTask?.(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-[#f5f5f5] dark:hover:bg-[#232325]"><File className="h-4 w-4" />Arquivar tarefa</button>
                  </div>
                )}
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-[#f5f5f5] dark:hover:bg-[#232325]"><X className="h-4 w-4 text-[#a3a3a3]" /></button>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 lg:flex">
          <section className="flex min-h-0 min-w-0 flex-1 flex-col border-b border-[#ececec] dark:border-[#2a2a2a] lg:border-b-0 lg:border-r">
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              {task.coverImage && <div className="mb-5 h-48 w-full overflow-hidden rounded-xl"><img src={task.coverImage} alt="Capa" className="h-full w-full object-cover" /></div>}
              <div className="space-y-5">
                {alertInfo && <div className={`flex items-center gap-2 rounded-xl px-4 py-3 ${alertInfo.bg} ${alertInfo.text}`}><alertInfo.icon className="h-4 w-4" /><span className="text-sm font-semibold">{alertInfo.label}</span><span className="ml-auto text-xs">{displayDueDate}</span></div>}
                <div className="flex flex-wrap gap-2">{taskTags.map((tag, i) => <TagBadge key={i} label={tag.label} color={tag.color} />)}</div>
                <div>
                  <h2 className="mb-2 text-xl font-bold">{task.title}</h2>
                  {descriptionText && <div className="text-sm leading-relaxed text-[#737373] dark:text-[#a3a3a3] [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold" dangerouslySetInnerHTML={{ __html: toDisplayRichTextHtml(task.description) }} />}
                </div>
                {hasSubtasks && (
                  <div>
                    <div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2 text-[#987dfe]"><CheckSquare className="h-4 w-4" /><span className="text-sm font-semibold">Subtarefas</span></div><span className="text-sm font-bold">{completedSubtasks}/{totalSubtasks}</span></div>
                    <ProgressBar value={progress} color="success" size="md" showLabel />
                    {subtasks.length > 0 && <div className="mt-3 space-y-2">{subtasks.map((subtask) => <button key={subtask.id} type="button" onClick={() => onToggleSubtask?.(subtask.id)} className="flex w-full items-center gap-3 py-1.5 text-left"><div className={`flex h-4 w-4 items-center justify-center rounded border-2 ${subtask.done ? 'border-[#019364] bg-[#019364]' : 'border-[#d4d4d4]'}`}>{subtask.done && <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}</div><span className={`text-sm ${subtask.done ? 'line-through text-[#a3a3a3]' : 'text-[#525252] dark:text-[#f5f5f5]'}`}>{subtask.label}</span></button>)}</div>}
                  </div>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-[#fafafa] p-4 dark:bg-[#1e1e1e]"><p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">Data de entrega</p><div className="flex items-center gap-2"><Calendar className={`h-4 w-4 ${dueDateState === 'overdue' ? 'text-[#f32c2c]' : dueDateState === 'warning' ? 'text-[#ca8a04]' : 'text-[#a3a3a3]'}`} /><span className={`text-sm font-semibold ${dueDateState === 'overdue' ? 'text-[#dc2626] dark:text-[#ff4d4f]' : dueDateState === 'warning' ? 'text-[#a16207] dark:text-[#d89b18]' : 'text-[#171717] dark:text-[#f5f5f5]'}`}>{displayDueDate || 'Sem prazo'}</span></div></div>
                  <div className="rounded-xl bg-[#fafafa] p-4 dark:bg-[#1e1e1e]"><p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">Cliente</p><button type="button" disabled={!task.client} onClick={() => onOpenClientLibrary?.(task.clientId, task.client)} className="group flex items-center gap-2 text-left disabled:cursor-default"><Building2 className="h-4 w-4 text-[#ff5623]" /><span className="text-sm font-semibold text-[#171717] transition-colors group-hover:text-[#ff5623] dark:text-[#f5f5f5] dark:group-hover:text-[#ff8c69]">{task.client || 'Não definido'}</span></button></div>
                </div>
                <p className="-mt-2 flex items-center gap-1.5 text-[11px] text-[#a3a3a3]"><Clock className="h-3 w-3" />Criado em {task.createdAt || '10 Mar, 2026'} às 09:00</p>
                <div><p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">Responsáveis</p><div className="flex items-center gap-3"><AvatarStack avatars={taskAssignees} max={6} size="md" /></div></div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Paperclip className="h-4 w-4 text-[#737373]" /><h3 className="text-sm font-semibold">Anexos</h3></div><span className="rounded-md bg-[#f5f5f5] px-2 py-0.5 text-[10px] font-semibold text-[#737373] dark:bg-[#232325] dark:text-[#a3a3a3]">{attachmentsList.length}</span></div>
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#e5e5e5] px-4 py-4 text-[#737373] hover:border-[#ff5623]/40 hover:bg-[#ff5623]/5 hover:text-[#ff5623] dark:border-[#2a2a2a]"><Upload className="h-4.5 w-4.5" /><span className="text-sm font-semibold">Enviar arquivo</span></button>
                  {attachmentsList.length > 0 ? <div className="space-y-3">{attachmentsList.map((attachment) => { const Icon = fileIcon(attachment.type); return <div key={attachment.id} className="group/file flex items-center gap-4 rounded-xl bg-[#fafafa] p-4 dark:bg-[#1e1e1e]"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${fileColor(attachment.type)}`}><Icon className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{attachment.name}</p><p className="text-[11px] text-[#a3a3a3]">{attachment.size} · Enviado por {attachment.uploadedBy} · {attachment.uploadedAt}</p></div><button className="rounded-lg p-2 opacity-0 transition-all group-hover/file:opacity-100"><Download className="h-4 w-4 text-[#737373]" /></button></div>; })}</div> : <div className="py-8 text-center text-[#a3a3a3]"><Paperclip className="mx-auto mb-2 h-8 w-8 opacity-40" /><p className="text-sm">Nenhum anexo adicionado</p></div>}
                </div>
              </div>
            </div>
            <div className="shrink-0 border-t border-[#e5e5e5] px-6 py-4 dark:border-[#2a2a2a]">
              <div className="flex items-center justify-between"><p className="text-[11px] text-[#a3a3a3]">{taskCompleted ? 'Tarefa marcada como concluída' : 'Marque como concluída quando finalizar'}</p><button onClick={() => { if (taskCompleted || completingAnim) return; setCompletingAnim(true); onCompleteTask?.(); window.setTimeout(() => { setCompletingAnim(false); setTaskCompleted(true); }, onCompleteTask ? 320 : 700); }} disabled={taskCompleted} className={['flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold', taskCompleted ? 'cursor-default border border-[#1f5a45] bg-[#12231c] text-[#79d9b0]' : completingAnim ? 'cursor-wait scale-95 border border-[#1f5a45] bg-[#173125] text-[#b8f0d8]' : 'border border-[#A7F3D0] bg-[#EDF9F4] text-[#047857] hover:bg-[#dff5ed]'].join(' ')}><CheckCheck className={`h-4 w-4 ${completingAnim ? 'animate-bounce' : ''}`} />{taskCompleted ? 'Concluída' : completingAnim ? 'Concluindo...' : 'Concluir tarefa'}</button></div>
            </div>
          </section>

          <aside className="flex min-h-0 w-full flex-col bg-[#fafafa] dark:bg-[#111214] lg:w-[38%] lg:min-w-[360px] lg:max-w-[520px]">
            <div className="shrink-0 border-b border-[#ececec] px-5 py-3 dark:border-[#2a2a2a]">
              <div className="flex items-center justify-between gap-2">
                <button type="button" onClick={() => setSidebarView(sidebarView === 'comments' ? 'activities' : 'comments')} className="inline-flex items-center gap-2 rounded-lg border border-[#e5e5e5] bg-white px-3 py-1.5 text-xs font-semibold text-[#525252] hover:bg-[#f5f5f5] dark:border-[#2a2a2a] dark:bg-[#171717] dark:text-[#f5f5f5] dark:hover:bg-[#232325]"><Activity className="h-3.5 w-3.5" />{sidebarView === 'comments' ? 'Ver atividades' : 'Ver comentários'}</button>
                <span className="rounded-md bg-[#ececec] px-2 py-0.5 text-[10px] font-semibold text-[#737373] dark:bg-[#232325] dark:text-[#a3a3a3]">{sidebarView === 'comments' ? `${taskComments.length} comentários` : `${activityItems.length} eventos`}</span>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              {sidebarView === 'comments' ? (
                taskComments.length > 0 ? <div className="space-y-4">{taskComments.map((comment) => <div key={comment.id} className="rounded-xl bg-[#f5f5f5] px-4 py-3 dark:bg-[#1e1e1e]"><p className="mb-1 text-xs font-semibold">{comment.author?.name ?? 'Usuário'} <span className="font-normal text-[#a3a3a3]">{comment.timestamp}</span></p><p className="text-sm text-[#525252] dark:text-[#f5f5f5]">{comment.text}</p></div>)}</div> : <div className="py-10 text-center text-[#a3a3a3]"><MessageCircle className="mx-auto mb-2 h-8 w-8 opacity-40" /><p className="text-sm">Nenhum comentário ainda</p></div>
              ) : (
                <div className="relative space-y-4 pl-2">{activityItems.map((item) => { const Icon = item.icon; return <div key={item.id} className="flex items-start gap-3"><div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#ececec] dark:bg-[#232325]"><Icon className="h-3.5 w-3.5 text-[#737373] dark:text-[#a3a3a3]" /></div><div><p className="text-sm"><span className="font-semibold">{item.actor}</span> <span className="text-[#525252] dark:text-[#a3a3a3]">{item.action}</span></p><p className="text-[11px] text-[#a3a3a3]">{item.timestamp}</p></div></div>; })}</div>
              )}
            </div>
            <div className="shrink-0 border-t border-[#e5e5e5] px-5 py-4 dark:border-[#2a2a2a]">
              {sidebarView === 'comments' ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff5623] text-[10px] font-semibold text-white">AS</div>
                  <div className="relative flex-1">
                    <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Escreva um comentário..." className="h-10 w-full rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-4 pr-20 text-sm dark:border-[#333] dark:bg-[#1e1e1e]" />
                    <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-0.5"><button className="rounded-lg p-1.5 text-[#a3a3a3] hover:text-[#ff5623]"><ImagePlus className="h-3.5 w-3.5" /></button><button className="rounded-lg p-1.5 text-[#a3a3a3] hover:text-[#ff5623]"><Paperclip className="h-3.5 w-3.5" /></button><button className={`rounded-lg p-1.5 ${commentText.trim() ? 'bg-[#ff5623] text-white' : 'text-[#d4d4d4]'}`}><Send className="h-3.5 w-3.5" /></button></div>
                  </div>
                </div>
              ) : <p className="text-xs text-[#a3a3a3]">Linha do tempo de atividades da tarefa.</p>}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
