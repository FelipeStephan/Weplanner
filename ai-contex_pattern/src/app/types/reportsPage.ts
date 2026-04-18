import type { ReactNode } from "react";
import type { PersistedWorkflowStatus } from "../data/kanban-workspace-persistence";

export interface ReportsDashboardPageProps {
  onBackToDesignSystem?: () => void;
  onOpenBoard?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  isManager?: boolean;
}

export type TimeFilter = "7d" | "30d" | "90d" | "custom";
export type TrendBucket = "day" | "week";
export type SortDirection = "asc" | "desc";
export type ReportsView = "operational" | "credits";
export type DeadlineMetricKey = "warning" | "overdue";

export interface DateRange {
  start: Date;
  end: Date;
}

export interface SortState {
  key: string;
  direction: SortDirection;
}

export interface ClientPerformanceRow {
  client: string;
  totalTasks: number;
  completedTasks: number;
  averageProductionTime: number;
  averageApprovalTime: number;
  reworkCount: number;
  reworkRate: number;
  comparisonToAverage: "above" | "below" | "aligned";
  comparisonDelta: number;
}

export interface TeamPerformanceRow {
  collaborator: string;
  avatar?: string;
  tasksAssigned: number;
  tasksCompleted: number;
  averageProductionTime: number;
  tasksCurrentlyActive: number;
  tasksOverdue: number;
  completionRate: number;
  performanceScore: number;
  rank: number;
  highlight: "top-performer" | "delay-risk" | "steady";
}

export interface KPIData {
  title: string;
  value: ReactNode;
  delta: number;
  tone: "orange" | "green" | "blue" | "purple" | "yellow" | "red";
  series: Array<{ label: string; value: number }>;
  description: string;
  tooltip: string;
  lowerIsBetter?: boolean;
}

export interface PeriodInsight {
  id: string;
  title: string;
  description: string;
  tone: "success" | "warning" | "neutral";
}

export interface BottleneckInsight {
  status: PersistedWorkflowStatus;
  label: string;
  averageTime: number;
}

export interface CreditsClientRow {
  client: string;
  contractedCredits: number;
  consumedCredits: number;
  remainingCredits: number;
  deficitCredits: number;
  activeCredits: number;
  completedCredits: number;
  archivedCredits: number;
  cancelledCredits: number;
  burnRate: number;
  daysToExhaust: number | null;
  reworkCreditsRate: number;
  risk: "healthy" | "attention" | "critical";
}
