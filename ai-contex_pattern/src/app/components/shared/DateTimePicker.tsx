import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { cn } from '../ui/utils';
import { formatTaskDueDate } from '../../utils/taskDueDate';

// ─── Constants ────────────────────────────────────────────────────────────────

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseISOParts(value?: string): { date: string; time: string } {
  if (!value) return { date: '', time: '' };
  const [date = '', timePart = ''] = value.split('T');
  return { date, time: timePart.slice(0, 5) };
}

function toMidnight(year: number, month: number, day: number): number {
  return new Date(year, month, day).getTime();
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DateTimePickerProps {
  /** ISO string: "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM" */
  value?: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  /** "field" = input-like border box (CreateTaskModal)
   *  "inline" = text trigger with hover bg (TaskDetailModal) */
  variant?: 'field' | 'inline';
  className?: string;
  /** Extra classes forwarded to the trigger button */
  triggerClassName?: string;
  /** Color state for the inline variant (overdue/warning/normal) */
  dueDateState?: 'overdue' | 'warning' | 'normal';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DateTimePicker({
  value,
  onChange,
  onClear,
  placeholder = 'Definir data',
  variant = 'field',
  className,
  triggerClassName,
  dueDateState = 'normal',
}: DateTimePickerProps) {
  const { date: initDate, time: initTime } = parseISOParts(value);

  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(initDate);
  const [selectedTime, setSelectedTime] = useState(initTime || '09:00');
  const [viewDate, setViewDate] = useState(() =>
    initDate ? new Date(initDate + 'T00:00:00') : new Date(),
  );

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync when value prop changes externally
  useEffect(() => {
    const { date, time } = parseISOParts(value);
    setSelectedDate(date);
    if (time) setSelectedTime(time);
    if (date) setViewDate(new Date(date + 'T00:00:00'));
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // ── Calendar math ────────────────────────────────────────────────────────────
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayMs = toMidnight(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleDayClick = (day: number) => {
    const d = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(d);
  };

  const handleConfirm = () => {
    if (selectedDate) onChange(`${selectedDate}T${selectedTime}`);
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedDate('');
    onClear?.();
    onChange('');
    setOpen(false);
  };

  // ── Display ──────────────────────────────────────────────────────────────────
  const displayValue = value ? formatTaskDueDate(value) : '';

  const inlineTextClass = cn(
    'text-sm font-semibold truncate transition-colors group-hover:text-[#ff5623]',
    dueDateState === 'overdue'
      ? 'text-[#dc2626] dark:text-[#ff4d4f]'
      : dueDateState === 'warning'
        ? 'text-[#a16207] dark:text-[#d89b18]'
        : displayValue
          ? 'text-[#171717] dark:text-[#f5f5f5]'
          : 'text-[#a3a3a3]',
  );

  const inlineIconClass = cn(
    'h-4 w-4 shrink-0 transition-colors group-hover:text-[#ff5623]',
    dueDateState === 'overdue'
      ? 'text-[#f32c2c]'
      : dueDateState === 'warning'
        ? 'text-[#ca8a04]'
        : 'text-[#a3a3a3]',
  );

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* ── Trigger ─────────────────────────────────────────────────────────── */}
      {variant === 'inline' ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'group flex w-full items-center gap-2 rounded-xl border border-transparent p-1.5 -ml-1.5 text-left transition-colors hover:bg-[#e5e5e5] dark:hover:bg-[#2a2a2a]',
            triggerClassName,
          )}
        >
          <Calendar className={inlineIconClass} />
          <span className={inlineTextClass}>{displayValue || placeholder}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'flex h-10 w-full items-center gap-2.5 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-4 text-sm text-left transition-all focus:border-[#ff5623] focus:outline-none focus:ring-2 focus:ring-[#ff5623]/20 hover:border-[#d4d4d4] dark:border-[#2a2a2a] dark:bg-[#1e1e1e]',
            triggerClassName,
          )}
        >
          <Calendar className="h-4 w-4 shrink-0 text-[#a3a3a3]" />
          <span className={displayValue ? 'text-[#171717] dark:text-[#f5f5f5]' : 'text-[#a3a3a3]'}>
            {displayValue || placeholder}
          </span>
        </button>
      )}

      {/* ── Dropdown ────────────────────────────────────────────────────────── */}
      {open && (
        <div className="absolute left-0 top-full z-[300] mt-2 w-[272px] overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-xl dark:border-[#2a2a2a] dark:bg-[#1a1a1a]">

          {/* Month navigation */}
          <div className="flex items-center justify-between border-b border-[#f0f0f0] px-4 py-3 dark:border-[#252525]">
            <button
              onClick={prevMonth}
              className="rounded-lg p-1.5 text-[#525252] transition-colors hover:bg-[#f5f5f5] dark:text-[#a3a3a3] dark:hover:bg-[#252525]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-[#171717] dark:text-[#f5f5f5]">
              {MONTHS[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="rounded-lg p-1.5 text-[#525252] transition-colors hover:bg-[#f5f5f5] dark:text-[#a3a3a3] dark:hover:bg-[#252525]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 px-3 pt-3">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="pb-1.5 text-center text-[9px] font-semibold uppercase tracking-wider text-[#a3a3a3]"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-y-0.5 px-3 pb-3">
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = selectedDate === dateStr;
              const isToday = toMidnight(year, month, day) === todayMs;
              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    'mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-medium transition-colors',
                    isSelected
                      ? 'bg-[#ff5623] text-white shadow-sm'
                      : isToday
                        ? 'border border-[#ff5623] text-[#ff5623]'
                        : 'text-[#525252] hover:bg-[#f5f5f5] dark:text-[#d4d4d4] dark:hover:bg-[#252525]',
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Time + actions */}
          <div className="border-t border-[#f0f0f0] px-4 py-3 dark:border-[#252525]">
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 shrink-0 text-[#a3a3a3]" />
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="h-8 flex-1 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-3 text-sm text-[#171717] outline-none transition-all focus:border-[#ff5623] focus:ring-2 focus:ring-[#ff5623]/20 dark:border-[#2a2a2a] dark:bg-[#141414] dark:text-[#f5f5f5]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClear}
                className="flex-1 rounded-xl border border-[#e5e5e5] py-2 text-[12px] font-semibold text-[#a3a3a3] transition-colors hover:border-[#f32c2c]/40 hover:text-[#f32c2c] dark:border-[#2a2a2a]"
              >
                Limpar
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedDate}
                className="flex-1 rounded-xl bg-[#ff5623] py-2 text-[12px] font-semibold text-white transition-colors hover:bg-[#c2410c] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
