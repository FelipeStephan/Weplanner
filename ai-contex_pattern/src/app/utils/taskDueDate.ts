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

export type TaskDueDateState = 'normal' | 'warning' | 'overdue' | 'none';

export interface ParsedTaskDueDate {
  date: Date | null;
  hasTime: boolean;
}

const pad = (value: number) => String(value).padStart(2, '0');

export function parseTaskDueDate(value?: string | null, fallbackYear = 2026): ParsedTaskDueDate {
  if (!value) return { date: null, hasTime: false };

  const normalizedValue = value.trim();
  if (!normalizedValue) return { date: null, hasTime: false };

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
    return {
      date: new Date(`${normalizedValue}T00:00:00`),
      hasTime: false,
    };
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(normalizedValue)) {
    return {
      date: new Date(normalizedValue),
      hasTime: true,
    };
  }

  const compactMatch = normalizedValue.match(/^(\d{1,2})\s([A-Za-zÀ-ÿ]{3})(?:\s(?:às\s)?(\d{2}):(\d{2}))?$/i);
  if (compactMatch) {
    const day = Number(compactMatch[1]);
    const monthLabel = compactMatch[2].slice(0, 3);
    const month = MONTH_MAP[monthLabel] ?? 0;
    const hours = compactMatch[3] ? Number(compactMatch[3]) : 0;
    const minutes = compactMatch[4] ? Number(compactMatch[4]) : 0;

    return {
      date: new Date(fallbackYear, month, day, hours, minutes),
      hasTime: Boolean(compactMatch[3]),
    };
  }

  const parsed = new Date(normalizedValue);
  if (!Number.isNaN(parsed.getTime())) {
    return {
      date: parsed,
      hasTime: /T\d{2}:\d{2}/.test(normalizedValue) || /\d{2}:\d{2}/.test(normalizedValue),
    };
  }

  return { date: null, hasTime: false };
}

export function formatTaskDueDate(value?: string | null, fallbackYear = 2026) {
  const parsed = parseTaskDueDate(value, fallbackYear);
  if (!parsed.date) return value ?? '';

  const monthLabel =
    Object.entries(MONTH_MAP).find(([, month]) => month === parsed.date?.getMonth())?.[0] ?? 'Jan';
  const baseLabel = `${pad(parsed.date.getDate())} ${monthLabel}`;

  if (!parsed.hasTime) return baseLabel;

  return `${baseLabel} às ${pad(parsed.date.getHours())}:${pad(parsed.date.getMinutes())}`;
}

export function getTaskDueDateState(value?: string | null, now = new Date()): TaskDueDateState {
  const parsed = parseTaskDueDate(value);
  if (!parsed.date) return 'none';

  const diff = parsed.date.getTime() - now.getTime();
  if (diff < 0) return 'overdue';
  if (diff <= 24 * 60 * 60 * 1000) return 'warning';
  return 'normal';
}

export function getTaskDueDateInputParts(value?: string | null) {
  const parsed = parseTaskDueDate(value);
  if (!parsed.date) {
    return { date: '', time: '' };
  }

  const date = `${parsed.date.getFullYear()}-${pad(parsed.date.getMonth() + 1)}-${pad(parsed.date.getDate())}`;
  const time = parsed.hasTime ? `${pad(parsed.date.getHours())}:${pad(parsed.date.getMinutes())}` : '';
  return { date, time };
}

export function buildTaskDueDateValue(date: string, time?: string | null) {
  if (!date) return '';
  if (time && time.trim()) return `${date}T${time.trim()}`;
  return date;
}

