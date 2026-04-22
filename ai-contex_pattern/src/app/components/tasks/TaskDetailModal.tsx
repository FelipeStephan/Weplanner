import { useEffect, useState, useRef } from 'react';
import {
  X,
  Bold,
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
  ChevronDown,
  Diamond,
  FileType,
  Highlighter,
  Italic,
  Trash2,
  Plus,
  Search,
  Check,
  UserPlus,
} from 'lucide-react';
import { PriorityBadge } from '../shared/PriorityBadge';
import { TagBadge } from '../shared/TagBadge';
import { AvatarStack } from '../shared/AvatarStack';
import { ProgressBar } from '../shared/ProgressBar';
import { StatusBadge } from './StatusBadge';
import { formatTaskDueDate, getTaskDueDateState, getTaskDueDateInputParts, buildTaskDueDateValue } from '../../utils/taskDueDate';
import { getRichTextPlainText, toDisplayRichTextHtml } from '../../utils/richText';
import { BOARD_DIRECTORY_USERS } from '../../../demo/boardDirectory';
import type { TaskDetailComment as Comment, TaskDetailAttachment as Attachment, TaskDetailModalProps } from '../../types/taskDetail';
import { MOCK_TASK_FORM_CLIENTS, FONT_SIZES, TEXT_COLORS, HIGHLIGHT_COLORS } from '../../data/taskForm';
import { MOCK_TASK_FORM_TEAM } from '../../../mocks/taskForm';
import { DateTimePicker } from '../shared/DateTimePicker';
import { compressImage } from '../../utils/imageUtils';

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
  onUpdateTaskField,
  task,
}: TaskDetailModalProps) {
  const [commentText, setCommentText] = useState('');
  const [sidebarView, setSidebarView] = useState<'comments' | 'activities'>('comments');
  const [isEditingCredits, setIsEditingCredits] = useState(false);
  const [editCredits, setEditCredits] = useState(task.credits ?? 0);
  const [taskCompleted, setTaskCompleted] = useState(task.status === 'completed' || task.status === 'done');
  const [completingAnim, setCompletingAnim] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  const [coverImage, setCoverImage] = useState<string | null>(task.coverImage ?? null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const [showInlineCoverDropdown, setShowInlineCoverDropdown] = useState(false);
  const [attachmentsList, setAttachmentsList] = useState<Attachment[]>(Array.isArray(task.attachmentsList) ? task.attachmentsList : []);

  // Edit Inline States
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editDescription, setEditDescription] = useState(getRichTextPlainText(task.description));
  // Rich text editor states (detail description)
  const descDetailRef = useRef<HTMLDivElement>(null);
  const descEditorContainerRef = useRef<HTMLDivElement>(null);
  const [detailFontSize, setDetailFontSize] = useState('14px');
  const [detailTextColor, setDetailTextColor] = useState('#171717');
  const [detailHighlightColor, setDetailHighlightColor] = useState('transparent');
  const [showDetailColorPicker, setShowDetailColorPicker] = useState(false);
  const [showDetailHighlightPicker, setShowDetailHighlightPicker] = useState(false);
  const [detailColorPickerPos, setDetailColorPickerPos] = useState({ top: 0, left: 0 });
  const [detailHighlightPickerPos, setDetailHighlightPickerPos] = useState({ top: 0, left: 0 });
  const [detailHeading, setDetailHeading] = useState('p');
  const [editDueDate, setEditDueDate] = useState(() => task.dueDate?.split('T')[0] ?? '');
  const [editDueTime, setEditDueTime] = useState(() => task.dueDate?.includes('T') ? task.dueDate.split('T')[1]?.slice(0, 5) : '');
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  
  // Tag States
  const [showTagPicker, setShowTagPicker] = useState<string | number | false>(false);
  const [tagInput, setTagInput] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);
  
  // Assignee States
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const assigneeSearchRef = useRef<HTMLInputElement>(null);

  // Client States
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Subtask States
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [subtaskInput, setSubtaskInput] = useState('');
  const subtaskInputRef = useRef<HTMLInputElement>(null);
  const [localSubtasks, setLocalSubtasks] = useState(() =>
    (task.subtasksList ?? []).map((item, i) => ({
      id: item.id ?? `subtask-${i}`,
      title: item.label ?? item.title ?? '',
      done: item.done,
      dueDate: item.dueDate ?? '',
      assignee: item.assignee as { name: string } | undefined,
    }))
  );
  const [subtaskAssigneeTargetId, setSubtaskAssigneeTargetId] = useState<string | null>(null);
  const [subtaskDateTargetId, setSubtaskDateTargetId] = useState<string | null>(null);
  const [subtaskAssigneeSearch, setSubtaskAssigneeSearch] = useState('');

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
    setCoverImage(task.coverImage ?? null);
    setAttachmentsList(Array.isArray(task.attachmentsList) ? task.attachmentsList : []);
    
    // Reset inline edit states
    setEditTitle(task.title);
    setEditDescription(getRichTextPlainText(task.description));
    setEditDueDate(task.dueDate?.split('T')[0] ?? '');
    setEditDueTime(task.dueDate?.includes('T') ? task.dueDate.split('T')[1]?.slice(0, 5) : '');
    setIsEditingDueDate(false);
    setIsEditingTitle(false);
    setIsEditingDescription(false);
    setShowTagPicker(false);
    setShowAssigneeDropdown(false);
    setShowClientDropdown(false);
    setShowSubtaskInput(false);
    setLocalSubtasks(
      (task.subtasksList ?? []).map((item, i) => ({
        id: item.id ?? `subtask-${i}`,
        title: item.label ?? item.title ?? '',
        done: item.done,
        dueDate: item.dueDate ?? '',
        assignee: item.assignee as { name: string } | undefined,
      }))
    );
    setSubtaskAssigneeTargetId(null);
    setSubtaskDateTargetId(null);
    setSubtaskAssigneeSearch('');
  }, [isOpen, task]);

  // Initialize the description editor with the task's existing HTML when editing starts
  useEffect(() => {
    if (isEditingDescription && descDetailRef.current) {
      descDetailRef.current.innerHTML = task.description || '';
      // Move cursor to end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(descDetailRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
      descDetailRef.current.focus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditingDescription, task.description]);

  if (!isOpen) return null;

  const applyFormatDetail = (command: string, value?: string) => {
    descDetailRef.current?.focus();
    document.execCommand(command, false, value);
  };

  const fontSizeToExecValue = (size: string): string => {
    const map: Record<string, string> = { '12px': '1', '14px': '2', '16px': '3', '18px': '4', '20px': '5', '24px': '6' };
    return map[size] ?? '2';
  };

  const saveDetailDescription = () => {
    setIsEditingDescription(false);
    const html = descDetailRef.current?.innerHTML ?? '';
    const isEmpty = !html || html === '<br>' || html === '<div><br></div>' || html.trim() === '';
    const newVal = isEmpty ? '' : html.trim();
    if (newVal !== (task.description || '')) {
      onUpdateTaskField?.({ description: newVal }, 'atualizou a descrição da tarefa', 'edit');
    }
    setDetailFontSize('14px');
    setDetailHeading('p');
    setDetailTextColor('#171717');
    setDetailHighlightColor('transparent');
    setShowDetailColorPicker(false);
    setShowDetailHighlightPicker(false);
  };

  // ── Subtask helpers ──────────────────────────────────────────────────────────
  const updateLocalSubtask = (id: string, updater: (s: typeof localSubtasks[number]) => typeof localSubtasks[number]) => {
    const next = localSubtasks.map((s) => (s.id === id ? updater(s) : s));
    setLocalSubtasks(next);
    onUpdateTaskField?.(
      { subtasksList: next.map((s) => ({ id: s.id, title: s.title, label: s.title, done: s.done, dueDate: s.dueDate || undefined, assignee: s.assignee })) },
      'atualizou subtarefas', 'edit',
    );
  };
  const addLocalSubtask = () => {
    const val = subtaskInput.trim();
    if (!val) return;
    const next = [...localSubtasks, { id: `subtask-${Date.now()}`, title: val, done: false, dueDate: '', assignee: undefined }];
    setLocalSubtasks(next);
    onUpdateTaskField?.(
      { subtasksList: next.map((s) => ({ id: s.id, title: s.title, label: s.title, done: s.done, dueDate: s.dueDate || undefined, assignee: s.assignee })) },
      `adicionou a subtarefa '${val}'`, 'create',
    );
    setSubtaskInput('');
    setTimeout(() => subtaskInputRef.current?.focus(), 10);
  };
  const removeLocalSubtask = (id: string) => {
    const next = localSubtasks.filter((s) => s.id !== id);
    setLocalSubtasks(next);
    onUpdateTaskField?.(
      { subtasksList: next.map((s) => ({ id: s.id, title: s.title, label: s.title, done: s.done, dueDate: s.dueDate || undefined, assignee: s.assignee })) },
      'removeu subtarefa', 'edit',
    );
  };
  const filteredSubtaskTeam = MOCK_TASK_FORM_TEAM.filter((m) =>
    m.name.toLowerCase().includes(subtaskAssigneeSearch.toLowerCase())
  );
  const doneCount = localSubtasks.filter((s) => s.done).length;

  const taskTags = Array.isArray(task.tags) ? task.tags : [];
  const taskAssignees = Array.isArray(task.assignees) ? task.assignees : [];
  const taskComments = Array.isArray(task.comments) ? task.comments : [];
  const descriptionText = getRichTextPlainText(task.description);
  const dueDateState = getTaskDueDateState(task.dueDate);
  const displayDueDate = formatTaskDueDate(task.dueDate);

  const TAG_PALETTE = [
    { bg: '#fee2e2', text: '#dc2626', colorName: 'red' as const },
    { bg: '#ffedd5', text: '#ea580c', colorName: 'orange' as const },
    { bg: '#fef3c7', text: '#d97706', colorName: 'yellow' as const },
    { bg: '#dcfce7', text: '#16a34a', colorName: 'green' as const },
    { bg: '#dbeafe', text: '#2563eb', colorName: 'blue' as const },
    { bg: '#f3e8ff', text: '#9333ea', colorName: 'purple' as const },
    { bg: '#fce7f3', text: '#db2777', colorName: 'pink' as const },
    { bg: '#f3f4f6', text: '#4b5563', colorName: 'gray' as const },
  ];

  const addCustomTag = () => {
    const value = tagInput.trim();
    if (!value) return;
    if (taskTags.length >= 5) {
      setTagInput('');
      return;
    }
    const color = TAG_PALETTE[taskTags.length % TAG_PALETTE.length].colorName;
    const newTags = [...taskTags, { label: value, color }];
    onUpdateTaskField?.({ tags: newTags }, `adicionou a tag '${value}'`, 'edit');
    setTagInput('');
    setShowTagPicker(false);
  };

  const removeTag = (labelToRemove: string) => {
    const newTags = taskTags.filter((t) => t.label !== labelToRemove);
    onUpdateTaskField?.({ tags: newTags }, `removeu a tag '${labelToRemove}'`, 'edit');
  };

  const changeTagColor = (index: number, newColor: { colorName: string }) => {
    const newTags = taskTags.map((tag, i) => i === index ? { ...tag, color: newColor.colorName } : tag);
    onUpdateTaskField?.({ tags: newTags }, `alterou a cor da tag '${newTags[index].label}'`, 'edit');
  };

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

  const activityIconMap: Record<string, typeof Edit3> = {
    move: ArrowRight,
    complete: CheckCheck,
    archive: File,
    cancel: X,
    send: ArrowRight,
    create: Edit3,
    edit: Edit3,
  };

  const formatActivityTimestamp = (iso: string): string => {
    try {
      const date = new Date(iso);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  const filteredTeam = BOARD_DIRECTORY_USERS.filter((member) => member.name.toLowerCase().includes(assigneeSearch.toLowerCase()));

  const toggleAssignee = (memberName: string) => {
    const isSelected = taskAssignees.some((a) => a.name === memberName);
    const newAssignees = isSelected ? taskAssignees.filter((a) => a.name !== memberName) : [...taskAssignees, { name: memberName }];
    const action = isSelected ? `removeu ${memberName} da tarefa` : `atribuiu ${memberName} à tarefa`;
    onUpdateTaskField?.({ assignees: newAssignees }, action, 'edit');
  };

  const updateClient = (clientName: string) => {
    onUpdateTaskField?.({ client: clientName, clientId: MOCK_TASK_FORM_CLIENTS.find(c => c.name === clientName)?.id }, `alterou o cliente da tarefa para '${clientName}'`, 'edit');
    setShowClientDropdown(false);
  };

  const activityItems = [
    {
      id: 'a0-create',
      icon: Edit3,
      actor: task.assignees[0]?.name || 'Sistema',
      action: 'criou esta tarefa',
      timestamp: task.createdAt ? `${task.createdAt} às 09:00` : '01 Mar, 2026 às 09:00',
    },
    ...(task.activityLog ?? []).map((entry) => ({
      id: entry.id,
      icon: activityIconMap[entry.icon] ?? ArrowRight,
      actor: entry.actor,
      action: entry.action,
      timestamp: formatActivityTimestamp(entry.timestamp),
    })),
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

        <div className="min-h-0 flex-1 lg:flex" onClick={() => setShowInlineCoverDropdown(false)}>
          <section className="flex min-h-0 min-w-0 flex-1 flex-col border-b border-[#ececec] dark:border-[#2a2a2a] lg:border-b-0 lg:border-r">
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              {!coverImage && (
                <button
                  type="button"
                  onClick={() => coverImageInputRef.current?.click()}
                  className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#d4d4d4] bg-[#fafafa]/50 py-3 text-[12px] font-semibold text-[#a3a3a3] transition-colors hover:border-[#ff5623]/50 hover:bg-[#fff8f6] hover:text-[#ff5623] dark:border-[#2a2a2a] dark:bg-[#1e1e1e]/50 dark:hover:border-[#ff5623]/40 dark:hover:text-[#ff8c69]"
                >
                  <ImagePlus className="h-4 w-4" /> Adicionar capa
                </button>
              )}
              {coverImage && (
                <div className="group relative mb-5 h-48 w-full rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a]">
                  <img src={coverImage} alt="Capa" className="h-full w-full rounded-xl object-cover" />
                  <div className={`absolute inset-0 flex items-center justify-center gap-2 rounded-xl bg-black/40 transition-opacity ${showInlineCoverDropdown ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setShowInlineCoverDropdown(!showInlineCoverDropdown); }}
                        className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-[#171717] shadow transition-all hover:bg-white"
                      >
                        <Image className="h-3.5 w-3.5" /> Trocar
                      </button>
                      {showInlineCoverDropdown && (
                        <div className="absolute left-1/2 top-full z-[200] mt-2 w-56 -translate-x-1/2 rounded-xl border border-[#e5e5e5] bg-white p-2 shadow-xl dark:border-[#2a2a2a] dark:bg-[#1e1e1e]" onClick={(e) => e.stopPropagation()}>
                          <button 
                            type="button"
                            onClick={() => { coverImageInputRef.current?.click(); setShowInlineCoverDropdown(false); }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] hover:bg-[#f5f5f5] dark:hover:bg-[#232325]"
                          >
                            <Upload className="h-4 w-4" />
                            Enviar do computador
                          </button>
                          {attachmentsList.filter((a) => a.type === 'image' || a.name.endsWith('.jpg') || a.name.endsWith('.png')).length > 0 && (
                            <>
                              <div className="my-1 h-px bg-[#e5e5e5] dark:bg-[#2a2a2a]" />
                              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">Dos anexos</p>
                              {attachmentsList.filter((a) => a.type === 'image' || a.name.endsWith('.jpg') || a.name.endsWith('.png')).map((a) => (
                                <button 
                                  key={a.id}
                                  type="button"
                                  onClick={() => {
                                    coverImageInputRef.current?.click();
                                    setShowInlineCoverDropdown(false);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] hover:bg-[#f5f5f5] dark:hover:bg-[#232325]"
                                >
                                  <Image className="h-4 w-4" />
                                  <span className="truncate">{a.name}</span>
                                </button>
                              ))}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => { setCoverImage(null); setShowInlineCoverDropdown(false); onUpdateTaskField?.({ coverImage: null }, 'removeu a capa', 'edit'); }}
                      className="flex items-center gap-1.5 rounded-lg bg-[#f32c2c]/90 px-3 py-1.5 text-[11px] font-semibold text-white shadow transition-all hover:bg-[#f32c2c]"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remover
                    </button>
                  </div>
                </div>
              )}
              <input
                ref={coverImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    e.target.value = '';
                    compressImage(file)
                      .then((compressed) => {
                        setCoverImage(compressed);
                        onUpdateTaskField?.({ coverImage: compressed }, 'adicionou uma capa', 'edit');
                      })
                      .catch((err) => {
                        console.error('Erro ao processar imagem de capa:', err);
                      });
                  }
                }}
              />
              <div className="space-y-5">
                {alertInfo && <div className={`flex items-center gap-2 rounded-xl px-4 py-3 ${alertInfo.bg} ${alertInfo.text}`}><alertInfo.icon className="h-4 w-4" /><span className="text-sm font-semibold">{alertInfo.label}</span><span className="ml-auto text-xs">{displayDueDate}</span></div>}
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">Tags</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {taskTags.map((tag, i) => {
                      const palette = TAG_PALETTE.find((c) => c.colorName === tag.color) ?? TAG_PALETTE[0];
                      return (
                        <div key={i} className="relative flex shrink-0 items-center rounded-md" style={{ backgroundColor: palette.bg }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowTagPicker(showTagPicker === i ? false : i); }}
                            className="pl-2 pr-1 py-0.5 text-[11px] font-semibold transition-opacity hover:opacity-80"
                            style={{ color: palette.text }}
                          >
                            {tag.label}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeTag(tag.label); }}
                            className="pl-0.5 pr-1.5 py-0.5 transition-opacity hover:opacity-60"
                            style={{ color: palette.text }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                          {showTagPicker === i && (
                            <div className="absolute left-0 top-full z-[200] mt-1.5 rounded-xl border border-[#e5e5e5] bg-white p-2 shadow-xl dark:border-[#2a2a2a] dark:bg-[#1e1e1e]" style={{ minWidth: '120px' }} onClick={(e) => e.stopPropagation()}>
                              <p className="mb-1.5 px-1 text-[9px] font-semibold uppercase tracking-wider text-[#a3a3a3]">Cor da tag</p>
                              <div className="grid grid-cols-4 gap-1.5">
                                {TAG_PALETTE.map((color) => (
                                  <button
                                    key={color.bg}
                                    onClick={() => changeTagColor(i, color)}
                                    className="h-6 w-6 rounded-lg border-2 transition-transform hover:scale-110"
                                    style={{ backgroundColor: color.bg, borderColor: tag.color === color.colorName ? '#171717' : 'transparent' }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {taskTags.length < 5 && (
                      <div className="relative">
                        <button 
                          onClick={() => { setShowTagPicker('new'); setTimeout(() => tagInputRef.current?.focus(), 50); }}
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-[#d4d4d4] text-[#a3a3a3] transition-colors hover:border-[#ff5623] hover:text-[#ff5623] dark:border-[#333]"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        {showTagPicker === 'new' && (
                          <div className="absolute left-0 top-full z-[200] mt-1.5 w-48 rounded-xl border border-[#e5e5e5] bg-white p-2 shadow-xl dark:border-[#2a2a2a] dark:bg-[#1e1e1e]">
                            <input
                              ref={tagInputRef}
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') { e.preventDefault(); addCustomTag(); }
                                if (e.key === 'Escape') { e.preventDefault(); setTagInput(''); setShowTagPicker(false); }
                              }}
                              onBlur={() => setTimeout(() => { setTagInput(''); setShowTagPicker(false); }, 120)}
                              placeholder="Nome da tag (Enter)..."
                              className="w-full rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-3 py-1.5 text-sm outline-none dark:border-[#333] dark:bg-[#141414] dark:text-[#f5f5f5]"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  {isEditingTitle ? (
                    <input
                      autoFocus
                      className="mb-2 w-full rounded-xl border border-[#ff5623] bg-white px-3 py-1.5 text-xl font-bold text-[#171717] outline-none dark:bg-[#141414] dark:text-[#f5f5f5]"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => {
                        setIsEditingTitle(false);
                        if (editTitle.trim() && editTitle.trim() !== task.title) {
                          onUpdateTaskField?.({ title: editTitle.trim() }, 'alterou o título da tarefa', 'edit');
                        } else {
                          setEditTitle(task.title);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.currentTarget.blur();
                        if (e.key === 'Escape') {
                           setEditTitle(task.title);
                           setIsEditingTitle(false);
                        }
                      }}
                    />
                  ) : (
                    <div 
                      className="group relative mb-2 flex cursor-pointer items-start gap-2 rounded-xl border border-transparent p-1.5 -ml-1.5 transition-colors hover:bg-[#f5f5f5] dark:hover:bg-[#232325]"
                      onClick={() => setIsEditingTitle(true)}
                    >
                      <h2 className="text-xl font-bold dark:text-[#f5f5f5]">{task.title}</h2>
                      <Edit3 className="mt-1 h-4 w-4 opacity-0 text-[#a3a3a3] transition-opacity group-hover:opacity-100" />
                    </div>
                  )}

                  {isEditingDescription ? (
                    /* sem overflow-hidden — permite que os dropdowns da toolbar apareçam fora dos limites */
                    <div ref={descEditorContainerRef} className="rounded-xl border border-[#ff5623] bg-white dark:bg-[#141414]">
                      {/* ── Toolbar ── */}
                      <div className="flex items-center gap-1 overflow-x-auto border-b border-[#e5e5e5] bg-[#fafafa] px-3 py-2 dark:border-[#2a2a2a] dark:bg-[#1e1e1e]">
                        {/* Bold */}
                        <button onMouseDown={(e) => { e.preventDefault(); applyFormatDetail('bold'); }} className="shrink-0 rounded-lg p-1.5 transition-colors hover:bg-[#e5e5e5] dark:hover:bg-[#2a2a2a]" title="Negrito">
                          <Bold className="h-3.5 w-3.5 text-[#525252] dark:text-[#a3a3a3]" />
                        </button>
                        {/* Italic */}
                        <button onMouseDown={(e) => { e.preventDefault(); applyFormatDetail('italic'); }} className="shrink-0 rounded-lg p-1.5 transition-colors hover:bg-[#e5e5e5] dark:hover:bg-[#2a2a2a]" title="Itálico">
                          <Italic className="h-3.5 w-3.5 text-[#525252] dark:text-[#a3a3a3]" />
                        </button>
                        <div className="mx-1 h-4 w-px shrink-0 bg-[#e5e5e5] dark:bg-[#2a2a2a]" />
                        {/* Font size */}
                        <select
                          value={detailFontSize}
                          onMouseDown={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const next = e.target.value;
                            setDetailFontSize(next);
                            descDetailRef.current?.focus();
                            document.execCommand('fontSize', false, fontSizeToExecValue(next));
                          }}
                          className="h-6 shrink-0 rounded-lg border border-[#e5e5e5] bg-transparent px-1.5 text-[11px] font-semibold text-[#525252] focus:outline-none dark:border-[#2a2a2a] dark:text-[#a3a3a3]"
                        >
                          {FONT_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <div className="mx-1 h-4 w-px shrink-0 bg-[#e5e5e5] dark:bg-[#2a2a2a]" />
                        {/* Heading select */}
                        <select
                          value={detailHeading}
                          onMouseDown={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDetailHeading(val);
                            descDetailRef.current?.focus();
                            document.execCommand('formatBlock', false, val);
                          }}
                          className="h-6 shrink-0 rounded-lg border border-[#e5e5e5] bg-transparent px-1.5 text-[11px] font-semibold text-[#525252] focus:outline-none dark:border-[#2a2a2a] dark:text-[#a3a3a3]"
                          title="Estilo do parágrafo"
                        >
                          <option value="p">P</option>
                          <option value="h1">H1</option>
                          <option value="h2">H2</option>
                          <option value="h3">H3</option>
                        </select>
                        <div className="mx-1 h-4 w-px shrink-0 bg-[#e5e5e5] dark:bg-[#2a2a2a]" />
                        {/* Text color — popup com position:fixed para não ser cortado pelo overflow-y-auto do pai */}
                        <div className="shrink-0">
                          <button
                            onMouseDown={(e) => {
                              e.preventDefault();
                              const rect = e.currentTarget.getBoundingClientRect();
                              setDetailColorPickerPos({ top: rect.bottom + 6, left: rect.left });
                              setShowDetailColorPicker((v) => !v);
                              setShowDetailHighlightPicker(false);
                            }}
                            className="flex items-center gap-1 rounded-lg p-1.5 text-[#525252] transition-colors hover:bg-[#e5e5e5] dark:text-[#a3a3a3] dark:hover:bg-[#2a2a2a]"
                            title="Cor do texto"
                          >
                            <span
                              className="text-sm font-bold"
                              style={detailTextColor !== '#171717' ? { color: detailTextColor === '#ffffff' ? '#d4d4d4' : detailTextColor } : {}}
                            >A</span>
                            <div className="h-1.5 w-3 rounded-sm" style={{ backgroundColor: detailTextColor, boxShadow: detailTextColor === '#ffffff' ? 'inset 0 0 0 1px #d4d4d4' : 'none' }} />
                          </button>
                        </div>
                        {/* Highlight color — popup com position:fixed */}
                        <div className="shrink-0">
                          <button
                            onMouseDown={(e) => {
                              e.preventDefault();
                              const rect = e.currentTarget.getBoundingClientRect();
                              setDetailHighlightPickerPos({ top: rect.bottom + 6, left: rect.left });
                              setShowDetailHighlightPicker((v) => !v);
                              setShowDetailColorPicker(false);
                            }}
                            className="flex items-center gap-1 rounded-lg p-1.5 transition-colors hover:bg-[#e5e5e5] dark:hover:bg-[#2a2a2a]"
                            title="Marcador de texto"
                          >
                            <Highlighter
                              className="h-3.5 w-3.5 shrink-0 text-[#525252] dark:text-[#a3a3a3]"
                              style={detailHighlightColor !== 'transparent' ? { color: detailHighlightColor } : {}}
                            />
                            <div className="h-1.5 w-3 rounded-sm" style={{ backgroundColor: detailHighlightColor !== 'transparent' ? detailHighlightColor : 'transparent', boxShadow: '0 0 0 1px #888888' }} />
                          </button>
                        </div>
                        {/* Done button */}
                        <button
                          onMouseDown={(e) => { e.preventDefault(); saveDetailDescription(); }}
                          className="ml-auto shrink-0 rounded-lg bg-[#ff5623] px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-[#e04d1e]"
                        >
                          Feito
                        </button>
                      </div>
                      {/* ── Content editable ── */}
                      <div
                        ref={descDetailRef}
                        contentEditable
                        suppressContentEditableWarning
                        data-placeholder="Adicionar uma descrição..."
                        className="min-h-[180px] px-3 py-2.5 text-sm text-[#171717] empty:before:pointer-events-none empty:before:italic empty:before:text-[#a3a3a3] empty:before:content-[attr(data-placeholder)] focus:outline-none dark:text-[#f5f5f5]"
                        onBlur={(e) => {
                          // Não fecha o editor se o foco foi para um elemento dentro do próprio container (toolbar selects, botões, etc.)
                          if (descEditorContainerRef.current?.contains(e.relatedTarget as Node)) return;
                          saveDetailDescription();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') { e.preventDefault(); setIsEditingDescription(false); }
                        }}
                      />
                    </div>
                  ) : (
                    <div 
                      className="group relative min-h-[40px] cursor-pointer rounded-xl border border-transparent p-2 -ml-2 transition-colors hover:bg-[#f5f5f5] dark:hover:bg-[#232325]"
                      onClick={() => setIsEditingDescription(true)}
                    >
                      <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <Edit3 className="h-4 w-4 text-[#a3a3a3]" />
                      </div>
                      {descriptionText ? (
                        <div className="text-sm leading-relaxed text-[#737373] pr-6 dark:text-[#a3a3a3] [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold" dangerouslySetInnerHTML={{ __html: toDisplayRichTextHtml(task.description) }} />
                      ) : (
                        <span className="text-sm text-[#a3a3a3] italic pr-6">Adicionar uma descrição...</span>
                      )}
                    </div>
                  )}
                </div>
                {/* ── Subtarefas ── */}
                <div>
                  {localSubtasks.length > 0 && (
                    <div className="mb-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#987dfe]">
                          <CheckSquare className="h-4 w-4" />
                          <span className="text-sm font-semibold">Subtarefas</span>
                        </div>
                        <span className="text-sm font-bold text-[#525252] dark:text-[#a3a3a3]">{doneCount}/{localSubtasks.length}</span>
                      </div>
                      <ProgressBar value={localSubtasks.length > 0 ? Math.round((doneCount / localSubtasks.length) * 100) : 0} color="success" size="md" showLabel />
                    </div>
                  )}
                  <div className="mt-1 space-y-2">
                    {localSubtasks.map((subtask) => (
                      <div
                        key={subtask.id}
                        className="relative rounded-2xl border border-[#ececec] bg-[#fafafa] px-3 py-2.5 dark:border-[#2a2a2a] dark:bg-[#1a1a1a]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateLocalSubtask(subtask.id, (s) => ({ ...s, done: !s.done }))}
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border-2 transition-all ${subtask.done ? 'border-[#019364] bg-[#019364]' : 'border-[#d4d4d4] hover:border-[#ff5623] dark:border-[#3a3a3a]'}`}
                          >
                            {subtask.done && (
                              <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </button>
                          <input
                            type="text"
                            value={subtask.title}
                            onChange={(e) => updateLocalSubtask(subtask.id, (s) => ({ ...s, title: e.target.value }))}
                            placeholder="Descreva a subtarefa"
                            className={`flex-1 bg-transparent text-[13px] focus:outline-none ${subtask.done ? 'line-through text-[#a3a3a3]' : 'text-[#171717] dark:text-[#f5f5f5]'}`}
                          />
                          <button
                            onClick={(e) => { e.stopPropagation(); setSubtaskDateTargetId(null); setSubtaskAssigneeTargetId((c) => (c === subtask.id ? null : subtask.id)); setSubtaskAssigneeSearch(''); }}
                            className="inline-flex items-center gap-1 rounded-full border border-[#e5e5e5] bg-white px-2 py-1 text-[11px] font-medium text-[#737373] transition-colors hover:border-[#ff5623]/40 hover:text-[#ff5623] dark:border-[#2f2f2f] dark:bg-[#171717]"
                          >
                            {subtask.assignee ? (
                              <>
                                <span className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: MOCK_TASK_FORM_TEAM.find((m) => m.name === subtask.assignee?.name)?.color || '#ff5623' }}>
                                  {getInitials(subtask.assignee.name)}
                                </span>
                                <span className="max-w-[72px] truncate">{subtask.assignee.name.split(' ')[0]}</span>
                              </>
                            ) : (
                              <><UserPlus className="h-3 w-3" /><span>Atribuir</span></>
                            )}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSubtaskAssigneeTargetId(null); setSubtaskDateTargetId((c) => (c === subtask.id ? null : subtask.id)); }}
                            className="inline-flex items-center gap-1 rounded-full border border-[#e5e5e5] bg-white px-2 py-1 text-[11px] font-medium text-[#737373] transition-colors hover:border-[#ff5623]/40 hover:text-[#ff5623] dark:border-[#2f2f2f] dark:bg-[#171717]"
                          >
                            <Calendar className="h-3 w-3" />
                            <span>{subtask.dueDate ? formatTaskDueDate(subtask.dueDate) : 'Data'}</span>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeLocalSubtask(subtask.id); }}
                            className="rounded-lg p-1 text-[#a3a3a3] transition-colors hover:bg-[#f32c2c]/10 hover:text-[#f32c2c]"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Assignee picker */}
                        {subtaskAssigneeTargetId === subtask.id && (
                          <div className="mt-2 rounded-xl border border-[#e5e5e5] bg-white p-2 shadow-lg dark:border-[#2a2a2a] dark:bg-[#171717]" onClick={(e) => e.stopPropagation()}>
                            <div className="mb-2 flex items-center gap-2 rounded-lg bg-[#fafafa] px-2 dark:bg-[#1f1f20]">
                              <Search className="h-3.5 w-3.5 text-[#a3a3a3]" />
                              <input
                                autoFocus
                                type="text"
                                value={subtaskAssigneeSearch}
                                onChange={(e) => setSubtaskAssigneeSearch(e.target.value)}
                                placeholder="Buscar responsável..."
                                className="h-8 flex-1 bg-transparent text-sm text-[#171717] outline-none placeholder:text-[#c7c7c7] dark:text-[#f5f5f5]"
                              />
                            </div>
                            <div className="max-h-[160px] space-y-1 overflow-y-auto">
                              {filteredSubtaskTeam.map((member) => (
                                <button
                                  key={member.name}
                                  onClick={() => { updateLocalSubtask(subtask.id, (s) => ({ ...s, assignee: { name: member.name } })); setSubtaskAssigneeTargetId(null); setSubtaskAssigneeSearch(''); }}
                                  className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition-colors hover:bg-[#f5f5f5] dark:hover:bg-[#202021]"
                                >
                                  <span className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: member.color }}>
                                    {getInitials(member.name)}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-[#171717] dark:text-[#f5f5f5]">{member.name}</p>
                                    <p className="truncate text-[10px] text-[#a3a3a3]">{member.role}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Date picker */}
                        {subtaskDateTargetId === subtask.id && (
                          <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#e5e5e5] bg-white p-2 shadow-lg dark:border-[#2a2a2a] dark:bg-[#171717]" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="date"
                              value={getTaskDueDateInputParts(subtask.dueDate).date}
                              onChange={(e) => { updateLocalSubtask(subtask.id, (s) => ({ ...s, dueDate: buildTaskDueDateValue(e.target.value, getTaskDueDateInputParts(s.dueDate).time) })); setSubtaskDateTargetId(null); }}
                              className="h-9 flex-1 rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-3 text-sm text-[#171717] outline-none focus:border-[#ff5623] dark:border-[#2a2a2a] dark:bg-[#1f1f20] dark:text-[#f5f5f5]"
                            />
                            <button
                              onClick={() => { updateLocalSubtask(subtask.id, (s) => ({ ...s, dueDate: '' })); setSubtaskDateTargetId(null); }}
                              className="rounded-lg px-2 py-1.5 text-[11px] font-semibold text-[#a3a3a3] transition-colors hover:bg-[#f5f5f5] hover:text-[#525252]"
                            >
                              Limpar
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Input nova subtarefa */}
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 shrink-0 rounded-[4px] border-2 border-dashed border-[#d4d4d4] dark:border-[#3a3a3a]" />
                      <input
                        ref={subtaskInputRef}
                        type="text"
                        value={subtaskInput}
                        onChange={(e) => setSubtaskInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLocalSubtask(); } }}
                        placeholder="Adicionar subtarefa... (Enter)"
                        className="flex-1 bg-transparent text-[13px] text-[#171717] placeholder:text-[#d4d4d4] focus:outline-none dark:text-[#f5f5f5] dark:placeholder:text-[#525252]"
                      />
                    </div>
                    {localSubtasks.length > 0 && (
                      <p className="pt-0.5 text-[10px] text-[#a3a3a3]">
                        {doneCount}/{localSubtasks.length} concluídas
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-[#fafafa] p-4 dark:bg-[#1e1e1e]">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">Data de entrega</p>
                    <DateTimePicker
                      variant="inline"
                      value={task.dueDate}
                      dueDateState={dueDateState === 'overdue' ? 'overdue' : dueDateState === 'warning' ? 'warning' : 'normal'}
                      placeholder="Não definido"
                      onChange={(val) => {
                        setEditDueDate(val.split('T')[0] ?? '');
                        setEditDueTime(val.split('T')[1]?.slice(0, 5) ?? '');
                        onUpdateTaskField?.({ dueDate: val }, 'alterou a data de entrega', 'edit');
                      }}
                      onClear={() => onUpdateTaskField?.({ dueDate: '' }, 'removeu a data de entrega', 'edit')}
                    />
                  </div>
                  <div className="rounded-xl bg-[#fafafa] p-4 dark:bg-[#1e1e1e]">
                    <div className="relative">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">Cliente</p>
                      <button type="button" disabled={!task.client} onClick={() => setShowClientDropdown((curr) => !curr)} className="group flex items-center gap-2 text-left disabled:cursor-default w-full rounded-xl border border-transparent p-1.5 -ml-1.5 hover:bg-[#e5e5e5] dark:hover:bg-[#2a2a2a] transition-colors">
                        <Building2 className={`h-4 w-4 shrink-0 ${task.client ? 'text-[#ff5623]' : 'text-[#a3a3a3] group-hover:text-[#ff5623]'}`} />
                        <span className="text-sm font-semibold text-[#171717] transition-colors group-hover:text-[#ff5623] dark:text-[#f5f5f5] dark:group-hover:text-[#ff8c69] flex-1 truncate">{task.client || 'Não definido'}</span>
                      </button>
                      {showClientDropdown && (
                        <div className="absolute top-full right-0 z-[200] mt-1 w-full min-w-[200px] overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-xl dark:border-[#2a2a2a] dark:bg-[#1e1e1e]">
                          <div className="max-h-[200px] overflow-y-auto py-1">
                            {MOCK_TASK_FORM_CLIENTS.map((client) => {
                               const isSelected = task.client === client.name;
                               return (
                                 <button key={client.id} onClick={() => updateClient(client.name)} className={`flex w-full items-center justify-between px-3 py-2 transition-colors ${isSelected ? 'bg-[#ff5623]/5 text-[#ff5623]' : 'hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]'}`}>
                                   <div className="flex items-center gap-2">
                                     <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: client.color }} />
                                     <span className={`text-sm text-left truncate font-medium ${isSelected ? 'text-[#ff5623]' : 'text-[#171717] dark:text-[#f5f5f5]'}`}>{client.name}</span>
                                   </div>
                                   {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                                 </button>
                               )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <p className="-mt-2 flex items-center gap-1.5 text-[11px] text-[#a3a3a3]"><Clock className="h-3 w-3" />Criado em {task.createdAt || '10 Mar, 2026'} às 09:00</p>
                <div className="relative">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">Responsáveis</p>
                  <div className="flex min-h-[40px] items-center gap-2 rounded-xl border border-transparent hover:border-[#e5e5e5] p-1.5 -ml-1.5 dark:hover:border-[#2a2a2a] transition-colors cursor-pointer group" onClick={() => { setShowAssigneeDropdown((curr) => !curr); setTimeout(() => assigneeSearchRef.current?.focus(), 50); }}>
                    {taskAssignees.length > 0 ? (
                      <div className="flex flex-1 items-center gap-2">
                        <AvatarStack avatars={taskAssignees} max={6} size="md" />
                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center h-6 w-6 rounded-full bg-[#f5f5f5] dark:bg-[#232325]">
                           <Plus className="h-3.5 w-3.5 text-[#737373] dark:text-[#a3a3a3]" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashed border-[#d4d4d4] text-[#737373] transition-colors hover:border-[#ff5623]/50 hover:text-[#ff5623] dark:border-[#3a3a3a] dark:text-[#b8b8bc]">
                          <Plus className="h-4 w-4" />
                        </div>
                        <span className="text-sm text-[#b8b8bc]">Adicionar responsáveis</span>
                      </div>
                    )}
                  </div>
                  {showAssigneeDropdown && (
                    <div className="absolute top-full z-[200] mt-1 w-full max-w-[280px] overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-xl dark:border-[#2a2a2a] dark:bg-[#1e1e1e]">
                      <div className="border-b border-[#f5f5f5] p-2 dark:border-[#2a2a2a]">
                        <div className="flex items-center gap-2 px-2">
                          <Search className="h-3.5 w-3.5 shrink-0 text-[#a3a3a3]" />
                          <input
                            ref={assigneeSearchRef}
                            type="text"
                            value={assigneeSearch}
                            onChange={(event) => setAssigneeSearch(event.target.value)}
                            placeholder="Buscar membro..."
                            className="flex-1 bg-transparent text-sm text-[#171717] placeholder:text-[#d4d4d4] focus:outline-none dark:text-[#f5f5f5]"
                          />
                        </div>
                      </div>
                      <div className="max-h-[200px] overflow-y-auto py-1">
                        {filteredTeam.map((member) => {
                          const isSelected = taskAssignees.some((a) => a.name === member.name);
                          return (
                            <button
                              key={member.id}
                              onClick={() => toggleAssignee(member.name)}
                              className={`flex w-full items-center justify-between px-4 py-2.5 transition-colors ${isSelected ? 'bg-[#ff5623]/5' : 'hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]'}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white flex-shrink-0" style={{ backgroundColor: member.color }}>
                                  {getInitials(member.name)}
                                </div>
                                <div className="text-left overflow-hidden">
                                  <p className="text-sm font-medium text-[#171717] dark:text-[#f5f5f5] truncate">{member.name}</p>
                                  <p className="text-[10px] text-[#a3a3a3] truncate">{member.role}</p>
                                </div>
                              </div>
                              {isSelected && <Check className="h-4 w-4 text-[#ff5623] flex-shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
                      <Paperclip className="h-3 w-3" /> Anexos
                    </label>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f5f5f5] text-[10px] font-bold text-[#737373] dark:bg-[#2a2a2a] dark:text-[#a3a3a3]">
                      {attachmentsList.length}
                    </span>
                  </div>

                  <div 
                    className="mb-3 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#d4d4d4] bg-[#fafafa]/50 p-6 transition-colors hover:border-[#ff5623]/50 hover:bg-[#fff8f6] dark:border-[#2a2a2a] dark:bg-[#1e1e1e]/50 cursor-pointer"
                    onClick={() => {
                      // Mock upload
                      const newAttachment = {
                         id: Math.random().toString(),
                         name: 'novo_arquivo_selecionado.jpg',
                         type: 'image' as const,
                         size: '1.2 MB',
                         uploadedBy: 'Felipe',
                         uploadedAt: 'Agora'
                      };
                      setAttachmentsList((prev) => [...prev, newAttachment]);
                    }}
                  >
                    <Upload className="mb-2 h-5 w-5 text-[#737373] dark:text-[#a3a3a3]" />
                    <p className="text-sm font-semibold text-[#171717] dark:text-[#f5f5f5]">Clique ou arraste arquivos para anexar</p>
                    <p className="mt-1 text-[11px] text-[#a3a3a3]">Até 25.0 MB por arquivo</p>
                  </div>

                  {attachmentsList.length > 0 && (
                    <div className="space-y-2">
                      {attachmentsList.map((file) => (
                        <div key={file.id} className="flex items-center justify-between rounded-xl border border-[#e5e5e5] bg-white p-2.5 shadow-sm transition-all hover:shadow-md dark:border-[#2a2a2a] dark:bg-[#1a1a1a]">
                          <div className="flex items-center gap-3 overflow-hidden">
                            {file.type === 'image' || file.name.endsWith('.jpg') || file.name.endsWith('.png') ? (
                              <div className="h-10 w-12 shrink-0 overflow-hidden rounded-lg bg-[#f5f5f5] dark:bg-[#2a2a2a]">
                                <img src="/src/assets/task-cover-demo.png" alt={file.name} className="h-full w-full object-cover" />
                              </div>
                            ) : (
                              <div className="flex h-10 w-12 shrink-0 items-center justify-center rounded-lg bg-[#f5f5f5] dark:bg-[#2a2a2a]">
                                <FileType className="h-5 w-5 text-[#a3a3a3]" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#171717] dark:text-[#f5f5f5]">{file.name}</p>
                              <p className="text-[11px] text-[#a3a3a3]">{file.size}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 pl-2">
                            <button type="button" className="rounded-lg p-1.5 text-[#737373] transition-colors hover:bg-[#f5f5f5] hover:text-[#171717] dark:text-[#a3a3a3] dark:hover:bg-[#2a2a2a] dark:hover:text-[#f5f5f5]">
                              <Upload className="h-4 w-4 rotate-180" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => setAttachmentsList((prev) => prev.filter((a) => a.id !== file.id))}
                              className="rounded-lg p-1.5 text-[#737373] transition-colors hover:bg-[#fee2e2] hover:text-[#f32c2c] dark:text-[#a3a3a3] dark:hover:bg-[#311514] dark:hover:text-[#f32c2c]"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button type="button" className="rounded-lg p-1.5 text-[#737373] transition-colors hover:bg-[#f5f5f5] hover:text-[#171717] dark:text-[#a3a3a3] dark:hover:bg-[#2a2a2a] dark:hover:text-[#f5f5f5]">
                              <ChevronDown className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

      {/* ── Fixed color picker popup ─────────────────────────────────────── */}
      {showDetailColorPicker && (
        <div
          className="fixed z-[500] flex flex-nowrap gap-1.5 rounded-xl border border-[#e5e5e5] bg-white p-2 shadow-xl dark:border-[#2a2a2a] dark:bg-[#1e1e1e]"
          style={{ top: detailColorPickerPos.top, left: detailColorPickerPos.left }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {TEXT_COLORS.map((color) => (
            <button
              key={color}
              onMouseDown={(e) => {
                e.preventDefault();
                setDetailTextColor(color);
                applyFormatDetail('foreColor', color);
                setShowDetailColorPicker(false);
              }}
              className="h-5 w-5 shrink-0 rounded-full transition-transform hover:scale-110"
              style={{
                backgroundColor: color,
                boxShadow:
                  detailTextColor === color
                    ? '0 0 0 2px #171717'
                    : color === '#ffffff'
                    ? '0 0 0 1.5px #d4d4d4'
                    : '0 0 0 1.5px transparent',
              }}
              title={color}
            />
          ))}
        </div>
      )}

      {/* ── Fixed highlight picker popup ─────────────────────────────────── */}
      {showDetailHighlightPicker && (
        <div
          className="fixed z-[500] flex flex-nowrap gap-1.5 rounded-xl border border-[#e5e5e5] bg-white p-2 shadow-xl dark:border-[#2a2a2a] dark:bg-[#1e1e1e]"
          style={{ top: detailHighlightPickerPos.top, left: detailHighlightPickerPos.left }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {HIGHLIGHT_COLORS.map(({ color, label }) => (
            <button
              key={color}
              onMouseDown={(e) => {
                e.preventDefault();
                setDetailHighlightColor(color);
                applyFormatDetail('backColor', color === 'transparent' ? 'transparent' : color);
                setShowDetailHighlightPicker(false);
              }}
              className="h-5 w-5 shrink-0 rounded-full transition-transform hover:scale-110"
              style={{
                backgroundColor: color === 'transparent' ? '#ffffff' : color,
                boxShadow:
                  detailHighlightColor === color
                    ? '0 0 0 2px #171717'
                    : '0 0 0 1.5px #d4d4d4',
              }}
              title={label}
            />
          ))}
        </div>
      )}
    </div>
  );
}
