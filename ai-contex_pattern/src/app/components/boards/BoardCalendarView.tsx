import { useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, FolderKanban, Plus, Users } from 'lucide-react';
import type { WorkflowStatus } from '../../../domain/kanban/contracts';
import { formatTaskDueDate, parseTaskDueDate } from '../../utils/taskDueDate';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface CalendarBoardTask {
  id: string;
  title: string;
  dueDate: string;
  priority: TaskPriority;
  status: WorkflowStatus;
  columnName: string;
  columnAccentColor: string;
  assignees: Array<{ name: string; image?: string }>;
  clientName?: string | null;
}

interface BoardCalendarViewProps {
  month: Date;
  selectedDate: Date | null;
  tasks: CalendarBoardTask[];
  onMonthChange: (nextMonth: Date) => void;
  onSelectDate: (date: Date | null) => void;
  onOpenTask: (taskId: string) => void;
  onCreateTaskAtDate: (date: Date) => void;
}

const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const startOfDay = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate());

const startOfMonth = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), 1);

const addDays = (value: Date, amount: number) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate() + amount);

const addMonths = (value: Date, amount: number) =>
  new Date(value.getFullYear(), value.getMonth() + amount, 1);

const getWeekStart = (value: Date) => {
  const dayIndex = (value.getDay() + 6) % 7;
  return addDays(startOfDay(value), -dayIndex);
};

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const isSameMonth = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth();

const getDayKey = (value: Date) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(
    value.getDate(),
  ).padStart(2, '0')}`;

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const formatMonthLabel = (value: Date) =>
  capitalize(
    value.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    }),
  );

const formatSelectedDateLabel = (value: Date) =>
  capitalize(
    value.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    }),
  );

const getPriorityClasses = (priority: TaskPriority) => {
  if (priority === 'urgent') {
    return 'bg-[#FFF0F1] text-[#C51D34] dark:bg-[#34161b] dark:text-[#ff9cab]';
  }

  if (priority === 'high') {
    return 'bg-[#FFF4EE] text-[#C2410C] dark:bg-[#2c1710] dark:text-[#ffb089]';
  }

  if (priority === 'medium') {
    return 'bg-[#FFF8DD] text-[#9A6700] dark:bg-[#2d2410] dark:text-[#f7d16a]';
  }

  return 'bg-[#EAF7F0] text-[#0F8A58] dark:bg-[#162b21] dark:text-[#7fe0b3]';
};

const withAlpha = (hexColor: string, alpha: string) => {
  if (!/^#[\da-fA-F]{6}$/.test(hexColor)) {
    return undefined;
  }

  return `${hexColor}${alpha}`;
};

export function BoardCalendarView({
  month,
  selectedDate,
  tasks,
  onMonthChange,
  onSelectDate,
  onOpenTask,
  onCreateTaskAtDate,
}: BoardCalendarViewProps) {
  const today = useMemo(() => startOfDay(new Date()), []);

  const { monthDays, tasksByDay, monthTaskCount, monthTasksChronological, visibleTaskList } = useMemo(() => {
    const monthStart = startOfMonth(month);
    const gridStart = getWeekStart(monthStart);
    const days = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
    const groupedTasks = new Map<string, CalendarBoardTask[]>();

    tasks.forEach((task) => {
      const parsedDueDate = parseTaskDueDate(task.dueDate).date;
      if (!parsedDueDate) {
        return;
      }

      const normalizedDate = startOfDay(parsedDueDate);
      const key = getDayKey(normalizedDate);
      const currentItems = groupedTasks.get(key) ?? [];
      currentItems.push(task);
      currentItems.sort((left, right) => {
        const leftDate = parseTaskDueDate(left.dueDate).date;
        const rightDate = parseTaskDueDate(right.dueDate).date;
        return (leftDate?.getTime() ?? 0) - (rightDate?.getTime() ?? 0);
      });
      groupedTasks.set(key, currentItems);
    });

    const monthlyItems = tasks
      .filter((task) => {
        const parsedDueDate = parseTaskDueDate(task.dueDate).date;
        return parsedDueDate ? isSameMonth(parsedDueDate, monthStart) : false;
      })
      .sort((left, right) => {
        const leftDate = parseTaskDueDate(left.dueDate).date;
        const rightDate = parseTaskDueDate(right.dueDate).date;
        return (leftDate?.getTime() ?? 0) - (rightDate?.getTime() ?? 0);
      });

    const selectedItems = selectedDate
      ? groupedTasks.get(getDayKey(startOfDay(selectedDate))) ?? []
      : monthlyItems;

    return {
      monthDays: days,
      tasksByDay: groupedTasks,
      monthTaskCount: monthlyItems.length,
      monthTasksChronological: monthlyItems,
      visibleTaskList: selectedItems,
    };
  }, [month, selectedDate, tasks]);

  return (
    <div
      className="px-6 pb-6 pt-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onSelectDate(null);
        }
      }}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-hidden rounded-[32px] border border-[#E5E7E4] bg-white shadow-[0_24px_60px_-34px_rgba(15,23,42,0.24)] dark:border-[#232425] dark:bg-[#121313]">
          <div className="flex flex-col gap-4 border-b border-[#EEF1ED] px-5 py-5 dark:border-[#232425] lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#171717] dark:text-white">
                <Calendar className="h-5 w-5 text-[#ff5623]" />
                <h2 className="text-lg font-semibold">Calendário do board</h2>
              </div>
              <p className="mt-1 text-sm text-[#737373] dark:text-[#A3A3A3]">
                Visualize os prazos por dia e acompanhe as tarefas do mês em ordem cronológica.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-2xl border border-[#E5E7E4] bg-[#F8FAF8] px-3 py-2 text-sm font-medium text-[#525252] dark:border-[#2D2F30] dark:bg-[#171819] dark:text-[#D4D4D4]">
                {monthTaskCount} {monthTaskCount === 1 ? 'tarefa no mês' : 'tarefas no mês'}
              </div>
              <div className="flex items-center gap-1 rounded-2xl border border-[#E5E7E4] bg-white p-1 dark:border-[#2D2F30] dark:bg-[#171819]">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl"
                  onClick={() => onMonthChange(addMonths(month, -1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-[180px] text-center text-sm font-semibold text-[#171717] dark:text-white">
                  {formatMonthLabel(month)}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl"
                  onClick={() => onMonthChange(addMonths(month, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl border-[#E5E7E4] bg-white text-[#171717] hover:bg-[#F6F8F6] dark:border-[#2D2F30] dark:bg-[#171819] dark:text-white dark:hover:bg-[#1E2021]"
                onClick={() => {
                  onMonthChange(startOfMonth(today));
                  onSelectDate(null);
                }}
              >
                Hoje
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[860px] px-5 py-5">
              <div className="mb-3 grid grid-cols-7 gap-3">
                {WEEKDAY_LABELS.map((label) => (
                  <div
                    key={label}
                    className="rounded-2xl bg-[#F6F8F6] px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-[#737373] dark:bg-[#171819] dark:text-[#8E9092]"
                  >
                    {label}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-3">
                {monthDays.map((day) => {
                  const dayKey = getDayKey(day);
                  const dayTasks = tasksByDay.get(dayKey) ?? [];
                  const isCurrentMonth = isSameMonth(day, month);
                  const isToday = isSameDay(day, today);
                  const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

                  return (
                    <div
                      key={dayKey}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectDate(isSelected ? null : day)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onSelectDate(isSelected ? null : day);
                        }
                      }}
                      className={cn(
                        'group min-h-[148px] rounded-[28px] border p-3 text-left transition-all',
                        isCurrentMonth
                          ? 'border-[#EEF1ED] bg-[#FCFDFC] dark:border-[#232425] dark:bg-[#161718]'
                          : 'border-[#F2F3F2] bg-[#F8F9F8] opacity-65 dark:border-[#1D1F20] dark:bg-[#121313]',
                        isSelected &&
                          'border-[#ff5623] shadow-[0_20px_40px_-30px_rgba(255,86,35,0.9)]',
                        isToday && !isSelected && 'border-[#feba31]',
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-semibold',
                            isSelected
                              ? 'bg-[#ff5623] text-white'
                              : isToday
                                ? 'bg-[#FFF3DD] text-[#9A6700] dark:bg-[#2d2410] dark:text-[#f7d16a]'
                                : 'bg-[#F1F4F1] text-[#525252] dark:bg-[#1C1E1F] dark:text-[#D4D4D4]',
                          )}
                        >
                          {day.getDate()}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            aria-label={`Criar tarefa em ${day.toLocaleDateString('pt-BR')}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              onCreateTaskAtDate(day);
                            }}
                            className={cn(
                              'inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#E5E7E4] bg-white text-[#737373] opacity-0 shadow-[0_12px_24px_-18px_rgba(15,23,42,0.32)] transition-all hover:border-[#ff5623]/35 hover:bg-[#FFF4EE] hover:text-[#c2410c] group-hover:opacity-100 focus-visible:opacity-100 dark:border-[#2D2F30] dark:bg-[#171819] dark:text-[#A3A3A3] dark:hover:border-[#ff8c69]/40 dark:hover:bg-[#26150f] dark:hover:text-[#ffb39c]',
                              isSelected && 'opacity-100',
                            )}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        {dayTasks.slice(0, 3).map((task) => {
                          const taskDate = parseTaskDueDate(task.dueDate);
                          const taskTime = taskDate.hasTime && taskDate.date
                            ? taskDate.date.toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : null;

                          return (
                            <button
                              key={task.id}
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                onOpenTask(task.id);
                              }}
                              className="w-full rounded-2xl border border-transparent px-3 py-2 text-left transition-transform hover:-translate-y-[1px] hover:border-[#E5E7E4] hover:bg-white dark:hover:border-[#2D2F30] dark:hover:bg-[#1A1B1C]"
                              style={{
                                backgroundColor: withAlpha(task.columnAccentColor, '18') ?? '#FFF4EE',
                              }}
                            >
                              <div className="flex items-start gap-2">
                                <span
                                  className="mt-0.5 h-8 w-1 shrink-0 rounded-full"
                                  style={{ backgroundColor: task.columnAccentColor }}
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-xs font-semibold text-[#171717] dark:text-white">
                                    {task.title}
                                  </p>
                                  <div className="mt-1 flex items-center gap-2 text-[11px] text-[#525252] dark:text-[#C6C7C8]">
                                    <span
                                      className={cn(
                                        'rounded-full px-2 py-0.5 font-medium',
                                        getPriorityClasses(task.priority),
                                      )}
                                    >
                                      {task.columnName}
                                    </span>
                                    {taskTime ? <span>{taskTime}</span> : null}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}

                        {dayTasks.length > 3 ? (
                          <div className="rounded-2xl bg-[#F3F5F3] px-3 py-2 text-xs font-medium text-[#525252] dark:bg-[#1A1B1C] dark:text-[#D4D4D4]">
                            +{dayTasks.length - 3} tarefas neste dia
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <aside
          className="space-y-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              onSelectDate(null);
            }
          }}
        >
          <section className="rounded-[28px] border border-[#E5E7E4] bg-white p-5 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.22)] dark:border-[#232425] dark:bg-[#121313]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-[#171717] dark:text-white">
                  <FolderKanban className="h-4 w-4 text-[#ff5623]" />
                  <h3 className="text-base font-semibold">
                    {selectedDate ? 'Tarefas do dia' : 'Tarefas do mês'}
                  </h3>
                </div>
                <p className="mt-1 text-sm text-[#737373] dark:text-[#A3A3A3]">
                  {selectedDate
                    ? formatSelectedDateLabel(selectedDate)
                    : `${formatMonthLabel(month)} em ordem cronológica`}
                </p>
              </div>

              {selectedDate ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-2xl text-[#737373] hover:bg-[#F6F8F6] hover:text-[#171717] dark:text-[#A3A3A3] dark:hover:bg-[#1A1B1C] dark:hover:text-white"
                  onClick={() => onSelectDate(null)}
                >
                  Limpar
                </Button>
              ) : null}
            </div>

            <div className="mt-4 space-y-3">
              {visibleTaskList.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#DDE2DD] bg-[#F8FAF8] px-4 py-5 text-sm text-[#737373] dark:border-[#2A2C2D] dark:bg-[#171819] dark:text-[#A3A3A3]">
                  Nenhuma tarefa com prazo neste período.
                </div>
              ) : (
                visibleTaskList.map((task) => {
                  const assigneeLabel = task.assignees.length
                    ? task.assignees.map((assignee) => assignee.name).join(', ')
                    : 'Sem responsáveis';

                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => onOpenTask(task.id)}
                      className="w-full rounded-[24px] border border-[#EAEDEA] bg-[#FCFDFC] px-4 py-4 text-left transition-colors hover:border-[#ff5623]/40 hover:bg-[#FFF9F6] dark:border-[#232425] dark:bg-[#171819] dark:hover:border-[#ff5623]/40 dark:hover:bg-[#1C1715]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#171717] dark:text-white">
                            {task.title}
                          </p>
                          <p className="mt-1 text-xs text-[#737373] dark:text-[#A3A3A3]">
                            {task.clientName || task.columnName}
                          </p>
                        </div>
                        <span
                          className="rounded-full px-2 py-1 text-[11px] font-medium"
                          style={{
                            backgroundColor: withAlpha(task.columnAccentColor, '16') ?? '#FFF4EE',
                            color: task.columnAccentColor,
                          }}
                        >
                          {task.columnName}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#525252] dark:text-[#C6C7C8]">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatTaskDueDate(task.dueDate)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {assigneeLabel}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {!selectedDate && monthTasksChronological.length > 0 ? (
              <p className="mt-4 text-xs text-[#8A8A8A] dark:text-[#8E9092]">
                Clique em um dia do calendário para filtrar apenas as tarefas daquela data.
              </p>
            ) : null}
          </section>
        </aside>
      </div>
    </div>
  );
}
