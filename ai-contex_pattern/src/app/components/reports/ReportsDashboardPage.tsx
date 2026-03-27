import {
  Component,
  useMemo,
  useState,
  type Dispatch,
  type ErrorInfo,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Diamond,
  FolderKanban,
  Gauge,
  Info,
  LayoutDashboard,
  Moon,
  Sparkles,
  Sun,
  TriangleAlert,
  Users,
} from "lucide-react";
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
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  type PersistedTaskRecord,
  type PersistedTaskStatusHistoryRecord,
  type PersistedWorkflowStatus,
} from "../../data/kanban-workspace-persistence";
import {
  createReportsDemoSnapshot,
  EMPTY_REPORTS_SNAPSHOT,
} from "../../../demo/reportsDashboardDemo";
import { reportsRepository } from "../../../repositories/reportsRepository";
import {
  formatTaskDueDate,
  getTaskDueDateState,
  parseTaskDueDate,
} from "../../utils/taskDueDate";
import { AvatarStack } from "../shared/AvatarStack";
import { StatusBadge } from "../tasks/StatusBadge";
import { Button } from "../ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "../ui/utils";

interface ReportsDashboardPageProps {
  onBackToDesignSystem?: () => void;
  onOpenBoard?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  isManager?: boolean;
}

type TimeFilter = "7d" | "30d" | "90d" | "custom";
type TrendBucket = "day" | "week";
type SortDirection = "asc" | "desc";
type ReportsView = "operational" | "credits";
type DeadlineMetricKey = "warning" | "overdue";

interface DateRange {
  start: Date;
  end: Date;
}

interface SortState {
  key: string;
  direction: SortDirection;
}

interface ClientPerformanceRow {
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

interface TeamPerformanceRow {
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

interface KPIData {
  title: string;
  value: ReactNode;
  delta: number;
  tone: "orange" | "green" | "blue" | "purple" | "yellow" | "red";
  series: Array<{ label: string; value: number }>;
  description: string;
  tooltip: string;
  lowerIsBetter?: boolean;
}

interface PeriodInsight {
  id: string;
  title: string;
  description: string;
  tone: "success" | "warning" | "neutral";
}

interface BottleneckInsight {
  status: PersistedWorkflowStatus;
  label: string;
  averageTime: number;
}

interface CreditsClientRow {
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


const WORKFLOW_STATUS_META: Record<
  PersistedWorkflowStatus,
  { label: string; color: string }
> = {
  backlog: { label: "Backlog", color: "#64748b" },
  todo: { label: "A Fazer", color: "#ff5623" },
  in_progress: { label: "Em Progresso", color: "#987dfe" },
  review: { label: "Revisão", color: "#3b82f6" },
  adjustments: { label: "Ajustes", color: "#f97316" },
  approval: { label: "Aprovação", color: "#feba31" },
  done: { label: "Concluído", color: "#019364" },
};

const ACTIVE_WORKFLOW_STATUSES: PersistedWorkflowStatus[] = [
  "todo",
  "in_progress",
  "review",
  "adjustments",
  "approval",
  "done",
];

const KPI_TONE_CLASSES = {
  orange: {
    badge:
      "bg-[#FFF1EA] text-[#c2410c] dark:bg-[#2a1912] dark:text-[#ffb39c]",
    line: "#ff5623",
  },
  green: {
    badge:
      "bg-[#EDF9F4] text-[#047857] dark:bg-[#12231c] dark:text-[#79d9b0]",
    line: "#019364",
  },
  blue: {
    badge:
      "bg-[#EEF5FF] text-[#2563eb] dark:bg-[#111d30] dark:text-[#93c5fd]",
    line: "#3b82f6",
  },
  purple: {
    badge:
      "bg-[#F4F0FF] text-[#7c3aed] dark:bg-[#1d1831] dark:text-[#c4b5fd]",
    line: "#987dfe",
  },
  yellow: {
    badge:
      "bg-[#FFF8E5] text-[#b45309] dark:bg-[#241b0c] dark:text-[#fcd34d]",
    line: "#feba31",
  },
  red: {
    badge:
      "bg-[#FEF0F0] text-[#dc2626] dark:bg-[#291516] dark:text-[#fca5a5]",
    line: "#f32c2c",
  },
} as const;

const getDateRange = (
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

  if (filter === "90d") {
    return { start: startOfDay(subDays(today, 89)), end: today };
  }

  if (filter === "30d") {
    return { start: startOfDay(subDays(today, 29)), end: today };
  }

  return { start: startOfDay(subDays(today, 6)), end: today };
};

const formatDuration = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0h";
  }

  const totalHours = seconds / 3600;
  if (totalHours < 24) {
    return `${totalHours.toFixed(1)}h`;
  }

  return `${(totalHours / 24).toFixed(1)}d`;
};

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => `${character}${character}`)
          .join("")
      : normalized;

  const numericValue = Number.parseInt(value, 16);
  const red = (numericValue >> 16) & 255;
  const green = (numericValue >> 8) & 255;
  const blue = numericValue & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const getPercentDelta = (current: number, previous: number) => {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
};

const isTaskInRange = (task: PersistedTaskRecord, range: DateRange) => {
  const createdAt = parseISO(task.createdAt);
  const lastRelevantAt = parseISO(
    task.completedAt || task.cancelledAt || task.archivedAt || task.updatedAt,
  );

  return !isAfter(createdAt, range.end) && !isBefore(lastRelevantAt, range.start);
};

const isStatusHistoryInRange = (
  history: PersistedTaskStatusHistoryRecord,
  range: DateRange,
) => {
  const enteredAt = parseISO(history.enteredAt);
  const exitedAt = history.exitedAt ? parseISO(history.exitedAt) : new Date();

  return !isAfter(enteredAt, range.end) && !isBefore(exitedAt, range.start);
};

const sum = (values: number[]) => values.reduce((acc, value) => acc + value, 0);

const average = (values: number[]) => (values.length ? sum(values) / values.length : 0);

const getTaskClientName = (task: PersistedTaskRecord) =>
  task.client?.name || task.clientId || "Sem cliente";

const getTaskProductionTime = (task: PersistedTaskRecord) =>
  (task.totalTimeInProgress || 0) +
  (task.totalTimeInReview || 0) +
  (task.totalTimeInAdjustments || 0);

const getTaskApprovalTime = (task: PersistedTaskRecord) => task.totalTimeInApproval || 0;

const getRiskLevel = (rate: number) => {
  if (rate >= 25) {
    return "high";
  }

  if (rate >= 12) {
    return "medium";
  }

  return "low";
};

const CLIENT_CREDIT_CONTRACTS: Record<string, number> = {
  Natura: 480,
  Nike: 420,
  iFood: 560,
  Ambev: 390,
  Nubank: 450,
};

const formatCredits = (value: number) =>
  `${Math.round(value).toLocaleString("pt-BR")} créditos`;

const getTaskDueTimestamp = (value?: string | null) =>
  parseTaskDueDate(value).date?.getTime() ?? Number.POSITIVE_INFINITY;

const getInsightToneClasses = (tone: PeriodInsight["tone"]) => {
  if (tone === "success") {
    return "border-[#D6F5E7] bg-[#F3FCF7] text-[#047857] dark:border-[#153125] dark:bg-[#0f1b15] dark:text-[#79d9b0]";
  }

  if (tone === "warning") {
    return "border-[#FFE5D8] bg-[#FFF7F2] text-[#c2410c] dark:border-[#3a2418] dark:bg-[#1f1410] dark:text-[#ffb39c]";
  }

  return "border-[#E7E8EE] bg-[#F7F8FC] text-[#475569] dark:border-[#252834] dark:bg-[#11141d] dark:text-[#cbd5e1]";
};

const getTaskTurnaroundTime = (task: PersistedTaskRecord) => {
  if (!task.completedAt) {
    return 0;
  }

  return Math.max(
    0,
    differenceInCalendarDays(parseISO(task.completedAt), parseISO(task.createdAt)),
  );
};

const getOverdueState = (task: PersistedTaskRecord) => {
  if (task.resolution) {
    return false;
  }

  return isBefore(parseISO(task.dueDate), startOfDay(new Date()));
};

const buildTrendBuckets = (range: DateRange, bucket: TrendBucket) => {
  const buckets: Array<{ label: string; start: Date; end: Date }> = [];
  let cursor = range.start;

  while (!isAfter(cursor, range.end)) {
    const bucketStart = cursor;
    const bucketEnd = bucket === "day" ? endOfDay(cursor) : endOfDay(addDays(cursor, 6));

    buckets.push({
      label: format(bucketStart, "dd MMM"),
      start: bucketStart,
      end: bucketEnd,
    });

    cursor = bucket === "day" ? addDays(cursor, 1) : addDays(cursor, 7);
  }

  return buckets;
};

const getColumnStatusDistribution = (tasks: PersistedTaskRecord[]) =>
  ACTIVE_WORKFLOW_STATUSES.map((status) => ({
    status,
    label: WORKFLOW_STATUS_META[status].label,
    count: tasks.filter((task) => task.status === status && task.resolution !== "archived").length,
  }));

const sortRows = <T extends Record<string, string | number>>(
  rows: T[],
  state: SortState,
) =>
  [...rows].sort((left, right) => {
    const direction = state.direction === "asc" ? 1 : -1;
    const a = left[state.key];
    const b = right[state.key];

    if (typeof a === "number" && typeof b === "number") {
      return (a - b) * direction;
    }

    return String(a).localeCompare(String(b), "pt-BR") * direction;
  });

function KPIReportCard({ data }: { data: KPIData }) {
  const tone = KPI_TONE_CLASSES[data.tone];
  const isPositive = data.lowerIsBetter ? data.delta <= 0 : data.delta >= 0;
  const safeTitle = String(data.title ?? "kpi");
  const chartGradientId = `kpi-${safeTitle
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()}-gradient`;

  return (
    <div className="rounded-[28px] border border-[#E5E7E4] bg-white p-5 transition-colors hover:border-[#d9ddd7] dark:border-[#262728] dark:bg-[#151617] dark:hover:border-[#303234]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A3A3A3]">
              {data.title}
            </p>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="rounded-full text-[#A3A3A3] transition-colors hover:text-[#525252] dark:hover:text-[#d4d4d4]">
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                sideOffset={8}
                className="max-w-[220px] rounded-xl border border-[#E5E7E4] bg-white px-3 py-2 text-[#171717] shadow-none dark:border-[#2D2F30] dark:bg-[#171717] dark:text-white"
              >
                {data.tooltip}
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="mt-2 text-sm text-[#737373] dark:text-[#A3A3A3]">{data.description}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-[#171717] dark:text-white">
            {data.value}
          </p>
        </div>
        <div
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm",
            isPositive
              ? "bg-[#EDF9F4] text-[#047857] dark:bg-[#12231c] dark:text-[#79d9b0]"
              : "bg-[#FEF0F0] text-[#dc2626] dark:bg-[#291516] dark:text-[#fca5a5]",
          )}
        >
          {isPositive ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
          <span>{Math.abs(data.delta).toFixed(1)}%</span>
        </div>
      </div>

      <div
        className="mt-5 h-16 overflow-hidden rounded-[18px]"
        style={{
          background: `linear-gradient(180deg, ${hexToRgba(tone.line, 0)} 0%, ${hexToRgba(
            tone.line,
            0.018,
          )} 62%, ${hexToRgba(tone.line, 0.065)} 100%)`,
        }}
      >
        <ChartContainer
          className="aspect-auto h-full w-full"
          config={{ value: { label: data.title, color: tone.line } }}
        >
          <AreaChart data={data.series} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={chartGradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={tone.line} stopOpacity={0.16} />
                <stop offset="58%" stopColor={tone.line} stopOpacity={0.05} />
                <stop offset="100%" stopColor={tone.line} stopOpacity={0} />
              </linearGradient>
            </defs>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) => (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-muted-foreground text-xs">Valor</span>
                      <span className="font-medium tabular-nums text-[#171717] dark:text-white">
                        {Number(value).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  )}
                  labelFormatter={(_, payload) => {
                    const periodLabel =
                      payload?.[0] && typeof payload[0]?.payload?.label === "string"
                        ? payload[0].payload.label
                        : "Período";
                    return <span className="text-xs">{periodLabel}</span>;
                  }}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={tone.line}
              fill={`url(#${chartGradientId})`}
              strokeWidth={2.4}
              strokeLinecap="round"
            />
          </AreaChart>
        </ChartContainer>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-[#A3A3A3]">vs período anterior</span>
        <span
          className={cn(
            "inline-flex items-center gap-1 font-semibold",
            isPositive
              ? "text-[#019364] dark:text-[#79d9b0]"
              : "text-[#f32c2c] dark:text-[#fca5a5]",
          )}
        >
          {isPositive ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
          {isPositive ? "melhorando" : "em atenção"}
        </span>
      </div>
    </div>
  );
}

class ReportsSectionErrorBoundary extends Component<
  { title: string; children: ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { title: string; children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ReportsSectionErrorBoundary:${this.props.title}]`, error, errorInfo);
    this.setState({ message: error?.message || "Erro desconhecido de renderização." });
  }

  render() {
    if (this.state.hasError) {
      return (
        <SectionCard
          title={`Falha ao carregar ${this.props.title}`}
          description="Essa seção encontrou um erro de renderização. Recarregue a página ou altere os filtros."
        >
          <div className="rounded-[20px] border border-[#FDE6DA] bg-[#FFF7F2] px-4 py-3 text-sm text-[#c2410c] dark:border-[#3a2418] dark:bg-[#1f1410] dark:text-[#ffb39c]">
            O restante do dashboard continua disponível normalmente.
            {this.state.message ? (
              <p className="mt-2 text-xs opacity-90">Detalhe técnico: {this.state.message}</p>
            ) : null}
          </div>
        </SectionCard>
      );
    }

    return this.props.children;
  }
}

function SectionCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[30px] border border-[#E5E7E4] bg-white p-6 dark:border-[#262728] dark:bg-[#151617]",
        className,
      )}
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight text-[#171717] dark:text-white">
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 text-sm text-[#737373] dark:text-[#A3A3A3]">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function InsightCard({ insight }: { insight: PeriodInsight }) {
  return (
    <div
      className={cn(
        "rounded-[24px] border px-4 py-4",
        getInsightToneClasses(insight.tone),
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {insight.tone === "success" ? (
            <Sparkles className="h-4 w-4" />
          ) : insight.tone === "warning" ? (
            <TriangleAlert className="h-4 w-4" />
          ) : (
            <CircleAlert className="h-4 w-4" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold">{insight.title}</p>
          <p className="mt-1 text-xs opacity-80">{insight.description}</p>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onValueChange,
  children,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A3A3A3]">
        {label}
      </p>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-11 rounded-2xl border-[#E5E7E4] bg-[#FBFCFB] dark:border-[#2D2F30] dark:bg-[#171819]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  );
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A3A3A3]">
        {label}
      </p>
      <Input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-2xl border-[#E5E7E4] bg-[#FBFCFB] dark:border-[#2D2F30] dark:bg-[#171819]"
      />
    </div>
  );
}

function DataTable({
  columns,
  rows,
  sortState,
  onSort,
}: {
  columns: Array<{
    key: string;
    label: string;
    format?: (value: number) => string;
    render?: (row: Record<string, string | number>) => ReactNode;
  }>;
  rows: Array<Record<string, string | number>>;
  sortState: SortState;
  onSort: (key: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-[#EAECE8] dark:border-[#232425]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#EAECE8] text-sm dark:divide-[#232425]">
          <thead className="bg-[#FBFCFB] dark:bg-[#101112]">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 text-left">
                  <button
                    className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#525252] transition-colors hover:text-[#171717] dark:text-[#A3A3A3] dark:hover:text-white"
                    onClick={() => onSort(column.key)}
                  >
                    {column.label}
                    {sortState.key === column.key ? (
                      sortState.direction === "desc" ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />
                    ) : null}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F3F1] bg-white dark:divide-[#232425] dark:bg-[#151617]">
            {rows.map((row, index) => (
              <tr key={`${row[columns[0].key]}-${index}`} className="transition-colors hover:bg-[#FBFCFB] dark:hover:bg-[#111213]">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-4 py-3.5 text-[14px] text-[#525252] dark:text-[#D4D4D4]",
                      column.key === columns[0].key && "font-medium text-[#171717] dark:text-white",
                    )}
                  >
                    {column.render
                      ? column.render(row)
                      : column.format && typeof row[column.key] === "number"
                      ? column.format(row[column.key] as number)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ReportsDashboardPage({
  onBackToDesignSystem,
  onOpenBoard,
  darkMode,
  onToggleDarkMode,
  isManager = false,
}: ReportsDashboardPageProps) {
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("30d");
  const [customStart, setCustomStart] = useState(format(subDays(new Date(), 29), "yyyy-MM-dd"));
  const [customEnd, setCustomEnd] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedBoardId, setSelectedBoardId] = useState("all");
  const [selectedClient, setSelectedClient] = useState("all");
  const [selectedCollaborator, setSelectedCollaborator] = useState("all");
  const [reportsView, setReportsView] = useState<ReportsView>("operational");
  const [clientSort, setClientSort] = useState<SortState>({ key: "completedTasks", direction: "desc" });
  const [teamSort, setTeamSort] = useState<SortState>({ key: "tasksCompleted", direction: "desc" });
  const [creditsSort, setCreditsSort] = useState<SortState>({ key: "consumedCredits", direction: "desc" });
  const [deadlineListMetric, setDeadlineListMetric] = useState<DeadlineMetricKey | null>(null);

  const persistedSnapshot = useMemo(
    () => reportsRepository.loadSnapshot(EMPTY_REPORTS_SNAPSHOT),
    [],
  );
  const hasRealData = persistedSnapshot.tasks.length > 0;
  const [simulationEnabled, setSimulationEnabled] = useState(!hasRealData);
  const isDemoMode = simulationEnabled;
  const snapshot = useMemo(
    () => (isDemoMode ? createReportsDemoSnapshot() : persistedSnapshot),
    [isDemoMode, persistedSnapshot],
  );

  const currentRange = useMemo(
    () => getDateRange(timeFilter, customStart, customEnd),
    [timeFilter, customStart, customEnd],
  );

  const previousRange = useMemo(() => {
    const days = Math.max(1, differenceInCalendarDays(currentRange.end, currentRange.start) + 1);
    const previousEnd = endOfDay(subDays(currentRange.start, 1));
    const previousStart = startOfDay(subDays(previousEnd, days - 1));
    return { start: previousStart, end: previousEnd };
  }, [currentRange]);

  const collaboratorOptions = useMemo(() => {
    const names = new Map<string, { name: string; image?: string }>();
    snapshot.tasks.forEach((task) => {
      task.assignees.forEach((assignee) => {
        if (!names.has(assignee.name)) {
          names.set(assignee.name, { name: assignee.name, image: assignee.image });
        }
      });
    });
    return [...names.values()];
  }, [snapshot.tasks]);

  const clientOptions = useMemo(
    () => Array.from(new Set(snapshot.tasks.map(getTaskClientName))).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [snapshot.tasks],
  );

  const filterByStaticCriteria = (task: PersistedTaskRecord) => {
    if (selectedBoardId !== "all" && task.boardId !== selectedBoardId) {
      return false;
    }

    if (selectedClient !== "all" && getTaskClientName(task) !== selectedClient) {
      return false;
    }

    if (
      selectedCollaborator !== "all" &&
      !task.assignees.some((assignee) => assignee.name === selectedCollaborator)
    ) {
      return false;
    }

    return true;
  };

  const filteredTasks = useMemo(
    () => snapshot.tasks.filter((task) => filterByStaticCriteria(task) && isTaskInRange(task, currentRange)),
    [snapshot.tasks, selectedBoardId, selectedClient, selectedCollaborator, currentRange],
  );

  const previousFilteredTasks = useMemo(
    () => snapshot.tasks.filter((task) => filterByStaticCriteria(task) && isTaskInRange(task, previousRange)),
    [snapshot.tasks, selectedBoardId, selectedClient, selectedCollaborator, previousRange],
  );

  const filteredHistory = useMemo(() => {
    const taskIds = new Set(filteredTasks.map((task) => task.id));
    return snapshot.taskStatusHistory.filter(
      (record) => taskIds.has(record.taskId) && isStatusHistoryInRange(record, currentRange),
    );
  }, [snapshot.taskStatusHistory, filteredTasks, currentRange]);

  const trendBucket: TrendBucket = timeFilter === "90d" ? "week" : "day";
  const trendData = useMemo(() => {
    return buildTrendBuckets(currentRange, trendBucket).map((bucket) => {
      const bucketCreatedTasks = filteredTasks.filter((task) => {
        const createdAt = parseISO(task.createdAt);
        return !isBefore(createdAt, bucket.start) && !isAfter(createdAt, bucket.end);
      });
      const tasksCreated = bucketCreatedTasks.length;

      const bucketCompletedTasks = filteredTasks.filter((task) => {
        if (!task.completedAt) {
          return false;
        }
        const completedAt = parseISO(task.completedAt);
        return !isBefore(completedAt, bucket.start) && !isAfter(completedAt, bucket.end);
      });
      const tasksCompleted = bucketCompletedTasks.length;

      const tasksCancelled = filteredTasks.filter((task) => {
        if (!task.cancelledAt) {
          return false;
        }
        const cancelledAt = parseISO(task.cancelledAt);
        return !isBefore(cancelledAt, bucket.start) && !isAfter(cancelledAt, bucket.end);
      }).length;

      const rework = filteredHistory.filter((record) => {
        const enteredAt = parseISO(record.enteredAt);
        return (
          record.toStatus === "adjustments" &&
          !isBefore(enteredAt, bucket.start) &&
          !isAfter(enteredAt, bucket.end)
        );
      }).length;

      return {
        label: bucket.label,
        created: tasksCreated,
        completed: tasksCompleted,
        cancelled: tasksCancelled,
        rework,
        productionAverage: average(bucketCompletedTasks.map(getTaskProductionTime)),
        approvalAverage: average(bucketCompletedTasks.map(getTaskApprovalTime)),
      };
    });
  }, [currentRange, trendBucket, filteredTasks, filteredHistory]);

  const currentCompletedTasks = filteredTasks.filter((task) => task.resolution === "completed" && !!task.completedAt);
  const previousCompletedTasks = previousFilteredTasks.filter((task) => task.resolution === "completed" && !!task.completedAt);
  const currentCancelledTasks = filteredTasks.filter((task) => task.resolution === "cancelled" && !!task.cancelledAt);
  const previousCancelledTasks = previousFilteredTasks.filter((task) => task.resolution === "cancelled" && !!task.cancelledAt);
  const currentInProgressTasks = filteredTasks.filter((task) => task.status === "in_progress" && !task.resolution);
  const previousInProgressTasks = previousFilteredTasks.filter((task) => task.status === "in_progress" && !task.resolution);
  const currentReworkTasks = filteredTasks.filter((task) => (task.adjustmentCycles || 0) > 0);
  const previousReworkTasks = previousFilteredTasks.filter((task) => (task.adjustmentCycles || 0) > 0);

  const averageProductionTime = average(currentCompletedTasks.map(getTaskProductionTime));
  const previousAverageProductionTime = average(previousCompletedTasks.map(getTaskProductionTime));
  const averageApprovalTime = average(currentCompletedTasks.map(getTaskApprovalTime));
  const previousAverageApprovalTime = average(previousCompletedTasks.map(getTaskApprovalTime));
  const reworkRate =
    filteredTasks.length === 0 ? 0 : (currentReworkTasks.length / filteredTasks.length) * 100;
  const previousReworkRate =
    previousFilteredTasks.length === 0 ? 0 : (previousReworkTasks.length / previousFilteredTasks.length) * 100;

  const kpis: KPIData[] = [
    {
      title: "Tarefas concluidas",
      value: currentCompletedTasks.length.toLocaleString("pt-BR"),
      delta: getPercentDelta(currentCompletedTasks.length, previousCompletedTasks.length),
      tone: "green",
      series: trendData.map((item) => ({ label: item.label, value: item.completed })),
      description: "tarefas finalizadas no recorte",
      tooltip: "Quantidade de tarefas concluídas dentro do período filtrado.",
    },
    {
      title: "Tarefas em andamento",
      value: currentInProgressTasks.length.toLocaleString("pt-BR"),
      delta: getPercentDelta(currentInProgressTasks.length, previousInProgressTasks.length),
      tone: "blue",
      series: trendData.map((item) => ({ label: item.label, value: item.created - item.completed + item.rework })),
      description: "cards ativos em produção agora",
      tooltip: "Total de tarefas que continuam em produção sem encerramento.",
    },
    {
      title: "Tempo medio de producao",
      value: formatDuration(averageProductionTime),
      delta: getPercentDelta(averageProductionTime, previousAverageProductionTime),
      tone: "orange",
      series: trendData.map((item) => ({ label: item.label, value: item.productionAverage })),
      description: "tempo médio do início à entrega",
      tooltip: "Tempo medio que uma tarefa leva entre producao, revisao e ajustes ate ficar pronta.",
      lowerIsBetter: true,
    },
    {
      title: "Tempo medio aguardando aprovacao",
      value: formatDuration(averageApprovalTime),
      delta: getPercentDelta(averageApprovalTime, previousAverageApprovalTime),
      tone: "yellow",
      series: trendData.map((item) => ({ label: item.label, value: item.approvalAverage })),
      description: "tempo médio parado em aprovação",
      tooltip: "Tempo medio que as tarefas permanecem aguardando validacao ou aprovacao.",
      lowerIsBetter: true,
    },
    {
      title: "Taxa de retrabalho",
      value: `${reworkRate.toFixed(1)}%`,
      delta: getPercentDelta(reworkRate, previousReworkRate),
      tone: "purple",
      series: trendData.map((item) => ({ label: item.label, value: item.rework })),
      description: "tarefas que voltaram para ajustes",
      tooltip: "Percentual de tarefas que precisaram retornar ao estagio de ajustes no periodo.",
      lowerIsBetter: true,
    },
    {
      title: "Tarefas canceladas",
      value: currentCancelledTasks.length.toLocaleString("pt-BR"),
      delta: getPercentDelta(currentCancelledTasks.length, previousCancelledTasks.length),
      tone: "red",
      series: trendData.map((item) => ({ label: item.label, value: item.cancelled })),
      description: "cards cancelados no período",
      tooltip: "Total de tarefas encerradas como canceladas no recorte filtrado.",
      lowerIsBetter: true,
    },
  ];

  const workflowDistribution = getColumnStatusDistribution(filteredTasks);
  const workflowAverageTime = ACTIVE_WORKFLOW_STATUSES.map((status) => ({
    status,
    averageTime: average(
      filteredHistory
        .filter((record) => record.toStatus === status && record.durationInSeconds)
        .map((record) => record.durationInSeconds || 0),
    ),
  }));

  const workflowTotalTasks = sum(workflowDistribution.map((item) => item.count));
  const deadlineHealthMetrics = useMemo(() => {
    const activeDeadlineTasks = filteredTasks.filter(
      (task) => !task.resolution && task.status !== "done",
    );

    const counts = activeDeadlineTasks.reduce(
      (acc, task) => {
        const state = getTaskDueDateState(task.dueDate);
        if (state === "overdue") {
          acc.overdue += 1;
        } else if (state === "warning") {
          acc.warning += 1;
        } else {
          acc.onTrack += 1;
        }
        return acc;
      },
      { onTrack: 0, warning: 0, overdue: 0 },
    );

    return [
      {
        key: "on-track",
        label: "Tarefas em dia",
        value: counts.onTrack,
        helper: "Dentro do prazo previsto",
        className:
          "border-[#DCEFE6] bg-[#F2FBF6] text-[#047857] dark:border-[#1f5a45] dark:bg-[#12231c] dark:text-[#79d9b0]",
      },
      {
        key: "warning",
        label: "Prazos em atenção",
        value: counts.warning,
        helper: "Vencem nas próximas 24h",
        className:
          "border-[#F6E3B1] bg-[#FFF8E8] text-[#B45309] dark:border-[#69511a] dark:bg-[#2a220f] dark:text-[#f2c35b]",
      },
      {
        key: "overdue",
        label: "Tarefas em atraso",
        value: counts.overdue,
        helper: "Prazo já ultrapassado",
        className:
          "border-[#F3C7C7] bg-[#FEF1F1] text-[#DC2626] dark:border-[#7c2323] dark:bg-[#311514] dark:text-[#ff9a9b]",
      },
    ];
  }, [filteredTasks]);

  const deadlineTasksByMetric = useMemo(
    () => ({
      warning: filteredTasks
        .filter(
          (task) =>
            !task.resolution &&
            task.status !== "done" &&
            getTaskDueDateState(task.dueDate) === "warning",
        )
        .sort(
          (left, right) =>
            getTaskDueTimestamp(left.dueDate) - getTaskDueTimestamp(right.dueDate),
        ),
      overdue: filteredTasks
        .filter(
          (task) =>
            !task.resolution &&
            task.status !== "done" &&
            getTaskDueDateState(task.dueDate) === "overdue",
        )
        .sort(
          (left, right) =>
            getTaskDueTimestamp(left.dueDate) - getTaskDueTimestamp(right.dueDate),
        ),
    }),
    [filteredTasks],
  );

  const boardNameById = useMemo(
    () => new Map(snapshot.boards.map((board) => [board.id, board.name])),
    [snapshot.boards],
  );

  const columnNameById = useMemo(
    () => new Map(snapshot.columns.map((column) => [column.id, column.name])),
    [snapshot.columns],
  );

  const selectedDeadlineTasks = useMemo(() => {
    if (!deadlineListMetric) {
      return [];
    }
    return deadlineTasksByMetric[deadlineListMetric];
  }, [deadlineListMetric, deadlineTasksByMetric]);

  const workflowBottleneck = workflowAverageTime.reduce<BottleneckInsight | null>((highest, item) => {
    if (!highest || item.averageTime > highest.averageTime) {
      return {
        status: item.status,
        label: WORKFLOW_STATUS_META[item.status].label,
        averageTime: item.averageTime,
      };
    }

    return highest;
  }, null);

  const reworkBars = [
    { label: "Ciclos de revisao", value: sum(filteredTasks.map((task) => task.reviewCycles || 0)), color: "#987dfe" },
    { label: "Ciclos de ajustes", value: sum(filteredTasks.map((task) => task.adjustmentCycles || 0)), color: "#ff5623" },
    { label: "Tarefas retrabalhadas", value: currentReworkTasks.length, color: "#feba31" },
  ];

  const systemAverageProductionTime = average(currentCompletedTasks.map(getTaskProductionTime));

  const clientRows = useMemo<ClientPerformanceRow[]>(() => {
    const groups = new Map<string, PersistedTaskRecord[]>();
    filteredTasks.forEach((task) => {
      const client = getTaskClientName(task);
      groups.set(client, [...(groups.get(client) || []), task]);
    });

    return [...groups.entries()].map(([client, tasks]) => {
      const completedTasks = tasks.filter((task) => task.resolution === "completed");
      const reworkCount = tasks.filter((task) => (task.adjustmentCycles || 0) > 0).length;
      const averageProductionTime = average(completedTasks.map(getTaskProductionTime));
      const comparisonDelta = averageProductionTime - systemAverageProductionTime;
      return {
        client,
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        averageProductionTime,
        averageApprovalTime: average(completedTasks.map(getTaskApprovalTime)),
        reworkCount,
        reworkRate: tasks.length === 0 ? 0 : (reworkCount / tasks.length) * 100,
        comparisonToAverage:
          Math.abs(comparisonDelta) < 0.02
            ? "aligned"
            : comparisonDelta > 0
              ? "above"
              : "below",
        comparisonDelta,
      };
    });
  }, [filteredTasks, systemAverageProductionTime]);

  const topReworkClients = [...clientRows]
    .sort((left, right) => right.reworkRate - left.reworkRate)
    .slice(0, 3);

  const teamRows = useMemo<TeamPerformanceRow[]>(() => {
    const collaborators = new Map<string, TeamPerformanceRow>();

    filteredTasks.forEach((task) => {
      task.assignees.forEach((assignee) => {
        const current = collaborators.get(assignee.name) || {
          collaborator: assignee.name,
          avatar: assignee.image,
          tasksAssigned: 0,
          tasksCompleted: 0,
          averageProductionTime: 0,
          tasksCurrentlyActive: 0,
          tasksOverdue: 0,
          completionRate: 0,
          performanceScore: 0,
          rank: 0,
          highlight: "steady",
        };

        current.tasksAssigned += 1;
        if (task.resolution === "completed") {
          current.tasksCompleted += 1;
        }
        if (!task.resolution && task.status !== "done") {
          current.tasksCurrentlyActive += 1;
        }
        if (getOverdueState(task)) {
          current.tasksOverdue += 1;
        }
        current.averageProductionTime += getTaskProductionTime(task);
        collaborators.set(assignee.name, current);
      });
    });

    return [...collaborators.values()].map((row) => ({
      ...row,
      averageProductionTime: row.tasksAssigned > 0 ? row.averageProductionTime / row.tasksAssigned : 0,
      completionRate: row.tasksAssigned > 0 ? (row.tasksCompleted / row.tasksAssigned) * 100 : 0,
      performanceScore:
        row.tasksCompleted * 3 +
        row.tasksCurrentlyActive -
        row.tasksOverdue * 4 -
        (row.tasksAssigned > 0 ? row.averageProductionTime / row.tasksAssigned : 0) / 3600,
    }))
      .sort((left, right) => right.performanceScore - left.performanceScore)
      .map((row, index) => ({
        ...row,
        rank: index + 1,
        highlight:
          index === 0
            ? "top-performer"
            : row.tasksOverdue >= 2 || row.averageProductionTime > systemAverageProductionTime
              ? "delay-risk"
              : "steady",
      }));
  }, [filteredTasks, systemAverageProductionTime]);

  const sortedClientRows = useMemo(() => sortRows(clientRows, clientSort), [clientRows, clientSort]);
  const sortedTeamRows = useMemo(() => sortRows(teamRows, teamSort), [teamRows, teamSort]);

  const periodDays = Math.max(
    1,
    differenceInCalendarDays(currentRange.end, currentRange.start) + 1,
  );

  const creditsRows = useMemo<CreditsClientRow[]>(() => {
    const grouped = new Map<string, PersistedTaskRecord[]>();
    filteredTasks.forEach((task) => {
      const clientName = getTaskClientName(task);
      grouped.set(clientName, [...(grouped.get(clientName) || []), task]);
    });

    return [...grouped.entries()].map(([client, tasks]) => {
      const consumedCredits = sum(
        tasks
          .filter((task) => task.resolution !== "cancelled")
          .map((task) => task.credits || 0),
      );
      const cancelledCredits = sum(
        tasks
          .filter((task) => task.resolution === "cancelled")
          .map((task) => task.credits || 0),
      );
      const completedCredits = sum(
        tasks
          .filter((task) => task.resolution === "completed")
          .map((task) => task.credits || 0),
      );
      const archivedCredits = sum(
        tasks
          .filter((task) => task.resolution === "archived")
          .map((task) => task.credits || 0),
      );
      const activeCredits = sum(
        tasks
          .filter((task) => !task.resolution)
          .map((task) => task.credits || 0),
      );
      const reworkCredits = sum(
        tasks
          .filter(
            (task) =>
              task.resolution !== "cancelled" &&
              ((task.reviewCycles || 0) > 0 || (task.adjustmentCycles || 0) > 0),
          )
          .map((task) => task.credits || 0),
      );
      const contractedFromCatalog = CLIENT_CREDIT_CONTRACTS[client];
      const contractedCredits =
        contractedFromCatalog ??
        Math.max(120, Math.ceil((Math.max(consumedCredits, 1) * 1.25) / 10) * 10);
      const balance = contractedCredits - consumedCredits;
      const remainingCredits = Math.max(balance, 0);
      const deficitCredits = Math.max(-balance, 0);
      const burnRate = consumedCredits / periodDays;
      const daysToExhaust =
        burnRate > 0 && remainingCredits > 0 ? remainingCredits / burnRate : null;
      const consumptionRate = contractedCredits > 0 ? consumedCredits / contractedCredits : 0;
      const risk: CreditsClientRow["risk"] =
        deficitCredits > 0 || consumptionRate >= 0.95
          ? "critical"
          : consumptionRate >= 0.8
            ? "attention"
            : "healthy";

      return {
        client,
        contractedCredits,
        consumedCredits,
        remainingCredits,
        deficitCredits,
        activeCredits,
        completedCredits,
        archivedCredits,
        cancelledCredits,
        burnRate,
        daysToExhaust,
        reworkCreditsRate: consumedCredits > 0 ? (reworkCredits / consumedCredits) * 100 : 0,
        risk,
      };
    });
  }, [filteredTasks, periodDays]);

  const sortedCreditsRows = useMemo(
    () => sortRows(creditsRows, creditsSort),
    [creditsRows, creditsSort],
  );

  const creditsTrendData = useMemo(() => {
    return buildTrendBuckets(currentRange, trendBucket).map((bucket) => {
      const consumed = sum(
        filteredTasks
          .filter((task) => task.resolution !== "cancelled")
          .filter((task) => {
            const anchor = parseISO(
              task.completedAt || task.archivedAt || task.updatedAt || task.createdAt,
            );
            return !isBefore(anchor, bucket.start) && !isAfter(anchor, bucket.end);
          })
          .map((task) => task.credits || 0),
      );
      const cancelled = sum(
        filteredTasks
          .filter((task) => task.resolution === "cancelled")
          .filter((task) => {
            const anchor = parseISO(task.cancelledAt || task.updatedAt || task.createdAt);
            return !isBefore(anchor, bucket.start) && !isAfter(anchor, bucket.end);
          })
          .map((task) => task.credits || 0),
      );

      return {
        label: bucket.label,
        consumed,
        cancelled,
      };
    });
  }, [currentRange, trendBucket, filteredTasks]);

  const creditsTrendCumulativeData = useMemo(() => {
    let cumulative = 0;
    return creditsTrendData.map((item) => {
      cumulative += item.consumed;
      return {
        ...item,
        cumulative,
      };
    });
  }, [creditsTrendData]);

  const totalContractedCredits = sum(creditsRows.map((row) => row.contractedCredits));
  const totalConsumedCredits = sum(creditsRows.map((row) => row.consumedCredits));
  const totalRemainingCredits = sum(creditsRows.map((row) => row.remainingCredits));
  const totalDeficitCredits = sum(creditsRows.map((row) => row.deficitCredits));
  const clientsInDeficit = creditsRows.filter((row) => row.deficitCredits > 0).length;
  const globalBurnRate = totalConsumedCredits / periodDays;
  const creditsReworkRate = average(creditsRows.map((row) => row.reworkCreditsRate));
  const creditsCancelledPool = sum(creditsRows.map((row) => row.cancelledCredits));
  const topConsumptionClient = [...creditsRows].sort(
    (left, right) => right.burnRate - left.burnRate,
  )[0] ?? null;
  const topExhaustionClient = [...creditsRows]
    .filter(
      (row): row is CreditsClientRow & { daysToExhaust: number } =>
        typeof row.daysToExhaust === "number" && Number.isFinite(row.daysToExhaust),
    )
    .sort((left, right) => left.daysToExhaust - right.daysToExhaust)[0] ?? null;
  const nextExhaustionDays = creditsRows
    .map((row) => row.daysToExhaust)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value))
    .sort((a, b) => a - b)[0] ?? null;

  const managerAvatars = collaboratorOptions.slice(0, 5).map((member) => ({
    name: member.name,
    image: member.image,
  }));

  const handleSort = (
    current: SortState,
    key: string,
    setter: Dispatch<SetStateAction<SortState>>,
  ) => {
    setter({
      key,
      direction: current.key === key && current.direction === "desc" ? "asc" : "desc",
    });
  };

  const openDeadlineTaskInBoard = (task: PersistedTaskRecord) => {
    const boardParam = encodeURIComponent(task.boardId);
    const taskParam = encodeURIComponent(task.id);
    const targetHash = `#/kanban-workspace?board=${boardParam}&card=${taskParam}`;
    const targetUrl = `${window.location.origin}${window.location.pathname}${targetHash}`;
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const getDeadlineListTitle = (metric: DeadlineMetricKey | null) => {
    if (metric === "warning") {
      return "Prazos em atenção";
    }
    if (metric === "overdue") {
      return "Tarefas em atraso";
    }
    return "Prazos";
  };

  const productivityCurrent = collaboratorOptions.length
    ? currentCompletedTasks.length / collaboratorOptions.length
    : 0;
  const productivityPrevious = collaboratorOptions.length
    ? previousCompletedTasks.length / collaboratorOptions.length
    : 0;
  const topRiskClient = topReworkClients[0];

  const periodInsights: PeriodInsight[] = [
    topRiskClient
      ? {
          id: "top-risk-client",
          title: `Cliente ${topRiskClient.client} com ${topRiskClient.reworkRate.toFixed(0)}% de retrabalho`,
          description:
            topRiskClient.reworkRate > reworkRate
              ? "Acima da média do período e pedindo revisão de briefing ou validação."
              : "Mesmo no topo, ainda alinhado com a média do período.",
          tone: topRiskClient.reworkRate > reworkRate ? "warning" : "neutral",
        }
      : null,
    {
      id: "production-time",
      title:
        averageProductionTime > previousAverageProductionTime
          ? `Tempo médio de produção aumentou ${((averageProductionTime - previousAverageProductionTime) / 86400).toFixed(1)} dias`
          : `Tempo médio de produção caiu ${((previousAverageProductionTime - averageProductionTime) / 86400).toFixed(1)} dias`,
      description:
        averageProductionTime > previousAverageProductionTime
          ? "Vale revisar dependências entre produção, revisão e ajustes."
          : "Sinal de fluxo mais enxuto e menos espera entre etapas.",
      tone: averageProductionTime > previousAverageProductionTime ? "warning" : "success",
    },
    {
      id: "productivity",
      title:
        productivityCurrent >= productivityPrevious
          ? `Produtividade da equipe subiu ${Math.abs(getPercentDelta(productivityCurrent, productivityPrevious)).toFixed(0)}%`
          : `Produtividade da equipe caiu ${Math.abs(getPercentDelta(productivityCurrent, productivityPrevious)).toFixed(0)}%`,
      description:
        productivityCurrent >= productivityPrevious
          ? "Mais entregas concluídas por colaborador no período."
          : "Menos entregas concluídas por colaborador em comparação ao período anterior.",
      tone: productivityCurrent >= productivityPrevious ? "success" : "warning",
    },
  ].filter(Boolean) as PeriodInsight[];

  const creditInsights: PeriodInsight[] = [
    topExhaustionClient
      ? {
          id: "credits-exhaustion-risk",
          title: `${topExhaustionClient.client} pode esgotar os créditos em ${Math.max(1, Math.round(topExhaustionClient.daysToExhaust))} dias`,
          description:
            topExhaustionClient.daysToExhaust <= 14
              ? "Vale revisar escopo, ritmo de produção ou necessidade de reforço contratual."
              : "O consumo segue saudável, mas já existe previsão objetiva de esgotamento se o ritmo continuar.",
          tone: topExhaustionClient.daysToExhaust <= 14 ? "warning" : "neutral",
        }
      : {
          id: "credits-exhaustion-safe",
          title: "Nenhum cliente com risco imediato de esgotamento",
          description:
            "No recorte atual, a carteira ainda mantém saldo sem pressão de curto prazo.",
          tone: "success",
        },
    topConsumptionClient
      ? {
          id: "credits-accelerated-consumption",
          title: `${topConsumptionClient.client} lidera o consumo com ${topConsumptionClient.burnRate.toFixed(1)} créditos/dia`,
          description:
            topConsumptionClient.burnRate > globalBurnRate
              ? `${((topConsumptionClient.consumedCredits / Math.max(topConsumptionClient.contractedCredits, 1)) * 100).toFixed(0)}% da base já foi utilizada no período filtrado.`
              : "Mesmo liderando a carteira, o ritmo ainda está alinhado com a média geral.",
          tone: topConsumptionClient.burnRate > globalBurnRate ? "warning" : "neutral",
        }
      : {
          id: "credits-consumption-empty",
          title: "Sem consumo suficiente para medir aceleração",
          description: "Quando houver mais movimentação, o painel destacará o cliente com maior ritmo de uso.",
          tone: "neutral",
        },
    clientsInDeficit > 0
      ? {
          id: "credits-deficit",
          title: `${clientsInDeficit} cliente${clientsInDeficit === 1 ? "" : "s"} já operam em déficit`,
          description: `${Math.round(totalDeficitCredits).toLocaleString("pt-BR")} créditos acima da base contratada no período atual.`,
          tone: "warning",
        }
      : {
          id: "credits-deficit-safe",
          title: "Nenhum cliente ultrapassou a base contratada",
          description: "A carteira segue dentro do limite previsto, sem déficit de créditos no recorte.",
          tone: "success",
        },
  ];

  return (
    <section className="min-h-screen bg-[#F6F8F6] px-0 dark:bg-[#0f0f10]">
      <div className="flex min-h-screen items-start">
        {false && (
        <aside
          className={cn(
            "sticky top-0 h-screen shrink-0 overflow-hidden border-r border-[#E5E7E4] bg-white dark:border-[#232425] dark:bg-[#121313] transition-all",
            collapsedSidebar ? "w-[84px]" : "w-[252px]",
          )}
        >
          <div className="flex h-full flex-col p-4">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#ff5623] text-white shadow-[0_14px_34px_-18px_rgba(255,86,35,0.8)]">
                  <BarChart3 className="h-5 w-5" />
                </div>
                {!collapsedSidebar && (
                  <div>
                    <p className="text-sm font-semibold text-[#171717] dark:text-white">WePlanner</p>
                    <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">Relatorios</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setCollapsedSidebar((current) => !current)}
                className="rounded-xl p-2 text-[#737373] transition-colors hover:bg-[#F6F8F6] dark:text-[#A3A3A3] dark:hover:bg-[#1A1B1C]"
              >
                {collapsedSidebar ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            </div>

            <div className="space-y-2">
              {[
                { label: "Visao geral", icon: LayoutDashboard, active: false, action: undefined },
                { label: "Board", icon: FolderKanban, active: false, action: onOpenBoard },
                { label: "Relatorios", icon: BarChart3, active: true, action: undefined },
                { label: "Equipe", icon: Users, active: false, action: undefined },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-colors",
                    item.active
                      ? "bg-[#F6F8F6] text-[#171717] dark:bg-[#1A1B1C] dark:text-white"
                      : "text-[#525252] hover:bg-[#F6F8F6] dark:text-[#A3A3A3] dark:hover:bg-[#1A1B1C]",
                    collapsedSidebar && "justify-center",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsedSidebar && <span>{item.label}</span>}
                </button>
              ))}
            </div>

            <div className="mt-auto space-y-2">
              {onBackToDesignSystem ? (
                <Button
                  variant="outline"
                  className={cn("w-full rounded-2xl dark:border-[#2D2F30]", collapsedSidebar && "px-0")}
                  onClick={onBackToDesignSystem}
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  {!collapsedSidebar && "Design System"}
                </Button>
              ) : null}
            </div>
          </div>
        </aside>
        )}

        <div className="min-w-0 flex-1 bg-[#F6F8F6] dark:bg-[#0f0f10]">
          <div className="border-b border-[#E5E7E4] px-6 py-6 dark:border-[#232425]">
            <div className="mx-auto flex max-w-[1560px] flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#ff5623]" />
                  <h1 className="text-3xl font-bold tracking-tight text-[#171717] dark:text-white">
                    Relatorios
                  </h1>
                </div>
                  <p className="mt-1 text-base text-[#737373] dark:text-[#A3A3A3]">
                    Visao operacional do workflow, produtividade da equipe e performance por cliente.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {isDemoMode ? (
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF7F2] px-3 py-1.5 text-xs font-semibold text-[#c2410c] dark:bg-[#26150f] dark:text-[#ffb39c]">
                        <Sparkles className="h-3.5 w-3.5" />
                        Modo de demonstracao ativo
                      </div>
                    ) : null}
                    {!hasRealData ? (
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#F7F8FC] px-3 py-1.5 text-xs font-semibold text-[#475569] dark:bg-[#11141d] dark:text-[#cbd5e1]">
                        <CircleAlert className="h-3.5 w-3.5" />
                        Sem dados reais suficientes no momento
                      </div>
                    ) : null}
                  </div>
                </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant={isDemoMode ? "default" : "outline"}
                  className={cn(
                    "rounded-2xl",
                    isDemoMode
                      ? "bg-[#171717] text-white hover:bg-[#2a2a2a] dark:bg-[#F5F5F5] dark:text-[#171717] dark:hover:bg-white"
                      : "border-[#E5E7E4] bg-white text-[#525252] hover:bg-[#f5f5f5] dark:border-[#2D2F30] dark:bg-[#171819] dark:text-[#F5F5F5] dark:hover:bg-[#1e2021]",
                  )}
                  onClick={() => setSimulationEnabled((current) => !current)}
                >
                  <Sparkles className="mr-1.5 h-4 w-4" />
                  {isDemoMode
                    ? hasRealData
                      ? "Voltar para dados reais"
                      : "Ocultar simulacao"
                    : "Simular dados"}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl border-[#E5E7E4] bg-white text-[#525252] hover:bg-[#f5f5f5] dark:border-[#2D2F30] dark:bg-[#171819] dark:text-[#F5F5F5] dark:hover:bg-[#1e2021]"
                >
                  Exportar
                </Button>
                <AvatarStack avatars={managerAvatars} max={5} size="md" />
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-[1560px] space-y-8 px-6 py-8 2xl:px-8">
            {!isManager ? (
              <SectionCard title="Acesso restrito" description="Relatórios estão disponíveis apenas para gestores." className="max-w-3xl">
                <div className="flex flex-col gap-5 rounded-[26px] border border-dashed border-[#E5E7E4] bg-[#FBFCFB] p-6 dark:border-[#2A2B2C] dark:bg-[#121314]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF1EA] text-[#ff5623] dark:bg-[#26150f] dark:text-[#ffb39c]">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#171717] dark:text-white">
                        Somente managers visualizam analytics
                      </h3>
                      <p className="mt-1 text-sm text-[#737373] dark:text-[#A3A3A3]">
                        O dashboard usa dados completos do workflow, incluindo tempo por etapa, ciclos de revisão e performance por cliente.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {onOpenBoard ? (
                      <Button className="rounded-2xl bg-[#ff5623] text-white hover:bg-[#c2410c]" onClick={onOpenBoard}>
                        <FolderKanban className="mr-1.5 h-4 w-4" />
                        Voltar ao board
                      </Button>
                    ) : null}
                    {onBackToDesignSystem ? (
                      <Button variant="outline" className="rounded-2xl" onClick={onBackToDesignSystem}>
                        <LayoutDashboard className="mr-1.5 h-4 w-4" />
                        Abrir design system
                      </Button>
                    ) : null}
                  </div>
                </div>
              </SectionCard>
            ) : (
              <>
                <SectionCard title="Filtros globais" description="Tudo abaixo responde ao mesmo recorte de tempo, board, cliente e colaborador.">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
                    <FilterSelect label="Periodo" value={timeFilter} onValueChange={(value) => setTimeFilter(value as TimeFilter)}>
                      <SelectItem value="7d">Ultimos 7 dias</SelectItem>
                      <SelectItem value="30d">Ultimos 30 dias</SelectItem>
                      <SelectItem value="90d">Ultimos 90 dias</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </FilterSelect>

                    <FilterSelect label="Board" value={selectedBoardId} onValueChange={setSelectedBoardId}>
                      <SelectItem value="all">Todos os boards</SelectItem>
                      {snapshot.boards.map((board) => (
                        <SelectItem key={board.id} value={board.id}>
                          {board.name}
                        </SelectItem>
                      ))}
                    </FilterSelect>

                    <FilterSelect label="Cliente" value={selectedClient} onValueChange={setSelectedClient}>
                      <SelectItem value="all">Todos os clientes</SelectItem>
                      {clientOptions.map((client) => (
                        <SelectItem key={client} value={client}>
                          {client}
                        </SelectItem>
                      ))}
                    </FilterSelect>

                    <FilterSelect label="Colaborador" value={selectedCollaborator} onValueChange={setSelectedCollaborator}>
                      <SelectItem value="all">Todo o time</SelectItem>
                      {collaboratorOptions.map((member) => (
                        <SelectItem key={member.name} value={member.name}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </FilterSelect>

                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A3A3A3]">
                        Recorte ativo
                      </p>
                      <div className="flex h-11 items-center gap-2 rounded-2xl border border-[#E5E7E4] bg-[#FBFCFB] px-4 dark:border-[#2D2F30] dark:bg-[#171819]">
                        <Calendar className="h-4 w-4 text-[#737373]" />
                        <span className="text-sm text-[#171717] dark:text-white">
                          {format(currentRange.start, "dd MMM")} - {format(currentRange.end, "dd MMM")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {timeFilter === "custom" ? (
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <DateInput label="Data inicial" value={customStart} onChange={setCustomStart} />
                      <DateInput label="Data final" value={customEnd} onChange={setCustomEnd} />
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-medium text-[#737373] dark:text-[#A3A3A3]">
                    <span className="rounded-full border border-[#E5E7E4] bg-[#FBFCFB] px-2.5 py-1 dark:border-[#2D2F30] dark:bg-[#171819]">
                      pronto para filtros avançados
                    </span>
                    <span className="rounded-full border border-[#E5E7E4] bg-[#FBFCFB] px-2.5 py-1 dark:border-[#2D2F30] dark:bg-[#171819]">
                      comparação entre períodos
                    </span>
                    <span className="rounded-full border border-[#E5E7E4] bg-[#FBFCFB] px-2.5 py-1 dark:border-[#2D2F30] dark:bg-[#171819]">
                      exportação de insights
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <Button className="rounded-2xl bg-[#ff5623] text-white hover:bg-[#c2410c]">
                      Aplicar
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-2xl border-[#E5E7E4] bg-white text-[#525252] hover:bg-[#f5f5f5] dark:border-[#2D2F30] dark:bg-[#171819] dark:text-[#F5F5F5] dark:hover:bg-[#1e2021]"
                      onClick={() => {
                        setTimeFilter("30d");
                        setCustomStart(format(subDays(new Date(), 29), "yyyy-MM-dd"));
                        setCustomEnd(format(new Date(), "yyyy-MM-dd"));
                        setSelectedBoardId("all");
                        setSelectedClient("all");
                        setSelectedCollaborator("all");
                      }}
                    >
                      Limpar
                    </Button>
                  </div>
                </SectionCard>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReportsView("operational")}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition-colors",
                      reportsView === "operational"
                        ? "border-[#171717] bg-[#171717] text-white dark:border-[#f5f5f5] dark:bg-[#f5f5f5] dark:text-[#171717]"
                        : "border-[#E5E7E4] bg-white text-[#525252] hover:bg-[#f5f5f5] dark:border-[#2D2F30] dark:bg-[#171819] dark:text-[#F5F5F5] dark:hover:bg-[#1e2021]",
                    )}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Relatórios operacionais
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportsView("credits")}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition-colors",
                      reportsView === "credits"
                        ? "border-[#171717] bg-[#171717] text-white dark:border-[#f5f5f5] dark:bg-[#f5f5f5] dark:text-[#171717]"
                        : "border-[#E5E7E4] bg-white text-[#525252] hover:bg-[#f5f5f5] dark:border-[#2D2F30] dark:bg-[#171819] dark:text-[#F5F5F5] dark:hover:bg-[#1e2021]",
                    )}
                  >
                    <Gauge className="h-4 w-4" />
                    Gestão de créditos
                  </button>
                </div>

                {reportsView === "operational" ? (
                <div className="space-y-8">
                <SectionCard
                  title="Insights do período"
                  description="Leituras automáticas para orientar ação rápida do gestor sem precisar vasculhar o dashboard inteiro."
                >
                  <div className="grid gap-4 xl:grid-cols-3">
                    {periodInsights.map((insight) => (
                      <InsightCard key={insight.id} insight={insight} />
                    ))}
                  </div>
                </SectionCard>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {kpis.map((kpi) => (
                    <KPIReportCard key={kpi.title} data={kpi} />
                  ))}
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
                  <SectionCard title="Visao do workflow" description="Distribuicao de tarefas por etapa no periodo e tempo medio de permanencia em cada fase.">
                    <div className="space-y-5">
                      {workflowBottleneck ? (
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[#FDE6DA] bg-[#FFF7F2] px-4 py-4 dark:border-[#3a2418] dark:bg-[#1f1410]">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ff5623] text-white">
                              <TriangleAlert className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#171717] dark:text-white">
                                Gargalo atual: {workflowBottleneck.label}
                              </p>
                              <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                                Média de {formatDuration(workflowBottleneck.averageTime)} nesta etapa.
                              </p>
                            </div>
                          </div>
                          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#c2410c] shadow-sm dark:bg-[#2a1912] dark:text-[#ffb39c]">
                            <ArrowRight className="h-3.5 w-3.5" />
                            Priorizar saída desta fila
                          </div>
                        </div>
                      ) : null}

                      <div className="rounded-[24px] border border-[#EEF1EE] bg-[#FBFCFB] px-4 py-4 dark:border-[#232425] dark:bg-[#101112]">
                        <div className="overflow-hidden rounded-full bg-[#EEF1ED] p-1 dark:bg-[#1B1D1E]">
                          <div className="flex h-4 w-full overflow-hidden rounded-full">
                            {workflowDistribution.map((item) => {
                              const width =
                                workflowTotalTasks > 0
                                  ? (item.count / workflowTotalTasks) * 100
                                  : 100 / Math.max(workflowDistribution.length, 1);
                              return (
                                <div
                                  key={item.status}
                                  className={cn(
                                    "h-full transition-all",
                                    item.count === 0 && "opacity-30",
                                  )}
                                  style={{
                                    width: `${width}%`,
                                    backgroundColor: WORKFLOW_STATUS_META[item.status].color,
                                  }}
                                  title={`${item.label}: ${item.count}`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {workflowDistribution.map((item) => {
                          const stageTime = workflowAverageTime.find((entry) => entry.status === item.status);
                          return (
                            <div key={item.status} className="rounded-[22px] border border-[#EAECE8] bg-[#FBFCFB] p-3.5 dark:border-[#232425] dark:bg-[#101112]">
                              <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: WORKFLOW_STATUS_META[item.status].color }} />
                                <p className="text-[15px] font-semibold text-[#171717] dark:text-white">{item.label}</p>
                              </div>
                              <p className="mt-2.5 text-[26px] font-bold tracking-tight text-[#171717] dark:text-white">{item.count}</p>
                              <p className="mt-1 text-[13px] text-[#737373] dark:text-[#A3A3A3]">
                                Media: {formatDuration(stageTime?.averageTime || 0)}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      <div className="rounded-[24px] border border-[#EAECE8] bg-[#FBFCFB] p-4 dark:border-[#232425] dark:bg-[#101112]">
                        <div className="mb-3">
                          <p className="text-sm font-semibold text-[#171717] dark:text-white">
                            Saude dos prazos
                          </p>
                          <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                            Leitura operacional dos prazos ativos no quadro atual.
                          </p>
                        </div>
                        <div className="grid gap-3 md:grid-cols-3">
                          {deadlineHealthMetrics.map((metric) => {
                            const isNavigable =
                              metric.key === "warning" || metric.key === "overdue";

                            return (
                              <button
                                key={metric.key}
                                type="button"
                                onClick={() => {
                                  if (isNavigable) {
                                    setDeadlineListMetric(metric.key as DeadlineMetricKey);
                                  }
                                }}
                                className={cn(
                                  "rounded-[20px] border px-4 py-3.5 text-left transition-colors",
                                  metric.className,
                                  isNavigable
                                    ? "cursor-pointer hover:brightness-[0.98] dark:hover:brightness-[1.08]"
                                    : "cursor-default",
                                )}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-semibold">{metric.label}</p>
                                  {isNavigable ? (
                                    <span className="inline-flex items-center justify-center rounded-full border border-current/35 p-1.5 opacity-85">
                                      <ArrowRight className="h-3.5 w-3.5" />
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-2 text-[26px] font-bold tracking-tight">
                                  {metric.value}
                                </p>
                                <p className="mt-1 text-xs opacity-80">
                                  {metric.helper}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Analise de retrabalho" description="Leitura rapida do quanto o fluxo volta para ajustes e quantos ciclos o time acumula.">
                    <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
                      {[
                        { label: "Tarefas em ajuste", value: currentReworkTasks.length, icon: Gauge, tone: "text-[#ff5623]" },
                        { label: "Media de ciclos", value: average(currentReworkTasks.map((task) => task.adjustmentCycles || 0)).toFixed(1), icon: Activity, tone: "text-[#987dfe]" },
                        { label: "Com retrabalho", value: `${reworkRate.toFixed(1)}%`, icon: ClipboardCheck, tone: "text-[#feba31]" },
                      ].map((item) => (
                        <div key={item.label} className="rounded-[24px] border border-[#EAECE8] bg-[#FBFCFB] p-4 dark:border-[#232425] dark:bg-[#101112]">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-[#525252] dark:text-[#D4D4D4]">{item.label}</p>
                            <item.icon className={cn("h-4 w-4", item.tone)} />
                          </div>
                          <p className="mt-3 text-2xl font-bold tracking-tight text-[#171717] dark:text-white">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 h-[220px] rounded-[24px] bg-[#FBFCFB] p-4 dark:bg-[#101112]">
                      <ChartContainer className="aspect-auto h-full w-full" config={{ value: { label: "Cycles", color: "#ff5623" } }}>
                        <BarChart data={reworkBars} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                          <CartesianGrid vertical={false} strokeDasharray="4 4" />
                          <XAxis dataKey="label" tickLine={false} axisLine={false} />
                          <YAxis tickLine={false} axisLine={false} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                            {reworkBars.map((item) => (
                              <Cell key={item.label} fill={item.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ChartContainer>
                    </div>

                    <div className="mt-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#171717] dark:text-white">
                          Ranking de clientes com mais retrabalho
                        </p>
                        <p className="text-xs text-[#A3A3A3]">risco operacional</p>
                      </div>
                      {topReworkClients.map((client) => {
                        const risk = getRiskLevel(client.reworkRate);
                        return (
                          <div
                            key={client.client}
                            className="flex items-center justify-between gap-3 rounded-[20px] border border-[#EAECE8] bg-[#FBFCFB] px-4 py-3 dark:border-[#232425] dark:bg-[#101112]"
                          >
                            <div>
                              <p className="font-medium text-[#171717] dark:text-white">{client.client}</p>
                              <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                                Retrabalho: {client.reworkRate.toFixed(1)}%
                              </p>
                            </div>
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-1 text-xs font-semibold",
                                risk === "high"
                                  ? "bg-[#FEF0F0] text-[#dc2626] dark:bg-[#291516] dark:text-[#fca5a5]"
                                  : risk === "medium"
                                    ? "bg-[#FFF8E5] text-[#b45309] dark:bg-[#241b0c] dark:text-[#fcd34d]"
                                    : "bg-[#EDF9F4] text-[#047857] dark:bg-[#12231c] dark:text-[#79d9b0]",
                              )}
                            >
                              {risk === "high" ? "Alto" : risk === "medium" ? "Médio" : "Baixo"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </SectionCard>
                </div>

                <SectionCard title="Performance por cliente" description="Metricas consolidadas por cliente no periodo, com comparacao frente a media do sistema.">
                    <DataTable
                      columns={[
                        {
                          key: "client",
                          label: "Cliente",
                          render: (row) => {
                            const clientName = String(row.client);
                            return (
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff5623] to-[#ff8a65] text-[10px] font-bold text-white">
                                  {clientName.slice(0, 2).toUpperCase()}
                                </div>
                                <span className="font-semibold text-[#171717] dark:text-white">
                                  {clientName}
                                </span>
                              </div>
                            );
                          },
                        },
                        { key: "totalTasks", label: "Total de tarefas" },
                        {
                          key: "completedTasks",
                          label: "Concluidas",
                          render: (row) => {
                            const completed = Number(row.completedTasks);
                            const total = Number(row.totalTasks);
                            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
                            return (
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-[#171717] dark:text-white">{completed}</span>
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#E8EBE8] dark:bg-[#232425]">
                                    <div className="h-full rounded-full bg-[#019364]" style={{ width: `${percent}%` }} />
                                  </div>
                                  <span className="text-[10px] text-[#A3A3A3]">{percent}%</span>
                                </div>
                              </div>
                            );
                          },
                        },
                        { key: "averageProductionTime", label: "T. medio producao", format: formatDuration },
                        { key: "averageApprovalTime", label: "T. medio aprovacao", format: formatDuration },
                        {
                          key: "comparisonDelta",
                          label: "Comparação com média",
                          render: (row) => {
                            const comparison = row.comparisonToAverage as ClientPerformanceRow["comparisonToAverage"];
                            const delta = Number(row.comparisonDelta);
                            return (
                              <div className="flex flex-col gap-1">
                                <span
                                  className={cn(
                                    "inline-flex w-fit items-center rounded-full px-2 py-1 text-xs font-semibold",
                                    comparison === "above"
                                      ? "bg-[#FEF0F0] text-[#dc2626] dark:bg-[#291516] dark:text-[#fca5a5]"
                                      : comparison === "below"
                                        ? "bg-[#EDF9F4] text-[#047857] dark:bg-[#12231c] dark:text-[#79d9b0]"
                                        : "bg-[#F4F5F7] text-[#475569] dark:bg-[#22252d] dark:text-[#cbd5e1]",
                                  )}
                                >
                                  {comparison === "above"
                                    ? "acima da média"
                                    : comparison === "below"
                                      ? "abaixo da média"
                                      : "na média"}
                                </span>
                                <span className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                                  Δ {formatDuration(Math.abs(delta))}
                                </span>
                              </div>
                            );
                          },
                        },
                        {
                          key: "reworkRate",
                          label: "Retrabalho",
                          render: (row) => {
                            const rate = Number(row.reworkRate);
                            const risk = getRiskLevel(rate);
                            return (
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                                  risk === "high"
                                    ? "bg-[#FEF0F0] text-[#dc2626] dark:bg-[#291516] dark:text-[#fca5a5]"
                                    : risk === "medium"
                                      ? "bg-[#FFF8E5] text-[#b45309] dark:bg-[#241b0c] dark:text-[#fcd34d]"
                                      : "bg-[#EDF9F4] text-[#047857] dark:bg-[#12231c] dark:text-[#79d9b0]",
                                )}
                              >
                                {rate.toFixed(1)}%
                              </span>
                            );
                          },
                        },
                      ]}
                      rows={sortedClientRows}
                      sortState={clientSort}
                      onSort={(key) => handleSort(clientSort, key, setClientSort)}
                    />
                </SectionCard>

                <SectionCard title="Performance da equipe" description="Produtividade individual dos colaboradores no periodo, com leitura mais clara de entrega e risco.">
                    <div className="mb-4 flex items-center justify-end">
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#FBFCFB] px-3 py-1.5 text-sm font-medium text-[#737373] dark:bg-[#101112] dark:text-[#A3A3A3]">
                        <Users className="h-4 w-4" />
                        {sortedTeamRows.length} colaboradores
                      </div>
                    </div>

                    <DataTable
                      columns={[
                        {
                          key: "collaborator",
                          label: "Colaborador",
                          render: (row) => {
                            const teamRow = row as TeamPerformanceRow;
                            return (
                              <div className="flex min-w-[220px] items-center gap-3">
                                {teamRow.avatar ? (
                                  <img
                                    src={teamRow.avatar}
                                    alt={teamRow.collaborator}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFEFEF] text-xs font-semibold text-[#737373] dark:bg-[#262728] dark:text-[#d4d4d4]">
                                    {teamRow.collaborator.slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="truncate font-semibold text-[#171717] dark:text-white">
                                      {teamRow.collaborator}
                                    </span>
                                    <span className="rounded-full bg-[#F4F5F7] px-2 py-0.5 text-[10px] font-semibold text-[#64748b] dark:bg-[#22252d] dark:text-[#cbd5e1]">
                                      #{teamRow.rank}
                                    </span>
                                  </div>
                                  {teamRow.highlight === "top-performer" ? (
                                    <span className="mt-1 inline-flex items-center rounded-full bg-[#FFF8E5] px-2 py-0.5 text-[10px] font-semibold text-[#b45309] dark:bg-[#241b0c] dark:text-[#fcd34d]">
                                      Top performer
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            );
                          },
                        },
                        { key: "tasksAssigned", label: "Atribuidas" },
                        {
                          key: "tasksCompleted",
                          label: "Concluidas",
                          render: (row) => {
                            const teamRow = row as TeamPerformanceRow;
                            return (
                              <div className="flex min-w-[140px] items-center gap-2">
                                <span className="min-w-8 font-semibold text-[#171717] dark:text-white">
                                  {teamRow.tasksCompleted}
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#E8EBE8] dark:bg-[#232425]">
                                    <div
                                      className={cn(
                                        "h-full rounded-full",
                                        teamRow.completionRate >= 75
                                          ? "bg-[#019364]"
                                          : teamRow.completionRate >= 60
                                            ? "bg-[#feba31]"
                                            : "bg-[#f32c2c]",
                                      )}
                                      style={{
                                        width: `${Math.min(teamRow.completionRate, 100)}%`,
                                      }}
                                    />
                                  </div>
                                  <span className="text-[11px] font-semibold text-[#737373] dark:text-[#A3A3A3]">
                                    {teamRow.completionRate.toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                            );
                          },
                        },
                        {
                          key: "averageProductionTime",
                          label: "Tempo medio",
                          format: formatDuration,
                        },
                        {
                          key: "tasksCurrentlyActive",
                          label: "Ativas",
                          render: (row) => {
                            const value = Number(row.tasksCurrentlyActive);
                            return (
                              <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-[#EEF4FF] px-2 py-1 text-xs font-semibold text-[#2563eb] dark:bg-[#172033] dark:text-[#93c5fd]">
                                {value}
                              </span>
                            );
                          },
                        },
                        {
                          key: "tasksOverdue",
                          label: "Atrasadas",
                          render: (row) => {
                            const value = Number(row.tasksOverdue);
                            return (
                              <span
                                className={cn(
                                  "inline-flex min-w-8 items-center justify-center rounded-full px-2 py-1 text-xs font-semibold",
                                  value > 0
                                    ? "bg-[#FEF0F0] text-[#dc2626] dark:bg-[#291516] dark:text-[#fca5a5]"
                                    : "bg-[#EDF9F4] text-[#047857] dark:bg-[#12231c] dark:text-[#79d9b0]",
                                )}
                              >
                                {value}
                              </span>
                            );
                          },
                        },
                      ]}
                      rows={sortedTeamRows}
                      sortState={teamSort}
                      onSort={(key) => handleSort(teamSort, key, setTeamSort)}
                    />
                </SectionCard>

                <SectionCard title="Tendencia de tarefas no periodo" description="Tarefas criadas, concluidas e retrabalho ao longo do periodo selecionado.">
                  <div className="h-[340px] rounded-[28px] bg-[#FBFCFB] p-4 dark:bg-[#101112]">
                    <ChartContainer
                      className="aspect-auto h-full w-full"
                      config={{
                        created: { label: "Criadas", color: "#ff5623" },
                        completed: { label: "Concluidas", color: "#019364" },
                        rework: { label: "Retrabalho", color: "#987dfe" },
                      }}
                    >
                      <LineChart data={trendData} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="4 4" />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                        <Line type="monotone" dataKey="created" stroke="#ff5623" strokeWidth={2.5} dot={false} />
                        <Line type="monotone" dataKey="completed" stroke="#019364" strokeWidth={2.5} dot={false} />
                        <Line type="monotone" dataKey="rework" stroke="#987dfe" strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ChartContainer>
                  </div>
                </SectionCard>

                </div>
                ) : null}

                {reportsView === "credits" ? (
                <ReportsSectionErrorBoundary title="Gestão de créditos">
                <div className="space-y-8">
                  <SectionCard
                    title="Insights de créditos"
                    description="Leituras rápidas sobre risco de consumo, aceleração e saúde da carteira no período."
                  >
                    <div className="grid gap-4 xl:grid-cols-3">
                      {creditInsights.map((insight) => (
                        <InsightCard key={insight.id} insight={insight} />
                      ))}
                    </div>
                  </SectionCard>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    <KPIReportCard
                      data={{
                        title: "Créditos contratados",
                        value: formatCredits(totalContractedCredits),
                        delta: 0,
                        tone: "blue",
                        series: creditsTrendData.map((item) => ({ label: item.label, value: item.consumed })),
                        description: "base contratada no recorte",
                        tooltip: "Total de créditos de contrato considerados para os clientes filtrados.",
                      }}
                    />
                    <KPIReportCard
                      data={{
                        title: "Créditos consumidos",
                        value: formatCredits(totalConsumedCredits),
                        delta: totalContractedCredits > 0 ? (totalConsumedCredits / totalContractedCredits) * 100 : 0,
                        tone: "orange",
                        series: creditsTrendData.map((item) => ({ label: item.label, value: item.consumed })),
                        description: "consumo válido (canceladas não contam)",
                        tooltip: "Soma de créditos de tarefas que não foram canceladas.",
                      }}
                    />
                    <KPIReportCard
                      data={{
                        title: "Créditos restantes",
                        value: formatCredits(totalRemainingCredits),
                        delta: totalContractedCredits > 0 ? (totalRemainingCredits / totalContractedCredits) * 100 : 0,
                        tone: "green",
                        series: creditsTrendCumulativeData.map((item) => ({ label: item.label, value: item.cumulative })),
                        description: "saldo disponível",
                        tooltip: "Saldo agregado ainda disponível após consumo do período.",
                      }}
                    />
                    <KPIReportCard
                      data={{
                        title: "Clientes em déficit",
                        value: clientsInDeficit.toLocaleString("pt-BR"),
                        delta: clientsInDeficit,
                        tone: "red",
                        series: creditsRows.map((item) => ({ label: item.client, value: item.deficitCredits })),
                        description: `${Math.round(totalDeficitCredits).toLocaleString("pt-BR")} acima do contratado`,
                        tooltip: "Quantidade de clientes com consumo acima da base contratada.",
                        lowerIsBetter: true,
                      }}
                    />
                    <KPIReportCard
                      data={{
                        title: "Taxa média de consumo",
                        value: `${globalBurnRate.toFixed(1)} créditos/dia`,
                        delta: 0,
                        tone: "yellow",
                        series: creditsTrendData.map((item) => ({ label: item.label, value: item.consumed })),
                        description: "ritmo de consumo por dia",
                        tooltip: "Média diária de créditos consumidos no recorte filtrado.",
                      }}
                    />
                    <KPIReportCard
                      data={{
                        title: "Créditos com retrabalho",
                        value: `${creditsReworkRate.toFixed(1)}%`,
                        delta: 0,
                        tone: "purple",
                        series: creditsRows.map((item) => ({ label: item.client, value: item.reworkCreditsRate })),
                        description: "fatia consumida com ciclos de revisão/ajuste",
                        tooltip: "Percentual de créditos em tarefas que passaram por ciclos de revisão e ajustes.",
                        lowerIsBetter: true,
                      }}
                    />
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <SectionCard title="Curva de consumo de créditos" description="Consumo acumulado e créditos cancelados (não faturáveis) no período.">
                      <div className="h-[320px] rounded-[24px] bg-[#FBFCFB] p-4 dark:bg-[#101112]">
                        <ChartContainer
                          className="aspect-auto h-full w-full"
                          config={{
                            cumulative: { label: "Consumo acumulado", color: "#ff5623" },
                            cancelled: { label: "Cancelados", color: "#f32c2c" },
                          }}
                        >
                          <LineChart data={creditsTrendCumulativeData} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
                            <CartesianGrid vertical={false} strokeDasharray="4 4" />
                            <XAxis dataKey="label" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} />
                            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                            <Line type="monotone" dataKey="cumulative" stroke="#ff5623" strokeWidth={2.5} dot={false} />
                            <Line type="monotone" dataKey="cancelled" stroke="#f32c2c" strokeWidth={2.2} dot={false} />
                          </LineChart>
                        </ChartContainer>
                      </div>
                    </SectionCard>

                    <SectionCard title="Sinais de crédito" description="Alertas para gestão de risco de consumo por carteira.">
                      <div className="space-y-3">
                        <div className="rounded-[20px] border border-[#EAECE8] bg-[#FBFCFB] p-4 dark:border-[#232425] dark:bg-[#101112]">
                          <p className="text-sm font-medium text-[#525252] dark:text-[#D4D4D4]">Próximo esgotamento estimado</p>
                          <p className="mt-2 text-2xl font-bold tracking-tight text-[#171717] dark:text-white">
                            {nextExhaustionDays !== null ? `${Math.max(1, Math.round(nextExhaustionDays))} dias` : "Sem risco imediato"}
                          </p>
                        </div>
                        <div className="rounded-[20px] border border-[#EAECE8] bg-[#FBFCFB] p-4 dark:border-[#232425] dark:bg-[#101112]">
                          <p className="text-sm font-medium text-[#525252] dark:text-[#D4D4D4]">Créditos não faturáveis</p>
                          <p className="mt-2 text-2xl font-bold tracking-tight text-[#171717] dark:text-white">
                            {formatCredits(creditsCancelledPool)}
                          </p>
                          <p className="mt-1 text-xs text-[#737373] dark:text-[#A3A3A3]">canceladas no período</p>
                        </div>
                        <div className="rounded-[20px] border border-[#EAECE8] bg-[#FBFCFB] p-4 dark:border-[#232425] dark:bg-[#101112]">
                          <p className="text-sm font-medium text-[#525252] dark:text-[#D4D4D4]">Regra de consumo aplicada</p>
                          <p className="mt-2 text-sm text-[#737373] dark:text-[#A3A3A3]">
                            consumo do cliente = soma dos créditos de tarefas não canceladas
                          </p>
                        </div>
                      </div>
                    </SectionCard>
                  </div>

                  <SectionCard title="Base de créditos por cliente" description="Contrato, consumo, saldo, déficit e previsão de esgotamento por cliente.">
                    <DataTable
                      columns={[
                        { key: "client", label: "Cliente" },
                        {
                          key: "contractedCredits",
                          label: "Contratados",
                          render: (row) => formatCredits(Number(row.contractedCredits)),
                        },
                        {
                          key: "consumedCredits",
                          label: "Consumidos",
                          render: (row) => formatCredits(Number(row.consumedCredits)),
                        },
                        {
                          key: "remainingCredits",
                          label: "Restantes",
                          render: (row) => formatCredits(Number(row.remainingCredits)),
                        },
                        {
                          key: "deficitCredits",
                          label: "Déficit",
                          render: (row) => formatCredits(Number(row.deficitCredits)),
                        },
                        { key: "burnRate", label: "Taxa de consumo", render: (row) => `${Number(row.burnRate).toFixed(1)} créditos/dia` },
                        {
                          key: "daysToExhaust",
                          label: "Esgotamento",
                          render: (row) => {
                            const days = row.daysToExhaust as number | null;
                            return days && Number.isFinite(days) ? `${Math.max(1, Math.round(days))} dias` : "Sem previsão";
                          },
                        },
                        {
                          key: "risk",
                          label: "Risco",
                          render: (row) => {
                            const risk = row.risk as CreditsClientRow["risk"];
                            return (
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                                  risk === "critical"
                                    ? "bg-[#FEF0F0] text-[#dc2626] dark:bg-[#291516] dark:text-[#fca5a5]"
                                    : risk === "attention"
                                      ? "bg-[#FFF8E5] text-[#b45309] dark:bg-[#241b0c] dark:text-[#fcd34d]"
                                      : "bg-[#EDF9F4] text-[#047857] dark:bg-[#12231c] dark:text-[#79d9b0]",
                                )}
                              >
                                {risk === "critical" ? "Crítico" : risk === "attention" ? "Atenção" : "Saudável"}
                              </span>
                            );
                          },
                        },
                      ]}
                      rows={sortedCreditsRows}
                      sortState={creditsSort}
                      onSort={(key) => handleSort(creditsSort, key, setCreditsSort)}
                    />
                  </SectionCard>
                </div>
                </ReportsSectionErrorBoundary>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={deadlineListMetric !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeadlineListMetric(null);
          }
        }}
      >
        <DialogContent className="flex h-[min(88vh,780px)] w-[95vw] max-w-[1024px] flex-col overflow-hidden rounded-[28px] border-[#E5E7E4] bg-[#F8FAF8] p-0 dark:border-[#2D2F30] dark:bg-[#111214]">
          <DialogHeader className="border-b border-[#E5E7E4] px-6 py-5 text-left dark:border-[#232425]">
            <DialogTitle className="text-2xl font-bold tracking-tight text-[#171717] dark:text-white">
              {getDeadlineListTitle(deadlineListMetric)}
            </DialogTitle>
            <DialogDescription className="text-sm text-[#737373] dark:text-[#A3A3A3]">
              Lista de tarefas para atuação rápida no board atual.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-4 overflow-hidden px-6 py-5">
            <p className="text-sm text-[#737373] dark:text-[#A3A3A3]">
              {selectedDeadlineTasks.length} tarefa{selectedDeadlineTasks.length === 1 ? "" : "s"} encontrada{selectedDeadlineTasks.length === 1 ? "" : "s"}
            </p>

            {selectedDeadlineTasks.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-[#D9DEDA] bg-white px-6 py-10 text-center dark:border-[#2A2C2D] dark:bg-[#171819]">
                <p className="text-base font-semibold text-[#171717] dark:text-white">
                  Nenhuma tarefa neste estado
                </p>
                <p className="mt-1 text-sm text-[#737373] dark:text-[#A3A3A3]">
                  Altere os filtros para encontrar outras tarefas.
                </p>
              </div>
            ) : (
              <div className="h-full max-h-[560px] space-y-3 overflow-y-auto pr-1">
                {selectedDeadlineTasks.map((task) => {
                  const dueState = getTaskDueDateState(task.dueDate);
                  const visibleStatusLabel =
                    columnNameById.get(task.columnId) || WORKFLOW_STATUS_META[task.status].label;
                  return (
                    <div
                      key={task.id}
                      className="rounded-[22px] border border-[#E5E7E4] bg-white px-4 py-3 dark:border-[#2D2F30] dark:bg-[#171819]"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge
                              status={task.status}
                              labelOverride={visibleStatusLabel}
                            />
                            {typeof task.credits === "number" ? (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-[#fef3c7] px-2 py-0.5 text-xs font-semibold text-[#92400e] dark:border dark:border-[#69511a] dark:bg-[#2a220f] dark:text-[#d8a744]">
                                <Diamond className="h-3 w-3" />
                                {Math.round(task.credits).toLocaleString("pt-BR")}
                              </span>
                            ) : null}
                          </div>
                          <p className="text-base font-semibold text-[#171717] dark:text-white">
                            {task.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-[#737373] dark:text-[#A3A3A3]">
                            <span className="inline-flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5 opacity-75" />
                              <span>{getTaskClientName(task)}</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <FolderKanban className="h-3.5 w-3.5 opacity-75" />
                              <span>{boardNameById.get(task.boardId) || "Board"}</span>
                            </span>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5",
                                dueState === "overdue"
                                  ? "font-semibold text-[#dc2626] dark:text-[#fca5a5]"
                                  : dueState === "warning"
                                    ? "font-semibold text-[#b45309] dark:text-[#fcd34d]"
                                    : "",
                              )}
                            >
                              <Calendar className="h-3.5 w-3.5 opacity-75" />
                              <span>{formatTaskDueDate(task.dueDate) || "Sem prazo"}</span>
                            </span>
                          </div>
                          {task.assignees.length > 0 ? (
                            <AvatarStack avatars={task.assignees} max={4} size="sm" />
                          ) : null}
                        </div>

                        <Button
                          variant="outline"
                          className="rounded-2xl border-[#E5E7E4] bg-white text-[#171717] hover:bg-[#F6F8F6] dark:border-[#2D2F30] dark:bg-[#171819] dark:text-white dark:hover:bg-[#1A1B1C] md:self-start"
                          onClick={() => openDeadlineTaskInBoard(task)}
                        >
                          Ver tarefa
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
