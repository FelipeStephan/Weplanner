import { useState } from "react";
import {
  LayoutDashboard,
  Plus,
  Calendar,
  RefreshCw,
  Globe,
  CheckSquare,
  Target,
  Users,
  Zap,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import { KPICard } from "../components/dashboard/KPICard";
import { StatusBadge } from "../components/tasks/StatusBadge";
import { RoleBadge } from "../components/shared/RoleBadge";
import { PriorityBadge } from "../components/shared/PriorityBadge";
import { TagBadge } from "../components/shared/TagBadge";
import { AvatarStack } from "../components/shared/AvatarStack";
import { InfoChip } from "../components/shared/InfoChip";
import { SectionHeader } from "../components/shared/SectionHeader";
import { NotificationList } from "../components/shared/NotificationCard";
import type { NotificationItem } from "../components/shared/NotificationCard";
import { Button } from "../components/ui/button";
import { TEAM } from "../data/team";
import type { Section } from "../types/navigation";
import {
  DS_PRINCIPLES,
  DS_COLORS,
  DS_SEMANTIC_BKGS,
  DS_TYPOGRAPHY,
  DS_KANBAN_COLUMNS,
  DS_WORKSPACE_FEATURES,
  DS_ICONS_SHOWCASE,
} from "../data/designSystem";

interface DesignSystemPageProps {
  notifications: NotificationItem[];
  onOpenBoard: () => void;
}

const SECTIONS: { key: Section; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "principles", label: "Princípios" },
  { key: "colors", label: "Cores" },
  { key: "typography", label: "Tipografia" },
  { key: "badges", label: "Badges e tags" },
  { key: "cards", label: "Cards" },
  { key: "kanban", label: "Kanban" },
  { key: "workspace", label: "Board Workspace" },
  { key: "icons", label: "Iconografia" },
  { key: "notifications", label: "Notificações" },
  { key: "components", label: "Componentes" },
];

export function DesignSystemPage({ notifications, onOpenBoard }: DesignSystemPageProps) {
  const [activeSection, setActiveSection] = useState<Section>("all");
  const show = (s: Section) => activeSection === "all" || activeSection === s;

  return (
    <>
      <div className="mx-auto max-w-[1440px] px-4 pb-12 md:px-6">
        {/* Hero */}
        <div className="mb-8 rounded-[28px] border border-[#e7e7e7] bg-white p-6 shadow-[0_20px_60px_rgba(23,23,23,0.06)] dark:border-[#2a2a2a] dark:bg-[#111111] dark:shadow-none md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full bg-[#fff2ec] px-3 py-1 text-xs font-semibold text-[#ff5623] dark:bg-[#2a160f] dark:text-[#ff8a66]">
                Sistema vivo do produto
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#171717] dark:text-white md:text-4xl">
                Design System
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#666666] dark:text-[#a3a3a3] md:text-[15px]">
                Base visual e funcional do WePlanner. Esta tela reúne tokens, padrões de interface e os blocos que sustentam as experiências de Visão Geral, Board, Calendário, Notificações e busca.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="h-10 rounded-xl border-[#e5e5e5] px-4 dark:border-[#343434]"
                onClick={onOpenBoard}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Abrir board
              </Button>
              <Button className="h-10 rounded-xl bg-[#ff5623] px-4 text-white hover:bg-[#e14b1c]">
                <Plus className="mr-2 h-4 w-4" />
                Novo componente
              </Button>
            </div>
          </div>
          {/* Section tabs */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all ${
                  activeSection === s.key
                    ? "border-[#ff5623] bg-[#fff3ee] text-[#ff5623] dark:border-[#ff7a4d] dark:bg-[#241611] dark:text-[#ff9b77]"
                    : "border-[#ececec] bg-white text-[#666666] hover:border-[#d8d8d8] hover:text-[#171717] dark:border-[#2d2d2d] dark:bg-[#151515] dark:text-[#a3a3a3] dark:hover:text-white"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Principles */}
        {show("principles") && (
          <section className="mb-10">
            <SectionHeader
              title="Princípios"
              subtitle="Diretrizes que mantêm o produto consistente entre light mode, dark mode e fluxos operacionais."
            />
            <div className="grid gap-4 md:grid-cols-3">
              {DS_PRINCIPLES.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[24px] border border-[#ececec] bg-white p-5 dark:border-[#2a2a2a] dark:bg-[#111111]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff2ec] text-[#ff5623] dark:bg-[#261711] dark:text-[#ff8a66]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-[#171717] dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#666666] dark:text-[#a3a3a3]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Colors */}
        {show("colors") && (
          <section className="mb-10">
            <SectionHeader
              title="Cores"
              subtitle="Paleta principal e fundos semânticos usados nos fluxos do produto."
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {DS_COLORS.map((color) => (
                <div
                  key={color.name}
                  className="rounded-[24px] border border-[#ececec] bg-white p-4 dark:border-[#2a2a2a] dark:bg-[#111111]"
                >
                  <div className="h-24 rounded-2xl" style={{ backgroundColor: color.hex }} />
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#171717] dark:text-white">{color.name}</p>
                      <p className="mt-1 text-xs text-[#777777] dark:text-[#8a8a8a]">{color.helper}</p>
                    </div>
                    <span className="rounded-full bg-[#f7f7f7] px-2.5 py-1 font-mono text-[11px] text-[#525252] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]">
                      {color.hex}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              {DS_SEMANTIC_BKGS.map((semantic) => (
                <div key={semantic.name} className={`rounded-2xl p-4 ${semantic.className}`}>
                  <span className={`text-sm font-semibold ${semantic.text}`}>{semantic.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Typography */}
        {show("typography") && (
          <section className="mb-10">
            <SectionHeader
              title="Tipografia"
              subtitle="Escala simples para títulos, conteúdo e apoio visual no produto."
            />
            <div className="rounded-[24px] border border-[#ececec] bg-white p-6 dark:border-[#2a2a2a] dark:bg-[#111111]">
              <div className="space-y-5">
                {DS_TYPOGRAPHY.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col gap-1 border-b border-[#f1f1f1] pb-4 last:border-b-0 last:pb-0 dark:border-[#242424] md:flex-row md:items-baseline md:justify-between"
                  >
                    <span className={`${item.className} text-[#171717] dark:text-white`}>
                      {item.label} · WePlanner mantém legibilidade com hierarquia clara.
                    </span>
                    <span className="font-mono text-xs text-[#8a8a8a] dark:text-[#777777]">{item.meta}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Badges */}
        {show("badges") && (
          <section className="mb-10">
            <SectionHeader
              title="Badges e tags"
              subtitle="Estados, prioridade e etiquetas de contexto reutilizadas no board e na Visão Geral."
            />
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[24px] border border-[#ececec] bg-white p-5 dark:border-[#2a2a2a] dark:bg-[#111111]">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#777777] dark:text-[#8a8a8a]">Status</p>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status="todo" />
                  <StatusBadge status="in-progress" />
                  <StatusBadge status="review" />
                  <StatusBadge status="completed" />
                </div>
                <p className="mb-4 mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-[#777777] dark:text-[#8a8a8a]">Prioridade</p>
                <div className="flex flex-wrap gap-2">
                  <PriorityBadge priority="low" />
                  <PriorityBadge priority="medium" />
                  <PriorityBadge priority="high" />
                  <PriorityBadge priority="urgent" />
                </div>
              </div>
              <div className="rounded-[24px] border border-[#ececec] bg-white p-5 dark:border-[#2a2a2a] dark:bg-[#111111]">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#777777] dark:text-[#8a8a8a]">Papéis e contexto</p>
                <div className="flex flex-wrap gap-2">
                  <RoleBadge role="client" />
                  <RoleBadge role="manager" />
                  <RoleBadge role="collaborator" />
                  <TagBadge label="Design" color="orange" />
                  <TagBadge label="Board" color="gray" />
                  <TagBadge label="Sprint" color="blue" />
                  <TagBadge label="Entrega" color="green" />
                </div>
                <p className="mb-4 mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-[#777777] dark:text-[#8a8a8a]">Chips informativos</p>
                <div className="flex flex-wrap gap-3">
                  <InfoChip label="Abr 18" icon={Calendar} color="blue" />
                  <InfoChip label="Planejamento" icon={RefreshCw} color="orange" />
                  <InfoChip label="Remoto" icon={Globe} color="green" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Cards */}
        {show("cards") && (
          <section className="mb-10">
            <SectionHeader
              title="Cards"
              subtitle="Blocos de resumo usados para monitorar andamento, entregas e contexto rápido."
            />
            <div className="grid gap-4 xl:grid-cols-4">
              <KPICard title="Tarefas ativas" value="24" change="+12%" trend="up" color="primary" icon={CheckSquare} />
              <KPICard title="Concluídas" value="156" change="+8%" trend="up" color="success" icon={Target} />
              <KPICard title="Equipe" value="12" change="+2" trend="up" color="info" icon={Users} />
              <KPICard title="Créditos" value="450" change="-15%" trend="down" color="secondary" icon={Zap} />
            </div>
          </section>
        )}

        {/* Kanban */}
        {show("kanban") && (
          <section className="mb-10">
            <SectionHeader
              title="Kanban"
              subtitle="Estrutura operacional do board com foco em fluxo, ownership e leitura rápida do status."
            />
            <div className="grid gap-4 lg:grid-cols-3">
              {DS_KANBAN_COLUMNS.map((column) => (
                <div key={column.title} className="rounded-[24px] border border-[#ececec] bg-white p-5 dark:border-[#2a2a2a] dark:bg-[#111111]">
                  <div className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${column.accent}`} />
                    <h3 className="text-sm font-semibold text-[#171717] dark:text-white">{column.title}</h3>
                  </div>
                  <div className="mt-4 space-y-3">
                    {column.items.map((item) => (
                      <div key={item} className="rounded-2xl border border-[#efefef] bg-[#fafafa] p-4 text-sm font-medium text-[#171717] dark:border-[#242424] dark:bg-[#171717] dark:text-[#f5f5f5]">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Workspace */}
        {show("workspace") && (
          <section className="mb-10">
            <SectionHeader
              title="Board Workspace"
              subtitle="Estado atual da arquitetura do board, com calendário, notificações e busca contextual."
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {DS_WORKSPACE_FEATURES.map((item) => (
                <div key={item.title} className="rounded-[24px] border border-[#ececec] bg-white p-5 dark:border-[#2a2a2a] dark:bg-[#111111]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff2ec] text-[#ff5623] dark:bg-[#261711] dark:text-[#ff8a66]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-[#171717] dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#666666] dark:text-[#a3a3a3]">{item.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Icons */}
        {show("icons") && (
          <section className="mb-10">
            <SectionHeader
              title="Iconografia"
              subtitle="Ícones recorrentes em navegação, tarefas, notificação e contexto de operação."
            />
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {DS_ICONS_SHOWCASE.map((item) => (
                <div key={item.label} className="rounded-[22px] border border-[#ececec] bg-white p-4 text-center dark:border-[#2a2a2a] dark:bg-[#111111]">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f6f6f6] text-[#171717] dark:bg-[#1a1a1a] dark:text-white">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-[#171717] dark:text-white">{item.label}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Notifications */}
        {show("notifications") && (
          <section className="mb-10">
            <SectionHeader
              title="Notificações"
              subtitle="Componente compartilhado entre Visão Geral e board, com selo sólido, ícone branco e leitura clara."
            />
            <div className="rounded-[24px] border border-[#ececec] bg-white p-5 dark:border-[#2a2a2a] dark:bg-[#111111]">
              <NotificationList notifications={notifications.slice(0, 4)} />
            </div>
          </section>
        )}

        {/* Components */}
        {show("components") && (
          <section className="mb-10">
            <SectionHeader
              title="Componentes"
              subtitle="Combinação dos blocos principais em uma linguagem visual única para a operação diária."
            />
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[24px] border border-[#ececec] bg-white p-5 dark:border-[#2a2a2a] dark:bg-[#111111]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#987dfe]" />
                      <h3 className="text-base font-semibold text-[#171717] dark:text-white">Botão de notificações</h3>
                      <StatusBadge status="in-progress" />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#666666] dark:text-[#a3a3a3]">
                      Componente para board e Visão Geral, com foco em leitura rápida, filtros objetivos e acesso direto à ação.
                    </p>
                  </div>
                  <AvatarStack users={TEAM.slice(0, 2)} max={2} />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[#666666] dark:text-[#a3a3a3]">
                  <span className="inline-flex items-center gap-2"><Briefcase className="h-4 w-4" /> Desenvolvimento e tratativas de bugs</span>
                  <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4" /> Sem prazo</span>
                </div>
              </div>
              <div className="rounded-[24px] border border-[#ececec] bg-white p-5 dark:border-[#2a2a2a] dark:bg-[#111111]">
                <p className="text-sm font-semibold text-[#171717] dark:text-white">Checklist de consistência</p>
                <ul className="mt-4 space-y-3 text-sm text-[#666666] dark:text-[#a3a3a3]">
                  <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[#019364]" /> Contraste estável em light e dark mode</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[#019364]" /> Ações visíveis sem depender de texto excessivo</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[#019364]" /> Linguagem alinhada entre board, busca e overview</li>
                </ul>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-[#e5e5e5] bg-white/90 py-6 dark:border-[#2a2a2a] dark:bg-[#111111]/90">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-4 text-center md:flex-row md:px-6 md:text-left">
          <div>
            <p className="text-sm font-semibold text-[#171717] dark:text-white">WePlanner Design System</p>
            <p className="mt-1 text-xs text-[#777777] dark:text-[#8a8a8a]">
              Biblioteca viva para a evolução do produto, com foco em consistência visual e clareza operacional.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#777777] dark:text-[#8a8a8a]">
            <span>React + Tailwind + shadcn/ui</span>
            <span className="hidden md:inline">•</span>
            <a
              href="https://loopera.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#ff5623] transition-colors hover:text-[#e14b1c]"
            >
              Loopera.com.br
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
