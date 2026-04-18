import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bold,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  Columns3,
  Diamond,
  FileText,
  FileType,
  Image,
  ImagePlus,
  Italic,
  Paperclip,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Type,
  Upload,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { AvatarStack } from '../shared/AvatarStack';
import {
  buildTaskDueDateValue,
  formatTaskDueDate,
  getTaskDueDateInputParts,
} from '../../utils/taskDueDate';
import { isRichTextEmpty, toDisplayRichTextHtml } from '../../utils/richText';
import type {
  TaskAssignee,
  TaskAttachment,
  TaskSubtask,
  WorkflowStatus,
} from '../../../domain/kanban/contracts';
import {
  MOCK_TASK_FORM_ATTACHMENTS,
  MOCK_TASK_FORM_CLIENTS,
  MOCK_TASK_FORM_COLUMNS,
  MOCK_TASK_FORM_TEAM,
  type TaskFormColumnOption,
} from '../../../mocks/taskForm';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId?: string;
  columns?: TaskFormColumnOption[];
  defaultColumnId?: string;
  onCreateTask?: (payload: CreateTaskSubmitData) => void;
  initialTask?: CreateTaskInitialData | null;
  mode?: 'create' | 'edit';
}

export type TaskFormSubtask = TaskSubtask;

export type TaskFormAttachment = TaskAttachment;

export interface CreateTaskSubmitData {
  taskId?: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  credits: number;
  client: string;
  assignees: TaskAssignee[];
  tags: TagItem[];
  subtasks: TaskFormSubtask[];
  attachments: TaskFormAttachment[];
  /** Data URL da imagem de capa — null quando sem capa */
  coverImage: string | null;
}

export interface CreateTaskInitialData extends Partial<CreateTaskSubmitData> {}


import { PRIORITY_OPTIONS, WORKFLOW_STAGE_LABELS, TAG_PALETTE_CREATE as TAG_PALETTE, FONT_SIZES, TEXT_COLORS } from '../../data/taskForm';

type TagColor = (typeof TAG_PALETTE)[number];

interface TagItem {
  label: string;
  color: TagColor;
}


function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getFileIcon(type: TaskFormAttachment['type']) {
  if (type === 'pdf') return FileText;
  if (type === 'image') return Image;
  return FileType;
}

function getFileColor(type: TaskFormAttachment['type']) {
  if (type === 'pdf') return '#f32c2c';
  if (type === 'image') return '#019364';
  return '#3b82f6';
}

export function CreateTaskModal({
  isOpen,
  onClose,
  boardId = 'design-system-board',
  columns,
  defaultColumnId,
  onCreateTask,
  initialTask,
  mode = 'create',
}: CreateTaskModalProps) {
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const columnSearchRef = useRef<HTMLInputElement>(null);
  const clientSearchRef = useRef<HTMLInputElement>(null);
  const assigneeSearchRef = useRef<HTMLInputElement>(null);

  const availableColumns = useMemo(
    () =>
      [...(columns?.length ? columns : MOCK_TASK_FORM_COLUMNS)].sort(
        (left, right) => left.order - right.order,
      ),
    [columns],
  );

  const resolvedDefaultColumnId = useMemo(() => {
    if (defaultColumnId && availableColumns.some((column) => column.id === defaultColumnId)) {
      return defaultColumnId;
    }
    return availableColumns.find((column) => column.baseStatus === 'todo')?.id || availableColumns[0]?.id || '';
  }, [availableColumns, defaultColumnId]);

  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [selectedColumnId, setSelectedColumnId] = useState(resolvedDefaultColumnId);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [columnSearch, setColumnSearch] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [credits, setCredits] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [client, setClient] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [tags, setTags] = useState<TagItem[]>([]);
  const [tagPickerKey, setTagPickerKey] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [fontSize, setFontSize] = useState('14px');
  const [textColor, setTextColor] = useState('#171717');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [subtasksEnabled, setSubtasksEnabled] = useState(false);
  const [subtasks, setSubtasks] = useState<TaskFormSubtask[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [attachments, setAttachments] = useState<TaskFormAttachment[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const [showCoverDropdown, setShowCoverDropdown] = useState(false);
  const [showInlineCoverDropdown, setShowInlineCoverDropdown] = useState(false);
  const [subtaskAssigneeTargetId, setSubtaskAssigneeTargetId] = useState<string | null>(null);
  const [subtaskDateTargetId, setSubtaskDateTargetId] = useState<string | null>(null);
  const [subtaskAssigneeSearch, setSubtaskAssigneeSearch] = useState('');

  const selectedColumn = useMemo(
    () => availableColumns.find((column) => column.id === selectedColumnId) || null,
    [availableColumns, selectedColumnId],
  );

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (titleInputRef.current) {
      titleInputRef.current.value = initialTask?.title ?? '';
    }
    if (descRef.current) {
      descRef.current.innerHTML = toDisplayRichTextHtml(initialTask?.description);
    }

    setPriority(initialTask?.priority ?? 'medium');
    setSelectedColumnId(initialTask?.columnId ?? resolvedDefaultColumnId);
    const dueDateParts = getTaskDueDateInputParts(initialTask?.dueDate);
    setDueDate(dueDateParts.date);
    setDueTime(dueDateParts.time);
    setCredits(initialTask?.credits !== undefined ? String(initialTask.credits) : '');
    setClient(initialTask?.client ?? '');
    setTags(initialTask?.tags ?? []);
    setSelectedAssignees(initialTask?.assignees?.map((member) => member.name) ?? []);
    setSubtasks(initialTask?.subtasks ?? []);
    setSubtasksEnabled(Boolean(initialTask?.subtasks?.length));
    setAttachments(initialTask?.attachments ?? []);
    setCoverImage(initialTask?.coverImage ?? null);
    setColumnSearch('');
    setClientSearch('');
    setAssigneeSearch('');
    setTagInput('');
    setTagPickerKey(null);
    setShowColumnDropdown(false);
    setShowClientDropdown(false);
    setShowAssigneeDropdown(false);
    setShowColorPicker(false);
    setSubtaskAssigneeTargetId(null);
    setSubtaskDateTargetId(null);
    setSubtaskAssigneeSearch('');
    setSubtaskInput('');
    setAiLoading(false);
  }, [initialTask, isOpen, resolvedDefaultColumnId]);

  if (!isOpen) return null;

  const filteredColumns = availableColumns.filter((column) =>
    column.name.toLowerCase().includes(columnSearch.toLowerCase()),
  );
  const filteredClients = MOCK_TASK_FORM_CLIENTS.filter((currentClient) =>
    currentClient.name.toLowerCase().includes(clientSearch.toLowerCase()),
  );
  const filteredTeam = MOCK_TASK_FORM_TEAM.filter((member) =>
    member.name.toLowerCase().includes(assigneeSearch.toLowerCase()),
  );
  const filteredSubtaskTeam = MOCK_TASK_FORM_TEAM.filter((member) =>
    member.name.toLowerCase().includes(subtaskAssigneeSearch.toLowerCase()),
  );

  const applyFormat = (command: string, value?: string) => {
    descRef.current?.focus();
    document.execCommand(command, false, value);
  };

  const addAttachment = () => {
    const nextAttachment =
      MOCK_TASK_FORM_ATTACHMENTS[attachments.length % MOCK_TASK_FORM_ATTACHMENTS.length];
    setAttachments((prev) =>
      prev.some((attachment) => attachment.id === nextAttachment.id) ? prev : [...prev, nextAttachment],
    );
  };

  const addCustomTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed || tags.length >= 5 || tags.some((tag) => tag.label === trimmed)) return;
    setTags((prev) => [...prev, { label: trimmed, color: TAG_PALETTE[7] }]);
    setTagInput('');
  };

  const changeTagColor = (index: number, color: TagColor) => {
    setTags((prev) => prev.map((tag, currentIndex) => (currentIndex === index ? { ...tag, color } : tag)));
    setTagPickerKey(null);
  };

  const toggleAssignee = (name: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(name) ? prev.filter((currentName) => currentName !== name) : [...prev, name],
    );
  };

  const addSubtask = () => {
    const trimmed = subtaskInput.trim();
    if (!trimmed) return;
    setSubtasks((prev) => [...prev, { id: `sub-${Date.now()}`, title: trimmed, done: false }]);
    setSubtaskInput('');
  };

  const updateSubtask = (subtaskId: string, updater: (current: TaskFormSubtask) => TaskFormSubtask) => {
    setSubtasks((prev) => prev.map((subtask) => (subtask.id === subtaskId ? updater(subtask) : subtask)));
  };

  const simulateAI = () => {
    setAiLoading(true);
    window.setTimeout(() => {
      setCredits('18');
      setAiLoading(false);
    }, 1200);
  };

  const handleCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    event.target.value = '';
  };

  const handleSubmit = () => {
    const title = titleInputRef.current?.value.trim() ?? '';
    const rawDescription = descRef.current?.innerHTML ?? '';
    const description = isRichTextEmpty(rawDescription) ? '' : rawDescription.trim();
    if (!title || !selectedColumnId) return;

    onCreateTask?.({
      taskId: initialTask?.taskId,
      boardId,
      columnId: selectedColumnId,
      title,
      description,
      priority,
      dueDate: buildTaskDueDateValue(dueDate, dueTime),
      credits: Number(credits) || 0,
      client,
      assignees: selectedAssignees.map((name) => ({ id: name, name })),
      tags,
      subtasks: subtasksEnabled ? subtasks.filter((subtask) => subtask.title.trim()) : [],
      attachments,
      coverImage,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex max-h-[92vh] w-full max-w-[600px] flex-col overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-2xl dark:border-[#2a2a2a] dark:bg-[#141414]">
        <div className="flex items-center justify-between border-b border-[#e5e5e5] px-6 py-4 dark:border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff5623]">
              {mode === 'edit' ? <Check className="h-4 w-4 text-white" /> : <Plus className="h-4 w-4 text-white" />}
            </div>
            <h2 className="text-[15px] font-bold text-[#171717] dark:text-[#f5f5f5]">
              {mode === 'edit' ? 'Editar tarefa' : 'Nova tarefa'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="rounded-lg p-1.5 transition-colors hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]">
              <X className="h-4 w-4 text-[#a3a3a3]" />
            </button>
          </div>
        </div>

        <div
          className="flex-1 space-y-5 overflow-y-auto px-6 py-5"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#d4d4d4 transparent' }}
          onClick={() => {
            setTagPickerKey(null);
            setShowColorPicker(false);
            setShowColumnDropdown(false);
            setShowClientDropdown(false);
            setShowAssigneeDropdown(false);
            setSubtaskAssigneeTargetId(null);
            setSubtaskDateTargetId(null);
            setShowCoverDropdown(false);
            setShowInlineCoverDropdown(false);
          }}
        >
          {/* ── Foto de Capa Preview ── */}
          {coverImage && (
            <div>
              <div className="group relative h-36 w-full rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a]">
                <img src={coverImage} alt="Capa da tarefa" className="h-full w-full object-cover rounded-xl" />
              <div className={`absolute inset-0 flex items-center justify-center gap-2 bg-black/40 rounded-xl transition-opacity ${showInlineCoverDropdown ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowInlineCoverDropdown(!showInlineCoverDropdown); }}
                    className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-[#171717] shadow transition-all hover:bg-white"
                  >
                    <Image className="h-3.5 w-3.5" /> Trocar
                  </button>
                  {showInlineCoverDropdown && (
                    <div className="absolute left-1/2 top-full mt-2 w-56 -translate-x-1/2 z-[200] rounded-xl border border-[#e5e5e5] bg-white p-2 shadow-xl dark:border-[#2a2a2a] dark:bg-[#1e1e1e]" onClick={(e) => e.stopPropagation()}>
                      <button 
                        type="button"
                        onClick={() => { coverImageInputRef.current?.click(); setShowInlineCoverDropdown(false); }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] hover:bg-[#f5f5f5] dark:hover:bg-[#232325]"
                      >
                        <Upload className="h-4 w-4" />
                        Enviar do computador
                      </button>
                      {attachments.filter(a => a.type === 'image' || a.name.endsWith('.jpg') || a.name.endsWith('.png')).length > 0 && (
                        <>
                          <div className="my-1 h-px bg-[#e5e5e5] dark:bg-[#2a2a2a]" />
                          <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">Dos anexos</p>
                          {attachments.filter(a => a.type === 'image' || a.name.endsWith('.jpg') || a.name.endsWith('.png')).map(a => (
                            <button 
                              key={a.id}
                              type="button"
                              onClick={() => {
                                setCoverImage('/src/assets/task-cover-demo.png');
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
                  onClick={() => { setCoverImage(null); setShowInlineCoverDropdown(false); setShowCoverDropdown(false); }}
                  className="flex items-center gap-1.5 rounded-lg bg-[#f32c2c]/90 px-3 py-1.5 text-[11px] font-semibold text-white shadow transition-all hover:bg-[#f32c2c]"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remover
                </button>
              </div>
              </div>
            </div>
          )}

          <input
            ref={coverImageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverImageChange}
          />

          {/* ── Add Cover Button (sem capa) ── */}
          {!coverImage && (
            <button
              type="button"
              onClick={() => coverImageInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#d4d4d4] bg-[#fafafa]/50 py-3 text-[12px] font-semibold text-[#a3a3a3] transition-colors hover:border-[#ff5623]/50 hover:bg-[#fff8f6] hover:text-[#ff5623] dark:border-[#2a2a2a] dark:bg-[#1e1e1e]/50 dark:hover:border-[#ff5623]/40 dark:hover:text-[#ff8c69]"
            >
              <ImagePlus className="h-4 w-4" /> Adicionar capa
            </button>
          )}

          <div>
            <label className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
              <Type className="h-3 w-3" /> Título
            </label>
            <input
              ref={titleInputRef}
              type="text"
              placeholder="Ex: Criar tela de login"
              defaultValue={initialTask?.title ?? ''}
              className="h-10 w-full rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-4 text-sm text-[#171717] placeholder:text-[#d4d4d4] transition-all focus:border-[#ff5623] focus:outline-none focus:ring-2 focus:ring-[#ff5623]/20 dark:border-[#2a2a2a] dark:bg-[#1e1e1e] dark:text-[#f5f5f5] dark:placeholder:text-[#525252]"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">Descrição</label>
            <div className="flex items-center gap-1 rounded-t-xl border border-b-0 border-[#e5e5e5] bg-[#fafafa] px-3 py-2 dark:border-[#2a2a2a] dark:bg-[#1e1e1e]">
              <button onMouseDown={(event) => { event.preventDefault(); applyFormat('bold'); }} className="rounded-lg p-1.5 transition-colors hover:bg-[#e5e5e5] dark:hover:bg-[#2a2a2a]">
                <Bold className="h-3.5 w-3.5 text-[#525252] dark:text-[#a3a3a3]" />
              </button>
              <button onMouseDown={(event) => { event.preventDefault(); applyFormat('italic'); }} className="rounded-lg p-1.5 transition-colors hover:bg-[#e5e5e5] dark:hover:bg-[#2a2a2a]">
                <Italic className="h-3.5 w-3.5 text-[#525252] dark:text-[#a3a3a3]" />
              </button>
              <div className="mx-1 h-4 w-px bg-[#e5e5e5] dark:bg-[#2a2a2a]" />
              <select
                value={fontSize}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setFontSize(nextValue);
                  applyFormat('fontSize', nextValue === '12px' ? '1' : nextValue === '14px' ? '2' : nextValue === '16px' ? '3' : nextValue === '18px' ? '4' : nextValue === '20px' ? '5' : '6');
                }}
                className="h-6 rounded-lg border border-[#e5e5e5] bg-transparent px-1.5 text-[11px] font-semibold text-[#525252] focus:outline-none dark:border-[#2a2a2a] dark:text-[#a3a3a3]"
              >
                {FONT_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <div className="mx-1 h-4 w-px bg-[#e5e5e5] dark:bg-[#2a2a2a]" />
              <div className="relative" onClick={(event) => event.stopPropagation()}>
                <button
                  onMouseDown={(event) => {
                    event.preventDefault();
                    setShowColorPicker((current) => !current);
                  }}
                  className="flex items-center gap-1.5 rounded-lg p-1.5 transition-colors hover:bg-[#e5e5e5] dark:hover:bg-[#2a2a2a]"
                >
                  <span className="text-sm font-bold" style={{ color: textColor }}>A</span>
                  <div className="h-1.5 w-3 rounded-sm" style={{ backgroundColor: textColor }} />
                </button>
                {showColorPicker && (
                  <div className="absolute left-0 top-8 z-50 flex gap-1.5 rounded-xl border border-[#e5e5e5] bg-white p-2 shadow-xl dark:border-[#2a2a2a] dark:bg-[#1e1e1e]">
                    {TEXT_COLORS.map((color) => (
                      <button
                        key={color}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          setTextColor(color);
                          applyFormat('foreColor', color);
                          setShowColorPicker(false);
                        }}
                        className="h-5 w-5 rounded-full border-2 transition-transform hover:scale-110"
                        style={{ backgroundColor: color, borderColor: textColor === color ? '#171717' : 'transparent' }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div
              ref={descRef}
              contentEditable
              suppressContentEditableWarning
              data-placeholder="Descreva o que precisa ser feito..."
              className="min-h-[120px] rounded-b-xl border border-[#e5e5e5] bg-[#fafafa] px-4 py-3 text-sm text-[#171717] transition-all empty:before:pointer-events-none empty:before:text-[#d4d4d4] empty:before:content-[attr(data-placeholder)] focus:border-[#ff5623] focus:outline-none focus:ring-2 focus:ring-[#ff5623]/20 dark:border-[#2a2a2a] dark:bg-[#1e1e1e] dark:text-[#f5f5f5] dark:empty:before:text-[#525252]"
              style={{ fontSize }}
            />
          </div>

          <div>
            <button onClick={() => setSubtasksEnabled((current) => !current)} className="flex w-full items-center gap-2 group">
              <div className={`flex h-4 w-8 items-center rounded-full px-0.5 transition-colors ${subtasksEnabled ? 'bg-[#ff5623]' : 'bg-[#e5e5e5] dark:bg-[#3a3a3a]'}`}>
                <div className={`h-3 w-3 rounded-full bg-white shadow-sm transition-transform ${subtasksEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3] transition-colors group-hover:text-[#525252]">Subtarefas</span>
            </button>

            {subtasksEnabled && (
              <div className="mt-3 space-y-2">
                {subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="relative rounded-2xl border border-[#ececec] bg-[#fafafa] px-3 py-2.5 dark:border-[#2a2a2a] dark:bg-[#1a1a1a]"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          updateSubtask(subtask.id, (current) => ({ ...current, done: !current.done }));
                        }}
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
                        onChange={(event) => updateSubtask(subtask.id, (current) => ({ ...current, title: event.target.value }))}
                        placeholder="Descreva a subtarefa"
                        className={`flex-1 bg-transparent text-[13px] focus:outline-none ${subtask.done ? 'line-through text-[#a3a3a3]' : 'text-[#171717] dark:text-[#f5f5f5]'}`}
                      />
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setSubtaskDateTargetId(null);
                          setSubtaskAssigneeTargetId((current) => (current === subtask.id ? null : subtask.id));
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-[#e5e5e5] bg-white px-2 py-1 text-[11px] font-medium text-[#737373] transition-colors hover:border-[#ff5623]/40 hover:text-[#ff5623] dark:border-[#2f2f2f] dark:bg-[#171717] dark:text-[#b8b8bc]"
                      >
                        {subtask.assignee ? (
                          <>
                            <span className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: MOCK_TASK_FORM_TEAM.find((member) => member.name === subtask.assignee?.name)?.color || '#ff5623' }}>
                              {getInitials(subtask.assignee.name)}
                            </span>
                            <span className="max-w-[72px] truncate">{subtask.assignee.name.split(' ')[0]}</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-3 w-3" />
                            <span>Atribuir</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSubtaskAssigneeTargetId(null);
                          setSubtaskDateTargetId((current) => (current === subtask.id ? null : subtask.id));
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-[#e5e5e5] bg-white px-2 py-1 text-[11px] font-medium text-[#737373] transition-colors hover:border-[#ff5623]/40 hover:text-[#ff5623] dark:border-[#2f2f2f] dark:bg-[#171717] dark:text-[#b8b8bc]"
                      >
                        <Calendar className="h-3 w-3" />
                        <span>{subtask.dueDate ? formatTaskDueDate(subtask.dueDate) : 'Data'}</span>
                      </button>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setSubtasks((prev) => prev.filter((current) => current.id !== subtask.id));
                        }}
                        className="rounded-lg p-1 text-[#a3a3a3] transition-colors hover:bg-[#f32c2c]/10 hover:text-[#f32c2c]"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    {subtaskAssigneeTargetId === subtask.id && (
                      <div
                        className="mt-2 rounded-xl border border-[#e5e5e5] bg-white p-2 shadow-lg dark:border-[#2a2a2a] dark:bg-[#171717]"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <div className="mb-2 flex items-center gap-2 rounded-lg bg-[#fafafa] px-2 dark:bg-[#1f1f20]">
                          <Search className="h-3.5 w-3.5 text-[#a3a3a3]" />
                          <input
                            autoFocus
                            type="text"
                            value={subtaskAssigneeSearch}
                            onChange={(event) => setSubtaskAssigneeSearch(event.target.value)}
                            placeholder="Buscar responsável..."
                            className="h-8 flex-1 bg-transparent text-sm text-[#171717] outline-none placeholder:text-[#c7c7c7] dark:text-[#f5f5f5]"
                          />
                        </div>
                        <div className="max-h-[160px] space-y-1 overflow-y-auto">
                          {filteredSubtaskTeam.map((member) => (
                            <button
                              key={`${subtask.id}-${member.name}`}
                              onClick={() => {
                                updateSubtask(subtask.id, (current) => ({ ...current, assignee: { id: member.name, name: member.name } }));
                                setSubtaskAssigneeTargetId(null);
                                setSubtaskAssigneeSearch('');
                              }}
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
                    {subtaskDateTargetId === subtask.id && (
                      <div
                        className="mt-2 flex items-center gap-2 rounded-xl border border-[#e5e5e5] bg-white p-2 shadow-lg dark:border-[#2a2a2a] dark:bg-[#171717]"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <input
                          type="date"
                          value={getTaskDueDateInputParts(subtask.dueDate).date}
                          onChange={(event) => {
                            updateSubtask(subtask.id, (current) => ({
                              ...current,
                              dueDate: buildTaskDueDateValue(event.target.value, getTaskDueDateInputParts(current.dueDate).time),
                            }));
                            setSubtaskDateTargetId(null);
                          }}
                          className="h-9 flex-1 rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-3 text-sm text-[#171717] outline-none focus:border-[#ff5623] dark:border-[#2a2a2a] dark:bg-[#1f1f20] dark:text-[#f5f5f5]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            updateSubtask(subtask.id, (current) => ({ ...current, dueDate: '' }));
                            setSubtaskDateTargetId(null);
                          }}
                          className="rounded-lg px-2 py-1.5 text-[11px] font-semibold text-[#a3a3a3] transition-colors hover:bg-[#f5f5f5] hover:text-[#525252] dark:hover:bg-[#202021]"
                        >
                          Limpar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 shrink-0 rounded-[4px] border-2 border-dashed border-[#d4d4d4] dark:border-[#3a3a3a]" />
                  <input
                    type="text"
                    value={subtaskInput}
                    onChange={(event) => setSubtaskInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addSubtask();
                      }
                    }}
                    placeholder="Adicionar subtarefa... (Enter)"
                    className="flex-1 bg-transparent text-[13px] text-[#171717] placeholder:text-[#d4d4d4] focus:outline-none dark:text-[#f5f5f5] dark:placeholder:text-[#525252]"
                  />
                </div>
                {subtasks.length > 0 && (
                  <p className="pt-0.5 text-[10px] text-[#a3a3a3]">
                    {subtasks.filter((subtask) => subtask.done).length}/{subtasks.length} concluídas
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Anexos ── */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
                <Paperclip className="h-3 w-3" /> Anexos
              </label>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f5f5f5] text-[10px] font-bold text-[#737373] dark:bg-[#2a2a2a] dark:text-[#a3a3a3]">
                {attachments.length}
              </span>
            </div>

            <div 
              className="mb-3 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#d4d4d4] bg-[#fafafa]/50 p-6 transition-colors hover:border-[#ff5623]/50 hover:bg-[#fff8f6] dark:border-[#2a2a2a] dark:bg-[#1e1e1e]/50 cursor-pointer"
              onClick={() => {
                // Mock upload addition logic
                const newAttachment = {
                   id: Math.random().toString(),
                   name: 'novo_arquivo_selecionado.jpg',
                   type: 'image' as const,
                   size: '1.2 MB'
                };
                setAttachments(prev => [...prev, newAttachment]);
              }}
            >
              <Upload className="mb-2 h-5 w-5 text-[#737373] dark:text-[#a3a3a3]" />
              <p className="text-sm font-semibold text-[#171717] dark:text-[#f5f5f5]">Clique ou arraste arquivos para anexar</p>
              <p className="mt-1 text-[11px] text-[#a3a3a3]">Até 25.0 MB por arquivo</p>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((file) => (
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
                        onClick={() => setAttachments(prev => prev.filter(a => a.id !== file.id))}
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

          <div>
            <label className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">Prioridade</label>
            <div className="flex flex-wrap gap-1.5">
              {PRIORITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPriority(option.value)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${priority === option.value ? `${option.activeBg} text-white shadow-sm` : `${option.passiveBg} ${option.passiveText} hover:opacity-80`}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative" onClick={(event) => event.stopPropagation()}>
              <label className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
                <Columns3 className="h-3 w-3" /> Coluna inicial
              </label>
              <button
                onClick={() => {
                  setShowColumnDropdown((current) => !current);
                  window.setTimeout(() => columnSearchRef.current?.focus(), 20);
                }}
                className="flex h-10 w-full items-center justify-between rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-4 text-sm transition-all hover:border-[#ff5623]/50 focus:outline-none focus:ring-2 focus:ring-[#ff5623]/20 dark:border-[#2a2a2a] dark:bg-[#1e1e1e]"
              >
                <span className={selectedColumn ? 'font-medium text-[#171717] dark:text-[#f5f5f5]' : 'text-[#d4d4d4] dark:text-[#525252]'}>
                  {selectedColumn?.name || 'Selecionar coluna...'}
                </span>
                <ChevronDown className={`h-4 w-4 text-[#a3a3a3] transition-transform ${showColumnDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showColumnDropdown && (
                <div className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-xl dark:border-[#2a2a2a] dark:bg-[#1e1e1e]">
                  <div className="border-b border-[#f5f5f5] p-2 dark:border-[#2a2a2a]">
                    <div className="flex items-center gap-2 px-2">
                      <Search className="h-3.5 w-3.5 shrink-0 text-[#a3a3a3]" />
                      <input
                        ref={columnSearchRef}
                        type="text"
                        value={columnSearch}
                        onChange={(event) => setColumnSearch(event.target.value)}
                        placeholder="Buscar coluna..."
                        className="flex-1 bg-transparent text-sm text-[#171717] placeholder:text-[#d4d4d4] focus:outline-none dark:text-[#f5f5f5]"
                      />
                    </div>
                  </div>
                  <div className="max-h-[180px] overflow-y-auto py-1">
                    {filteredColumns.map((column) => (
                      <button
                        key={column.id}
                        onClick={() => {
                          setSelectedColumnId(column.id);
                          setShowColumnDropdown(false);
                          setColumnSearch('');
                        }}
                        className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]"
                      >
                        <div>
                          <p className="text-sm font-medium text-[#171717] dark:text-[#f5f5f5]">{column.name}</p>
                          <p className="text-[10px] text-[#a3a3a3]">Etapa: {WORKFLOW_STAGE_LABELS[column.baseStatus]}</p>
                        </div>
                        {selectedColumnId === column.id && <Check className="h-4 w-4 text-[#ff5623]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" onClick={(event) => event.stopPropagation()}>
              <label className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
                <Building2 className="h-3 w-3" /> Cliente
              </label>
              <button
                onClick={() => {
                  setShowClientDropdown((current) => !current);
                  window.setTimeout(() => clientSearchRef.current?.focus(), 20);
                }}
                className="flex h-10 w-full items-center justify-between rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-4 text-sm transition-all hover:border-[#ff5623]/50 focus:outline-none focus:ring-2 focus:ring-[#ff5623]/20 dark:border-[#2a2a2a] dark:bg-[#1e1e1e]"
              >
                <span className={client ? 'font-medium text-[#171717] dark:text-[#f5f5f5]' : 'text-[#d4d4d4] dark:text-[#525252]'}>
                  {client || 'Selecionar cliente...'}
                </span>
                <ChevronDown className={`h-4 w-4 text-[#a3a3a3] transition-transform ${showClientDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showClientDropdown && (
                <div className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-xl dark:border-[#2a2a2a] dark:bg-[#1e1e1e]">
                  <div className="border-b border-[#f5f5f5] p-2 dark:border-[#2a2a2a]">
                    <div className="flex items-center gap-2 px-2">
                      <Search className="h-3.5 w-3.5 shrink-0 text-[#a3a3a3]" />
                      <input
                        ref={clientSearchRef}
                        type="text"
                        value={clientSearch}
                        onChange={(event) => setClientSearch(event.target.value)}
                        placeholder="Buscar cliente..."
                        className="flex-1 bg-transparent text-sm text-[#171717] placeholder:text-[#d4d4d4] focus:outline-none dark:text-[#f5f5f5]"
                      />
                    </div>
                  </div>
                  <div className="max-h-[180px] overflow-y-auto py-1">
                    {filteredClients.map((currentClient) => (
                      <button
                        key={currentClient.name}
                        onClick={() => {
                          setClient(currentClient.name);
                          setShowClientDropdown(false);
                          setClientSearch('');
                        }}
                        className="flex w-full items-center justify-between px-4 py-2.5 transition-colors hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff5623] text-[10px] font-bold text-white">
                            {currentClient.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-[#171717] dark:text-[#f5f5f5]">{currentClient.name}</span>
                        </div>
                        <span className="text-[10px] text-[#a3a3a3]">{currentClient.sector}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div onClick={(event) => event.stopPropagation()}>
              <label className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
                <Tag className="h-3 w-3" /> Tags
              </label>
              <div
                className="flex min-h-[40px] cursor-text flex-wrap items-center gap-1.5 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 transition-all focus-within:border-[#ff5623] focus-within:ring-2 focus-within:ring-[#ff5623]/20 dark:border-[#2a2a2a] dark:bg-[#1e1e1e]"
                style={{ overflow: 'visible' }}
                onClick={() => tagInputRef.current?.focus()}
              >
                {tags.map((tag, index) => {
                  const pickerKey = `tag-${index}`;
                  return (
                    <div key={tag.label} className="relative flex shrink-0 items-center rounded-md" style={{ backgroundColor: tag.color.bg }}>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setTagPickerKey(tagPickerKey === pickerKey ? null : pickerKey);
                        }}
                        className="pl-2 pr-1 py-0.5 text-[11px] font-semibold transition-opacity hover:opacity-80"
                        style={{ color: tag.color.text }}
                      >
                        {tag.label}
                      </button>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setTags((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
                        }}
                        className="pl-0.5 pr-1.5 py-0.5 transition-opacity hover:opacity-60"
                        style={{ color: tag.color.text }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {tagPickerKey === pickerKey && (
                        <div className="absolute left-0 top-full z-[200] mt-1.5 rounded-xl border border-[#e5e5e5] bg-white p-2 shadow-xl dark:border-[#2a2a2a] dark:bg-[#1e1e1e]" style={{ minWidth: '120px' }} onClick={(event) => event.stopPropagation()}>
                          <p className="mb-1.5 px-1 text-[9px] font-semibold uppercase tracking-wider text-[#a3a3a3]">Cor da tag</p>
                          <div className="grid grid-cols-4 gap-1.5">
                            {TAG_PALETTE.map((color) => (
                              <button
                                key={color.bg}
                                onClick={() => changeTagColor(index, color)}
                                className="h-6 w-6 rounded-lg border-2 transition-transform hover:scale-110"
                                style={{ backgroundColor: color.bg, borderColor: tag.color.bg === color.bg ? '#171717' : 'transparent' }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {tags.length < 5 && (
                  <input
                    ref={tagInputRef}
                    type="text"
                    value={tagInput}
                    onChange={(event) => setTagInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addCustomTag();
                      }
                    }}
                    placeholder={tags.length === 0 ? 'Adicionar tag... (Enter)' : ''}
                    className="min-w-[100px] flex-1 bg-transparent text-sm text-[#171717] placeholder:text-[#d4d4d4] focus:outline-none dark:text-[#f5f5f5] dark:placeholder:text-[#525252]"
                  />
                )}
              </div>
              {tags.length >= 5 && <p className="mt-1 text-[10px] text-[#a3a3a3]">Limite de 5 tags atingido.</p>}
            </div>

            <div className="relative" onClick={(event) => event.stopPropagation()}>
              <label className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
                <Users className="h-3 w-3" /> Responsáveis
              </label>
              <div className="flex min-h-[40px] items-center gap-2 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 dark:border-[#2a2a2a] dark:bg-[#1e1e1e]">
                <button
                  onClick={() => {
                    setShowAssigneeDropdown((current) => !current);
                    window.setTimeout(() => assigneeSearchRef.current?.focus(), 20);
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashed border-[#d4d4d4] text-[#737373] transition-colors hover:border-[#ff5623]/50 hover:text-[#ff5623] dark:border-[#3a3a3a] dark:text-[#b8b8bc]"
                >
                  <Plus className="h-4 w-4" />
                </button>
                {selectedAssignees.length > 0 ? (
                  <div className="flex flex-1 items-center justify-between gap-2">
                    <AvatarStack avatars={selectedAssignees.map((name) => ({ name }))} size="sm" max={6} />
                    <button onClick={() => setSelectedAssignees([])} className="text-[11px] font-medium text-[#a3a3a3] transition-colors hover:text-[#f32c2c]">
                      Limpar
                    </button>
                  </div>
                ) : (
                  <span className="text-sm text-[#b8b8bc]">Adicionar responsáveis</span>
                )}
              </div>
              {showAssigneeDropdown && (
                <div className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-xl dark:border-[#2a2a2a] dark:bg-[#1e1e1e]">
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
                      const isSelected = selectedAssignees.includes(member.name);
                      return (
                        <button
                          key={member.name}
                          onClick={() => toggleAssignee(member.name)}
                          className={`flex w-full items-center justify-between px-4 py-2.5 transition-colors ${isSelected ? 'bg-[#ff5623]/5' : 'hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]'}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: member.color }}>
                              {getInitials(member.name)}
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-medium text-[#171717] dark:text-[#f5f5f5]">{member.name}</p>
                              <p className="text-[10px] text-[#a3a3a3]">{member.role}</p>
                            </div>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-[#ff5623]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
                <Calendar className="h-3 w-3" /> Data de entrega
              </label>
              <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-2">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="h-10 w-full rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-4 text-sm text-[#171717] transition-all focus:border-[#ff5623] focus:outline-none focus:ring-2 focus:ring-[#ff5623]/20 dark:border-[#2a2a2a] dark:bg-[#1e1e1e] dark:text-[#f5f5f5]"
                />
                <input
                  type="time"
                  value={dueTime}
                  onChange={(event) => setDueTime(event.target.value)}
                  className="h-10 w-full rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3 text-sm text-[#171717] transition-all focus:border-[#ff5623] focus:outline-none focus:ring-2 focus:ring-[#ff5623]/20 dark:border-[#2a2a2a] dark:bg-[#1e1e1e] dark:text-[#f5f5f5]"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
                <Diamond className="h-3 w-3 text-[#b45309]" /> Créditos
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  value={credits}
                  onChange={(event) => setCredits(event.target.value)}
                  placeholder="0"
                  className="h-10 flex-1 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-4 text-sm text-[#171717] placeholder:text-[#d4d4d4] transition-all focus:border-[#ff5623] focus:outline-none focus:ring-2 focus:ring-[#ff5623]/20 dark:border-[#2a2a2a] dark:bg-[#1e1e1e] dark:text-[#f5f5f5] dark:placeholder:text-[#525252]"
                />
                <button
                  onClick={simulateAI}
                  disabled={aiLoading}
                  title="Calcular créditos com IA"
                  className={`flex h-10 items-center gap-1.5 rounded-xl px-3 text-[11px] font-semibold transition-all ${aiLoading ? 'cursor-wait bg-[#987dfe]/10 text-[#987dfe]' : 'bg-[#987dfe]/10 text-[#987dfe] hover:bg-[#987dfe]/20'}`}
                >
                  <Sparkles className={`h-3.5 w-3.5 ${aiLoading ? 'animate-pulse' : ''}`} />
                  {aiLoading ? 'IA...' : 'IA'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#e5e5e5] bg-white px-6 py-4 dark:border-[#2a2a2a] dark:bg-[#141414]">
          <button onClick={onClose} className="rounded-xl bg-[#f5f5f5] px-4 py-2 text-sm font-semibold text-[#525252] transition-colors hover:bg-[#e5e5e5] dark:bg-[#2a2a2a] dark:text-[#a3a3a3] dark:hover:bg-[#333]">
            Cancelar
          </button>
          <button onClick={handleSubmit} className="flex items-center gap-1.5 rounded-xl bg-[#ff5623] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#c2410c]">
            {mode === 'edit' ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {mode === 'edit' ? 'Salvar tarefa' : 'Criar tarefa'}
          </button>
        </div>
      </div>
    </div>
  );
}
