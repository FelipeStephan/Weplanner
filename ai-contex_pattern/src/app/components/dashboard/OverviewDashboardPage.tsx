import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  CircleDot,
  ExternalLink,
  FolderKanban,
  Link2,
  MessageSquare,
  Paperclip,
  Plus,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { PersistedKanbanWorkspaceSnapshot } from '../../data/kanban-workspace-persistence';
import type { BoardViewerContext } from '../../../domain/boards/contracts';
import { clientLibraryRepository } from '../../../repositories/clientLibraryRepository';
import { overviewRepository, type OverviewUserContext } from '../../../repositories/overviewRepository';
import { OverviewTaskListItem } from './OverviewTaskListItem';
import { cn } from '../ui/utils';
import { ClientLibraryModal } from '../shared/ClientLibraryModal';

interface OverviewDashboardPageProps {
  snapshot: PersistedKanbanWorkspaceSnapshot;
  viewer: BoardViewerContext;
  currentUser: OverviewUserContext;
  onOpenBoard: (boardId?: string, taskId?: string) => void;
}

type TaskFilter = 'all' | 'today' | 'overdue';

const KPI_CARD_STYLES = {
  purple: {
    icon: 'bg-[#F1EAFF] text-[#7c3aed] dark:bg-[#221730] dark:text-[#c4b5fd]',
    badge: 'bg-[#F1EAFF] text-[#7c3aed] dark:bg-[#221730] dark:text-[#c4b5fd]',
  },
  green: {
    icon: 'bg-[#EAF8F1] text-[#047857] dark:bg-[#13251D] dark:text-[#79d9b0]',
    badge: 'bg-[#EAF8F1] text-[#047857] dark:bg-[#13251D] dark:text-[#79d9b0]',
  },
  yellow: {
    icon: 'bg-[#FFF8E5] text-[#b45309] dark:bg-[#241b0c] dark:text-[#fcd34d]',
    badge: 'bg-[#FFF8E5] text-[#b45309] dark:bg-[#241b0c] dark:text-[#fcd34d]',
  },
  red: {
    icon: 'bg-[#FEF0F0] text-[#dc2626] dark:bg-[#291516] dark:text-[#fca5a5]',
    badge: 'bg-[#FEF0F0] text-[#dc2626] dark:bg-[#291516] dark:text-[#fca5a5]',
  },
} as const;

const RESOURCE_ICON = {
  drive: Paperclip,
  brand: Sparkles,
  social: Building2,
  links: Link2,
} as const;

const ALERT_ICON = {
  warning: Calendar,
  danger: AlertTriangle,
} as const;

function SectionCard({
  title,
  subtitle,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-[#E5E7E4] bg-white p-5 dark:border-[#232425] dark:bg-[#121313]">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[20px] font-bold tracking-[-0.03em] text-[#171717] dark:text-white">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-[#737373] dark:text-[#A3A3A3]">{subtitle}</p>
          ) : null}
        </div>
        {actionLabel ? (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#525252] transition-colors hover:text-[#171717] dark:text-[#A3A3A3] dark:hover:text-white"
          >
            {actionLabel}
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function OverviewDashboardPage({
  snapshot,
  viewer,
  currentUser,
  onOpenBoard,
}: OverviewDashboardPageProps) {
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('all');
  const [clientLibraryVersion, setClientLibraryVersion] = useState(0);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showClientLibrarySelector, setShowClientLibrarySelector] = useState(false);
  const overview = useMemo(
    () => overviewRepository.build(snapshot, viewer, currentUser),
    [clientLibraryVersion, currentUser, snapshot, viewer],
  );
  const allClientLibraries = useMemo(() => clientLibraryRepository.listAll(), [clientLibraryVersion]);
  const visibleClientLibraries = overview.clientRows.length > 0 ? overview.clientRows : allClientLibraries.slice(0, 6);

  const currentDateLabel = useMemo(() => {
    const raw = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, []);

  const filteredTasks = useMemo(() => {
    if (taskFilter === 'today') {
      return overview.taskRows.filter((task) => task.isDueToday);
    }

    if (taskFilter === 'overdue') {
      return overview.taskRows.filter((task) => task.dueState === 'overdue');
    }

    return overview.taskRows;
  }, [overview.taskRows, taskFilter]);

  const openBoardInNewTab = (boardId?: string, taskId?: string) => {
    if (typeof window === 'undefined') {
      return;
    }

    const resolvedBoardId = boardId || overview.boardRows[0]?.id;
    const params = new URLSearchParams();

    if (resolvedBoardId) {
      params.set('board', resolvedBoardId);
    }

    if (taskId) {
      params.set('card', taskId);
    }

    const baseUrl = window.location.href.split('#')[0];
    const nextUrl = `${baseUrl}#/kanban-workspace${params.toString() ? `?${params.toString()}` : ''}`;
    window.open(nextUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
    <div className="mx-auto w-full max-w-[1560px] px-5 py-6 md:px-8 md:py-8">
      <div className="space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-medium text-[#737373] dark:text-[#A3A3A3]">{currentDateLabel}</p>
          <div>
            <h1 className="text-[32px] font-bold tracking-[-0.04em] text-[#171717] dark:text-white">
              Visão Geral
            </h1>
            <p className="mt-2 text-[15px] text-[#737373] dark:text-[#A3A3A3]">
              Acompanhe suas tarefas, atividades e informações importantes.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overview.kpis.map((kpi) => {
            const icon =
              kpi.id === 'in-progress'
                ? CircleDot
                : kpi.id === 'completed-today'
                  ? CheckCircle2
                  : kpi.id === 'due-soon'
                    ? Calendar
                    : AlertTriangle;
            const Icon = icon;
            const tone = KPI_CARD_STYLES[kpi.tone];

            return (
              <div
                key={kpi.id}
                className="rounded-[24px] border border-[#E5E7E4] bg-white p-5 dark:border-[#232425] dark:bg-[#121313]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={cn('inline-flex h-11 w-11 items-center justify-center rounded-2xl', tone.icon)}>
                    <Icon className="h-5 w-5" />
                  </span>
                  {kpi.badge ? (
                    <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', tone.badge)}>
                      {kpi.badge}
                    </span>
                  ) : null}
                </div>
                <p className="mt-5 text-sm font-medium text-[#737373] dark:text-[#A3A3A3]">{kpi.title}</p>
                <p className="mt-2 text-[34px] font-bold tracking-[-0.04em] text-[#171717] dark:text-white">
                  {kpi.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
          <SectionCard
            title="Minhas tarefas"
            subtitle={`${overview.assignedCount} tarefas atribuídas`}
            actionLabel="Ver todas as tarefas"
            onAction={() => openBoardInNewTab()}
          >
            <div className="mb-5 flex flex-wrap gap-2">
              {[
                { value: 'all' as const, label: 'Todas' },
                { value: 'today' as const, label: 'Hoje' },
                { value: 'overdue' as const, label: 'Atrasadas' },
              ].map((tab) => {
                const active = taskFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setTaskFilter(tab.value)}
                    className={cn(
                      'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                      active
                        ? 'bg-[#171717] text-white dark:bg-[#F5F5F5] dark:text-[#121313]'
                        : 'bg-[#F6F8F6] text-[#737373] hover:text-[#171717] dark:bg-[#191A1B] dark:text-[#A3A3A3] dark:hover:text-white',
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-[#D8DDD8] bg-[#FBFCFB] px-5 py-8 text-center dark:border-[#2A2C2D] dark:bg-[#171819]">
                  <p className="text-sm font-semibold text-[#171717] dark:text-white">Nenhuma tarefa neste filtro</p>
                  <p className="mt-1 text-sm text-[#737373] dark:text-[#A3A3A3]">
                    Ajuste o filtro para revisar outras tarefas.
                  </p>
                </div>
              ) : (
                filteredTasks
                  .slice(0, 6)
                  .map((task) => (
                    <OverviewTaskListItem
                      key={task.id}
                      task={task}
                      onOpen={(selectedTask) => openBoardInNewTab(selectedTask.boardId, selectedTask.id)}
                    />
                  ))
              )}
            </div>
          </SectionCard>

          <SectionCard title="Avisos" subtitle="Itens que exigem atenção imediata">
            <div className="mb-4 flex items-center justify-between rounded-[20px] bg-[#F6F8F6] px-4 py-3 dark:bg-[#171819]">
              <p className="text-sm font-medium text-[#525252] dark:text-[#D4D4D4]">Alertas ativos</p>
              <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[#171717] px-2 text-xs font-semibold text-white dark:bg-white dark:text-[#121313]">
                {overview.alertRows.length}
              </span>
            </div>

            <div className="space-y-3">
              {overview.alertRows.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-[#D8DDD8] bg-[#FBFCFB] px-5 py-8 text-center dark:border-[#2A2C2D] dark:bg-[#171819]">
                  <p className="text-sm font-semibold text-[#171717] dark:text-white">Nenhum aviso crítico</p>
                  <p className="mt-1 text-sm text-[#737373] dark:text-[#A3A3A3]">
                    Seus prazos estão controlados neste momento.
                  </p>
                </div>
              ) : (
                overview.alertRows.map((alert) => {
                  const Icon = ALERT_ICON[alert.tone];
                  return (
                    <div
                      key={alert.id}
                      className={cn(
                        'group rounded-[22px] border px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-24px_rgba(23,23,23,0.22)] dark:hover:shadow-[0_18px_36px_-28px_rgba(0,0,0,0.5)]',
                        alert.tone === 'danger'
                          ? 'border-[#F6CDCD] bg-[#FFF7F7] hover:border-[#F0B8B8] hover:bg-[#FFF9F9] dark:border-[#4B2225] dark:bg-[#1D1213] dark:hover:border-[#6A2D31] dark:hover:bg-[#221415]'
                          : 'border-[#F4E4B3] bg-[#FFFDF3] hover:border-[#E7CF89] hover:bg-[#FFFEF8] dark:border-[#5A4520] dark:bg-[#1C1810] dark:hover:border-[#7A602B] dark:hover:bg-[#211B11]',
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={cn(
                            'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
                            alert.tone === 'danger'
                              ? 'bg-[#FEF0F0] text-[#dc2626] dark:bg-[#291516] dark:text-[#fca5a5]'
                              : 'bg-[#FFF8E5] text-[#b45309] dark:bg-[#241b0c] dark:text-[#fcd34d]',
                          )}
                        >
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#171717] dark:text-white">{alert.title}</p>
                          <p className="mt-1 text-sm text-[#737373] dark:text-[#A3A3A3]">{alert.description}</p>
                          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8A8A8A] dark:text-[#A3A3A3]">
                            {alert.priorityLabel}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openBoardInNewTab(alert.boardId, alert.taskId)}
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E5E7E4] text-[#525252] transition-colors group-hover:bg-white group-hover:text-[#171717] dark:border-[#2D2F30] dark:text-[#D4D4D4] dark:group-hover:bg-[#171819] dark:group-hover:text-white"
                          aria-label="Ver tarefa"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <SectionCard
            title="Seus boards"
            subtitle="Acesso rápido aos seus workspaces"
            actionLabel="Ver todos"
            onAction={() => openBoardInNewTab()}
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {overview.boardRows.map((board) => (
                <button
                  key={board.id}
                  type="button"
                  onClick={() => openBoardInNewTab(board.id)}
                  className="group rounded-[24px] border border-[#E5E7E4] bg-[#FBFCFB] p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D5DBD5] hover:bg-white hover:shadow-[0_14px_30px_-24px_rgba(23,23,23,0.28)] dark:border-[#232425] dark:bg-[#171819] dark:hover:border-[#343638] dark:hover:bg-[#1B1D1E] dark:hover:shadow-[0_18px_36px_-28px_rgba(0,0,0,0.55)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF1EA] text-[#ff5623] dark:bg-[#26150f] dark:text-[#ffb39c]">
                      <FolderKanban className="h-5 w-5" />
                    </span>
                    <ExternalLink className="h-4 w-4 text-[#A3A3A3] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                  <p className="mt-4 text-[15px] font-semibold text-[#171717] dark:text-white">{board.name}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-[#737373] dark:text-[#A3A3A3]">
                    {board.description || 'Board operacional do workspace'}
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-xs font-semibold text-[#737373] dark:text-[#A3A3A3]">
                    <span>{board.activeTasks} tarefas ativas</span>
                    <span>{board.overdueTasks} atrasadas</span>
                  </div>
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Atividade recente" actionLabel="Ver tudo" onAction={() => openBoardInNewTab()}>
            <div className="space-y-3">
              {overview.activityRows.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openBoardInNewTab(item.boardId, item.taskId)}
                  className="group flex w-full items-start gap-3 rounded-[22px] border border-[#E5E7E4] bg-[#FBFCFB] px-4 py-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D5DBD5] hover:bg-white hover:shadow-[0_14px_30px_-24px_rgba(23,23,23,0.28)] dark:border-[#232425] dark:bg-[#171819] dark:hover:border-[#343638] dark:hover:bg-[#1B1D1E] dark:hover:shadow-[0_18px_36px_-28px_rgba(0,0,0,0.55)]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F3F3F3] dark:bg-[#232325]">
                    {item.actorImage ? (
                      <img src={item.actorImage} alt={item.actorName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-semibold text-[#171717] dark:text-white">
                        {item.actorName
                          .split(' ')
                          .map((part) => part[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#525252] dark:text-[#D4D4D4]">
                      <span className="font-semibold text-[#171717] dark:text-white">{item.actorName}</span>{' '}
                      {item.action}{' '}
                      <span className="font-semibold text-[#171717] dark:text-white">{item.taskTitle}</span>
                    </p>
                    <p className="mt-1 text-xs text-[#A3A3A3]">{item.timestampLabel}</p>
                  </div>
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E5E7E4] text-[#525252] transition-all duration-200 group-hover:bg-white group-hover:text-[#171717] dark:border-[#2D2F30] dark:text-[#D4D4D4] dark:group-hover:bg-[#171819] dark:group-hover:text-white">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
              ))}
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="Biblioteca de clientes"
          subtitle="Acesso rápido a recursos por cliente"
          actionLabel="Cadastrar biblioteca"
          onAction={() => setShowClientLibrarySelector(true)}
        >
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {visibleClientLibraries.map((client) => (
              <button
                key={client.id}
                type="button"
                onClick={() => setSelectedClientId(client.id)}
                className="group rounded-[24px] border border-[#E5E7E4] bg-[#FBFCFB] p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D5DBD5] hover:bg-white hover:shadow-[0_14px_30px_-24px_rgba(23,23,23,0.28)] dark:border-[#232425] dark:bg-[#171819] dark:hover:border-[#343638] dark:hover:bg-[#1B1D1E] dark:hover:shadow-[0_18px_36px_-28px_rgba(0,0,0,0.55)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1EA] text-sm font-bold text-[#ff5623] dark:bg-[#26150f] dark:text-[#ffb39c]">
                    {client.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <p className="min-w-0 text-[15px] font-semibold text-[#171717] transition-colors group-hover:text-[#ff5623] dark:text-white dark:group-hover:text-[#ff8c69]">
                    {client.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
      <ClientLibraryModal
        isOpen={!!selectedClientId}
        clientId={selectedClientId}
        onClose={() => setSelectedClientId(null)}
        onSaved={() => setClientLibraryVersion((current) => current + 1)}
      />
      {showClientLibrarySelector ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowClientLibrarySelector(false)}
          />
          <div className="relative w-full max-w-[560px] rounded-[28px] border border-[#E5E7E4] bg-[#F8FAF8] p-6 dark:border-[#2D2F30] dark:bg-[#111214]">
            <div className="mb-5">
              <h3 className="text-xl font-bold tracking-[-0.03em] text-[#171717] dark:text-white">
                Cadastrar biblioteca
              </h3>
              <p className="mt-1 text-sm text-[#737373] dark:text-[#A3A3A3]">
                Escolha um cliente para criar ou editar a biblioteca de links úteis.
              </p>
            </div>

            <div className="max-h-[52vh] space-y-3 overflow-y-auto pr-1">
              {allClientLibraries.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => {
                    setSelectedClientId(client.id);
                    setShowClientLibrarySelector(false);
                  }}
                  className="group flex w-full items-center gap-3 rounded-[22px] border border-[#E5E7E4] bg-white px-4 py-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D5DBD5] hover:bg-[#FCFDFC] hover:shadow-[0_14px_30px_-24px_rgba(23,23,23,0.28)] dark:border-[#232425] dark:bg-[#171819] dark:hover:border-[#343638] dark:hover:bg-[#1B1D1E] dark:hover:shadow-[0_18px_36px_-28px_rgba(0,0,0,0.55)]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1EA] text-sm font-bold text-[#ff5623] dark:bg-[#26150f] dark:text-[#ffb39c]">
                    {client.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#171717] dark:text-white">{client.name}</p>
                    <p className="mt-1 text-xs text-[#737373] dark:text-[#A3A3A3]">
                      {client.resources.length > 0
                        ? `${client.resources.length} item${client.resources.length === 1 ? '' : 's'} cadastrados`
                        : 'Sem biblioteca cadastrada'}
                    </p>
                  </div>
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E5E7E4] text-[#525252] transition-colors group-hover:bg-white group-hover:text-[#171717] dark:border-[#2D2F30] dark:text-[#D4D4D4] dark:group-hover:bg-[#121313] dark:group-hover:text-white">
                    {client.resources.length > 0 ? <ExternalLink className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
