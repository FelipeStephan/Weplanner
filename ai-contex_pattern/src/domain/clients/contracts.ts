// ─────────────────────────────────────────────────────────────────────────────
// Client domain contracts
// ─────────────────────────────────────────────────────────────────────────────

export type ClientStatus = 'active' | 'onboarding' | 'inactive';

export type ClientLibraryResourceType = 'drive' | 'brand' | 'social' | 'links' | 'other';

export interface ClientLibraryResource {
  id: string;
  label: string;
  href?: string;
  type: ClientLibraryResourceType;
}

// ─── Full client record ───────────────────────────────────────────────────────

export interface ClientRecord {
  id: string;
  name: string;
  sector?: string;
  logoUrl?: string;
  /** ID of the manager responsible for this client */
  responsibleUserId?: string;
  status: ClientStatus;
  /** When false, client is hidden from credit dashboards and reports */
  creditsEnabled: boolean;
  /** Total credits contracted with the client */
  contractedCredits?: number;
  /** Soft link to boards — no structural rule, just convenience */
  boardIds: string[];
  /** Library of resources for this client (drive, brand kit, socials, etc.) */
  libraryResources: ClientLibraryResource[];
  createdAt: string;
  updatedAt: string;
}

// ─── Input types ─────────────────────────────────────────────────────────────

export interface ClientCreateInput {
  name: string;
  sector?: string;
  logoUrl?: string;
  responsibleUserId?: string;
  status?: ClientStatus;
  creditsEnabled?: boolean;
  contractedCredits?: number;
  boardIds?: string[];
}

export interface ClientUpdateInput {
  name?: string;
  sector?: string;
  logoUrl?: string;
  responsibleUserId?: string;
  status?: ClientStatus;
  creditsEnabled?: boolean;
  contractedCredits?: number;
  boardIds?: string[];
  libraryResources?: ClientLibraryResource[];
}

// ─── Default library resources ───────────────────────────────────────────────

export function buildDefaultLibraryResources(clientId: string): ClientLibraryResource[] {
  return [
    { id: `${clientId}-drive`,  label: 'Banco de imagens',    type: 'drive',  href: '' },
    { id: `${clientId}-brand`,  label: 'Identidade visual',   type: 'brand',  href: '' },
    { id: `${clientId}-social`, label: 'Redes sociais',       type: 'social', href: '' },
    { id: `${clientId}-links`,  label: 'Links importantes',   type: 'links',  href: '' },
  ];
}

// ─── Status metadata ────────────────────────────────────────────────────────

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  active: 'Ativo',
  onboarding: 'Em onboarding',
  inactive: 'Inativo',
};

export const CLIENT_STATUS_COLORS: Record<ClientStatus, string> = {
  active: '#019364',
  onboarding: '#d97706',
  inactive: '#737373',
};

export const CLIENT_LIBRARY_TYPE_LABELS: Record<ClientLibraryResourceType, string> = {
  drive: 'Drive',
  brand: 'Identidade visual',
  social: 'Redes sociais',
  links: 'Links',
  other: 'Outro',
};
