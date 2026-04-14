import { useState, type ReactNode } from "react";
import {
  X,
  ArrowRight,
  ChevronLeft,
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Circle,
  GripVertical,
  MessageCircle,
  Paperclip,
  Calendar,
  BarChart3,
  TrendingUp,
  Zap,
  Star,
} from "lucide-react";

// ─── Visual Mockups ────────────────────────────────────────────────────────────

function MockupWelcome() {
  return (
    <div className="relative w-full h-[180px] bg-gradient-to-br from-[#fff5f2] to-[#fef3e8] rounded-xl overflow-hidden flex items-center justify-center border border-[#ffe4d6]">
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-3">
          {[
            { icon: <FolderKanban className="h-4 w-4 text-[#019364]" />, label: "Board", bg: "bg-[#019364]/10" },
            { icon: <BarChart3 className="h-4 w-4 text-[#987dfe]" />, label: "Reports", bg: "bg-[#987dfe]/10" },
            { icon: <Users className="h-4 w-4 text-[#ff5623]" />, label: "Equipe", bg: "bg-[#ff5623]/10" },
            { icon: <Zap className="h-4 w-4 text-[#feba31]" />, label: "Créditos", bg: "bg-[#feba31]/10" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1.5">
              <div className={`h-10 w-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-semibold text-[#737373]">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-[#ff5623]/10 px-3 py-1">
          <Star className="h-3 w-3 text-[#ff5623]" fill="#ff5623" />
          <span className="text-[11px] font-semibold text-[#ff5623]">Plataforma de workflow para agências</span>
        </div>
      </div>
      {/* decorative circles */}
      <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-[#ff5623]/8" />
      <div className="absolute -bottom-4 -left-4 h-14 w-14 rounded-full bg-[#feba31]/15" />
    </div>
  );
}

function MockupOverview() {
  return (
    <div className="w-full h-[180px] bg-[#fafafa] rounded-xl border border-[#e5e5e5] p-3 overflow-hidden">
      <div className="flex items-center gap-1.5 mb-2.5">
        <div className="h-1.5 w-1.5 rounded-full bg-[#ff5623]" />
        <span className="text-[10px] font-semibold text-[#525252]">Visão Geral</span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-2.5">
        {[
          { label: "Em andamento", value: "8", color: "text-[#987dfe]", bg: "bg-[#987dfe]/8" },
          { label: "Concluídas hoje", value: "3", color: "text-[#019364]", bg: "bg-[#019364]/8" },
          { label: "Atrasadas", value: "2", color: "text-[#f32c2c]", bg: "bg-[#f32c2c]/8" },
        ].map((kpi) => (
          <div key={kpi.label} className={`rounded-lg ${kpi.bg} p-2`}>
            <div className={`text-[18px] font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-[9px] text-[#737373] leading-tight">{kpi.label}</div>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        {[
          { title: "Redesign da Homepage", tag: "Alta", tagColor: "text-[#f32c2c] bg-[#f32c2c]/8", progress: 75 },
          { title: "API de integração", tag: "Média", tagColor: "text-[#feba31] bg-[#feba31]/8", progress: 40 },
        ].map((task) => (
          <div key={task.title} className="flex items-center gap-2 rounded-lg bg-white border border-[#e5e5e5] px-2 py-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-[#987dfe] shrink-0" />
            <span className="flex-1 text-[10px] font-medium text-[#171717] truncate">{task.title}</span>
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${task.tagColor}`}>{task.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupKanban() {
  const columns = [
    { name: "A fazer", color: "#a3a3a3", tasks: ["Landing page", "Copywriting"] },
    { name: "Em progresso", color: "#987dfe", tasks: ["Design system", "API docs"] },
    { name: "Revisão", color: "#feba31", tasks: ["Mobile app"] },
    { name: "Concluído", color: "#019364", tasks: ["Onboarding"] },
  ];
  return (
    <div className="w-full h-[180px] bg-[#fafafa] rounded-xl border border-[#e5e5e5] p-3 overflow-hidden">
      <div className="flex items-center gap-1.5 mb-2.5">
        <div className="h-1.5 w-1.5 rounded-full bg-[#019364]" />
        <span className="text-[10px] font-semibold text-[#525252]">Board Kanban</span>
      </div>
      <div className="flex gap-2 h-[130px]">
        {columns.map((col) => (
          <div key={col.name} className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1.5">
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: col.color }} />
              <span className="text-[9px] font-semibold text-[#737373] truncate">{col.name}</span>
            </div>
            <div className="space-y-1">
              {col.tasks.map((task) => (
                <div key={task} className="flex items-center gap-1 rounded bg-white border border-[#e5e5e5] px-1.5 py-1">
                  <GripVertical className="h-2.5 w-2.5 text-[#d4d4d4] shrink-0" />
                  <span className="text-[9px] text-[#525252] truncate leading-tight">{task}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupTask() {
  return (
    <div className="w-full h-[180px] bg-[#fafafa] rounded-xl border border-[#e5e5e5] p-3 overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#f32c2c]/10 text-[#f32c2c]">Alta</span>
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#987dfe]/10 text-[#987dfe]">Em revisão</span>
        </div>
        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#feba31]/10 text-[#feba31]">3 créditos</span>
      </div>
      <div className="font-semibold text-[11px] text-[#171717] mb-1">Implementação do Design System</div>
      <div className="text-[9px] text-[#737373] mb-2.5 leading-relaxed">Criar e implementar um design system completo com tokens de cor, tipografia e componentes...</div>
      {/* subtasks */}
      <div className="space-y-1 mb-2.5">
        {[
          { label: "Definir paleta de cores", done: true },
          { label: "Criar componentes base", done: true },
          { label: "Documentar padrões", done: false },
        ].map((sub) => (
          <div key={sub.label} className="flex items-center gap-1.5">
            {sub.done
              ? <CheckCircle2 className="h-2.5 w-2.5 text-[#019364] shrink-0" />
              : <Circle className="h-2.5 w-2.5 text-[#d4d4d4] shrink-0" />}
            <span className={`text-[9px] ${sub.done ? "line-through text-[#a3a3a3]" : "text-[#525252]"}`}>{sub.label}</span>
          </div>
        ))}
      </div>
      {/* footer */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#e5e5e5]">
        <div className="flex -space-x-1">
          {["bg-indigo-400", "bg-rose-400", "bg-amber-400"].map((c, i) => (
            <div key={i} className={`h-4 w-4 rounded-full ${c} border-2 border-white`} />
          ))}
        </div>
        <div className="flex items-center gap-1 text-[#a3a3a3]">
          <MessageCircle className="h-2.5 w-2.5" /><span className="text-[9px]">4</span>
        </div>
        <div className="flex items-center gap-1 text-[#a3a3a3]">
          <Paperclip className="h-2.5 w-2.5" /><span className="text-[9px]">2</span>
        </div>
        <div className="flex items-center gap-1 text-[#a3a3a3] ml-auto">
          <Calendar className="h-2.5 w-2.5" /><span className="text-[9px]">28 Set</span>
        </div>
      </div>
    </div>
  );
}

function MockupTeam() {
  const members = [
    { initials: "AS", name: "Ana Silva", role: "Gestora", bg: "bg-indigo-400", status: "online" },
    { initials: "CL", name: "Carlos Lima", role: "Desenvolvedor", bg: "bg-rose-400", status: "online" },
    { initials: "MC", name: "Mariana Costa", role: "Designer", bg: "bg-amber-400", status: "away" },
    { initials: "RS", name: "Rafael Santos", role: "Copywriter", bg: "bg-teal-400", status: "offline" },
  ];
  const statusColor: Record<string, string> = {
    online: "bg-[#019364]",
    away: "bg-[#feba31]",
    offline: "bg-[#d4d4d4]",
  };
  return (
    <div className="w-full h-[180px] bg-[#fafafa] rounded-xl border border-[#e5e5e5] p-3 overflow-hidden">
      <div className="flex items-center gap-1.5 mb-2.5">
        <div className="h-1.5 w-1.5 rounded-full bg-[#ff5623]" />
        <span className="text-[10px] font-semibold text-[#525252]">Equipe</span>
        <span className="ml-auto text-[9px] text-[#a3a3a3]">4 membros</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {members.map((m) => (
          <div key={m.name} className="flex items-center gap-2 rounded-lg bg-white border border-[#e5e5e5] px-2 py-1.5">
            <div className="relative shrink-0">
              <div className={`h-6 w-6 rounded-full ${m.bg} flex items-center justify-center text-[8px] font-bold text-white`}>
                {m.initials}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ${statusColor[m.status]} border border-white`} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold text-[#171717] truncate">{m.name}</div>
              <div className="text-[9px] text-[#a3a3a3] truncate">{m.role}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupReady() {
  const items = [
    { icon: <CheckCircle2 className="h-3.5 w-3.5 text-[#019364]" />, text: "Ver tarefas atribuídas a você" },
    { icon: <CheckCircle2 className="h-3.5 w-3.5 text-[#019364]" />, text: "Atualizar status no board Kanban" },
    { icon: <CheckCircle2 className="h-3.5 w-3.5 text-[#019364]" />, text: "Colaborar via comentários" },
    { icon: <CheckCircle2 className="h-3.5 w-3.5 text-[#019364]" />, text: "Acompanhar prazos e progresso" },
  ];
  return (
    <div className="w-full h-[180px] bg-gradient-to-br from-[#f0fdf4] to-[#fafafa] rounded-xl border border-[#bbf7d0] p-4 overflow-hidden flex flex-col justify-center">
      <div className="text-center mb-3">
        <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#019364]/10 mb-2">
          <CheckCircle2 className="h-5 w-5 text-[#019364]" />
        </div>
        <div className="text-[11px] font-semibold text-[#019364]">Você está pronto para começar!</div>
      </div>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={item.text} className="flex items-center gap-2">
            {item.icon}
            <span className="text-[11px] text-[#525252]">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step definitions ──────────────────────────────────────────────────────────

interface Step {
  id: string;
  label: string;
  icon: ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  mockup: ReactNode;
  bullets: { icon: ReactNode; text: string }[];
}

const STEPS: Step[] = [
  {
    id: "welcome",
    label: "Boas-vindas",
    icon: <Sparkles className="h-4 w-4 text-[#ff5623]" />,
    iconBg: "bg-[#ff5623]/10",
    title: "Bem-vindo ao WePlanner",
    subtitle: "Sua plataforma de gestão de workflow e entregas",
    mockup: <MockupWelcome />,
    bullets: [
      { icon: <FolderKanban className="h-3.5 w-3.5 text-[#019364]" />, text: "Board Kanban para organizar tarefas em fluxo real" },
      { icon: <BarChart3 className="h-3.5 w-3.5 text-[#987dfe]" />, text: "Relatórios com métricas de performance da equipe" },
      { icon: <Zap className="h-3.5 w-3.5 text-[#feba31]" />, text: "Sistema de créditos para medir esforço operacional" },
      { icon: <Users className="h-3.5 w-3.5 text-[#ff5623]" />, text: "Visibilidade total de clientes, time e entregas" },
    ],
  },
  {
    id: "overview",
    label: "Visão Geral",
    icon: <LayoutDashboard className="h-4 w-4 text-[#987dfe]" />,
    iconBg: "bg-[#987dfe]/10",
    title: "Visão Geral",
    subtitle: "Seu ponto de partida a cada dia de trabalho",
    mockup: <MockupOverview />,
    bullets: [
      { icon: <AlertCircle className="h-3.5 w-3.5 text-[#f32c2c]" />, text: "Tarefas atrasadas e prazos próximos em destaque" },
      { icon: <TrendingUp className="h-3.5 w-3.5 text-[#019364]" />, text: "KPIs do dia: em andamento, concluídas, bloqueadas" },
      { icon: <Clock className="h-3.5 w-3.5 text-[#987dfe]" />, text: "Atividades recentes do time em tempo real" },
      { icon: <Star className="h-3.5 w-3.5 text-[#feba31]" />, text: "Tarefas prioritárias atribuídas a você no topo" },
    ],
  },
  {
    id: "kanban",
    label: "Board",
    icon: <FolderKanban className="h-4 w-4 text-[#019364]" />,
    iconBg: "bg-[#019364]/10",
    title: "Board Kanban",
    subtitle: "Onde o trabalho acontece — organizado por etapas",
    mockup: <MockupKanban />,
    bullets: [
      { icon: <GripVertical className="h-3.5 w-3.5 text-[#737373]" />, text: "Arraste cards entre colunas para atualizar o status" },
      { icon: <Circle className="h-3.5 w-3.5 text-[#a3a3a3]" />, text: "Colunas mapeadas ao workflow: Backlog → Concluído" },
      { icon: <FolderKanban className="h-3.5 w-3.5 text-[#019364]" />, text: "Cada board representa um cliente ou projeto" },
      { icon: <CheckSquare className="h-3.5 w-3.5 text-[#987dfe]" />, text: "Filtre para ver apenas as tarefas atribuídas a você" },
    ],
  },
  {
    id: "tasks",
    label: "Tarefas",
    icon: <CheckSquare className="h-4 w-4 text-[#feba31]" />,
    iconBg: "bg-[#feba31]/10",
    title: "Tarefas em Detalhe",
    subtitle: "Tudo que você precisa dentro de cada card",
    mockup: <MockupTask />,
    bullets: [
      { icon: <CheckSquare className="h-3.5 w-3.5 text-[#feba31]" />, text: "Subtarefas com progresso individual por checklist" },
      { icon: <MessageCircle className="h-3.5 w-3.5 text-[#987dfe]" />, text: "Comentários para comunicação direto na tarefa" },
      { icon: <Paperclip className="h-3.5 w-3.5 text-[#ff5623]" />, text: "Anexos: arquivos, imagens e links relevantes" },
      { icon: <Calendar className="h-3.5 w-3.5 text-[#019364]" />, text: "Data de entrega, prioridade e créditos por tarefa" },
    ],
  },
  {
    id: "team",
    label: "Equipe",
    icon: <Users className="h-4 w-4 text-[#ff5623]" />,
    iconBg: "bg-[#ff5623]/10",
    title: "Sua Equipe",
    subtitle: "Conheça com quem você está colaborando",
    mockup: <MockupTeam />,
    bullets: [
      { icon: <Users className="h-3.5 w-3.5 text-[#ff5623]" />, text: "Perfil de cada membro com cargo e contato" },
      { icon: <CheckCircle2 className="h-3.5 w-3.5 text-[#019364]" />, text: "Status de disponibilidade online / ausente" },
      { icon: <FolderKanban className="h-3.5 w-3.5 text-[#987dfe]" />, text: "Veja quem está em quais tarefas e boards" },
      { icon: <Star className="h-3.5 w-3.5 text-[#feba31]" />, text: "Clique no avatar de qualquer membro para ver o perfil" },
    ],
  },
  {
    id: "ready",
    label: "Pronto!",
    icon: <CheckCircle2 className="h-4 w-4 text-[#019364]" />,
    iconBg: "bg-[#019364]/10",
    title: "Tudo certo, vamos lá!",
    subtitle: "Você já sabe o essencial para usar o WePlanner",
    mockup: <MockupReady />,
    bullets: [
      { icon: <LayoutDashboard className="h-3.5 w-3.5 text-[#987dfe]" />, text: "Comece pela Visão Geral para ver o que está pendente" },
      { icon: <FolderKanban className="h-3.5 w-3.5 text-[#019364]" />, text: "Acesse o Board para trabalhar nas suas tarefas" },
      { icon: <MessageCircle className="h-3.5 w-3.5 text-[#ff5623]" />, text: "Use os comentários para manter o time alinhado" },
      { icon: <Sparkles className="h-3.5 w-3.5 text-[#feba31]" />, text: "Em caso de dúvidas, explore o Design System" },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface OnboardingModalProps {
  userName?: string;
  show: boolean;
  onClose: () => void;
}

export function OnboardingModal({ userName, show, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setStep(0);
      onClose();
    }, 200);
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleClose();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  if (!show) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;
  const firstName = userName?.split(" ")[0] ?? "você";

  return (
    <div
      className={`fixed inset-0 z-[300] flex items-center justify-center p-4 transition-opacity duration-200 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative z-10 w-full max-w-[560px] rounded-2xl bg-white shadow-2xl overflow-hidden transition-all duration-200 ${
          closing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Progress bar */}
        <div className="h-1 w-full bg-[#f5f5f5]">
          <div
            className="h-full bg-[#ff5623] transition-all duration-400 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step tabs */}
        <div className="flex items-center gap-0 border-b border-[#f0f0f0] px-5 pt-3 overflow-x-auto">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(i)}
              className={`flex items-center gap-1.5 px-2.5 pb-2.5 text-[11px] font-semibold whitespace-nowrap border-b-2 transition-all ${
                i === step
                  ? "border-[#ff5623] text-[#ff5623]"
                  : i < step
                    ? "border-transparent text-[#019364]"
                    : "border-transparent text-[#a3a3a3]"
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
                  i < step
                    ? "bg-[#019364] text-white"
                    : i === step
                      ? "bg-[#ff5623] text-white"
                      : "bg-[#f0f0f0] text-[#a3a3a3]"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-6 pt-5 pb-2">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${current.iconBg}`}>
                {current.icon}
              </div>
              <div>
                <h2 className="text-[17px] font-semibold leading-tight text-[#171717]">
                  {step === 0 ? `Bem-vindo, ${firstName}!` : current.title}
                </h2>
                <p className="text-[12px] text-[#737373]">{current.subtitle}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#a3a3a3] transition-colors hover:bg-[#f5f5f5] hover:text-[#525252]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Mockup visual */}
          {current.mockup}

          {/* Bullets */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {current.bullets.map((b, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-xl bg-[#fafafa] border border-[#f0f0f0] px-3 py-2.5"
              >
                <span className="mt-0.5 shrink-0">{b.icon}</span>
                <span className="text-[11px] leading-relaxed text-[#525252]">{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 mt-1">
          {step > 0 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-[13px] font-medium text-[#737373] transition-colors hover:text-[#525252]"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="text-[12px] font-medium text-[#a3a3a3] transition-colors hover:text-[#737373]"
            >
              Pular tour
            </button>
          )}

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === step
                    ? "w-5 bg-[#ff5623]"
                    : i < step
                      ? "w-1.5 bg-[#019364]/40"
                      : "w-1.5 bg-[#e5e5e5]"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 rounded-xl bg-[#ff5623] px-4 py-2 text-[13px] font-semibold text-white transition-all hover:bg-[#e44d1e] active:scale-95"
          >
            {isLast ? "Começar" : "Próximo"}
            {!isLast && <ArrowRight className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
