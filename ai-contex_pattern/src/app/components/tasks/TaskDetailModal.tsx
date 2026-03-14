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
  UserPlus,
  Eye,
  ArrowRight,
  Building2,
  CheckCheck,
} from 'lucide-react';
import { PriorityBadge } from '../shared/PriorityBadge';
import { TagBadge } from '../shared/TagBadge';
import { AvatarStack } from '../shared/AvatarStack';
import { ProgressBar } from '../shared/ProgressBar';
import { StatusBadge } from './StatusBadge';

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
  task: {
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'todo' | 'in-progress' | 'review' | 'completed' | 'blocked' | 'archived' | 'new';
    subtasks?: { completed: number; total: number };
    subtasksList?: Array<{ label: string; done: boolean }>;
    progress: number;
    dueDate: string;
    dateAlert?: 'approaching' | 'overdue';
    tags: Array<{ label: string; color: 'orange' | 'blue' | 'green' | 'purple' | 'pink' | 'yellow' | 'red' | 'gray' }>;
    assignees: Array<{ name: string; image?: string }>;
    attachments?: number;
    attachmentsList?: Attachment[];
    comments: Comment[];
    createdAt?: string;
    coverImage?: string;
    credits?: number;
    client?: string;
  };
}

export function TaskDetailModal({ isOpen, onClose, task }: TaskDetailModalProps) {
  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'attachments' | 'activities'>('details');
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [editDueDate, setEditDueDate] = useState(task.dueDate);
  const [isEditingCredits, setIsEditingCredits] = useState(false);
  const [editCredits, setEditCredits] = useState(task.credits ?? 0);
  const [taskCompleted, setTaskCompleted] = useState(task.status === 'completed');
  const [completingAnim, setCompletingAnim] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const progressColor = task.progress === 100 ? 'success' : task.progress >= 50 ? 'blue' : 'primary';
  const hasSubtasks = Boolean(
    (task.subtasks && task.subtasks.total > 0) ||
      (task.subtasksList && task.subtasksList.length > 0),
  );

  const dateAlertConfig = {
    approaching: {
      bg: 'bg-[#fef9c3]',
      text: 'text-[#a16207]',
      border: 'border-[#feba31]/30',
      icon: Clock,
      label: 'Prazo se aproximando',
    },
    overdue: {
      bg: 'bg-[#fee2e2]',
      text: 'text-[#dc2626]',
      border: 'border-[#f32c2c]/30',
      icon: AlertTriangle,
      label: 'Atrasado',
    },
  };

  const alertInfo = task.dateAlert ? dateAlertConfig[task.dateAlert] : null;

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const avatarColors = ['bg-[#ff5623]', 'bg-[#987dfe]', 'bg-[#019364]', 'bg-[#3b82f6]', 'bg-[#ec4899]'];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return FileText;
      case 'image': return Image;
      case 'doc': return FileText;
      default: return File;
    }
  };

  const getFileColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'bg-[#fee2e2] text-[#dc2626]';
      case 'image': return 'bg-[#e9d5ff] text-[#7e22ce]';
      case 'doc': return 'bg-[#dbeafe] text-[#2563eb]';
      case 'spreadsheet': return 'bg-[#dcfce7] text-[#16a34a]';
      default: return 'bg-[#f5f5f5] text-[#525252]';
    }
  };

  const attachmentsList = task.attachmentsList || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[720px] max-h-[90vh] bg-white dark:bg-[#141414] rounded-2xl border border-[#e5e5e5] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5e5] shrink-0">
          <div className="flex items-center gap-3">
            <PriorityBadge priority={task.priority} size="md" />
            <StatusBadge status={task.status} size="md" />
            {task.credits !== undefined && (
              <div className="relative">
                <button
                  onClick={() => setIsEditingCredits(v => !v)}
                  className="flex items-center gap-1.5 bg-[#fef3c7] text-[#92400e] px-2.5 py-1.5 rounded-lg hover:bg-[#fde68a] transition-colors"
                >
                  <span className="text-[11px] font-semibold text-[#b45309] uppercase tracking-wide leading-none">Creditos usados</span>
                  <span className="text-sm font-bold leading-none">◈ {editCredits}</span>
                </button>
                {isEditingCredits && (
                  <div
                    className="absolute top-full mt-1.5 left-0 z-[200] bg-white dark:bg-[#1e1e1e] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-xl p-3 shadow-xl"
                    style={{ minWidth: '150px' }}
                    onClick={e => e.stopPropagation()}
                  >
                    <p className="text-[10px] font-semibold text-[#a3a3a3] uppercase tracking-wider mb-2">Ajustar créditos</p>
                    <input
                      type="number"
                      value={editCredits}
                      onChange={e => setEditCredits(Number(e.target.value))}
                      min={0}
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') setIsEditingCredits(false); }}
                      className="w-full h-8 bg-[#fafafa] dark:bg-[#141414] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-lg px-2 text-sm font-semibold text-[#171717] dark:text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#ff5623]/20"
                    />
                    <button
                      onClick={() => setIsEditingCredits(false)}
                      className="mt-2 w-full py-1.5 bg-[#ff5623] text-white text-xs font-semibold rounded-lg hover:bg-[#c2410c] transition-colors"
                    >
                      Salvar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg hover:bg-[#f5f5f5] transition-colors">
              <Link2 className="h-4 w-4 text-[#a3a3a3]" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-[#f5f5f5] transition-colors">
              <MoreHorizontal className="h-4 w-4 text-[#a3a3a3]" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#f5f5f5] transition-colors"
            >
              <X className="h-4 w-4 text-[#a3a3a3]" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0.5 px-6 pt-3 pb-3 border-b border-[#f0f0f0] shrink-0">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'details'
                ? 'bg-[#171717] text-white'
                : 'text-[#737373] hover:text-[#171717] hover:bg-[#f5f5f5]'
            }`}
          >
            <CheckSquare className="h-3.5 w-3.5" />
            Detalhes
          </button>
          <button
            onClick={() => setActiveTab('attachments')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'attachments'
                ? 'bg-[#171717] text-white'
                : 'text-[#737373] hover:text-[#171717] hover:bg-[#f5f5f5]'
            }`}
          >
            <Paperclip className="h-3.5 w-3.5" />
            Anexos
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${
              activeTab === 'attachments' ? 'bg-white/20 text-white' : 'bg-[#e5e5e5] text-[#737373]'
            }`}>
              {attachmentsList.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'comments'
                ? 'bg-[#171717] text-white'
                : 'text-[#737373] hover:text-[#171717] hover:bg-[#f5f5f5]'
            }`}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Comentários
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${
              activeTab === 'comments' ? 'bg-white/20 text-white' : 'bg-[#e5e5e5] text-[#737373]'
            }`}>
              {task.comments.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'activities'
                ? 'bg-[#171717] text-white'
                : 'text-[#737373] hover:text-[#171717] hover:bg-[#f5f5f5]'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            Atividades
          </button>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#d4d4d4 transparent',
          }}
        >
          {activeTab === 'details' && (
            <div className="pb-6">
              {/* Cover Image */}
              {task.coverImage && (
                <div className="px-6 pt-5">
                  <div className="w-full h-48 rounded-xl overflow-hidden">
                    <img
                      src={task.coverImage}
                      alt="Capa da tarefa"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="px-6 pt-5 space-y-5">
                {/* Date Alert */}
                {alertInfo && (
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${alertInfo.bg} ${alertInfo.text}`}>
                    <alertInfo.icon className="h-4 w-4 shrink-0" />
                    <span className="text-sm font-semibold">{alertInfo.label}</span>
                    <span className="text-xs font-medium opacity-70 ml-auto">{task.dueDate}</span>
                  </div>
                )}

                {/* Tags - above title */}
                <div>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, i) => (
                      <TagBadge key={i} label={tag.label} color={tag.color} />
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h2 className="text-xl font-bold text-[#171717] dark:text-[#f5f5f5] mb-2">{task.title}</h2>
                  {task.description && (
                    <p className="text-sm text-[#737373] dark:text-[#a3a3a3] leading-relaxed">{task.description}</p>
                  )}
                </div>

                {/* Subtasks + Progress — below description */}
                <div>
                  {hasSubtasks && (
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-[#987dfe]">
                        <CheckSquare className="h-4 w-4" />
                        <span className="text-sm font-semibold">Subtarefas</span>
                      </div>
                      <span className="text-sm font-bold text-[#525252] dark:text-[#f5f5f5]">
                        {task.subtasks?.completed ?? 0}/{task.subtasks?.total ?? task.subtasksList?.length ?? 0}
                      </span>
                    </div>
                  )}
                  <ProgressBar value={task.progress} color={progressColor} size="md" showLabel />
                  {task.subtasksList && task.subtasksList.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {task.subtasksList.map((st, i) => (
                        <div key={i} className="flex items-center gap-3 py-1.5">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${st.done ? 'bg-[#019364] border-[#019364]' : 'border-[#d4d4d4]'}`}>
                            {st.done && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={`text-sm ${st.done ? 'text-[#a3a3a3] line-through' : 'text-[#525252] dark:text-[#f5f5f5]'}`}>{st.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Meta Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Due Date — clicável para editar */}
                  <div
                    className="bg-[#fafafa] dark:bg-[#1e1e1e] rounded-xl p-4 cursor-pointer hover:bg-[#f0f0f0] dark:hover:bg-[#252525] transition-colors group/date"
                    onClick={() => setIsEditingDueDate(v => !v)}
                    title="Clique para editar a data"
                  >
                    <p className="text-[10px] font-semibold text-[#a3a3a3] uppercase tracking-wider mb-2 flex items-center gap-1">
                      Data de entrega
                      <Edit3 className="h-2.5 w-2.5 opacity-0 group-hover/date:opacity-60 transition-opacity" />
                    </p>
                    {isEditingDueDate ? (
                      <input
                        type="date"
                        defaultValue={editDueDate}
                        onChange={e => setEditDueDate(e.target.value)}
                        onBlur={() => setIsEditingDueDate(false)}
                        onClick={e => e.stopPropagation()}
                        autoFocus
                        className="w-full bg-transparent text-sm font-semibold text-[#171717] dark:text-[#f5f5f5] focus:outline-none border-b border-[#ff5623]"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Calendar className={`h-4 w-4 ${task.dateAlert === 'overdue' ? 'text-[#f32c2c]' : task.dateAlert === 'approaching' ? 'text-[#ca8a04]' : 'text-[#ff5623]'}`} />
                        <span className="text-sm font-semibold text-[#171717] dark:text-[#f5f5f5]">{editDueDate} às 18:00</span>
                      </div>
                    )}
                  </div>

                  {/* Cliente */}
                  <div className="bg-[#fafafa] dark:bg-[#1e1e1e] rounded-xl p-4">
                    <p className="text-[10px] font-semibold text-[#a3a3a3] uppercase tracking-wider mb-2">Cliente</p>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-[#ff5623]" />
                      <span className="text-sm font-semibold text-[#171717] dark:text-[#f5f5f5]">{task.client || 'Não definido'}</span>
                    </div>
                  </div>
                </div>

                {/* Criado em — destaque reduzido */}
                <p className="text-[11px] text-[#a3a3a3] flex items-center gap-1.5 -mt-2">
                  <Clock className="h-3 w-3" />
                  Criado em {task.createdAt || '10 Mar, 2026'} às 09:00
                </p>

                {/* Assignees */}
                <div>
                  <p className="text-[10px] font-semibold text-[#a3a3a3] dark:text-[#a3a3a3] uppercase tracking-wider mb-3">Responsáveis</p>
                  <div className="flex items-center gap-3">
                    <AvatarStack avatars={task.assignees} max={6} size="md" />
                    <div className="flex flex-wrap gap-1.5">
                      {task.assignees.slice(0, 3).map((a, i) => (
                        <span key={i} className="text-xs text-[#525252] dark:text-[#f5f5f5] font-medium">{a.name}{i < Math.min(task.assignees.length, 3) - 1 ? ',' : ''}</span>
                      ))}
                      {task.assignees.length > 3 && (
                        <span className="text-xs text-[#a3a3a3] dark:text-[#a3a3a3]">+{task.assignees.length - 3} mais</span>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="px-6 py-5 space-y-4">
              {/* Upload Area */}
              <button className="w-full flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-[#e5e5e5] rounded-xl text-[#737373] hover:border-[#ff5623]/40 hover:text-[#ff5623] hover:bg-[#ff5623]/5 transition-all cursor-pointer">
                <Upload className="h-4.5 w-4.5" />
                <span className="text-sm font-semibold">Enviar arquivo</span>
                <span className="text-xs text-[#a3a3a3] font-normal ml-1">ou arraste e solte aqui</span>
              </button>

              {attachmentsList.length > 0 ? (
                <div className="space-y-3">
                  {attachmentsList.map((file) => {
                    const FileIcon = getFileIcon(file.type);
                    const fileColor = getFileColor(file.type);
                    return (
                      <div key={file.id} className="flex items-center gap-4 p-4 bg-[#fafafa] dark:bg-[#1e1e1e] rounded-xl hover:bg-[#f0f0f0] transition-colors group/file">
                        <div className={`w-10 h-10 rounded-xl ${fileColor} flex items-center justify-center shrink-0`}>
                          <FileIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#171717] dark:text-[#f5f5f5] truncate">{file.name}</p>
                          <p className="text-[11px] text-[#a3a3a3] dark:text-[#a3a3a3]">
                            {file.size} · Enviado por {file.uploadedBy} · {file.uploadedAt}
                          </p>
                        </div>
                        <button className="p-2 rounded-lg hover:bg-white opacity-0 group-hover/file:opacity-100 transition-all">
                          <Download className="h-4 w-4 text-[#737373] dark:text-[#f5f5f5]" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-[#a3a3a3] dark:text-[#a3a3a3]">
                  <Paperclip className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Nenhum anexo adicionado</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="px-6 py-5 flex flex-col gap-5">
              {/* Comment list */}
              <div className="flex-1">
                {task.comments.length > 0 ? (
                  <div className="space-y-4">
                    {task.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="shrink-0">
                          {comment.author.image ? (
                            <img
                              src={comment.author.image}
                              alt={comment.author.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className={`w-8 h-8 rounded-full ${avatarColors[comment.id.charCodeAt(0) % avatarColors.length]} flex items-center justify-center text-white text-[10px] font-semibold`}>
                              {getInitials(comment.author.name)}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-[#171717] dark:text-[#f5f5f5]">{comment.author.name}</span>
                            <span className="text-[10px] text-[#a3a3a3] dark:text-[#a3a3a3]">{comment.timestamp}</span>
                          </div>
                          <div className="bg-[#f5f5f5] dark:bg-[#1e1e1e] rounded-xl rounded-tl-sm px-4 py-3">
                            <p className="text-sm text-[#525252] dark:text-[#f5f5f5] leading-relaxed">{comment.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-[#a3a3a3] dark:text-[#a3a3a3]">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Nenhum comentário ainda</p>
                  </div>
                )}
              </div>

              {/* Comment Input */}
              <div className="border-t border-[#e5e5e5] pt-4 bg-white dark:bg-[#141414]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#ff5623] flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
                    AS
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Escreva um comentário..."
                      className="w-full h-10 bg-[#fafafa] dark:bg-[#1e1e1e] border border-[#e5e5e5] dark:border-[#333] rounded-xl px-4 pr-20 text-sm text-[#171717] dark:text-[#f5f5f5] placeholder:text-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-[#ff5623]/20 focus:border-[#ff5623] transition-all"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                      <button
                        className="p-1.5 rounded-lg text-[#a3a3a3] hover:text-[#ff5623] hover:bg-[#ff5623]/10 transition-colors"
                        title="Anexar imagem"
                      >
                        <ImagePlus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="p-1.5 rounded-lg text-[#a3a3a3] hover:text-[#ff5623] hover:bg-[#ff5623]/10 transition-colors"
                        title="Anexar arquivo"
                      >
                        <Paperclip className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className={`p-1.5 rounded-lg transition-colors ${
                          commentText.trim()
                            ? 'bg-[#ff5623] text-white hover:bg-[#c2410c]'
                            : 'text-[#d4d4d4]'
                        }`}
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activities' && (() => {
            const MOCK_ACTIVITIES = [
              {
                id: 'a1',
                icon: Edit3,
                iconBg: 'bg-[#dbeafe]',
                iconColor: 'text-[#2563eb]',
                actor: 'Ana Silva',
                action: 'criou esta tarefa',
                timestamp: task.createdAt ? `${task.createdAt} às 09:00` : '01 Mar, 2026 às 09:00',
              },
              {
                id: 'a2',
                icon: UserPlus,
                iconBg: 'bg-[#fce7f3]',
                iconColor: 'text-[#db2777]',
                actor: 'Ana Silva',
                action: 'adicionou Carlos Lima, Mariana Costa como responsáveis',
                timestamp: task.createdAt ? `${task.createdAt} às 09:15` : '01 Mar, 2026 às 09:15',
              },
              {
                id: 'a3',
                icon: ArrowRight,
                iconBg: 'bg-[#f3e8ff]',
                iconColor: 'text-[#7e22ce]',
                actor: 'Carlos Lima',
                action: 'moveu o status de A fazer para Em progresso',
                timestamp: '05 Mar, 2026 às 10:30',
              },
              {
                id: 'a4',
                icon: Paperclip,
                iconBg: 'bg-[#fff7ed]',
                iconColor: 'text-[#ea580c]',
                actor: 'Mariana Costa',
                action: 'anexou 2 arquivos',
                timestamp: '06 Mar, 2026 às 14:20',
              },
              {
                id: 'a5',
                icon: CheckSquare,
                iconBg: 'bg-[#dcfce7]',
                iconColor: 'text-[#16a34a]',
                actor: 'Carlos Lima',
                action: 'marcou "Definir paleta de cores e tokens" como concluída',
                timestamp: '07 Mar, 2026 às 11:00',
              },
              {
                id: 'a6',
                icon: MessageCircle,
                iconBg: 'bg-[#f3e8ff]',
                iconColor: 'text-[#987dfe]',
                actor: 'Rafael Santos',
                action: 'comentou na tarefa',
                timestamp: '08 Mar, 2026 às 16:45',
              },
              {
                id: 'a7',
                icon: Eye,
                iconBg: 'bg-[#f5f5f5]',
                iconColor: 'text-[#525252]',
                actor: 'Julia Ferreira',
                action: 'visualizou a tarefa',
                timestamp: 'Hoje às 08:30',
              },
              {
                id: 'a8',
                icon: CheckSquare,
                iconBg: 'bg-[#dcfce7]',
                iconColor: 'text-[#16a34a]',
                actor: 'Ana Silva',
                action: 'marcou "Criar tipografia e escala de fontes" como concluída',
                timestamp: 'Hoje às 09:45',
              },
              {
                id: 'a9',
                icon: Edit3,
                iconBg: 'bg-[#dbeafe]',
                iconColor: 'text-[#2563eb]',
                actor: 'Carlos Lima',
                action: 'editou a descrição da tarefa',
                timestamp: 'Hoje às 11:20',
              },
              {
                id: 'a10',
                icon: Calendar,
                iconBg: 'bg-[#fef3c7]',
                iconColor: 'text-[#ca8a04]',
                actor: 'Ana Silva',
                action: `ajustou a data de entrega para ${editDueDate}`,
                timestamp: 'Hoje às 13:05',
              },
            ];

            return (
              <div className="px-6 py-5">
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-4 bottom-4 w-px bg-[#e5e5e5]" />

                  <div className="space-y-5">
                    {MOCK_ACTIVITIES.map((activity) => {
                      const Icon = activity.icon;
                      return (
                        <div key={activity.id} className="flex items-start gap-3 relative">
                          <div className={`w-8 h-8 rounded-full ${activity.iconBg} flex items-center justify-center shrink-0 z-10 ring-4 ring-white dark:ring-[#141414]`}>
                            <Icon className={`h-3.5 w-3.5 ${activity.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <p className="text-sm text-[#171717] dark:text-[#f5f5f5] leading-snug">
                              <span className="font-semibold">{activity.actor}</span>{' '}
                              <span className="text-[#525252] dark:text-[#f5f5f5]">{activity.action}</span>
                            </p>
                            <p className="text-[11px] text-[#a3a3a3] dark:text-[#a3a3a3] mt-0.5">{activity.timestamp}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Footer — Concluir tarefa */}
        <div className="shrink-0 px-6 py-4 border-t border-[#e5e5e5] dark:border-[#2a2a2a] flex items-center justify-between bg-white dark:bg-[#141414]">
          <p className="text-[11px] text-[#a3a3a3]">
            {taskCompleted ? 'Tarefa marcada como concluída ✓' : 'Marque como concluída quando finalizar'}
          </p>
          <button
            onClick={() => {
              if (taskCompleted) return;
              setCompletingAnim(true);
              setTimeout(() => {
                setCompletingAnim(false);
                setTaskCompleted(true);
              }, 700);
            }}
            disabled={taskCompleted}
            className={[
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold',
              taskCompleted
                ? 'bg-[#019364] text-white cursor-default'
                : completingAnim
                  ? 'bg-[#019364]/80 text-white scale-95 cursor-wait'
                  : 'bg-[#f0fdf4] text-[#019364] border border-[#019364]/30 hover:bg-[#019364] hover:text-white',
            ].join(' ')}
            style={{ transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}
          >
            <CheckCheck className={`h-4 w-4 ${completingAnim ? 'animate-bounce' : ''}`} />
            {taskCompleted ? 'Concluída' : completingAnim ? 'Concluindo...' : 'Concluir tarefa'}
          </button>
        </div>
      </div>
    </div>
  );
}
