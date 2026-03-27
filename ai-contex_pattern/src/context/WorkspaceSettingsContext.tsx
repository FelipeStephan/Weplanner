import React, { createContext, useContext, useState, useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type WorkDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface AccentPalette {
  id: string;
  label: string;
  color: string;
}

export interface WorkspaceSettings {
  /** Nome do workspace exibido no sidebar e em títulos */
  workspaceName: string;
  /** URL da logo exibida no sidebar. Vazio = usa logotipo padrão WePlanner */
  logoUrl: string;
  /** Cor de destaque do workspace (substitui #ff5623 padrão) */
  accentColor: string;
  /** Master switch do sistema de créditos */
  creditsEnabled: boolean;
  /** Dias de trabalho usados para calcular alertas de prazo */
  workDays: WorkDay[];
  /** Dias para o convite expirar */
  inviteExpiryDays: number;
  /** Clientes podem ver a biblioteca de assets sem edição */
  clientLibraryAccess: boolean;
}

export const ACCENT_PALETTES: AccentPalette[] = [
  { id: 'brand',   label: 'WePlanner',  color: '#ff5623' },
  { id: 'indigo',  label: 'Índigo',     color: '#4f46e5' },
  { id: 'sky',     label: 'Azul',       color: '#0284c7' },
  { id: 'emerald', label: 'Verde',      color: '#059669' },
  { id: 'violet',  label: 'Violeta',    color: '#7c3aed' },
  { id: 'rose',    label: 'Rosa',       color: '#e11d48' },
  { id: 'amber',   label: 'Âmbar',     color: '#d97706' },
  { id: 'slate',   label: 'Grafite',   color: '#475569' },
];

export const WORK_DAY_LABELS: Record<WorkDay, string> = {
  mon: 'Seg',
  tue: 'Ter',
  wed: 'Qua',
  thu: 'Qui',
  fri: 'Sex',
  sat: 'Sáb',
  sun: 'Dom',
};

const DEFAULT_SETTINGS: WorkspaceSettings = {
  workspaceName: 'WePlanner',
  logoUrl: '',
  accentColor: '#ff5623',
  creditsEnabled: true,
  workDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
  inviteExpiryDays: 7,
  clientLibraryAccess: true,
};

const STORAGE_KEY = 'weplanner:workspace-settings:v1';

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

interface WorkspaceSettingsContextValue {
  settings: WorkspaceSettings;
  updateSettings: (patch: Partial<WorkspaceSettings>) => void;
  resetSettings: () => void;
}

const WorkspaceSettingsContext = createContext<WorkspaceSettingsContextValue | null>(null);

function loadSettings(): WorkspaceSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function applyAccentColor(color: string) {
  document.documentElement.style.setProperty('--accent-color', color);
}

export function WorkspaceSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<WorkspaceSettings>(loadSettings);

  // Apply accent color on mount and whenever it changes
  useEffect(() => {
    applyAccentColor(settings.accentColor);
  }, [settings.accentColor]);

  const updateSettings = (patch: Partial<WorkspaceSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <WorkspaceSettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </WorkspaceSettingsContext.Provider>
  );
}

export function useWorkspaceSettings() {
  const ctx = useContext(WorkspaceSettingsContext);
  if (!ctx) throw new Error('useWorkspaceSettings must be used inside WorkspaceSettingsProvider');
  return ctx;
}
