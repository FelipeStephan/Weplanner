import { addDays, parseISO, subDays } from 'date-fns';
import type { PersistedKanbanWorkspaceSnapshot } from '../app/data/kanban-workspace-persistence';

export const EMPTY_REPORTS_SNAPSHOT: PersistedKanbanWorkspaceSnapshot = {
  schemaVersion: 1,
  persistedAt: new Date().toISOString(),
  boards: [
    {
      id: 'board-my-workspace',
      name: 'Meu quadro',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  columns: [],
  tasks: [],
  taskStatusHistory: [],
};

export const createReportsDemoSnapshot = (): PersistedKanbanWorkspaceSnapshot => {
  const now = new Date();
  const boardId = 'board-demo';
  const boardCreatedAt = subDays(now, 90).toISOString();
  const team = [
    {
      id: 'ana',
      name: 'Ana Silva',
      image:
        'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?w=80&h=80&fit=crop&crop=face',
    },
    {
      id: 'carlos',
      name: 'Carlos Lima',
      image:
        'https://images.unsplash.com/photo-1672685667592-0392f458f46f?w=80&h=80&fit=crop&crop=face',
    },
    {
      id: 'mariana',
      name: 'Mariana Costa',
      image:
        'https://images.unsplash.com/photo-1641808895769-29e63aa2f066?w=80&h=80&fit=crop&crop=face',
    },
    {
      id: 'rafael',
      name: 'Rafael Santos',
      image:
        'https://images.unsplash.com/photo-1762708550141-2688121b9ebd?w=80&h=80&fit=crop&crop=face',
    },
    {
      id: 'julia',
      name: 'Julia Ferreira',
      image:
        'https://images.unsplash.com/photo-1753162660224-7852bd04f827?w=80&h=80&fit=crop&crop=face',
    },
  ];
  const clients = ['Natura', 'Nike', 'iFood', 'Ambev', 'Nubank'];
  const columns = [
    { id: 'todo', name: 'A Fazer', baseStatus: 'todo' as const, order: 1, color: '#ff5623' },
    { id: 'progress', name: 'Em Progresso', baseStatus: 'in_progress' as const, order: 2, color: '#987dfe' },
    { id: 'review', name: 'Revisao', baseStatus: 'review' as const, order: 3, color: '#3b82f6' },
    { id: 'adjustments', name: 'Ajustes', baseStatus: 'adjustments' as const, order: 4, color: '#f97316' },
    { id: 'approval', name: 'Aprovacao', baseStatus: 'approval' as const, order: 5, color: '#feba31' },
    { id: 'done', name: 'Concluido', baseStatus: 'done' as const, order: 6, color: '#019364' },
  ];

  const taskTemplates = [
    { title: 'Campanha de primavera', client: 'Natura', assignee: 0, status: 'done', daysAgo: 28, production: 90000, review: 42000, adjustments: 18000, approval: 36000, completedAgo: 19, rework: 1 },
    { title: 'Landing de varejo', client: 'Nike', assignee: 1, status: 'done', daysAgo: 24, production: 76000, review: 24000, adjustments: 0, approval: 21000, completedAgo: 15, rework: 0 },
    { title: 'Ads de awareness', client: 'iFood', assignee: 2, status: 'done', daysAgo: 23, production: 112000, review: 56000, adjustments: 46000, approval: 41000, completedAgo: 12, rework: 2 },
    { title: 'Playbook comercial', client: 'Ambev', assignee: 0, status: 'done', daysAgo: 22, production: 68000, review: 18000, adjustments: 0, approval: 19000, completedAgo: 14, rework: 0 },
    { title: 'Guia de social media', client: 'Nubank', assignee: 3, status: 'done', daysAgo: 19, production: 81000, review: 30000, adjustments: 18000, approval: 26000, completedAgo: 9, rework: 1 },
    { title: 'Nova LP do produto', client: 'iFood', assignee: 1, status: 'approval', daysAgo: 10, production: 52000, review: 16000, adjustments: 18000, approval: 42000, completedAgo: null, rework: 1 },
    { title: 'Fluxo de onboarding', client: 'Natura', assignee: 4, status: 'in_progress', daysAgo: 8, production: 42000, review: 0, adjustments: 0, approval: 0, completedAgo: null, rework: 0 },
    { title: 'Email de ativacao', client: 'Nike', assignee: 2, status: 'review', daysAgo: 7, production: 31000, review: 18000, adjustments: 0, approval: 0, completedAgo: null, rework: 0 },
    { title: 'Automacao de CRM', client: 'Ambev', assignee: 3, status: 'adjustments', daysAgo: 6, production: 28000, review: 12000, adjustments: 14000, approval: 0, completedAgo: null, rework: 1 },
    { title: 'Relatorio de performance', client: 'Nubank', assignee: 0, status: 'todo', daysAgo: 5, production: 0, review: 0, adjustments: 0, approval: 0, completedAgo: null, rework: 0 },
    { title: 'Deck institucional', client: 'iFood', assignee: 4, status: 'done', daysAgo: 34, production: 99000, review: 52000, adjustments: 32000, approval: 47000, completedAgo: 24, rework: 2 },
    { title: 'Sequencia de emails', client: 'Nubank', assignee: 1, status: 'cancelled', daysAgo: 16, production: 35000, review: 0, adjustments: 0, approval: 0, completedAgo: null, rework: 0 },
    { title: 'Atualizacao de branding', client: 'Natura', assignee: 2, status: 'done', daysAgo: 41, production: 84000, review: 22000, adjustments: 12000, approval: 19000, completedAgo: 32, rework: 1 },
    { title: 'Kit de stories', client: 'Nike', assignee: 4, status: 'approval', daysAgo: 9, production: 26000, review: 8000, adjustments: 0, approval: 25000, completedAgo: null, rework: 0 },
    { title: 'Calendario editorial', client: 'Ambev', assignee: 1, status: 'in_progress', daysAgo: 4, production: 24000, review: 0, adjustments: 0, approval: 0, completedAgo: null, rework: 0 },
    { title: 'Fluxo de CRM premium', client: 'iFood', assignee: 3, status: 'review', daysAgo: 11, production: 48000, review: 28000, adjustments: 12000, approval: 0, completedAgo: null, rework: 1 },
    { title: 'Campanha always-on', client: 'Nubank', assignee: 0, status: 'done', daysAgo: 14, production: 73000, review: 21000, adjustments: 0, approval: 22000, completedAgo: 5, rework: 0 },
    { title: 'Assets do evento', client: 'Ambev', assignee: 2, status: 'done', daysAgo: 12, production: 62000, review: 24000, adjustments: 14000, approval: 18000, completedAgo: 4, rework: 1 },
  ];

  const simulationLabels = ['Sprint retail', 'Campanha always-on', 'Fluxo CRM', 'Midia paga', 'Onboarding'];

  const taskSeeds = Array.from({ length: 5 }).flatMap((_, waveIndex) =>
    taskTemplates.map((template, templateIndex) => {
      const shift = waveIndex * 4 + (templateIndex % 3);
      const client = clients[(clients.indexOf(template.client) + waveIndex) % clients.length];
      const assignee = (template.assignee + waveIndex + templateIndex) % team.length;
      const isDoneLike = template.status === 'done';
      const status =
        template.status === 'cancelled'
          ? 'cancelled'
          : isDoneLike && waveIndex % 4 === 1
            ? 'approval'
            : isDoneLike && waveIndex % 4 === 2
              ? 'review'
              : isDoneLike && waveIndex % 4 === 3
                ? 'in_progress'
                : template.status;
      const completedAgo =
        status === 'done' && template.completedAgo !== null ? template.completedAgo + shift : null;

      return {
        ...template,
        title: `${template.title} - ${simulationLabels[waveIndex]}`,
        client,
        assignee,
        status,
        daysAgo: template.daysAgo + shift,
        production: template.production + waveIndex * 9000 + templateIndex * 1200,
        review: template.review + waveIndex * 4800,
        adjustments: template.adjustments + (waveIndex % 2 === 0 ? 3600 : 7200),
        approval: template.approval + waveIndex * 5400,
        completedAgo,
      };
    }),
  );

  const tasks = taskSeeds.map((seed, index) => {
    const createdAt = subDays(now, seed.daysAgo).toISOString();
    const completedAt = seed.completedAgo !== null ? subDays(now, seed.completedAgo).toISOString() : null;
    const cancelledAt = seed.status === 'cancelled' ? subDays(now, 8).toISOString() : null;
    const column =
      seed.status === 'cancelled'
        ? columns[0]
        : columns.find((item) => item.baseStatus === seed.status) || columns[0];

    return {
      id: `demo-task-${index + 1}`,
      boardId,
      columnId: column.id,
      title: seed.title,
      description: `${seed.title} para operacao de agencia.`,
      status: seed.status === 'cancelled' ? 'in_progress' : column.baseStatus,
      resolution: seed.status === 'cancelled' ? ('cancelled' as const) : completedAt ? ('completed' as const) : null,
      statusChangedAt: completedAt || cancelledAt || createdAt,
      createdAt,
      updatedAt: completedAt || cancelledAt || createdAt,
      completedAt,
      cancelledAt,
      archivedAt: null,
      dueDate: addDays(parseISO(createdAt), 12).toISOString(),
      clientId: seed.client.toLowerCase(),
      assignees: [team[seed.assignee]],
      type: index % 2 === 0 ? ('detailed' as const) : ('simple' as const),
      priority: (index % 4 === 0 ? 'high' : index % 3 === 0 ? 'urgent' : 'medium') as
        | 'low'
        | 'medium'
        | 'high'
        | 'urgent',
      tags: ['Design', 'Performance'],
      progress: completedAt ? 100 : seed.status === 'approval' ? 84 : seed.status === 'review' ? 66 : seed.status === 'adjustments' ? 58 : seed.status === 'in_progress' ? 44 : 12,
      showProgressBar: true,
      showDateAlert: index % 5 === 0,
      credits: 12 + index,
      attachments: 1 + (index % 4),
      comments: 2 + (index % 5),
      subtasks: { completed: Math.min(4, 1 + (index % 5)), total: 5 },
      client: { name: seed.client },
      totalTimeInProgress: seed.production,
      totalTimeInReview: seed.review,
      totalTimeInAdjustments: seed.adjustments,
      totalTimeInApproval: seed.approval,
      reviewCycles: seed.rework > 0 ? seed.rework + 1 : 1,
      adjustmentCycles: seed.rework,
    };
  });

  const taskStatusHistory = tasks.flatMap((task, index) => {
    const records = [];
    const startedAt = parseISO(task.createdAt);
    const todoAt = addDays(startedAt, 1).toISOString();
    const progressAt = addDays(startedAt, 2).toISOString();
    const reviewAt = addDays(startedAt, 4).toISOString();
    const adjustAt = addDays(startedAt, 5).toISOString();
    const approvalAt = addDays(startedAt, 6).toISOString();
    const endAt = task.completedAt || task.cancelledAt || addDays(startedAt, 7).toISOString();

    records.push({
      id: `history-${index}-1`,
      taskId: task.id,
      fromColumnId: null,
      toColumnId: 'todo',
      fromStatus: null,
      toStatus: 'todo' as const,
      enteredAt: todoAt,
      exitedAt: progressAt,
      durationInSeconds: 86400,
      changedBy: 'system',
      changeType: 'system-init' as const,
      createdAt: todoAt,
    });
    records.push({
      id: `history-${index}-2`,
      taskId: task.id,
      fromColumnId: 'todo',
      toColumnId: 'progress',
      fromStatus: 'todo' as const,
      toStatus: 'in_progress' as const,
      enteredAt: progressAt,
      exitedAt: reviewAt,
      durationInSeconds: 172800,
      changedBy: 'system',
      changeType: 'programmatic' as const,
      createdAt: progressAt,
    });

    if ((task.adjustmentCycles || 0) > 0) {
      records.push({
        id: `history-${index}-3`,
        taskId: task.id,
        fromColumnId: 'progress',
        toColumnId: 'review',
        fromStatus: 'in_progress' as const,
        toStatus: 'review' as const,
        enteredAt: reviewAt,
        exitedAt: adjustAt,
        durationInSeconds: 86400,
        changedBy: 'system',
        changeType: 'programmatic' as const,
        createdAt: reviewAt,
      });
      records.push({
        id: `history-${index}-4`,
        taskId: task.id,
        fromColumnId: 'review',
        toColumnId: 'adjustments',
        fromStatus: 'review' as const,
        toStatus: 'adjustments' as const,
        enteredAt: adjustAt,
        exitedAt: approvalAt,
        durationInSeconds: 86400,
        changedBy: 'system',
        changeType: 'manual' as const,
        createdAt: adjustAt,
      });
      records.push({
        id: `history-${index}-5`,
        taskId: task.id,
        fromColumnId: 'adjustments',
        toColumnId: 'approval',
        fromStatus: 'adjustments' as const,
        toStatus: 'approval' as const,
        enteredAt: approvalAt,
        exitedAt: endAt,
        durationInSeconds: 86400,
        changedBy: 'system',
        changeType: 'programmatic' as const,
        createdAt: approvalAt,
      });
    } else {
      records.push({
        id: `history-${index}-3`,
        taskId: task.id,
        fromColumnId: 'progress',
        toColumnId: task.completedAt || task.cancelledAt ? 'done' : 'review',
        fromStatus: 'in_progress' as const,
        toStatus: task.completedAt || task.cancelledAt ? ('done' as const) : ('review' as const),
        enteredAt: reviewAt,
        exitedAt: endAt,
        durationInSeconds: 172800,
        changedBy: 'system',
        changeType: 'programmatic' as const,
        createdAt: reviewAt,
      });
    }

    return records;
  });

  return {
    schemaVersion: 1,
    persistedAt: now.toISOString(),
    boards: [
      {
        id: boardId,
        name: 'Operacao da agencia',
        createdAt: boardCreatedAt,
        updatedAt: now.toISOString(),
      },
    ],
    columns: columns.map((column) => ({
      id: column.id,
      boardId,
      name: column.name,
      baseStatus: column.baseStatus,
      order: column.order,
      createdAt: boardCreatedAt,
      updatedAt: now.toISOString(),
      accentColor: column.color,
      bgClass: 'bg-[#F6F8F6]',
      iconName: 'CheckSquare',
    })),
    tasks,
    taskStatusHistory,
  };
};
