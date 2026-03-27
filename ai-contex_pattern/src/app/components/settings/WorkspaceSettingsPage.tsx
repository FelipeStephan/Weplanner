import { useState } from 'react';
import {
  Settings,
  Palette,
  Building2,
  Shield,
  Zap,
  RotateCcw,
  Save,
  Image,
  Diamond,
  Calendar,
  Users,
  Link2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import {
  useWorkspaceSettings,
  ACCENT_PALETTES,
  WORK_DAY_LABELS,
  type WorkDay,
} from '../../../context/WorkspaceSettingsContext';

// ─────────────────────────────────────────────────────────────────────────────
// Section Card helper
// ─────────────────────────────────────────────────────────────────────────────
function SectionCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-[#E5E7E4] bg-white dark:border-[#2D2F30] dark:bg-[#111214]">
      <div className="border-b border-[#E5E7E4] px-6 py-5 dark:border-[#232425]">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#F8FAF8] text-[#525252] dark:bg-[#1A1B1C] dark:text-[#D4D4D4]">
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-[15px] font-semibold text-[#171717] dark:text-white">{title}</h2>
            {description && (
              <p className="mt-0.5 text-[12px] text-[#737373] dark:text-[#A3A3A3]">{description}</p>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-5 p-6">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Toggle row helper
// ─────────────────────────────────────────────────────────────────────────────
function ToggleRow({
  label,
  description,
  value,
  onChange,
  accentColor,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  accentColor?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex w-full items-center justify-between gap-4 text-left"
    >
      <div>
        <p className="text-[13px] font-semibold text-[#171717] dark:text-white">{label}</p>
        {description && (
          <p className="mt-0.5 text-[12px] text-[#737373] dark:text-[#A3A3A3]">{description}</p>
        )}
      </div>
      <span
        className={cn(
          'flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-all',
          value ? 'border-[--accent] bg-[--accent]' : 'border-[#D4D4D4] bg-[#D4D4D4] dark:border-[#525252] dark:bg-[#525252]',
        )}
        style={value ? { borderColor: accentColor, backgroundColor: accentColor } as React.CSSProperties : undefined}
      >
        <span
          className={cn(
            'h-4 w-4 rounded-full bg-white shadow transition-transform',
            value ? 'translate-x-[22px]' : 'translate-x-0.5',
          )}
        />
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export function WorkspaceSettingsPage() {
  const { settings, updateSettings, resetSettings } = useWorkspaceSettings();

  // Local draft state so we only save on "Salvar"
  const [draft, setDraft] = useState({ ...settings });
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const patch = (partial: Partial<typeof draft>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
    setSaved(false);
  };

  const handleSave = () => {
    updateSettings(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    resetSettings();
    setDraft({
      workspaceName: 'WePlanner',
      logoUrl: '',
      accentColor: '#ff5623',
      creditsEnabled: true,
      workDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
      inviteExpiryDays: 7,
      clientLibraryAccess: true,
    });
    setConfirmReset(false);
    setSaved(false);
  };

  const accent = draft.accentColor;

  const ALL_WORK_DAYS: WorkDay[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  const toggleWorkDay = (day: WorkDay) => {
    const current = draft.workDays;
    const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
    // Must keep at least 1 day
    if (next.length === 0) return;
    patch({ workDays: next });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAF8] dark:bg-[#0D0E0F]">
      {/* Page header */}
      <div className="border-b border-[#E5E7E4] bg-white px-6 py-5 dark:border-[#232425] dark:bg-[#111214]">
        <div className="mx-auto flex max-w-[860px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-white"
              style={{ backgroundColor: accent }}
            >
              <Settings className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-[#171717] dark:text-white">Configurações do workspace</h1>
              <p className="text-sm text-[#737373] dark:text-[#A3A3A3]">
                Personalize identidade, operações e acessos do seu workspace.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saved && (
              <span className="rounded-full bg-[#D1FAE5] px-3 py-1 text-[12px] font-semibold text-[#065F46] dark:bg-[#0f2e20] dark:text-[#6ee7b7]">
                Salvo ✓
              </span>
            )}
            <Button
              variant="outline"
              onClick={() => setConfirmReset(true)}
              className="rounded-2xl border-[#E5E7E4] dark:border-[#2D2F30]"
            >
              <RotateCcw className="mr-1.5 h-4 w-4" />
              Restaurar padrões
            </Button>
            <Button
              onClick={handleSave}
              className="rounded-2xl text-white"
              style={{ backgroundColor: accent }}
            >
              <Save className="mr-1.5 h-4 w-4" />
              Salvar alterações
            </Button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto w-full max-w-[860px] space-y-6 px-6 py-8">

        {/* ── Identidade ── */}
        <SectionCard
          icon={Building2}
          title="Identidade do workspace"
          description="Nome, logo e cor de destaque que aparecem em toda a plataforma."
        >
          {/* Nome */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A3A3A3]">
              Nome do workspace
            </label>
            <Input
              value={draft.workspaceName}
              onChange={(e) => patch({ workspaceName: e.target.value })}
              placeholder="Ex: Agência Arcadia"
              className="h-11 rounded-2xl border-[#E5E7E4] dark:border-[#2D2F30]"
            />
          </div>

          {/* Logo URL */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A3A3A3]">
              Logo (URL da imagem)
            </label>
            <div className="flex items-center gap-3">
              {/* Preview */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E5E7E4] bg-[#F8FAF8] dark:border-[#2D2F30] dark:bg-[#171819]">
                {draft.logoUrl ? (
                  <img src={draft.logoUrl} alt="Logo preview" className="h-9 w-9 object-contain" />
                ) : (
                  <Image className="h-5 w-5 text-[#A3A3A3]" />
                )}
              </div>
              <div className="relative flex-1">
                <Link2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" />
                <Input
                  value={draft.logoUrl}
                  onChange={(e) => patch({ logoUrl: e.target.value })}
                  placeholder="https://sua-empresa.com/logo.svg"
                  className="h-11 rounded-2xl border-[#E5E7E4] pl-10 dark:border-[#2D2F30]"
                />
              </div>
            </div>
            <p className="text-[11px] text-[#A3A3A3]">
              Suporte a PNG, SVG ou JPEG. Upload via URL pública. Upload direto disponível em breve.
            </p>
          </div>

          {/* Paleta de cores */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A3A3A3]">
              Cor de destaque
            </label>
            <div className="flex flex-wrap gap-2">
              {ACCENT_PALETTES.map((palette) => (
                <button
                  key={palette.id}
                  type="button"
                  title={palette.label}
                  onClick={() => patch({ accentColor: palette.color })}
                  className={cn(
                    'flex h-9 items-center gap-2 rounded-full border px-3 text-[12px] font-semibold transition-all',
                    draft.accentColor === palette.color
                      ? 'border-transparent text-white shadow-md'
                      : 'border-[#E5E7E4] bg-white text-[#525252] hover:border-[#D4D4D4] dark:border-[#2D2F30] dark:bg-[#171819] dark:text-[#D4D4D4]',
                  )}
                  style={
                    draft.accentColor === palette.color
                      ? { backgroundColor: palette.color, borderColor: palette.color }
                      : undefined
                  }
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{ backgroundColor: palette.color }}
                  />
                  {palette.label}
                </button>
              ))}
            </div>
            {/* Custom hex input */}
            <div className="flex items-center gap-2 pt-1">
              <div
                className="h-8 w-8 shrink-0 rounded-xl border-2 border-white shadow"
                style={{ backgroundColor: draft.accentColor }}
              />
              <div className="relative">
                <Palette className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#A3A3A3]" />
                <input
                  type="text"
                  value={draft.accentColor}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) patch({ accentColor: val });
                  }}
                  placeholder="#ff5623"
                  maxLength={7}
                  className="h-8 rounded-xl border border-[#E5E7E4] bg-white pl-8 pr-3 text-[13px] font-mono text-[#171717] outline-none focus:border-[#A3A3A3] dark:border-[#2D2F30] dark:bg-[#171819] dark:text-white"
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Operacional ── */}
        <SectionCard
          icon={Zap}
          title="Configurações operacionais"
          description="Define como o sistema de créditos e os alertas de prazo funcionam."
        >
          {/* Credits */}
          <ToggleRow
            label="Sistema de créditos"
            description="Quando desativado, o campo de créditos some de todas as tarefas do workspace. Os valores são preservados."
            value={draft.creditsEnabled}
            onChange={(v) => patch({ creditsEnabled: v })}
            accentColor={accent}
          />

          <div className="border-t border-[#E5E7E4] pt-5 dark:border-[#2D2F30]">
            {/* Working days */}
            <div className="space-y-2">
              <div>
                <p className="text-[13px] font-semibold text-[#171717] dark:text-white">Dias de trabalho</p>
                <p className="mt-0.5 text-[12px] text-[#737373] dark:text-[#A3A3A3]">
                  Usado para calcular alertas de prazo (próximo / atrasado) descontando dias não úteis.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {ALL_WORK_DAYS.map((day) => {
                  const active = draft.workDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleWorkDay(day)}
                      className={cn(
                        'h-9 min-w-[48px] rounded-2xl border px-3 text-[13px] font-semibold transition-all',
                        active
                          ? 'border-transparent text-white'
                          : 'border-[#E5E7E4] bg-white text-[#737373] hover:border-[#D4D4D4] dark:border-[#2D2F30] dark:bg-[#171819] dark:text-[#A3A3A3]',
                      )}
                      style={active ? { backgroundColor: accent, borderColor: accent } : undefined}
                    >
                      {WORK_DAY_LABELS[day]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Acesso & Equipe ── */}
        <SectionCard
          icon={Shield}
          title="Acesso & Equipe"
          description="Controla como convites e acessos de clientes funcionam."
        >
          {/* Invite expiry */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#A3A3A3]" />
              <p className="text-[13px] font-semibold text-[#171717] dark:text-white">Expiração do convite</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {[3, 7, 14, 30].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => patch({ inviteExpiryDays: days })}
                    className={cn(
                      'h-9 rounded-2xl border px-4 text-[13px] font-semibold transition-all',
                      draft.inviteExpiryDays === days
                        ? 'border-transparent text-white'
                        : 'border-[#E5E7E4] bg-white text-[#737373] hover:border-[#D4D4D4] dark:border-[#2D2F30] dark:bg-[#171819] dark:text-[#A3A3A3]',
                    )}
                    style={draft.inviteExpiryDays === days ? { backgroundColor: accent, borderColor: accent } : undefined}
                  >
                    {days} dias
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-[#A3A3A3]">
              Após esse período, o link de convite expira e um novo convite precisará ser enviado.
            </p>
          </div>

          <div className="border-t border-[#E5E7E4] pt-5 dark:border-[#2D2F30]">
            <ToggleRow
              label="Acesso de clientes à biblioteca"
              description="Clientes podem visualizar a biblioteca de assets do workspace (sem permissão de edição)."
              value={draft.clientLibraryAccess}
              onChange={(v) => patch({ clientLibraryAccess: v })}
              accentColor={accent}
            />
          </div>
        </SectionCard>

        {/* ── Integrações (coming soon) ── */}
        <SectionCard
          icon={ExternalLink}
          title="Integrações"
          description="Conecte o WePlanner com ferramentas externas da sua agência."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { name: 'Slack', desc: 'Notificações em canais do Slack' },
              { name: 'Discord', desc: 'Alertas e atualizações de tarefas' },
              { name: 'Google Calendar', desc: 'Sincronize deadlines com sua agenda' },
              { name: 'Zapier', desc: 'Automatize fluxos com outros apps' },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-3 rounded-2xl border border-[#E5E7E4] bg-[#F8FAF8] px-4 py-3 dark:border-[#2D2F30] dark:bg-[#171819]"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-[#171717] dark:text-white">{item.name}</p>
                  <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3]">{item.desc}</p>
                </div>
                <span className="rounded-full bg-[#F0F0EF] px-2 py-0.5 text-[10px] font-semibold text-[#737373] dark:bg-[#232425] dark:text-[#A3A3A3]">
                  Em breve
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Confirm reset dialog */}
        {confirmReset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmReset(false)} />
            <div className="relative z-10 w-full max-w-sm rounded-[28px] border border-[#E5E7E4] bg-white p-6 shadow-2xl dark:border-[#2D2F30] dark:bg-[#111214]">
              <h3 className="text-[16px] font-bold text-[#171717] dark:text-white">Restaurar padrões?</h3>
              <p className="mt-1.5 text-sm text-[#737373] dark:text-[#A3A3A3]">
                Todas as configurações voltarão ao estado original do WePlanner. Esta ação não pode ser desfeita.
              </p>
              <div className="mt-5 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 rounded-2xl border-[#E5E7E4] dark:border-[#2D2F30]"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleReset}
                  className="flex-1 rounded-2xl bg-[#dc2626] text-white hover:bg-[#b91c1c]"
                >
                  Restaurar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
