import { useState, useMemo } from 'react';
import { ScrollText, GitBranch, Package } from 'lucide-react';
import { CHANGELOG_RELEASES, type ChangeType, type ChangelogRelease, type ChangelogChange } from '../data/changelog';

// ─── Types meta ──────────────────────────────────────────────────────────────

const TYPE_META: Record<ChangeType, { label: string; bg: string; text: string; dot: string }> = {
  feature:     { label: 'Feature',   bg: '#dcfce7', text: '#15803d', dot: '#16a34a' },
  fix:         { label: 'Fix',       bg: '#fee2e2', text: '#b91c1c', dot: '#dc2626' },
  improvement: { label: 'Melhoria',  bg: '#dbeafe', text: '#1d4ed8', dot: '#2563eb' },
  refactor:    { label: 'Refactor',  bg: '#f3e8ff', text: '#7e22ce', dot: '#9333ea' },
  design:      { label: 'Design',    bg: '#fff7ed', text: '#c2410c', dot: '#ff5623' },
};

const FILTER_OPTIONS: Array<{ value: ChangeType | 'all'; label: string }> = [
  { value: 'all',         label: 'Todas' },
  { value: 'feature',     label: 'Feature' },
  { value: 'fix',         label: 'Fix' },
  { value: 'improvement', label: 'Melhoria' },
  { value: 'refactor',    label: 'Refactor' },
  { value: 'design',      label: 'Design' },
];

// ─── Sub-components (privados, < 30 linhas cada) ─────────────────────────────

function TypeBadge({ type }: { type: ChangeType }) {
  const m = TYPE_META[type];
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: m.bg, color: m.text }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.dot }} />
      {m.label}
    </span>
  );
}

function FileChip({ path }: { path: string }) {
  const name = path.split('/').pop() ?? path;
  return (
    <span className="rounded-md border border-[#e5e5e5] bg-[#f5f5f5] px-1.5 py-0.5 font-mono text-[10px] text-[#525252] dark:border-[#2a2a2a] dark:bg-[#1e1e1e] dark:text-[#a3a3a3]">
      {name}
    </span>
  );
}

function ChangeRow({ change }: { change: ChangelogChange }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border-b border-[#f5f5f5] pb-3 pt-3 last:border-b-0 last:pb-0 dark:border-[#1e1e1e]">
      <div className="flex items-start gap-3">
        <TypeBadge type={change.type} />
        <div className="min-w-0 flex-1">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full text-left text-[13px] font-semibold text-[#171717] transition-colors hover:text-[#ff5623] dark:text-[#f5f5f5] dark:hover:text-[#ff8c69]"
          >
            {change.title}
          </button>
          {expanded && (
            <div className="mt-2 space-y-2">
              <p className="text-[12px] leading-relaxed text-[#525252] dark:text-[#a3a3a3]">
                {change.description}
              </p>
              {change.files.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {change.files.map((f) => (
                    <FileChip key={f} path={f} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReleaseCard({ release }: { release: ChangelogRelease }) {
  const totalChanges = release.modules.reduce((sum, m) => sum + m.changes.length, 0);
  return (
    <article
      id={`release-${release.version}`}
      className="scroll-mt-6 overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-sm dark:border-[#2a2a2a] dark:bg-[#111111]"
    >
      {/* Card header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f0f0] bg-[#fafafa] px-5 py-4 dark:border-[#1e1e1e] dark:bg-[#161616]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-lg border border-[#ff5623]/30 bg-[#fff3ef] px-2.5 py-1 text-[11px] font-bold text-[#ff5623] dark:border-[#ff5623]/20 dark:bg-[#2a1508]">
            <Package className="h-3 w-3" />
            v{release.version}
          </span>
          <span className="text-[13px] font-semibold text-[#171717] dark:text-[#f5f5f5]">
            {release.summary}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#f5f5f5] px-2.5 py-1 text-[10px] font-semibold text-[#737373] dark:bg-[#232325] dark:text-[#a3a3a3]">
            {totalChanges} {totalChanges === 1 ? 'mudança' : 'mudanças'}
          </span>
          <span className="text-[12px] text-[#a3a3a3]">{release.date}</span>
        </div>
      </div>

      {/* Modules */}
      <div className="divide-y divide-[#f5f5f5] dark:divide-[#1e1e1e]">
        {release.modules.map((mod) => (
          <div key={mod.area} className="px-5 py-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-base leading-none">{mod.emoji}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#a3a3a3]">
                {mod.area}
              </span>
            </div>
            <div className="space-y-0">
              {mod.changes.map((change) => (
                <ChangeRow key={change.title} change={change} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ChangelogPage() {
  const [filter, setFilter] = useState<ChangeType | 'all'>('all');

  const totalChanges = useMemo(
    () => CHANGELOG_RELEASES.reduce((sum, r) => sum + r.modules.reduce((s, m) => s + m.changes.length, 0), 0),
    [],
  );

  const filteredReleases = useMemo<ChangelogRelease[]>(() => {
    if (filter === 'all') return CHANGELOG_RELEASES;
    return CHANGELOG_RELEASES.map((release) => ({
      ...release,
      modules: release.modules
        .map((mod) => ({ ...mod, changes: mod.changes.filter((c) => c.type === filter) }))
        .filter((mod) => mod.changes.length > 0),
    })).filter((release) => release.modules.length > 0);
  }, [filter]);

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#0a0a0a]">
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="border-b border-[#e5e5e5] bg-gradient-to-b from-[#fff8f5] to-white px-6 py-10 dark:border-[#2a2a2a] dark:from-[#1a0f0a] dark:to-[#111111]">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff5623]">
              <ScrollText className="h-4.5 w-4.5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#171717] dark:text-[#f5f5f5]">Atualizações</h1>
            <span className="rounded-full border border-[#ff5623]/30 bg-[#fff3ef] px-2.5 py-0.5 text-[11px] font-bold text-[#ff5623] dark:border-[#ff5623]/20 dark:bg-[#2a1508]">
              v{CHANGELOG_RELEASES[0].version}
            </span>
          </div>
          <p className="mb-5 max-w-[560px] text-sm text-[#737373] dark:text-[#a3a3a3]">
            Registro de todas as mudanças, correções e melhorias do WePlanner. Clique em qualquer item para ver o contexto técnico e os arquivos afetados.
          </p>
          <div className="flex flex-wrap items-center gap-5 text-[12px] text-[#a3a3a3]">
            <span className="flex items-center gap-1.5">
              <GitBranch className="h-3.5 w-3.5" />
              {CHANGELOG_RELEASES.length} releases
            </span>
            <span className="h-1 w-1 rounded-full bg-[#d4d4d4]" />
            <span>{totalChanges} mudanças registradas</span>
            <span className="h-1 w-1 rounded-full bg-[#d4d4d4]" />
            <span>desde {CHANGELOG_RELEASES[CHANGELOG_RELEASES.length - 1].date}</span>
          </div>
        </div>
      </div>

      {/* ── Filter tabs ──────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 border-b border-[#e5e5e5] bg-white/90 px-6 py-3 backdrop-blur-sm dark:border-[#2a2a2a] dark:bg-[#111111]/90">
        <div className="mx-auto flex max-w-[1100px] items-center gap-2 overflow-x-auto">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all ${
                filter === opt.value
                  ? 'bg-[#ff5623] text-white shadow-sm'
                  : 'text-[#737373] hover:bg-[#f5f5f5] dark:text-[#a3a3a3] dark:hover:bg-[#1e1e1e]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="mx-auto flex max-w-[1100px] gap-8 px-6 py-8">

        {/* Timeline sidebar — desktop only */}
        <aside className="hidden w-44 shrink-0 lg:block">
          <div className="sticky top-24 space-y-1">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#a3a3a3]">
              Releases
            </p>
            {CHANGELOG_RELEASES.map((release) => (
              <button
                key={release.version}
                type="button"
                onClick={() => {
                  document
                    .getElementById(`release-${release.version}`)
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="group flex w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[#f5f5f5] dark:hover:bg-[#1e1e1e]"
              >
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d4d4d4] transition-colors group-hover:bg-[#ff5623]" />
                <div>
                  <p className="text-[12px] font-semibold text-[#525252] transition-colors group-hover:text-[#ff5623] dark:text-[#a3a3a3]">
                    v{release.version}
                  </p>
                  <p className="text-[10px] text-[#a3a3a3]">{release.date}</p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Release cards */}
        <div className="min-w-0 flex-1 space-y-5">
          {filteredReleases.length > 0 ? (
            filteredReleases.map((release) => (
              <ReleaseCard key={release.version} release={release} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#e5e5e5] py-16 text-center dark:border-[#2a2a2a]">
              <ScrollText className="mb-3 h-8 w-8 text-[#d4d4d4]" />
              <p className="text-sm font-semibold text-[#a3a3a3]">Nenhuma mudança desse tipo encontrada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
