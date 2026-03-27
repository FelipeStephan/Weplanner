import { useMemo } from 'react';
import {
  Gem,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { cn } from '../ui/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import type { TeamMember } from '../../../domain/team/contracts';
import type { ClientRecord } from '../../../domain/shared/entities';

// Cards/tarefas que o componente pai passa
interface ClientTask {
  id: string;
  title: string;
  status: string;
  statusLabel: string;
  dueDate?: string;
  credits?: number;
  boardId: string;
  canOpenDetail: boolean;
}

// Atividade do usuário
interface ClientActivity {
  id: string;
  action: string;
  timestamp: string;
}

interface ClientOverviewViewProps {
  member: TeamMember;
  clientRecord: ClientRecord | null;
  tasks: ClientTask[];
  activities: ClientActivity[];
  contractedCredits?: number;
  consumedCredits?: number;
  creditsEnabled?: boolean;
  onOpenTask?: (taskId: string, boardId: string) => void;
  onOpenClientLibrary?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  backlog: '#A3A3A3',
  todo: '#3b82f6',
  in_progress: '#f59e0b',
  review: '#8b5cf6',
  adjustments: '#ef4444',
  approval: '#06b6d4',
  done: '#019364',
  completed: '#019364',
};

function formatDueDate(iso?: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function isOverdue(iso?: string): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

export function ClientOverviewView({
  member,
  clientRecord,
  tasks,
  activities,
  contractedCredits = 0,
  consumedCredits = 0,
  creditsEnabled = true,
  onOpenTask,
  onOpenClientLibrary,
}: ClientOverviewViewProps) {
  const firstName = member.name.split(' ')[0];
  const remaining = Math.max(contractedCredits - consumedCredits, 0);
  const consumptionPct = contractedCredits > 0 ? (consumedCredits / contractedCredits) * 100 : 0;

  const kpis = useMemo(() => {
    const inProgress = tasks.filter(
      (t) => ['in_progress', 'review', 'adjustments', 'approval'].includes(t.status)
    ).length;
    const deliveredThisMonth = tasks.filter((t) => {
      if (t.status !== 'completed' && t.status !== 'done') return false;
      // consider tasks completed in this calendar month
      return true;
    }).length;
    const nearDeadline = tasks.filter((t) => {
      if (!t.dueDate) return false;
      const diff = new Date(t.dueDate).getTime() - Date.now();
      return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
    }).length;
    const overdue = tasks.filter((t) => isOverdue(t.dueDate) && t.status !== 'completed' && t.status !== 'done').length;

    return [
      { label: 'Em produção', value: inProgress, color: '#f59e0b', bg: '#FFFBEB', darkBg: '#221c0a' },
      { label: 'Entregues no mês', value: deliveredThisMonth, color: '#019364', bg: '#EDF9F4', darkBg: '#12231c' },
      { label: 'Prazo próximo', value: nearDeadline, color: '#3b82f6', bg: '#EFF6FF', darkBg: '#0c1929' },
      { label: 'Em atraso', value: overdue, color: '#dc2626', bg: '#FEF2F2', darkBg: '#291516' },
    ];
  }, [tasks]);

  return (
    <div className="min-h-screen bg-[#F6F8F6] dark:bg-[#0f0f10]">
      {/* Header */}
      <div className="border-b border-[#E5E7E4] px-6 py-6 dark:border-[#232425]">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#171717] dark:text-white">
                Olá, {firstName} 👋
              </h1>
              <p className="mt-1 text-base text-[#737373] dark:text-[#A3A3A3]">
                Visão geral da sua conta{clientRecord ? ` · ${clientRecord.name}` : ''}
              </p>
            </div>
            {clientRecord && (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff5623] to-[#ffb39c] text-sm font-bold text-white shadow-lg">
                {clientRecord.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] space-y-8 px-6 py-8">

        {/* Créditos */}
        {creditsEnabled && contractedCredits > 0 && (
          <div className="rounded-3xl border border-[#E8EBE8] bg-white p-6 dark:border-[#232425] dark:bg-[#121313]">
            <div className="flex items-center gap-2 mb-5">
              <Gem className="h-5 w-5 text-[#ff5623]" />
              <h2 className="text-[17px] font-semibold text-[#171717] dark:text-white">
                Créditos {clientRecord ? `· ${clientRecord.name}` : ''}
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-5">
              {[
                { label: 'Contratados', value: contractedCredits, color: '#171717' },
                { label: 'Consumidos', value: consumedCredits, color: '#ff5623' },
                { label: 'Saldo disponível', value: remaining, color: '#019364' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-[#F6F8F6] p-4 dark:bg-[#1A1B1C]">
                  <p className="text-xs font-medium text-[#737373] dark:text-[#A3A3A3]">{item.label}</p>
                  <p className="mt-1.5 text-2xl font-bold tracking-tight" style={{ color: item.color }}>
                    {item.value} <span className="text-base font-normal opacity-60">◆</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Barra de consumo */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[#737373] dark:text-[#A3A3A3]">
                <span>Consumo do período</span>
                <span className="font-semibold">{consumptionPct.toFixed(0)}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[#EBEBEB] dark:bg-[#2D2F30]">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    consumptionPct >= 95 ? 'bg-[#dc2626]' : consumptionPct >= 80 ? 'bg-[#f59e0b]' : 'bg-[#ff5623]',
                  )}
                  style={{ width: `${Math.min(consumptionPct, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-3xl border border-[#E8EBE8] bg-white p-5 dark:border-[#232425] dark:bg-[#121313]"
              style={{
                borderColor: `${kpi.color}20`,
              }}
            >
              <p className="text-xs font-medium text-[#737373] dark:text-[#A3A3A3]">{kpi.label}</p>
              <p
                className="mt-2 text-3xl font-bold tracking-tight"
                style={{ color: kpi.color }}
              >
                {kpi.value}
              </p>
            </div>
          ))}
        </div>

        {/* Minhas tarefas */}
        <div className="rounded-3xl border border-[#E8EBE8] bg-white dark:border-[#232425] dark:bg-[#121313]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F2F0] dark:border-[#1E2020]">
            <h2 className="text-[17px] font-semibold text-[#171717] dark:text-white">
              Minhas tarefas
            </h2>
            <span className="rounded-full bg-[#F6F8F6] px-2.5 py-0.5 text-[12px] font-semibold text-[#525252] dark:bg-[#1A1B1C] dark:text-[#A3A3A3]">
              {tasks.length}
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="h-8 w-8 text-[#D4D4D4]" />
              <p className="mt-3 text-sm text-[#737373] dark:text-[#A3A3A3]">
                Nenhuma tarefa registrada ainda
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#F0F2F0] dark:divide-[#1E2020]">
              {tasks.map((task) => {
                const overdue = isOverdue(task.dueDate) && task.status !== 'completed' && task.status !== 'done';
                return (
                  <div
                    key={task.id}
                    className={cn(
                      'flex items-center gap-4 px-6 py-4',
                      task.canOpenDetail && 'cursor-pointer hover:bg-[#FAFAFA] dark:hover:bg-[#151617]',
                    )}
                    onClick={() => task.canOpenDetail && onOpenTask?.(task.id, task.boardId)}
                  >
                    {/* Status dot */}
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[task.status] ?? '#A3A3A3' }}
                    />

                    {/* Title */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#171717] dark:text-white">
                        {task.title}
                      </p>
                      <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                        {task.statusLabel}
                      </p>
                    </div>

                    {/* Prazo */}
                    <div className="flex shrink-0 items-center gap-1.5">
                      {task.dueDate && (
                        <span
                          className={cn(
                            'flex items-center gap-1 text-[12px]',
                            overdue ? 'font-semibold text-[#dc2626]' : 'text-[#737373] dark:text-[#A3A3A3]',
                          )}
                        >
                          {overdue && <AlertTriangle className="h-3 w-3" />}
                          {!overdue && <Clock className="h-3 w-3" />}
                          {formatDueDate(task.dueDate)}
                        </span>
                      )}
                    </div>

                    {/* Créditos */}
                    {creditsEnabled && (
                      <span className="shrink-0 text-[12px] font-semibold text-[#737373] dark:text-[#A3A3A3]">
                        {task.credits ?? 0} ◆
                      </span>
                    )}

                    {/* Acesso */}
                    {task.canOpenDetail ? (
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#A3A3A3]" />
                    ) : (
                      <span className="shrink-0 text-[11px] text-[#A3A3A3]" title="Em produção — sem acesso ao board de execução">
                        🔒
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Atividades recentes */}
        {activities.length > 0 && (
          <div className="rounded-3xl border border-[#E8EBE8] bg-white dark:border-[#232425] dark:bg-[#121313]">
            <div className="px-6 py-4 border-b border-[#F0F2F0] dark:border-[#1E2020]">
              <h2 className="text-[17px] font-semibold text-[#171717] dark:text-white">
                Atividades recentes
              </h2>
            </div>
            <div className="divide-y divide-[#F0F2F0] dark:divide-[#1E2020]">
              {activities.slice(0, 6).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 px-6 py-3.5">
                  <Avatar className="mt-0.5 h-7 w-7 shrink-0">
                    <AvatarImage src={member.image} />
                    <AvatarFallback
                      className="text-[10px] font-bold text-white"
                      style={{ backgroundColor: member.color ?? '#ff5623' }}
                    >
                      {member.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm text-[#525252] dark:text-[#D4D4D4]">
                      <strong className="font-semibold text-[#171717] dark:text-white">{firstName}</strong>{' '}
                      {activity.action}
                    </p>
                    <p className="text-[11px] text-[#A3A3A3] dark:text-[#737373]">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Biblioteca */}
        <div
          onClick={onOpenClientLibrary}
          className="flex cursor-pointer items-center gap-4 rounded-3xl border border-[#E8EBE8] bg-white p-6 transition-colors hover:border-[#D4D4D4] dark:border-[#232425] dark:bg-[#121313] dark:hover:border-[#333]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF1EA] dark:bg-[#26150f]">
            <BookOpen className="h-5 w-5 text-[#ff5623]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-[16px] font-semibold text-[#171717] dark:text-white">
                Biblioteca
              </p>
              <span className="rounded-full bg-[#F6F8F6] px-2.5 py-0.5 text-[10px] font-semibold text-[#737373] dark:bg-[#1A1B1C] dark:text-[#A3A3A3]">
                Somente visualização
              </span>
            </div>
            <p className="text-sm text-[#737373] dark:text-[#A3A3A3]">
              Arquivos, referências e assets da sua conta
            </p>
          </div>
          <ExternalLink className="h-4 w-4 shrink-0 text-[#A3A3A3]" />
        </div>
      </div>
    </div>
  );
}
