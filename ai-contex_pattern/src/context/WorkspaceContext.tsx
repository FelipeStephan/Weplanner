import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface WorkspaceSettings {
  creditsEnabled: boolean;
}

interface WorkspaceContextValue {
  settings: WorkspaceSettings;
  setCreditsEnabled: (enabled: boolean) => void;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: WorkspaceSettings = {
  creditsEnabled: true,
};

const STORAGE_KEY = 'weplanner:workspace-settings';

function loadSettings(): WorkspaceSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: WorkspaceSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore write errors
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<WorkspaceSettings>(loadSettings);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const setCreditsEnabled = (enabled: boolean) => {
    setSettings((prev) => ({ ...prev, creditsEnabled: enabled }));
  };

  return (
    <WorkspaceContext.Provider value={{ settings, setCreditsEnabled }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceSettings(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspaceSettings must be used inside <WorkspaceProvider>');
  }
  return ctx;
}
