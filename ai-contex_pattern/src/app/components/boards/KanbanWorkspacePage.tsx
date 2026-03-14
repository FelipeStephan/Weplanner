import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import {
  Archive,
  ArrowDownWideNarrow,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Copy,
  EyeOff,
  Filter,
  FolderKanban,
  LayoutDashboard,
  Loader,
  Link2,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Moon,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Sun,
  Target,
  Trash2,
  Users,
  WandSparkles,
} from 'lucide-react';
import { AvatarStack } from '../shared/AvatarStack';
import { CreateTaskModal } from '../tasks/CreateTaskModal';
import { DetailedTaskCard } from '../tasks/DetailedTaskCard';
import { KanbanColumn } from '../tasks/KanbanColumn';
import { TaskCard } from '../tasks/TaskCard';
import { TaskDetailModal } from '../tasks/TaskDetailModal';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';

type ColumnKey =
  | 'todo'
  | 'in-progress'
  | 'review'
  | 'internal-approval'
  | 'completed';

type CardType = 'simple' | 'detailed';

interface KanbanWorkspacePageProps {
  onBackToDesignSystem?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

interface BoardCard {
  id: string;
  column: ColumnKey;
  previousColumn?: ColumnKey;
  previousStatus?: 'new' | 'todo' | 'in-progress' | 'review' | 'completed' | 'blocked' | 'archived';
  previousProgress?: number;
  createdAt: string;
  type: CardType;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status:
    | 'new'
    | 'todo'
    | 'in-progress'
    | 'review'
    | 'completed'
    | 'blocked'
    | 'archived';
  dueDate: string;
  dateAlert?: 'approaching' | 'overdue';
  tags: string[];
  tagColors?: Array<'orange' | 'blue' | 'green' | 'purple' | 'pink' | 'yellow' | 'red' | 'gray'>;
  assignees: Array<{ name: string; image?: string }>;
  progress: number;
  showProgressBar?: boolean;
  showDateAlert?: boolean;
  credits?: number;
  attachments?: number;
  comments?: number;
  subtasks?: { completed: number; total: number };
  client?: { name: string; image?: string };
}

interface BoardColumn {
  key: ColumnKey;
  title: string;
  accentColor: string;
  bgClass: string;
  icon: typeof CheckSquare;
}

type ColumnFilterOption = 'manual' | 'delivery-date' | 'recent' | 'oldest';
type BoardScope = 'all' | 'mine' | 'user';

const TEAM = [
  {
    name: 'Ana Silva',
    image:
      'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?w=80&h=80&fit=crop&crop=face',
  },
  {
    name: 'Carlos Lima',
    image:
      'https://images.unsplash.com/photo-1672685667592-0392f458f46f?w=80&h=80&fit=crop&crop=face',
  },
  {
    name: 'Mariana Costa',
    image:
      'https://images.unsplash.com/photo-1641808895769-29e63aa2f066?w=80&h=80&fit=crop&crop=face',
  },
  {
    name: 'Rafael Santos',
    image:
      'https://images.unsplash.com/photo-1762708550141-2688121b9ebd?w=80&h=80&fit=crop&crop=face',
  },
  {
    name: 'Julia Ferreira',
    image:
      'https://images.unsplash.com/photo-1753162660224-7852bd04f827?w=80&h=80&fit=crop&crop=face',
  },
];

const DEFAULT_BOARD_COLUMNS: BoardColumn[] = [
  {
    key: 'todo',
    title: 'A fazer',
    accentColor: '#ff5623',
    bgClass: 'bg-[#FFF8F3] dark:bg-[#1d1511]',
    icon: CheckSquare,
  },
  {
    key: 'in-progress',
    title: 'Em progresso',
    accentColor: '#987dfe',
    bgClass: 'bg-[#F6F1FF] dark:bg-[#171425]',
    icon: Loader,
  },
  {
    key: 'review',
    title: 'Revisao',
    accentColor: '#3b82f6',
    bgClass: 'bg-[#F1F7FF] dark:bg-[#111b29]',
    icon: Search,
  },
  {
    key: 'internal-approval',
    title: 'Aprovacao interna',
    accentColor: '#feba31',
    bgClass: 'bg-[#FFF8E7] dark:bg-[#21190d]',
    icon: ShieldCheck,
  },
  {
    key: 'completed',
    title: 'Concluido',
    accentColor: '#019364',
    bgClass: 'bg-[#EFFAF5] dark:bg-[#10211a]',
    icon: Target,
  },
];

const INITIAL_CARDS: BoardCard[] = [
  {
    id: 'todo-1',
    column: 'todo',
    createdAt: '2026-03-09',
    type: 'simple',
    title: 'Refinar brief do cliente para campanha de maio',
    description: 'Consolidar feedback do time comercial e separar entregas que entram na sprint.',
    priority: 'high',
    status: 'todo',
    dueDate: '18 Mar',
    tags: ['Briefing', 'Cliente'],
    assignees: [TEAM[0]],
    progress: 10,
    showProgressBar: false,
    showDateAlert: false,
    credits: 14,
    client: { name: 'Arcadia' },
  },
  {
    id: 'todo-2',
    column: 'todo',
    createdAt: '2026-03-11',
    type: 'detailed',
    title: 'Subir assets iniciais do quadro comercial',
    description: 'Organizar capas, thumbs e textos-base para o kickoff da proxima campanha.',
    priority: 'medium',
    status: 'new',
    dueDate: '21 Mar',
    tags: ['Assets', 'Operacao'],
    tagColors: ['pink', 'orange'],
    assignees: TEAM.slice(0, 2),
    progress: 18,
    showDateAlert: false,
    credits: 8,
    attachments: 2,
    comments: 3,
    subtasks: { completed: 1, total: 5 },
    client: { name: 'Arcadia' },
  },
  {
    id: 'progress-1',
    column: 'in-progress',
    createdAt: '2026-03-06',
    type: 'detailed',
    title: 'Construir visao de board por perfil',
    description: 'Permitir alternar entre time interno, cliente e visao pessoal com filtros persistidos.',
    priority: 'high',
    status: 'in-progress',
    dueDate: '16 Mar',
    dateAlert: 'approaching',
    tags: ['Frontend', 'Permissoes'],
    tagColors: ['blue', 'purple'],
    assignees: TEAM.slice(1, 4),
    progress: 68,
    credits: 22,
    attachments: 4,
    comments: 10,
    subtasks: { completed: 6, total: 9 },
    client: { name: 'WePlanner' },
  },
  {
    id: 'progress-2',
    column: 'in-progress',
    createdAt: '2026-03-10',
    type: 'detailed',
    title: 'Aplicar dark mode nas colunas de board',
    description: 'Ajustar contraste dos cards e cabecalhos para o tema escuro.',
    priority: 'medium',
    status: 'in-progress',
    dueDate: '19 Mar',
    tags: ['Dark mode', 'UI'],
    tagColors: ['gray', 'orange'],
    assignees: TEAM.slice(0, 3),
    progress: 54,
    showDateAlert: false,
    credits: 16,
    attachments: 1,
    comments: 6,
    subtasks: { completed: 4, total: 7 },
    client: { name: 'WePlanner' },
  },
  {
    id: 'review-1',
    column: 'review',
    createdAt: '2026-03-04',
    type: 'detailed',
    title: 'Validar regras de ocultacao por coluna',
    description: 'Confirmar se colunas ocultas continuam acessiveis para gestores e lideres do squad.',
    priority: 'urgent',
    status: 'review',
    dueDate: '15 Mar',
    dateAlert: 'approaching',
    tags: ['QA', 'Governanca'],
    tagColors: ['green', 'yellow'],
    assignees: TEAM.slice(2, 5),
    progress: 88,
    credits: 20,
    attachments: 3,
    comments: 12,
    subtasks: { completed: 7, total: 8 },
    client: { name: 'Arcadia' },
  },
  {
    id: 'approval-1',
    column: 'internal-approval',
    createdAt: '2026-03-08',
    type: 'detailed',
    title: 'Liberar visao segmentada para clientes enterprise',
    description: 'Entrega depende da validacao interna de seguranca e checklist de privacidade.',
    priority: 'high',
    status: 'review',
    dueDate: '17 Mar',
    dateAlert: 'approaching',
    tags: ['Compliance', 'Cliente'],
    tagColors: ['red', 'blue'],
    assignees: TEAM.slice(0, 4),
    progress: 91,
    credits: 28,
    attachments: 5,
    comments: 9,
    subtasks: { completed: 5, total: 6 },
    client: { name: 'Arcadia' },
  },
  {
    id: 'completed-1',
    column: 'completed',
    createdAt: '2026-03-02',
    type: 'detailed',
    title: 'Estrutura base do board entregue',
    description: 'Sidebar, busca superior e colunas principais prontas no fluxo.',
    priority: 'medium',
    status: 'completed',
    dueDate: '12 Mar',
    tags: ['Board', 'Entrega'],
    tagColors: ['orange', 'green'],
    assignees: TEAM.slice(0, 5),
    progress: 100,
    credits: 32,
    attachments: 6,
    comments: 14,
    subtasks: { completed: 10, total: 10 },
    client: { name: 'WePlanner' },
  },
  {
    id: 'todo-3',
    column: 'todo',
    createdAt: '2026-03-13',
    type: 'detailed',
    title: 'Ajustar copy do onboarding de clientes',
    description: 'Revisar textos principais da jornada inicial e alinhar com o time de CS.',
    priority: 'low',
    status: 'todo',
    dueDate: '24 Mar',
    tags: ['Conteudo', 'Cliente'],
    tagColors: ['pink', 'blue'],
    assignees: [TEAM[4]],
    progress: 24,
    showProgressBar: false,
    showDateAlert: false,
    credits: 6,
    attachments: 1,
    comments: 2,
    client: { name: 'Arcadia' },
  },
  {
    id: 'review-2',
    column: 'review',
    createdAt: '2026-03-12',
    type: 'detailed',
    title: 'Validar checklist visual da sprint comercial',
    description: 'Conferir espaçamentos, badges e comportamento em cards sem subtarefas.',
    priority: 'medium',
    status: 'review',
    dueDate: '20 Mar',
    tags: ['UI', 'QA'],
    tagColors: ['orange', 'green'],
    assignees: TEAM.slice(1, 3),
    progress: 72,
    showProgressBar: false,
    showDateAlert: false,
    credits: 11,
    attachments: 2,
    comments: 4,
    client: { name: 'WePlanner' },
  },
  {
    id: 'progress-3',
    column: 'in-progress',
    createdAt: '2026-03-14',
    type: 'detailed',
    title: 'Revisar assets da apresentacao comercial',
    description: 'Consolidar imagens, anexos e feedbacks para a apresentacao do squad de vendas.',
    priority: 'high',
    status: 'in-progress',
    dueDate: '22 Mar',
    tags: ['Comercial', 'Assets'],
    tagColors: ['yellow', 'blue'],
    assignees: TEAM.slice(0, 2),
    progress: 42,
    showProgressBar: false,
    showDateAlert: false,
    credits: 13,
    attachments: 5,
    comments: 7,
    client: { name: 'Arcadia' },
  },
  {
    id: 'approval-2',
    column: 'internal-approval',
    createdAt: '2026-03-07',
    type: 'detailed',
    title: 'Aprovar briefing final do cliente enterprise',
    description: 'Centralizar versoes finais, anexos e comentarios para validacao interna.',
    priority: 'medium',
    status: 'review',
    dueDate: '25 Mar',
    tags: ['Briefing', 'Enterprise'],
    tagColors: ['orange', 'purple'],
    assignees: TEAM.slice(2, 5),
    progress: 64,
    showProgressBar: false,
    showDateAlert: false,
    credits: 9,
    attachments: 3,
    comments: 6,
    client: { name: 'WePlanner' },
  },
];

const COLUMN_FILTER_OPTIONS: Array<{ value: ColumnFilterOption; label: string }> = [
  { value: 'delivery-date', label: 'Data de entrega' },
  { value: 'recent', label: 'Recentes' },
  { value: 'oldest', label: 'Antigos' },
];

const EMPTY_DRAG_IMAGE_SRC =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

const MONTH_MAP: Record<string, number> = {
  Jan: 0,
  Fev: 1,
  Mar: 2,
  Abr: 3,
  Mai: 4,
  Jun: 5,
  Jul: 6,
  Ago: 7,
  Set: 8,
  Out: 9,
  Nov: 10,
  Dez: 11,
};

const parseBoardDate = (value: string) => {
  const [day, month] = value.split(' ');
  const monthIndex = MONTH_MAP[month] ?? 0;
  return new Date(2026, monthIndex, Number(day));
};

const formatCreatedAt = (value: string) => {
  const date = new Date(value);
  const monthLabel = Object.keys(MONTH_MAP).find(
    (month) => MONTH_MAP[month] === date.getMonth(),
  );
  return `${String(date.getDate()).padStart(2, '0')} ${monthLabel}, ${date.getFullYear()}`;
};

export function KanbanWorkspacePage({
  onBackToDesignSystem,
  darkMode = false,
  onToggleDarkMode,
}: KanbanWorkspacePageProps) {
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [boardColumns, setBoardColumns] = useState(DEFAULT_BOARD_COLUMNS);
  const [searchQuery, setSearchQuery] = useState('');
  const [boardScope, setBoardScope] = useState<BoardScope>('all');
  const [selectedUser, setSelectedUser] = useState<string>('Ana Silva');
  const [organizeMenuOpen, setOrganizeMenuOpen] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState<ColumnKey[]>([]);
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [automationColumn, setAutomationColumn] = useState<BoardColumn | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<ColumnKey, ColumnFilterOption>>({
    todo: 'manual',
    'in-progress': 'manual',
    review: 'manual',
    'internal-approval': 'manual',
    completed: 'manual',
  });
  const [selectedCard, setSelectedCard] = useState<BoardCard | null>(null);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ColumnKey | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{
    columnKey: ColumnKey;
    targetCardId: string | null;
    placement: 'before' | 'after';
  } | null>(null);
  const [completingCardIds, setCompletingCardIds] = useState<string[]>([]);
  const [compactCardIds, setCompactCardIds] = useState<string[]>([]);
  const [movingCardIds, setMovingCardIds] = useState<string[]>([]);
  const boardScrollRef = useRef<HTMLDivElement | null>(null);
  const organizeMenuRef = useRef<HTMLDivElement | null>(null);
  const panStateRef = useRef({
    isPanning: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });
  const suppressCardClickRef = useRef(false);
  const [dragPreview, setDragPreview] = useState<{
    cardId: string;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (!organizeMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | globalThis.MouseEvent) => {
      const target = event.target as Node | null;
      if (!target || organizeMenuRef.current?.contains(target)) {
        return;
      }
      setOrganizeMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [organizeMenuOpen]);

  const visibleColumns = boardColumns.filter(
    (column) => !hiddenColumns.includes(column.key),
  );

  const cardsByColumn = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return visibleColumns.reduce<Record<ColumnKey, BoardCard[]>>((acc, column) => {
      let columnCards = cards.filter(
        (card) => card.column === column.key && card.status !== 'archived',
      );

      if (boardScope === 'mine') {
        columnCards = columnCards.filter((card) =>
          card.assignees.some((assignee) => assignee.name === 'Ana Silva'),
        );
      }

      if (boardScope === 'user') {
        columnCards = columnCards.filter((card) =>
          card.assignees.some((assignee) => assignee.name === selectedUser),
        );
      }

      if (normalizedQuery) {
        columnCards = columnCards.filter(
          (card) =>
            card.title.toLowerCase().includes(normalizedQuery) ||
            card.description.toLowerCase().includes(normalizedQuery) ||
            card.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)),
        );
      }

      const filterOption = columnFilters[column.key];
      if (filterOption === 'manual') {
        acc[column.key] = columnCards;
        return acc;
      }

      columnCards = [...columnCards].sort((left, right) => {
        if (filterOption === 'recent') {
          return (
            new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
          );
        }

        if (filterOption === 'oldest') {
          return (
            new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
          );
        }

        return parseBoardDate(left.dueDate).getTime() - parseBoardDate(right.dueDate).getTime();
      });

      acc[column.key] = columnCards;
      return acc;
    }, {} as Record<ColumnKey, BoardCard[]>);
  }, [boardScope, cards, columnFilters, searchQuery, selectedUser, visibleColumns]);

  const draggedCard = cards.find((card) => card.id === dragPreview?.cardId);
  const organizeLabel =
    boardScope === 'mine'
      ? 'Minhas tarefas'
      : boardScope === 'user'
        ? selectedUser
        : 'Todas as tarefas';

  const toggleColumnVisibility = (columnKey: ColumnKey) => {
    setHiddenColumns((current) =>
      current.includes(columnKey)
        ? current.filter((key) => key !== columnKey)
        : [...current, columnKey],
    );
  };

  const updateColumnFilter = (columnKey: ColumnKey, value: ColumnFilterOption) => {
    setColumnFilters((current) => ({
      ...current,
      [columnKey]: current[columnKey] === value ? 'manual' : value,
    }));
  };

  const deleteColumn = (columnKey: ColumnKey) => {
    setBoardColumns((current) => current.filter((column) => column.key !== columnKey));
    setHiddenColumns((current) => current.filter((key) => key !== columnKey));
  };

  const archiveColumnTasks = (columnKey: ColumnKey) => {
    setCards((current) =>
      current.map((card) =>
        card.column === columnKey ? { ...card, status: 'archived' } : card,
      ),
    );
  };

  const archiveCard = (cardId: string) => {
    setCards((current) =>
      current.map((card) =>
        card.id === cardId ? { ...card, status: 'archived' } : card,
      ),
    );
  };

  const duplicateCard = (cardId: string) => {
    setCards((current) => {
      const source = current.find((card) => card.id === cardId);
      if (!source) {
        return current;
      }

      return [
        {
          ...source,
          id: `${source.id}-copy-${Date.now()}`,
          title: `${source.title} (copia)`,
          createdAt: new Date().toISOString().slice(0, 10),
        },
        ...current,
      ];
    });
  };

  const copyCardLink = async (cardId: string) => {
    const link = `${window.location.origin}${window.location.pathname}#/kanban-workspace?card=${cardId}`;

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(link);
    }
  };

  const toggleCompactCard = (cardId: string) => {
    setCompactCardIds((current) =>
      current.includes(cardId)
        ? current.filter((id) => id !== cardId)
        : [...current, cardId],
    );
  };

  const handleDragStart = (
    cardId: string,
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    const emptyImage = new Image();
    emptyImage.src = EMPTY_DRAG_IMAGE_SRC;
    event.dataTransfer.setDragImage(emptyImage, 0, 0);
    setDraggedCardId(cardId);
    setDragPreview({
      cardId,
      x: event.clientX + 16,
      y: event.clientY + 16,
    });
  };

  const handleDrag = (event: React.DragEvent<HTMLDivElement>) => {
    if (!draggedCardId || (event.clientX === 0 && event.clientY === 0)) {
      return;
    }

    setDragPreview({
      cardId: draggedCardId,
      x: event.clientX + 16,
      y: event.clientY + 16,
    });
  };

  const moveCardToPosition = (
    currentCards: BoardCard[],
    movingCardId: string,
    destinationColumn: ColumnKey,
    targetCardId?: string | null,
    placement: 'before' | 'after' = 'after',
  ) => {
    const movingCard = currentCards.find((card) => card.id === movingCardId);
    if (!movingCard) {
      return currentCards;
    }

    const remainingCards = currentCards.filter((card) => card.id !== movingCardId);
    const archivedCards = remainingCards.filter((card) => card.status === 'archived');
    const activeCards = remainingCards.filter((card) => card.status !== 'archived');

    const columnsMap = boardColumns.reduce<Record<ColumnKey, BoardCard[]>>(
      (acc, column) => {
        acc[column.key] = activeCards.filter((card) => card.column === column.key);
        return acc;
      },
      {} as Record<ColumnKey, BoardCard[]>,
    );

    const destinationList = [...(columnsMap[destinationColumn] || [])];
    const nextCard = { ...movingCard, column: destinationColumn, previousColumn: destinationColumn };

    if (!targetCardId) {
      destinationList.push(nextCard);
    } else {
      const targetIndex = destinationList.findIndex((card) => card.id === targetCardId);
      const insertIndex =
        targetIndex === -1
          ? destinationList.length
          : placement === 'before'
            ? targetIndex
            : targetIndex + 1;
      destinationList.splice(insertIndex, 0, nextCard);
    }

    columnsMap[destinationColumn] = destinationList;

    return [
      ...boardColumns.flatMap((column) => columnsMap[column.key] || []),
      ...archivedCards,
    ];
  };

  const handleDrop = (
    columnKey: ColumnKey,
    targetCardId?: string | null,
    placement: 'before' | 'after' = 'after',
  ) => {
    if (!draggedCardId) {
      return;
    }

    setCards((current) =>
      moveCardToPosition(current, draggedCardId, columnKey, targetCardId, placement),
    );
    setDraggedCardId(null);
    setDragOverColumn(null);
    setDropIndicator(null);
    setDragPreview(null);
  };

  const clearDragState = () => {
    setDraggedCardId(null);
    setDragOverColumn(null);
    setDropIndicator(null);
    setDragPreview(null);
  };

  const handleBoardMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest('[data-no-pan="true"]')) {
      return;
    }

    const container = boardScrollRef.current;
    if (!container) {
      return;
    }

    panStateRef.current = {
      isPanning: true,
      startX: event.clientX,
      startScrollLeft: container.scrollLeft,
      moved: false,
    };

    container.classList.add('is-panning');
  };

  const handleBoardMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const container = boardScrollRef.current;
    if (!container || !panStateRef.current.isPanning) {
      return;
    }

    const deltaX = event.clientX - panStateRef.current.startX;
    if (Math.abs(deltaX) > 3) {
      panStateRef.current.moved = true;
      suppressCardClickRef.current = true;
    }

    container.scrollLeft = panStateRef.current.startScrollLeft - deltaX;
    event.preventDefault();
  };

  const stopBoardPan = () => {
    const container = boardScrollRef.current;
    if (container) {
      container.classList.remove('is-panning');
    }
    panStateRef.current.isPanning = false;
  };

  const toggleCardComplete = (cardId: string) => {
    const targetCard = cards.find((card) => card.id === cardId);
    if (!targetCard) {
      return;
    }

    if (completingCardIds.includes(cardId) || movingCardIds.includes(cardId)) {
      return;
    }

    if (targetCard.status === 'completed') {
      setCards((current) =>
        current.map((card) => {
          if (card.id !== cardId) {
            return card;
          }

          return {
            ...card,
            column: card.previousColumn || 'todo',
            status: card.previousStatus || 'todo',
            progress: card.previousProgress ?? card.progress,
          };
        }),
      );
      return;
    }

    setCompletingCardIds((current) => [...current, cardId]);
    window.setTimeout(() => {
      setCards((current) =>
        current.map((card) => {
          if (card.id !== cardId) {
            return card;
          }

          return {
            ...card,
            previousColumn: card.column,
            previousStatus: card.status,
            previousProgress: card.progress,
            status: 'completed',
            progress: 100,
          };
        }),
      );
      setMovingCardIds((current) => [...current, cardId]);
      setCompletingCardIds((current) =>
        current.filter((currentId) => currentId !== cardId),
      );
    }, 360);

    window.setTimeout(() => {
      setCards((current) =>
        current.map((card) => {
          if (card.id !== cardId) {
            return card;
          }

          return {
            ...card,
            column: 'completed',
            status: 'completed',
            progress: 100,
          };
        }),
      );
      setMovingCardIds((current) =>
        current.filter((currentId) => currentId !== cardId),
      );
    }, 960);
  };

  const modalTask = selectedCard
    ? {
        title: selectedCard.title,
        description: selectedCard.description,
        priority: selectedCard.priority,
        status: selectedCard.status,
        subtasks: selectedCard.subtasks,
        progress: selectedCard.progress,
        dueDate: selectedCard.dueDate,
        dateAlert: selectedCard.dateAlert,
        tags: selectedCard.tags.map((label, index) => ({
          label,
          color: selectedCard.tagColors?.[index] || 'gray',
        })),
        assignees: selectedCard.assignees,
        attachments: selectedCard.attachments,
        comments: [
          {
            id: 'c1',
            author: selectedCard.assignees[0] || { name: 'Ana Silva' },
            text: 'Card em acompanhamento dentro do board.',
            timestamp: 'Hoje as 10:20',
          },
        ],
        credits: selectedCard.credits,
        client: selectedCard.client?.name,
        createdAt: formatCreatedAt(selectedCard.createdAt),
      }
    : null;

  const renderCard = (card: BoardCard) => {
    const isCompleting = completingCardIds.includes(card.id);
    const isMovingToCompleted = movingCardIds.includes(card.id);
    const isCompact = compactCardIds.includes(card.id);
    const handleOpenCard = () => {
      if (suppressCardClickRef.current) {
        suppressCardClickRef.current = false;
        return;
      }
      if (isCompleting || isMovingToCompleted) {
        return;
      }
      setSelectedCard(card);
    };

    const cardActions = (
      <div data-no-pan="true" className="flex items-center gap-1">
        <button
          className="opacity-0 group-hover:opacity-100 rounded-md p-1 transition-all hover:bg-[#f5f5f5] dark:hover:bg-[#232325]"
          onClick={(event) => {
            event.stopPropagation();
            toggleCompactCard(card.id);
          }}
        >
          {isCompact ? (
            <Maximize2 className="h-4 w-4 text-[#a3a3a3]" />
          ) : (
            <Minimize2 className="h-4 w-4 text-[#a3a3a3]" />
          )}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="opacity-0 group-hover:opacity-100 rounded-md p-1 transition-all hover:bg-[#f5f5f5] dark:hover:bg-[#232325]"
              onClick={(event) => event.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4 text-[#a3a3a3]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52 rounded-2xl border-[#E5E7E4] bg-white p-2 dark:border-[#2D2F30] dark:bg-[#171819]"
          >
            <DropdownMenuItem onClick={() => setSelectedCard(card)} className="rounded-xl px-3 py-2.5">
              <Pencil className="h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => archiveCard(card.id)} className="rounded-xl px-3 py-2.5">
              <Archive className="h-4 w-4" />
              Arquivar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => duplicateCard(card.id)} className="rounded-xl px-3 py-2.5">
              <Copy className="h-4 w-4" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                void copyCardLink(card.id);
              }}
              className="rounded-xl px-3 py-2.5"
            >
              <Link2 className="h-4 w-4" />
              Copiar link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );

    if (isCompact) {
      return (
        <div className="group relative">
          <TaskCard
            title={card.title}
            status={card.status}
            assignee={{
              name: card.assignees[0]?.name || 'Sem responsavel',
              avatar: card.assignees[0]?.image,
            }}
            dueDate={card.dueDate}
            commentsCount={card.comments}
            attachmentsCount={card.attachments}
            priority={card.priority === 'urgent' ? 'high' : card.priority}
            credits={card.credits}
            actions={cardActions}
            hideDescription
            showCompleteButton
            onToggleComplete={() => toggleCardComplete(card.id)}
            isCompleting={isCompleting}
            onClick={handleOpenCard}
          />
        </div>
      );
    }

    return (
      <DetailedTaskCard
        title={card.title}
        description={card.description}
        priority={card.priority}
        status={card.status}
        subtasks={card.subtasks}
        progress={card.progress}
        showProgressBar={card.showProgressBar ?? true}
        showDateAlert={card.showDateAlert ?? true}
        dueDate={card.dueDate}
        dateAlert={card.dateAlert}
        tags={card.tags.map((label, index) => ({
          label,
          color: card.tagColors?.[index] || 'gray',
        }))}
        assignees={card.assignees}
        attachments={card.attachments}
        comments={card.comments}
        credits={card.credits}
        client={card.client}
        actions={cardActions}
        onClick={handleOpenCard}
        onToggleComplete={() => toggleCardComplete(card.id)}
        isCompleting={isCompleting}
        isMovingToCompleted={isMovingToCompleted}
      />
    );
  };

  return (
    <section className="min-h-screen bg-[#F6F8F6] px-0 dark:bg-[#0f0f10]">
      <div className="flex min-h-screen items-start">
        <aside
          className={cn(
            'sticky top-0 h-screen shrink-0 overflow-hidden border-r border-[#E5E7E4] bg-white dark:border-[#232425] dark:bg-[#121313] transition-all',
            collapsedSidebar ? 'w-[84px]' : 'w-[252px]',
          )}
        >
          <div className="flex h-full flex-col p-4">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#ff5623] text-white shadow-[0_14px_34px_-18px_rgba(255,86,35,0.8)]">
                  <FolderKanban className="h-5 w-5" />
                </div>
                {!collapsedSidebar && (
                  <div>
                    <p className="text-sm font-semibold text-[#171717] dark:text-white">
                      WePlanner
                    </p>
                    <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                      Workspace
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setCollapsedSidebar((current) => !current)}
                className="rounded-xl p-2 text-[#737373] transition-colors hover:bg-[#F6F8F6] dark:text-[#A3A3A3] dark:hover:bg-[#1A1B1C]"
              >
                {collapsedSidebar ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Visao geral', icon: LayoutDashboard, active: false },
                { label: 'Board', icon: FolderKanban, active: true },
                { label: 'Equipe', icon: Users, active: false },
              ].map((item) => (
                <button
                  key={item.label}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-colors',
                    item.active
                      ? 'bg-[#F6F8F6] text-[#171717] dark:bg-[#1A1B1C] dark:text-white'
                      : 'text-[#525252] hover:bg-[#F6F8F6] dark:text-[#A3A3A3] dark:hover:bg-[#1A1B1C]',
                    collapsedSidebar && 'justify-center',
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsedSidebar && <span>{item.label}</span>}
                </button>
              ))}
            </div>

            <div className="mt-auto space-y-2">
              {onBackToDesignSystem && (
                <Button
                  variant="outline"
                  className={cn(
                    'w-full rounded-2xl dark:border-[#2D2F30]',
                    collapsedSidebar && 'px-0',
                  )}
                  onClick={onBackToDesignSystem}
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  {!collapsedSidebar && 'Design System'}
                </Button>
              )}
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 bg-[#F6F8F6] dark:bg-[#0f0f10] flex flex-col">
          <div className="border-b border-[#E5E7E4] px-6 py-6 dark:border-[#232425]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#171717] dark:text-white">
                  Meu quadro
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[280px] flex-1 xl:w-[360px] xl:flex-none">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Buscar cards"
                    className="h-11 rounded-2xl border-[#E5E7E4] bg-white pl-10 dark:border-[#2D2F30] dark:bg-[#171819]"
                  />
                </div>

                <AvatarStack avatars={TEAM} max={5} size="md" />

                <div ref={organizeMenuRef} className="relative" data-no-pan="true">
                  <button
                    type="button"
                    onClick={() => setOrganizeMenuOpen((current) => !current)}
                    className="flex h-11 items-center gap-2 rounded-2xl border border-[#E5E7E4] bg-white px-4 text-sm font-medium text-[#171717] transition-colors hover:bg-[#F6F8F6] dark:border-[#2D2F30] dark:bg-[#171819] dark:text-[#F5F5F5] dark:hover:bg-[#1e2021]"
                  >
                    <ArrowDownWideNarrow className="h-4 w-4" />
                    <span>Organizar por: {organizeLabel}</span>
                    <ChevronsUpDown className="h-4 w-4 opacity-60" />
                  </button>

                  {organizeMenuOpen && (
                    <div className="absolute right-0 top-[calc(100%+10px)] z-[90] w-[320px] rounded-[24px] border border-[#E5E7E4] bg-white p-2 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.35)] dark:border-[#2D2F30] dark:bg-[#121313]">
                      <div className="px-3 py-2 text-sm font-semibold text-[#171717] dark:text-white">
                        Visualizacao do quadro
                      </div>
                      <div className="space-y-1 border-t border-[#F1F3F1] px-1 pt-2 dark:border-[#232425]">
                        <button
                          onClick={() => {
                            setBoardScope('all');
                            setOrganizeMenuOpen(false);
                          }}
                          className={cn(
                            'flex w-full items-center rounded-2xl px-3 py-2.5 text-left text-sm transition-colors',
                            boardScope === 'all'
                              ? 'bg-[#FFF4EE] text-[#c2410c] dark:bg-[#26150f] dark:text-[#ffb39c]'
                              : 'text-[#525252] hover:bg-[#F6F8F6] dark:text-[#D4D4D4] dark:hover:bg-[#1A1B1C]',
                          )}
                        >
                          Todas as tarefas
                        </button>
                        <button
                          onClick={() => {
                            setBoardScope('mine');
                            setOrganizeMenuOpen(false);
                          }}
                          className={cn(
                            'flex w-full items-center rounded-2xl px-3 py-2.5 text-left text-sm transition-colors',
                            boardScope === 'mine'
                              ? 'bg-[#FFF4EE] text-[#c2410c] dark:bg-[#26150f] dark:text-[#ffb39c]'
                              : 'text-[#525252] hover:bg-[#F6F8F6] dark:text-[#D4D4D4] dark:hover:bg-[#1A1B1C]',
                          )}
                        >
                          Minhas tarefas
                        </button>
                      </div>
                      <div className="mt-2 border-t border-[#F1F3F1] px-1 pt-2 dark:border-[#232425]">
                        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A3A3A3]">
                          Selecionar usuario
                        </p>
                        <div className="space-y-1">
                          {TEAM.map((member) => (
                            <button
                              key={member.name}
                              onClick={() => {
                                setSelectedUser(member.name);
                                setBoardScope('user');
                                setOrganizeMenuOpen(false);
                              }}
                              className={cn(
                                'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition-colors',
                                boardScope === 'user' && selectedUser === member.name
                                  ? 'bg-[#FFF4EE] text-[#c2410c] dark:bg-[#26150f] dark:text-[#ffb39c]'
                                  : 'text-[#525252] hover:bg-[#F6F8F6] dark:text-[#D4D4D4] dark:hover:bg-[#1A1B1C]',
                              )}
                            >
                              <img
                                src={member.image}
                                alt={member.name}
                                className="h-7 w-7 rounded-full object-cover"
                              />
                              <span className="font-medium">{member.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  className="rounded-2xl bg-[#ff5623] text-white hover:bg-[#c2410c]"
                  onClick={() => setCreateTaskModalOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Criar tarefa
                </Button>
                <Button className="rounded-2xl bg-[#171717] text-white hover:bg-[#2c2c2c] dark:bg-white dark:text-[#171717] dark:hover:bg-[#e8e8e8]">
                  <Plus className="h-4 w-4" />
                  Criar coluna
                </Button>
                <button
                  onClick={onToggleDarkMode}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E5E7E4] bg-white text-[#525252] transition-colors hover:bg-[#F0F3F0] dark:border-[#2D2F30] dark:bg-[#171819] dark:text-[#F5F5F5]"
                >
                  {darkMode ? (
                    <Sun className="h-4 w-4 text-[#feba31]" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {hiddenColumns.length > 0 && (
            <div className="px-6 pt-4">
              <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#E5E7E4] bg-white px-4 py-3 dark:border-[#2D2F30] dark:bg-[#171819]">
                <span className="text-sm font-medium text-[#525252] dark:text-[#D4D4D4]">
                  Colunas ocultas:
                </span>
                {boardColumns.filter((column) =>
                  hiddenColumns.includes(column.key),
                ).map((column) => (
                  <button
                    key={column.key}
                    onClick={() => toggleColumnVisibility(column.key)}
                    className="rounded-full bg-[#F3F5F3] px-3 py-1.5 text-xs font-semibold text-[#525252] dark:bg-[#1E2021] dark:text-[#D4D4D4]"
                  >
                    Mostrar {column.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1">
            <div
              ref={boardScrollRef}
              className="board-scrollbar flex cursor-grab items-start gap-4 overflow-x-auto overflow-y-visible px-6 py-6 active:cursor-grabbing"
              onMouseDown={handleBoardMouseDown}
              onMouseMove={handleBoardMouseMove}
              onMouseUp={stopBoardPan}
              onMouseLeave={stopBoardPan}
            >
              {visibleColumns.map((column) => {
              const columnCards = cardsByColumn[column.key] || [];
              const isDropTarget = dragOverColumn === column.key;

              return (
                <div
                  key={column.key}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOverColumn(column.key);
                    if (!columnCards.length) {
                      setDropIndicator({
                        columnKey: column.key,
                        targetCardId: null,
                        placement: 'after',
                      });
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverColumn === column.key) {
                      setDragOverColumn(null);
                    }
                  }}
                  onDrop={() =>
                    handleDrop(
                      column.key,
                      dropIndicator?.columnKey === column.key
                        ? dropIndicator.targetCardId
                        : null,
                      dropIndicator?.columnKey === column.key
                        ? dropIndicator.placement
                        : 'after',
                    )
                  }
                >
                  <KanbanColumn
                    title={column.title}
                    icon={column.icon}
                    count={columnCards.length}
                    accentColor={column.accentColor}
                    className={cn(
                      'min-w-[340px] max-w-[340px] shrink-0 border-[#E5E7E4] dark:border-[#232425]',
                      column.bgClass,
                      isDropTarget && 'ring-2 ring-[#ff5623]/35',
                    )}
                    actions={
                      <div data-no-pan="true" className="flex items-center gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="rounded-lg p-1.5 text-[#737373] transition-colors hover:bg-white/70 dark:text-[#A3A3A3] dark:hover:bg-[#1b1c1d]">
                              <Filter className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-52 rounded-2xl border-[#E5E7E4] bg-white p-2 dark:border-[#2D2F30] dark:bg-[#171819]"
                          >
                            <DropdownMenuLabel>Filtrar coluna</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {COLUMN_FILTER_OPTIONS.map((option) => (
                              <DropdownMenuItem
                                key={option.value}
                                onClick={() => updateColumnFilter(column.key, option.value)}
                                className={cn(
                                  'rounded-xl px-3 py-2.5',
                                  columnFilters[column.key] === option.value &&
                                    'bg-[#FFF4EE] text-[#c2410c] dark:bg-[#26150f] dark:text-[#ffb39c]',
                                )}
                              >
                                {option.label}
                              </DropdownMenuItem>
                            ))}
                            {columnFilters[column.key] !== 'manual' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => updateColumnFilter(column.key, columnFilters[column.key])}
                                  className="rounded-xl px-3 py-2.5"
                                >
                                  Voltar para ordem manual
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <button
                          onClick={() => toggleColumnVisibility(column.key)}
                          className="rounded-lg p-1.5 text-[#737373] transition-colors hover:bg-white/70 dark:text-[#A3A3A3] dark:hover:bg-[#1b1c1d]"
                        >
                          <EyeOff className="h-4 w-4" />
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="rounded-lg p-1.5 text-[#737373] transition-colors hover:bg-white/70 dark:text-[#A3A3A3] dark:hover:bg-[#1b1c1d]">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-60 rounded-2xl border-[#E5E7E4] bg-white p-2 dark:border-[#2D2F30] dark:bg-[#171819]"
                          >
                            <DropdownMenuLabel>{column.title}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setCreateTaskModalOpen(true)}
                              className="rounded-xl px-3 py-2.5"
                            >
                              <Plus className="h-4 w-4" />
                              Adicionar tarefa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => archiveColumnTasks(column.key)}
                              className="rounded-xl px-3 py-2.5"
                            >
                              <Archive className="h-4 w-4" />
                              Arquivar todas as tarefas
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setAutomationColumn(column)}
                              className="rounded-xl px-3 py-2.5"
                            >
                              <WandSparkles className="h-4 w-4" />
                              Criar automacao
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => deleteColumn(column.key)}
                              variant="destructive"
                              className="rounded-xl px-3 py-2.5"
                            >
                              <Trash2 className="h-4 w-4" />
                              Deletar coluna
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    }
                  >
                    {columnCards.map((card) => (
                      <div
                        key={card.id}
                        data-no-pan="true"
                        draggable={!movingCardIds.includes(card.id)}
                        onDragStart={(event) => handleDragStart(card.id, event)}
                        onDrag={handleDrag}
                        onDragEnd={clearDragState}
                        onDragOver={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          const rect = event.currentTarget.getBoundingClientRect();
                          const placement =
                            event.clientY < rect.top + rect.height / 2
                              ? 'before'
                              : 'after';
                          setDragOverColumn(column.key);
                          setDropIndicator({
                            columnKey: column.key,
                            targetCardId: card.id,
                            placement,
                          });
                        }}
                        className={cn(
                          'group relative cursor-grab active:cursor-grabbing',
                          movingCardIds.includes(card.id) &&
                            'animate-card-fly-to-completed pointer-events-none',
                          draggedCardId === card.id && 'opacity-0',
                        )}
                      >
                        {dropIndicator?.columnKey === column.key &&
                          dropIndicator?.targetCardId === card.id &&
                          dropIndicator.placement === 'before' && (
                            <div className="mb-2 h-[3px] rounded-full bg-[#ff5623]" />
                          )}
                        {renderCard(card)}
                        {dropIndicator?.columnKey === column.key &&
                          dropIndicator?.targetCardId === card.id &&
                          dropIndicator.placement === 'after' && (
                            <div className="mt-2 h-[3px] rounded-full bg-[#ff5623]" />
                          )}
                      </div>
                    ))}

                    {columnCards.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-[#D5DAD5] bg-white/70 px-4 py-8 text-center text-sm text-[#737373] dark:border-[#2F3132] dark:bg-[#161718] dark:text-[#A3A3A3]">
                        Solte um card aqui
                      </div>
                    )}
                  </KanbanColumn>
                </div>
              );
              })}
            </div>
          </div>
        </div>
      </div>

      {dragPreview && draggedCard && (
        <div
          className="pointer-events-none fixed left-0 top-0 z-[120] w-[340px]"
          style={{
            transform: `translate(${dragPreview.x}px, ${dragPreview.y}px)`,
          }}
        >
          <div className="scale-[1.01] drop-shadow-[0_26px_44px_rgba(16,16,16,0.24)]">
            {renderCard(draggedCard)}
          </div>
        </div>
      )}

      <Dialog open={!!automationColumn} onOpenChange={(open) => !open && setAutomationColumn(null)}>
        <DialogContent className="max-w-lg rounded-[28px] border-[#E5E7E4] bg-white p-6 dark:border-[#2D2F30] dark:bg-[#121313]">
          <DialogHeader>
            <DialogTitle className="text-[#171717] dark:text-white">
              Criar automacao
            </DialogTitle>
            <DialogDescription>
              Sugestoes rapidas para a coluna {automationColumn?.title?.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            {[
              'Mover para revisao quando o progresso atingir 100%',
              'Notificar responsaveis quando a entrega estiver proxima',
              'Arquivar tarefas concluidas apos 7 dias',
            ].map((option) => (
              <button
                key={option}
                onClick={() => setAutomationColumn(null)}
                className="rounded-2xl border border-[#E5E7E4] bg-white px-4 py-3 text-left text-sm font-medium text-[#525252] transition-colors hover:border-[#ff5623]/20 hover:bg-[#FFF4EE] hover:text-[#c2410c] dark:border-[#2D2F30] dark:bg-[#171819] dark:text-[#D4D4D4] dark:hover:bg-[#26150f] dark:hover:text-[#ffb39c]"
              >
                {option}
              </button>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-2xl dark:border-[#2D2F30]"
              onClick={() => setAutomationColumn(null)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateTaskModal
        isOpen={createTaskModalOpen}
        onClose={() => setCreateTaskModalOpen(false)}
      />

      {modalTask && (
        <TaskDetailModal
          isOpen={!!selectedCard}
          onClose={() => setSelectedCard(null)}
          task={modalTask}
        />
      )}
    </section>
  );
}
