import { useState, useRef, useEffect } from 'react';
import {
  X,
  Calendar,
  Plus,
  Tag,
  Users,
  Type,
  Building2,
  Paperclip,
  Bold,
  Italic,
  Sparkles,
  Check,
  ChevronDown,
  Search,
  FileText,
  Image,
  FileType,
} from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRIORITY_OPTIONS = [
  { value: 'low',    label: 'Baixa',   activeBg: 'bg-[#16a34a]',  passiveBg: 'bg-[#dcfce7]',  passiveText: 'text-[#16a34a]' },
  { value: 'medium', label: 'Média',   activeBg: 'bg-[#ea580c]',  passiveBg: 'bg-[#ffedd5]',  passiveText: 'text-[#ea580c]' },
  { value: 'high',   label: 'Alta',    activeBg: 'bg-[#dc2626]',  passiveBg: 'bg-[#fee2e2]',  passiveText: 'text-[#dc2626]' },
  { value: 'urgent', label: 'Urgente', activeBg: 'bg-[#a21caf]',  passiveBg: 'bg-[#fae8ff]',  passiveText: 'text-[#a21caf]' },
];

const STATUS_OPTIONS = [
  { value: 'todo',        label: 'A fazer',      activeBg: 'bg-[#525252]',  passiveBg: 'bg-[#f5f5f5]',       passiveText: 'text-[#525252]' },
  { value: 'in-progress', label: 'Em progresso', activeBg: 'bg-[#987dfe]',  passiveBg: 'bg-[#987dfe]/10',    passiveText: 'text-[#987dfe]' },
  { value: 'review',      label: 'Revisão',      activeBg: 'bg-[#ca8a04]',  passiveBg: 'bg-[#feba31]/10',    passiveText: 'text-[#feba31]' },
  { value: 'completed',   label: 'Concluído',    activeBg: 'bg-[#019364]',  passiveBg: 'bg-[#019364]/10',    passiveText: 'text-[#019364]' },
];

const TAG_PALETTE = [
  { bg: '#ff5623', text: '#ffffff', label: 'Laranja' },
  { bg: '#feba31', text: '#7c3a00', label: 'Amarelo' },
  { bg: '#019364', text: '#ffffff', label: 'Verde' },
  { bg: '#987dfe', text: '#ffffff', label: 'Roxo' },
  { bg: '#3b82f6', text: '#ffffff', label: 'Azul' },
  { bg: '#f32c2c', text: '#ffffff', label: 'Vermelho' },
  { bg: '#ffbee9', text: '#9d174d', label: 'Rosa' },
  { bg: '#e5e5e5', text: '#525252', label: 'Cinza' },
];

const TAG_SUGGESTIONS = [
  { label: 'Design',       color: TAG_PALETTE[2] },
  { label: 'Frontend',     color: TAG_PALETTE[4] },
  { label: 'Backend',      color: TAG_PALETTE[3] },
  { label: 'UX',           color: TAG_PALETTE[0] },
  { label: 'Mobile',       color: TAG_PALETTE[1] },
  { label: 'API',          color: TAG_PALETTE[5] },
  { label: 'Testes',       color: TAG_PALETTE[6] },
  { label: 'Documentação', color: TAG_PALETTE[7] },
];

const MOCK_TEAM = [
  { name: 'Ana Silva',      role: 'Gestora de Projetos',  color: '#ff5623' },
  { name: 'Carlos Lima',    role: 'Desenvolvedor Frontend', color: '#987dfe' },
  { name: 'Mariana Costa',  role: 'Designer UI/UX',       color: '#019364' },
  { name: 'Rafael Santos',  role: 'Desenvolvedor Backend', color: '#3b82f6' },
  { name: 'Julia Ferreira', role: 'QA Engineer',           color: '#f32c2c' },
  { name: 'Pedro Alves',    role: 'Product Manager',       color: '#feba31' },
];

const MOCK_CLIENTS = [
  { name: 'Acme Corp',  sector: 'Tecnologia' },
  { name: 'Nubank',     sector: 'Fintech' },
  { name: 'iFood',      sector: 'Delivery' },
  { name: 'Vivo',       sector: 'Telecom' },
  { name: 'WePlanner',  sector: 'SaaS' },
  { name: 'Nike Brasil',sector: 'Moda' },
  { name: 'Ambev',      sector: 'Bebidas' },
];

const STATUS_COLOR_PALETTE = [
  { hex: '#525252', label: 'Cinza' },
  { hex: '#987dfe', label: 'Roxo' },
  { hex: '#ca8a04', label: 'Dourado' },
  { hex: '#019364', label: 'Verde' },
  { hex: '#3b82f6', label: 'Azul' },
  { hex: '#f32c2c', label: 'Vermelho' },
  { hex: '#ff5623', label: 'Laranja' },
  { hex: '#a21caf', label: 'Violeta' },
  { hex: '#0d9488', label: 'Teal' },
  { hex: '#65a30d', label: 'Lima' },
  { hex: '#f43f5e', label: 'Rosa' },
  { hex: '#0ea5e9', label: 'Ciano' },
];

const MOCK_ATTACHMENTS = [
  { id: '1', name: 'briefing-campanha.pdf',       type: 'pdf'   as const, size: '2.4 MB' },
  { id: '2', name: 'wireframe-v2.png',             type: 'image' as const, size: '1.8 MB' },
  { id: '3', name: 'especificacao-tecnica.docx',   type: 'doc'   as const, size: '340 KB' },
  { id: '4', name: 'logo-cliente.png',             type: 'image' as const, size: '256 KB' },
  { id: '5', name: 'referencias-design.pdf',       type: 'pdf'   as const, size: '5.1 MB' },
];

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px'];
const TEXT_COLORS = ['#171717', '#ff5623', '#019364', '#987dfe', '#3b82f6', '#f32c2c', '#ca8a04'];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

interface TagItem {
  label: string;
  color: typeof TAG_PALETTE[number];
}

interface CustomStatus {
  value: string;
  label: string;
  color: string;
  editing?: boolean;
}

interface AttachmentItem {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'doc';
  size: string;
}

export function CreateTaskModal({ isOpen, onClose }: CreateTaskModalProps) {
  const descRef = useRef<HTMLDivElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const [priority, setPriority]               = useState('medium');
  const [status, setStatus]                   = useState('todo');
  const [dueDate, setDueDate]                 = useState('');
  const [credits, setCredits]                 = useState('');
  const [aiLoading, setAiLoading]             = useState(false);
  const [client, setClient]                   = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientSearch, setClientSearch]       = useState('');
  const [tags, setTags]                       = useState<TagItem[]>([]);
  const [tagPickerKey, setTagPickerKey]       = useState<string | null>(null);
  const [tagInput, setTagInput]               = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [assigneeSearch, setAssigneeSearch]   = useState('');
  const [fontSize, setFontSize]               = useState('14px');
  const [textColor, setTextColor]             = useState('#171717');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customStatuses, setCustomStatuses]   = useState<CustomStatus[]>([]);
  const [editingColorOpen, setEditingColorOpen] = useState<string | null>(null);
  const [subtasksEnabled, setSubtasksEnabled] = useState(false);
  const [subtasks, setSubtasks]               = useState<{ id: string; label: string; done: boolean }[]>([]);
  const [subtaskInput, setSubtaskInput]       = useState('');
  const [attachments, setAttachments]         = useState<AttachmentItem[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setAiLoading(false);
      setShowClientDropdown(false);
      setShowAssigneeDropdown(false);
      setTagPickerKey(null);
      setShowColorPicker(false);
      setCustomStatuses([]);
      setEditingColorOpen(null);
      setSubtasksEnabled(false);
      setSubtasks([]);
      setSubtaskInput('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const applyFormat = (cmd: string, value?: string) => {
    descRef.current?.focus();
    document.execCommand(cmd, false, value);
  };

  const simulateAI = () => {
    setAiLoading(true);
    setTimeout(() => {
      setCredits('18');
      setAiLoading(false);
    }, 1400);
  };

  const toggleSuggestion = (tag: TagItem) => {
    if (tags.find(t => t.label === tag.label)) {
      setTags(prev => prev.filter(t => t.label !== tag.label));
    } else if (tags.length < 5) {
      setTags(prev => [...prev, tag]);
    }
  };

  const changeTagColor = (idx: number, color: typeof TAG_PALETTE[number]) => {
    setTags(prev => prev.map((t, i) => i === idx ? { ...t, color } : t));
    setTagPickerKey(null);
  };

  const addCustomTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && tags.length < 5 && !tags.find(t => t.label === trimmed)) {
      setTags(prev => [...prev, { label: trimmed, color: TAG_PALETTE[7] }]);
      setTagInput('');
    }
  };

  const addCustomStatus = () => {
    const trimmed = newStatusName.trim();
    if (!trimmed) return;
    const value = `custom-${Date.now()}`;
    setCustomStatuses(prev => [...prev, { value, label: trimmed, color: newStatusColor }]);
    setStatus(value);
    setShowAddStatus(false);
    setNewStatusName('');
    setNewStatusColor('#525252');
  };

  const addNewStatus = () => {
    const id = `custom-${Date.now()}`;
    setCustomStatuses(prev => [...prev, { value: id, label: '', color: '#a3a3a3', editing: true }]);
    setEditingColorOpen(null);
  };

  const confirmStatus = (value: string) => {
    setCustomStatuses(prev => prev.map(s => s.value === value ? { ...s, editing: false } : s));
    setStatus(value);
    setEditingColorOpen(null);
  };

  const cancelStatus = (value: string) => {
    setCustomStatuses(prev => prev.filter(s => s.value !== value));
    setEditingColorOpen(null);
  };

  const deleteCustomStatus = (value: string) => {
    setCustomStatuses(prev => prev.filter(s => s.value !== value));
    if (status === value) setStatus('todo');
    setEditingColorOpen(null);
  };

  const addAttachment = () => {
    const next = MOCK_ATTACHMENTS[attachments.length % MOCK_ATTACHMENTS.length];
    if (!attachments.find(a => a.id === next.id)) {
      setAttachments(prev => [...prev, next]);
    }
  };

  const toggleAssignee = (name: string) => {
    setSelectedAssignees(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const filteredClients = MOCK_CLIENTS.filter(c =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const filteredTeam = MOCK_TEAM.filter(m =>
    m.name.toLowerCase().includes(assigneeSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-[600px] max-h-[92vh] bg-white dark:bg-[#141414] rounded-2xl border border-[#e5e5e5] dark:border-[#2a2a2a] shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5e5] dark:border-[#2a2a2a] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#ff5623] flex items-center justify-center">
              <Plus className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-[15px] font-bold text-[#171717] dark:text-[#f5f5f5]">Nova Tarefa</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors">
            <X className="h-4 w-4 text-[#a3a3a3]" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d4d4d4 transparent' }}
          onClick={() => { setTagPickerKey(null); setShowColorPicker(false); }}
        >

          {/* Title */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-semibold text-[#a3a3a3] uppercase tracking-wider mb-2">
              <Type className="h-3 w-3" /> Título
            </label>
            <input
              type="text"
              placeholder="Ex: Criar tela de login"
              className="w-full h-10 bg-[#fafafa] dark:bg-[#1e1e1e] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-xl px-4 text-sm text-[#171717] dark:text-[#f5f5f5] placeholder:text-[#d4d4d4] dark:placeholder:text-[#525252] focus:outline-none focus:ring-2 focus:ring-[#ff5623]/20 focus:border-[#ff5623] transition-all"
            />
          </div>

          {/* Description with rich-text toolbar */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-semibold text-[#a3a3a3] uppercase tracking-wider mb-2">
              Descrição
            </label>
            {/* Toolbar */}
            <div className="flex items-center gap-1 px-3 py-2 bg-[#fafafa] dark:bg-[#1e1e1e] border border-b-0 border-[#e5e5e5] dark:border-[#2a2a2a] rounded-t-xl">
              <button onMouseDown={(e) => { e.preventDefault(); applyFormat('bold'); }}
                className="p-1.5 rounded-lg hover:bg-[#e5e5e5] dark:hover:bg-[#2a2a2a] transition-colors" title="Negrito">
                <Bold className="h-3.5 w-3.5 text-[#525252] dark:text-[#a3a3a3]" />
              </button>
              <button onMouseDown={(e) => { e.preventDefault(); applyFormat('italic'); }}
                className="p-1.5 rounded-lg hover:bg-[#e5e5e5] dark:hover:bg-[#2a2a2a] transition-colors" title="Itálico">
                <Italic className="h-3.5 w-3.5 text-[#525252] dark:text-[#a3a3a3]" />
              </button>

              <div className="w-px h-4 bg-[#e5e5e5] dark:bg-[#2a2a2a] mx-1" />

              {/* Font size */}
              <select
                value={fontSize}
                onChange={(e) => { setFontSize(e.target.value); applyFormat('fontSize', e.target.value === '12px' ? '1' : e.target.value === '14px' ? '2' : e.target.value === '16px' ? '3' : e.target.value === '18px' ? '4' : e.target.value === '20px' ? '5' : '6'); }}
                className="h-6 px-1.5 text-[11px] font-semibold text-[#525252] dark:text-[#a3a3a3] bg-transparent border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-lg focus:outline-none cursor-pointer"
              >
                {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <div className="w-px h-4 bg-[#e5e5e5] dark:bg-[#2a2a2a] mx-1" />

              {/* Text color */}
              <div className="relative" onClick={e => e.stopPropagation()}>
                <button
                  onMouseDown={(e) => { e.preventDefault(); setShowColorPicker(v => !v); }}
                  className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-[#e5e5e5] dark:hover:bg-[#2a2a2a] transition-colors"
                  title="Cor do texto"
                >
                  <span className="font-bold text-sm" style={{ color: textColor, textShadow: textColor === '#ffffff' ? '0 0 2px #aaa' : 'none' }}>A</span>
                  <div className="w-3 h-1.5 rounded-sm" style={{ backgroundColor: textColor }} />
                </button>
                {showColorPicker && (
                  <div className="absolute top-8 left-0 z-50 bg-white dark:bg-[#1e1e1e] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-xl p-2 shadow-xl flex gap-1.5">
                    {TEXT_COLORS.map(c => (
                      <button
                        key={c}
                        onMouseDown={(e) => { e.preventDefault(); setTextColor(c); applyFormat('foreColor', c); setShowColorPicker(false); }}
                        className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                        style={{ backgroundColor: c, borderColor: textColor === c ? '#171717' : 'transparent' }}
                        title={c}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="w-px h-4 bg-[#e5e5e5] dark:bg-[#2a2a2a] mx-1" />

              {/* Attach file */}
              <button
                onMouseDown={e => { e.preventDefault(); addAttachment(); }}
                className={`flex items-center gap-1 p-1.5 rounded-lg transition-colors ${attachments.length > 0 ? 'text-[#ff5623] bg-[#ff5623]/10' : 'text-[#a3a3a3] hover:bg-[#e5e5e5] dark:hover:bg-[#2a2a2a] hover:text-[#ff5623]'}`}
                title="Anexar arquivo"
              >
                <Paperclip className="h-3.5 w-3.5" />
                <span className="text-[10px] font-semibold">
                  Anexar{attachments.length > 0 ? ` (${attachments.length})` : ''}
                </span>
              </button>
            </div>

            {/* Editable area */}
            <div
              ref={descRef}
              contentEditable
              suppressContentEditableWarning
              data-placeholder="Descreva o que precisa ser feito..."
              className="min-h-[120px] bg-[#fafafa] dark:bg-[#1e1e1e] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-b-xl px-4 py-3 text-sm text-[#171717] dark:text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#ff5623]/20 focus:border-[#ff5623] transition-all empty:before:content-[attr(data-placeholder)] empty:before:text-[#d4d4d4] dark:empty:before:text-[#525252] empty:before:pointer-events-none"
              style={{ fontSize }}
            />

            {/* Attachments list */}
            {attachments.length > 0 && (
              <div className="mt-2 flex flex-col gap-1.5">
                {attachments.map(file => {
                  const isImage = file.type === 'image';
                  const isPdf   = file.type === 'pdf';
                  const iconBg  = isImage ? '#019364' : isPdf ? '#f32c2c' : '#3b82f6';
                  const Icon    = isImage ? Image : isPdf ? FileText : FileType;
                  return (
                    <div key={file.id} className="flex items-center gap-2.5 px-3 py-2 bg-[#fafafa] dark:bg-[#1e1e1e] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-xl group">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg + '20' }}>
                        <Icon className="h-4 w-4" style={{ color: iconBg }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-[#171717] dark:text-[#f5f5f5] truncate">{file.name}</p>
                        <p className="text-[10px] text-[#a3a3a3]">{file.size}</p>
                      </div>
                      <button
                        onClick={() => setAttachments(prev => prev.filter(a => a.id !== file.id))}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-[#f32c2c]/10 text-[#a3a3a3] hover:text-[#f32c2c] transition-all"
                        title="Remover"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Subtasks */}
          <div>
            {/* Toggle row */}
            <button
              onClick={() => setSubtasksEnabled(v => !v)}
              className="flex items-center gap-2 group w-full"
            >
              <div className={`w-8 h-4 rounded-full transition-colors flex items-center px-0.5 ${subtasksEnabled ? 'bg-[#ff5623]' : 'bg-[#e5e5e5] dark:bg-[#3a3a3a]'}`}>
                <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${subtasksEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className="text-[10px] font-semibold text-[#a3a3a3] uppercase tracking-wider group-hover:text-[#525252] transition-colors">
                Subtarefas
              </span>
            </button>

            {subtasksEnabled && (
              <div className="mt-3 space-y-1.5">
                {subtasks.map(sub => (
                  <div key={sub.id} className="flex items-center gap-2 group/sub">
                    <button
                      onClick={() => setSubtasks(prev => prev.map(s => s.id === sub.id ? { ...s, done: !s.done } : s))}
                      className={`w-4 h-4 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-all ${sub.done ? 'bg-[#019364] border-[#019364]' : 'border-[#d4d4d4] dark:border-[#3a3a3a] hover:border-[#ff5623]'}`}
                    >
                      {sub.done && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </button>
                    <span className={`flex-1 text-[13px] transition-all ${sub.done ? 'line-through text-[#a3a3a3]' : 'text-[#171717] dark:text-[#f5f5f5]'}`}>
                      {sub.label}
                    </span>
                    <button
                      onClick={() => setSubtasks(prev => prev.filter(s => s.id !== sub.id))}
                      className="opacity-0 group-hover/sub:opacity-100 text-[#a3a3a3] hover:text-[#f32c2c] transition-all"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-[4px] border-2 border-dashed border-[#d4d4d4] dark:border-[#3a3a3a] shrink-0" />
                  <input
                    type="text"
                    value={subtaskInput}
                    onChange={e => setSubtaskInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const trimmed = subtaskInput.trim();
                        if (trimmed) {
                          setSubtasks(prev => [...prev, { id: `sub-${Date.now()}`, label: trimmed, done: false }]);
                          setSubtaskInput('');
                        }
                      }
                    }}
                    placeholder="Adicionar subtarefa... (Enter)"
                    className="flex-1 bg-transparent text-[13px] text-[#171717] dark:text-[#f5f5f5] placeholder:text-[#d4d4d4] dark:placeholder:text-[#525252] focus:outline-none"
                  />
                </div>
                {subtasks.length > 0 && (
                  <p className="text-[10px] text-[#a3a3a3] pt-0.5">
                    {subtasks.filter(s => s.done).length}/{subtasks.length} concluídas
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Priority + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-semibold text-[#a3a3a3] uppercase tracking-wider mb-2">Prioridade</label>
              <div className="flex flex-wrap gap-1.5">
                {PRIORITY_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setPriority(opt.value)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${priority === opt.value ? `${opt.activeBg} text-white shadow-sm` : `${opt.passiveBg} ${opt.passiveText} hover:opacity-80`}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div onClick={e => e.stopPropagation()}>
              <label className="flex items-center gap-1.5 text-[10px] font-semibold text-[#a3a3a3] uppercase tracking-wider mb-2">Status</label>
              <div className="flex flex-wrap gap-1.5 items-center">

                {/* Default status pills — fixed, no X */}
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setStatus(opt.value)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${status === opt.value ? `${opt.activeBg} text-white shadow-sm` : `${opt.passiveBg} ${opt.passiveText} hover:opacity-80`}`}
                  >
                    {opt.label}
                  </button>
                ))}

                {/* Custom status chips */}
                {customStatuses.map(opt => opt.editing ? (
                  /* ── Editing chip ── */
                  <div key={opt.value} className="relative flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-lg bg-[#f5f5f5] dark:bg-[#2a2a2a]" style={{ overflow: 'visible', outline: '1.5px dashed #d4d4d4' }}>
                    {/* Color dot */}
                    <button
                      onClick={e => { e.stopPropagation(); setEditingColorOpen(v => v === opt.value ? null : opt.value); }}
                      className="w-3 h-3 rounded-full shrink-0 border border-white/40 shadow-sm hover:scale-110 transition-transform"
                      style={{ backgroundColor: opt.color }}
                      title="Trocar cor"
                    />
                    {/* Inline name input */}
                    <input
                      autoFocus
                      type="text"
                      value={opt.label}
                      onChange={e => setCustomStatuses(prev => prev.map(s => s.value === opt.value ? { ...s, label: e.target.value } : s))}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { e.preventDefault(); if (opt.label.trim()) confirmStatus(opt.value); }
                        if (e.key === 'Escape') cancelStatus(opt.value);
                      }}
                      placeholder="Nome..."
                      className="w-20 bg-transparent text-[11px] text-[#171717] dark:text-[#f5f5f5] placeholder:text-[#d4d4d4] dark:placeholder:text-[#525252] focus:outline-none"
                    />
                    {/* Color picker popup */}
                    {editingColorOpen === opt.value && (
                      <div
                        className="absolute top-full mt-1.5 left-0 z-[200] bg-white dark:bg-[#1e1e1e] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-xl p-2 shadow-xl"
                        onClick={e => e.stopPropagation()}
                      >
                        <p className="text-[9px] font-semibold text-[#a3a3a3] uppercase tracking-wider mb-1.5 px-1">Cor</p>
                        <div className="flex flex-wrap gap-1.5" style={{ maxWidth: '112px' }}>
                          {STATUS_COLOR_PALETTE.map(c => (
                            <button
                              key={c.hex}
                              onClick={() => { setCustomStatuses(prev => prev.map(s => s.value === opt.value ? { ...s, color: c.hex } : s)); setEditingColorOpen(null); }}
                              className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                              style={{ backgroundColor: c.hex, borderColor: opt.color === c.hex ? '#171717' : 'transparent' }}
                              title={c.label}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ── Saved chip — hover shows X ── */
                  <div
                    key={opt.value}
                    className="group flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                    style={status === opt.value
                      ? { backgroundColor: opt.color, color: '#fff' }
                      : { backgroundColor: opt.color + '20', color: opt.color }}
                  >
                    <button onClick={() => setStatus(opt.value)} className="leading-none">
                      {opt.label}
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); deleteCustomStatus(opt.value); }}
                      className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity leading-none"
                      title="Remover"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}

                {/* Add new status button */}
                <button
                  onClick={addNewStatus}
                  className="w-6 h-6 rounded-lg flex items-center justify-center bg-[#f5f5f5] dark:bg-[#2a2a2a] text-[#a3a3a3] hover:bg-[#ff5623]/10 hover:text-[#ff5623] transition-all"
                  title="Criar status personalizado"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Due Date + Credits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-semibold text-[#a3a3a3] uppercase tracking-wider mb-2">
                <Calendar className="h-3 w-3" /> Data de entrega
              </label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full h-10 bg-[#fafafa] dark:bg-[#1e1e1e] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-xl px-4 text-sm text-[#171717] dark:text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#ff5623]/20 focus:border-[#ff5623] transition-all" />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-semibold text-[#a3a3a3] uppercase tracking-wider mb-2">
                <span className="text-[11px] font-bold text-[#a3a3a3]">◈</span> Créditos
              </label>
              <div className="flex gap-2">
                <input type="number" min="0" value={credits} onChange={e => setCredits(e.target.value)}
                  placeholder="0"
                  className="flex-1 h-10 bg-[#fafafa] dark:bg-[#1e1e1e] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-xl px-4 text-sm text-[#171717] dark:text-[#f5f5f5] placeholder:text-[#d4d4d4] dark:placeholder:text-[#525252] focus:outline-none focus:ring-2 focus:ring-[#ff5623]/20 focus:border-[#ff5623] transition-all" />
                <button
                  onClick={simulateAI}
                  disabled={aiLoading}
                  title="Calcular créditos com IA"
                  className={`h-10 px-3 rounded-xl flex items-center gap-1.5 text-[11px] font-semibold transition-all ${aiLoading ? 'bg-[#987dfe]/10 text-[#987dfe] cursor-wait' : 'bg-[#987dfe]/10 text-[#987dfe] hover:bg-[#987dfe]/20'}`}>
                  <Sparkles className={`h-3.5 w-3.5 ${aiLoading ? 'animate-pulse' : ''}`} />
                  {aiLoading ? 'IA...' : 'IA'}
                </button>
              </div>
              {aiLoading && (
                <p className="text-[10px] text-[#987dfe] mt-1 flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5 animate-pulse" />
                  Calculando créditos automaticamente...
                </p>
              )}
            </div>
          </div>

          {/* Client */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <label className="flex items-center gap-1.5 text-[10px] font-semibold text-[#a3a3a3] uppercase tracking-wider mb-2">
              <Building2 className="h-3 w-3" /> Cliente
            </label>
            <button
              onClick={() => setShowClientDropdown(v => !v)}
              className="w-full h-10 bg-[#fafafa] dark:bg-[#1e1e1e] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-xl px-4 flex items-center justify-between text-sm transition-all hover:border-[#ff5623]/50 focus:outline-none focus:ring-2 focus:ring-[#ff5623]/20"
            >
              <span className={client ? 'text-[#171717] dark:text-[#f5f5f5] font-medium' : 'text-[#d4d4d4] dark:text-[#525252]'}>
                {client || 'Selecionar cliente...'}
              </span>
              <ChevronDown className={`h-4 w-4 text-[#a3a3a3] transition-transform ${showClientDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showClientDropdown && (
              <div className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-[#1e1e1e] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-xl shadow-xl overflow-hidden">
                <div className="p-2 border-b border-[#f5f5f5] dark:border-[#2a2a2a]">
                  <div className="flex items-center gap-2 px-2">
                    <Search className="h-3.5 w-3.5 text-[#a3a3a3] shrink-0" />
                    <input autoFocus type="text" value={clientSearch} onChange={e => setClientSearch(e.target.value)}
                      placeholder="Buscar cliente..."
                      className="flex-1 text-sm bg-transparent text-[#171717] dark:text-[#f5f5f5] placeholder:text-[#d4d4d4] focus:outline-none" />
                  </div>
                </div>
                <div className="max-h-[180px] overflow-y-auto py-1">
                  {filteredClients.map(c => (
                    <button key={c.name} onClick={() => { setClient(c.name); setShowClientDropdown(false); setClientSearch(''); }}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#ff5623] flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                          {c.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-[#171717] dark:text-[#f5f5f5]">{c.name}</span>
                      </div>
                      <span className="text-[10px] text-[#a3a3a3]">{c.sector}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div onClick={e => e.stopPropagation()}>
            <label className="flex items-center gap-1.5 text-[10px] font-semibold text-[#a3a3a3] uppercase tracking-wider mb-2">
              <Tag className="h-3 w-3" /> Tags
            </label>

            {/* Suggestions — click adds to field below */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {TAG_SUGGESTIONS.map(tag => {
                const isAdded = !!tags.find(t => t.label === tag.label);
                const disabled = !isAdded && tags.length >= 5;
                return (
                  <button
                    key={tag.label}
                    onClick={() => { toggleSuggestion(tag); tagInputRef.current?.focus(); }}
                    disabled={disabled}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                    style={isAdded
                      ? { backgroundColor: tags.find(t => t.label === tag.label)!.color.bg, color: tags.find(t => t.label === tag.label)!.color.text }
                      : { backgroundColor: '#f5f5f5', color: disabled ? '#d4d4d4' : '#525252' }}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>

            {/* Unified tag field — chips + inline input */}
            <div
              className="min-h-[38px] bg-[#fafafa] dark:bg-[#1e1e1e] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-xl px-3 py-2 flex flex-wrap gap-1.5 items-center cursor-text transition-all focus-within:ring-2 focus-within:ring-[#ff5623]/20 focus-within:border-[#ff5623]"
              style={{ overflow: 'visible' }}
              onClick={() => tagInputRef.current?.focus()}
            >
              {tags.map((tag, idx) => {
                const pickerKey = `tag-${idx}`;
                return (
                  <div key={tag.label} className="relative flex items-center rounded-md shrink-0" style={{ backgroundColor: tag.color.bg }}>
                    <button
                      onClick={e => { e.stopPropagation(); setTagPickerKey(tagPickerKey === pickerKey ? null : pickerKey); }}
                      className="pl-2 pr-1 py-0.5 text-[11px] font-semibold hover:opacity-80 transition-opacity"
                      style={{ color: tag.color.text }}
                      title="Clique para trocar a cor"
                    >
                      {tag.label}
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setTags(prev => prev.filter((_, i) => i !== idx)); }}
                      className="pr-1.5 pl-0.5 py-0.5 hover:opacity-60 transition-opacity"
                      style={{ color: tag.color.text }}
                      title="Remover"
                    >
                      <X className="h-3 w-3" />
                    </button>

                    {tagPickerKey === pickerKey && (
                      <div
                        className="absolute top-full mt-1.5 left-0 z-[200] bg-white dark:bg-[#1e1e1e] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-xl p-2 shadow-xl"
                        style={{ minWidth: '120px' }}
                        onClick={e => e.stopPropagation()}
                      >
                        <p className="text-[9px] font-semibold text-[#a3a3a3] uppercase tracking-wider mb-1.5 px-1">Cor da tag</p>
                        <div className="grid grid-cols-4 gap-1.5">
                          {TAG_PALETTE.map(c => (
                            <button
                              key={c.bg}
                              onClick={() => changeTagColor(idx, c)}
                              className="w-6 h-6 rounded-lg border-2 transition-transform hover:scale-110"
                              style={{ backgroundColor: c.bg, borderColor: tag.color.bg === c.bg ? '#171717' : 'transparent' }}
                              title={c.label}
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
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag(); } }}
                  placeholder={tags.length === 0 ? 'Adicionar tag... (Enter)' : ''}
                  className="flex-1 min-w-[100px] bg-transparent text-sm text-[#171717] dark:text-[#f5f5f5] placeholder:text-[#d4d4d4] dark:placeholder:text-[#525252] focus:outline-none"
                />
              )}
            </div>

            {tags.length >= 5 && (
              <p className="text-[10px] text-[#a3a3a3] mt-1">Limite de 5 tags atingido.</p>
            )}
          </div>

          {/* Assignees */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <label className="flex items-center gap-1.5 text-[10px] font-semibold text-[#a3a3a3] uppercase tracking-wider mb-2">
              <Users className="h-3 w-3" /> Responsáveis
            </label>

            {selectedAssignees.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedAssignees.map(name => {
                  const member = MOCK_TEAM.find(m => m.name === name)!;
                  return (
                    <div key={name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f5f5f5] dark:bg-[#2a2a2a] border border-[#e5e5e5] dark:border-[#333]">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0" style={{ backgroundColor: member.color }}>
                        {getInitials(name)}
                      </div>
                      <span className="text-[11px] font-medium text-[#525252] dark:text-[#d4d4d4]">{name.split(' ')[0]}</span>
                      <button onClick={() => toggleAssignee(name)} className="text-[#a3a3a3] hover:text-[#f32c2c] transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <button onClick={() => setShowAssigneeDropdown(v => !v)}
              className="w-full flex items-center gap-2 h-10 bg-[#fafafa] dark:bg-[#1e1e1e] border border-dashed border-[#d4d4d4] dark:border-[#3a3a3a] rounded-xl px-4 text-sm text-[#a3a3a3] hover:border-[#ff5623]/50 hover:text-[#ff5623] hover:bg-[#ff5623]/5 transition-all">
              <Plus className="h-4 w-4" />
              Adicionar responsável
            </button>

            {showAssigneeDropdown && (
              <div className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-[#1e1e1e] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-xl shadow-xl overflow-hidden">
                <div className="p-2 border-b border-[#f5f5f5] dark:border-[#2a2a2a]">
                  <div className="flex items-center gap-2 px-2">
                    <Search className="h-3.5 w-3.5 text-[#a3a3a3] shrink-0" />
                    <input autoFocus type="text" value={assigneeSearch} onChange={e => setAssigneeSearch(e.target.value)}
                      placeholder="Buscar membro..."
                      className="flex-1 text-sm bg-transparent text-[#171717] dark:text-[#f5f5f5] placeholder:text-[#d4d4d4] focus:outline-none" />
                  </div>
                </div>
                <div className="max-h-[200px] overflow-y-auto py-1">
                  {filteredTeam.map(member => {
                    const isSelected = selectedAssignees.includes(member.name);
                    return (
                      <button key={member.name} onClick={() => toggleAssignee(member.name)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 transition-colors ${isSelected ? 'bg-[#ff5623]/5' : 'hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]'}`}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: member.color }}>
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

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e5e5] dark:border-[#2a2a2a] shrink-0 bg-white dark:bg-[#141414]">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#f5f5f5] dark:bg-[#2a2a2a] text-[#525252] dark:text-[#a3a3a3] hover:bg-[#e5e5e5] dark:hover:bg-[#333] text-sm font-semibold transition-colors">
            Cancelar
          </button>
          <button className="px-5 py-2 rounded-xl bg-[#ff5623] hover:bg-[#c2410c] text-white text-sm font-semibold transition-colors shadow-sm flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Criar tarefa
          </button>
        </div>
      </div>
    </div>
  );
}
