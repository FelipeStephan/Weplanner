import {
  Sparkles,
  Shield,
  Activity,
  Calendar,
  Bell,
  Search,
  LayoutDashboard,
  CheckSquare,
  Users,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const DS_PRINCIPLES: Array<{
  icon: LucideIcon;
  title: string;
  description: string;
}> = [
  {
    icon: Sparkles,
    title: "Clareza operacional",
    description:
      "Cada bloco precisa ajudar o usuário a decidir rápido, sem ruído visual ou excesso de estados concorrendo.",
  },
  {
    icon: Shield,
    title: "Consistência confiável",
    description:
      "Estados, espaçamentos, tipografia e feedbacks devem repetir padrões para reduzir curva de aprendizagem.",
  },
  {
    icon: Activity,
    title: "Contexto acionável",
    description:
      "Boards, calendário, notificações e busca precisam exibir informação útil e abrir caminhos diretos para ação.",
  },
];

export const DS_COLORS: Array<{
  name: string;
  hex: string;
  helper: string;
}> = [
  { name: "Primary", hex: "#ff5623", helper: "CTA principal e destaque" },
  { name: "Success", hex: "#019364", helper: "Conclusões e estados positivos" },
  { name: "Warning", hex: "#feba31", helper: "Alertas e atenção" },
  { name: "Accent", hex: "#987dfe", helper: "Eventos, comentários e foco secundário" },
];

export const DS_SEMANTIC_BKGS: Array<{
  name: string;
  className: string;
  text: string;
}> = [
  { name: "Info bg", className: "bg-[#dbeafe]", text: "text-[#2563eb]" },
  { name: "Warning bg", className: "bg-[#ffedd5]", text: "text-[#ea580c]" },
  { name: "Success bg", className: "bg-[#dcfce7]", text: "text-[#15803d]" },
  { name: "Error bg", className: "bg-[#fee2e2]", text: "text-[#dc2626]" },
];

export const DS_TYPOGRAPHY: Array<{
  label: string;
  className: string;
  meta: string;
}> = [
  { label: "Heading XL", className: "text-4xl font-bold", meta: "32px / Bold" },
  { label: "Heading L", className: "text-2xl font-semibold", meta: "24px / Semibold" },
  { label: "Body", className: "text-base font-normal", meta: "16px / Regular" },
  { label: "Caption", className: "text-sm font-medium", meta: "14px / Medium" },
];

export const DS_KANBAN_COLUMNS: Array<{
  title: string;
  accent: string;
  items: string[];
}> = [
  {
    title: "A Fazer",
    accent: "bg-[#ff5623]",
    items: ["Definir objetivo da sprint", "Organizar backlog da campanha"],
  },
  {
    title: "Em andamento",
    accent: "bg-[#987dfe]",
    items: ["Ajustar busca do board", "Refinar popover de notificações"],
  },
  {
    title: "Concluído",
    accent: "bg-[#019364]",
    items: ["Criar visualização de calendário", "Integrar notificações na Visão Geral"],
  },
];

export const DS_WORKSPACE_FEATURES: Array<{
  icon: LucideIcon;
  title: string;
  text: string;
}> = [
  {
    icon: Calendar,
    title: "Calendário mensal",
    text: "Visualização com tarefas por dia, criação rápida no hover e filtro por data selecionada.",
  },
  {
    icon: Bell,
    title: "Notificações por board",
    text: "Popover com filtros por Todas, Menções e Atualizações, conectado ao board atual.",
  },
  {
    icon: Search,
    title: "Busca em popup",
    text: "Pesquisa centralizada com resultados em lista e linguagem alinhada a Minhas tarefas.",
  },
  {
    icon: LayoutDashboard,
    title: "Visão Geral conectada",
    text: "Central global de notificações, tarefas roláveis e relação direta com o board operacional.",
  },
];

export const DS_ICONS_SHOWCASE: Array<{
  icon: LucideIcon;
  label: string;
}> = [
  { icon: Bell, label: "Notificações" },
  { icon: Search, label: "Busca" },
  { icon: Calendar, label: "Calendário" },
  { icon: CheckSquare, label: "Tarefas" },
  { icon: Users, label: "Equipe" },
  { icon: Settings, label: "Configurações" },
];
