import {
  addDays,
  differenceInCalendarDays,
  endOfDay,
  format,
  isAfter,
  isBefore,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";
import { parseTaskDueDate } from "./taskDueDate";
import { ACTIVE_WORKFLOW_STATUSES, WORKFLOW_STATUS_META } from "../data/reportsData";
import type {
  DateRange,
  PeriodInsight,
  SortState,
  TimeFilter,
  TrendBucket,
} from "../types/reportsPage";
import type {
  PersistedTaskRecord,
  PersistedTaskStatusHistoryRecord,
} from "../data/kanban-workspace-persistence";

// ─── Date range ──────────────────────────────────────────────────────────────

export const getDateRange = (
  filter: TimeFilter,
  customStart: string,
  customEnd: string,
): DateRange => {
  const today = endOfDay(new Date());

  if (filter === "custom" && customStart && customEnd) {
    return {
      start: startOfDay(new Date(customStart)),
      end: endOfDay(new Date(customEnd)),
    };
  }

  if (filter === "90d") return { start: startOfDay(subDays(today, 89)), end: today };
  if (filter === "30d") return { start: startOfDay(subDays(today, 29)), end: today };
  return { start: startOfDay(subDays(today, 6)), end: today };
};

export const buildTrendBuckets = (
  range: DateRange,
  bucket: TrendBucket,
): Array<{ label: string; start: Date; end: Date }> => {
  const buckets: Array<{ label: string; start: Date; end: Date }> = [];
  let cursor = range.start;

  while (!isAfter(cursor, range.end)) {
    const bucketStart = cursor;
    const bucketEnd =
      bucket === "day" ? endOfDay(cursor) : endOfDay(addDays(cursor, 6));
    buckets.push({ label: format(bucketStart, "dd MMM"), start: bucketStart, end: bucketEnd });
    cursor = bucket === "day" ? addDays(cursor, 1) : addDays(cursor, 7);
  }

  return buckets;
};

// ─── Number / formatting ─────────────────────────────────────────────────────

export const formatDuration = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0h";
  const totalHours = seconds / 3600;
  return totalHours < 24 ? `${totalHours.toFixed(1)}h` : `${(totalHours / 24).toFixed(1)}d`;
};

export const formatCredits = (value: number): string =>
  `${Math.round(value).toLocaleString("pt-BR")} créditos`;

export const getPercentDelta = (current: number, previous: number): number => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
};

export const sum = (values: number[]): number =>
  values.reduce((acc, value) => acc + value, 0);

export const average = (values: number[]): number =>
  values.length ? sum(values) / values.length : 0;

// ─── Task helpers ─────────────────────────────────────────────────────────────

export const getTaskClientName = (task: PersistedTaskRecord): string =>
  task.client?.name || task.clientId || "Sem cliente";

export const getTaskProductionTime = (task: PersistedTaskRecord): number =>
  (task.totalTimeInProgress || 0) +
  (task.totalTimeInReview || 0) +
  (task.totalTimeInAdjustments || 0);

export const getTaskApprovalTime = (task: PersistedTaskRecord): number =>
  task.totalTimeInApproval || 0;

export const getTaskDueTimestamp = (value?: string | null): number =>
  parseTaskDueDate(value).date?.getTime() ?? Number.POSITIVE_INFINITY;

export const getTaskTurnaroundTime = (task: PersistedTaskRecord): number => {
  if (!task.completedAt) return 0;
  return Math.max(
    0,
    differenceInCalendarDays(parseISO(task.completedAt), parseISO(task.createdAt)),
  );
};

export const getOverdueState = (task: PersistedTaskRecord): boolean => {
  if (task.resolution) return false;
  return isBefore(parseISO(task.dueDate), startOfDay(new Date()));
};

export const getRiskLevel = (rate: number): "high" | "medium" | "low" => {
  if (rate >= 25) return "high";
  if (rate >= 12) return "medium";
  return "low";
};

export const isTaskInRange = (task: PersistedTaskRecord, range: DateRange): boolean => {
  const createdAt = parseISO(task.createdAt);
  const lastRelevantAt = parseISO(
    task.completedAt || task.cancelledAt || task.archivedAt || task.updatedAt,
  );
  return !isAfter(createdAt, range.end) && !isBefore(lastRelevantAt, range.start);
};

export const isStatusHistoryInRange = (
  history: PersistedTaskStatusHistoryRecord,
  range: DateRange,
): boolean => {
  const enteredAt = parseISO(history.enteredAt);
  const exitedAt = history.exitedAt ? parseISO(history.exitedAt) : new Date();
  return !isAfter(enteredAt, range.end) && !isBefore(exitedAt, range.start);
};

export const getColumnStatusDistribution = (tasks: PersistedTaskRecord[]) =>
  ACTIVE_WORKFLOW_STATUSES.map((status) => ({
    status,
    label: WORKFLOW_STATUS_META[status].label,
    count: tasks.filter(
      (task) => task.status === status && task.resolution !== "archived",
    ).length,
  }));

export const sortRows = <T extends Record<string, string | number>>(
  rows: T[],
  state: SortState,
): T[] =>
  [...rows].sort((left, right) => {
    const direction = state.direction === "asc" ? 1 : -1;
    const a = left[state.key];
    const b = right[state.key];
    if (typeof a === "number" && typeof b === "number") return (a - b) * direction;
    return String(a).localeCompare(String(b), "pt-BR") * direction;
  });

// ─── Insight tone ─────────────────────────────────────────────────────────────

export const getInsightToneClasses = (tone: PeriodInsight["tone"]): string => {
  if (tone === "success")
    return "border-[#D6F5E7] bg-[#F3FCF7] text-[#047857] dark:border-[#153125] dark:bg-[#0f1b15] dark:text-[#79d9b0]";
  if (tone === "warning")
    return "border-[#FFE5D8] bg-[#FFF7F2] text-[#c2410c] dark:border-[#3a2418] dark:bg-[#1f1410] dark:text-[#ffb39c]";
  return "border-[#E7E8EE] bg-[#F7F8FC] text-[#475569] dark:border-[#252834] dark:bg-[#11141d] dark:text-[#cbd5e1]";
};
