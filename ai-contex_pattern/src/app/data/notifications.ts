import type { NotificationItem } from "../components/shared/NotificationCard";
import { DEFAULT_BOARD_ID } from "../../demo/kanbanWorkspaceSeed";

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    type: "mention",
    actor: {
      name: "Rafael Santos",
      image:
        "https://images.unsplash.com/photo-1762708550141-2688121b9ebd?w=80&h=80&fit=crop&crop=face",
    },
    message: "mencionou você na tarefa",
    taskTitle: "Construir visão de board por perfil",
    timestamp: "Há 5 minutos",
    isRead: false,
    boardId: DEFAULT_BOARD_ID,
    taskId: "progress-1",
  },
  {
    id: "n2",
    type: "comment",
    actor: { name: "Felipe Stephan" },
    message: "mencionou você nos comentários da tarefa",
    taskTitle: "Validar regras de ocultação por coluna",
    timestamp: "Há 15 minutos",
    isRead: false,
    boardId: DEFAULT_BOARD_ID,
    taskId: "review-1",
  },
  {
    id: "n3",
    type: "completed",
    actor: {
      name: "Carlos Lima",
      image:
        "https://images.unsplash.com/photo-1672685667592-0392f458f46f?w=80&h=80&fit=crop&crop=face",
    },
    message: "concluiu a tarefa",
    taskTitle: "Estrutura base do board entregue",
    timestamp: "Há 1 hora",
    isRead: false,
    boardId: DEFAULT_BOARD_ID,
    taskId: "completed-1",
  },
  {
    id: "n4",
    type: "assigned",
    actor: {
      name: "Ana Silva",
      image:
        "https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?w=80&h=80&fit=crop&crop=face",
    },
    message: "atribuiu você à tarefa",
    taskTitle: "Subir assets iniciais do quadro comercial",
    timestamp: "Há 2 horas",
    isRead: true,
    boardId: DEFAULT_BOARD_ID,
    taskId: "todo-2",
  },
  {
    id: "n5",
    type: "overdue",
    actor: { name: "Sistema WePlanner" },
    message: "a tarefa está atrasada:",
    taskTitle: "Liberar visão segmentada para clientes enterprise",
    timestamp: "Há 3 horas",
    isRead: true,
    boardId: DEFAULT_BOARD_ID,
    taskId: "approval-1",
  },
  {
    id: "n6",
    type: "attachment",
    actor: {
      name: "Mariana Costa",
      image:
        "https://images.unsplash.com/photo-1641808895769-29e63aa2f066?w=80&h=80&fit=crop&crop=face",
    },
    message: "anexou um arquivo na tarefa",
    taskTitle: "Aplicar dark mode nas colunas de board",
    timestamp: "Ontem às 16:30",
    isRead: true,
    boardId: DEFAULT_BOARD_ID,
    taskId: "progress-2",
  },
];
