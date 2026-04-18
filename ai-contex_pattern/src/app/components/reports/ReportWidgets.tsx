import {
  Component,
  type ErrorInfo,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  CircleAlert,
  Info,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import {
  Area,
  AreaChart,
} from "recharts";
import { KPI_TONE_CLASSES } from "../../data/reportsData";
import { getInsightToneClasses } from "../../utils/reportsUtils";
import type { KPIData, PeriodInsight, SortState } from "../../types/reportsPage";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "../ui/utils";

// ─── Internal helpers ─────────────────────────────────────────────────────────

const hexToRgba = (hex: string, alpha: number): string => {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => `${c}${c}`)
          .join("")
      : normalized;
  const numericValue = Number.parseInt(value, 16);
  const red = (numericValue >> 16) & 255;
  const green = (numericValue >> 8) & 255;
  const blue = numericValue & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

// ─── KPIReportCard ────────────────────────────────────────────────────────────

export function KPIReportCard({ data }: { data: KPIData }) {
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
          background: `linear-gradient(180deg, ${hexToRgba(tone.line, 0)} 0%, ${hexToRgba(tone.line, 0.018)} 62%, ${hexToRgba(tone.line, 0.065)} 100%)`,
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

// ─── SectionCard ──────────────────────────────────────────────────────────────

export function SectionCard({
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

// ─── ReportsSectionErrorBoundary ─────────────────────────────────────────────

export class ReportsSectionErrorBoundary extends Component<
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

// ─── InsightCard ──────────────────────────────────────────────────────────────

export function InsightCard({ insight }: { insight: PeriodInsight }) {
  return (
    <div className={cn("rounded-[24px] border px-4 py-4", getInsightToneClasses(insight.tone))}>
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

// ─── FilterSelect ─────────────────────────────────────────────────────────────

export function FilterSelect({
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

// ─── DateInput ────────────────────────────────────────────────────────────────

export function DateInput({
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

// ─── DataTable ────────────────────────────────────────────────────────────────

export function DataTable({
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
                      sortState.direction === "desc" ? (
                        <ArrowDown className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowUp className="h-3.5 w-3.5" />
                      )
                    ) : null}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F3F1] bg-white dark:divide-[#232425] dark:bg-[#151617]">
            {rows.map((row, index) => (
              <tr
                key={`${row[columns[0].key]}-${index}`}
                className="transition-colors hover:bg-[#FBFCFB] dark:hover:bg-[#111213]"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-4 py-3.5 text-[14px] text-[#525252] dark:text-[#D4D4D4]",
                      column.key === columns[0].key &&
                        "font-medium text-[#171717] dark:text-white",
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
