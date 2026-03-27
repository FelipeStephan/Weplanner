import type { ClientRecord } from '../domain/clients/contracts';
import { buildDefaultLibraryResources } from '../domain/clients/contracts';

// ─────────────────────────────────────────────────────────────────────────────
// Demo seed data — migrates from the old BOARD_DIRECTORY_CLIENTS hardcoded array
// into a full ClientRecord structure with library resources pre-populated.
// ─────────────────────────────────────────────────────────────────────────────

function makeClient(
  id: string,
  overrides: Partial<ClientRecord>,
): ClientRecord {
  const now = new Date('2025-11-01T10:00:00Z').toISOString();
  return {
    id,
    name: '',
    sector: undefined,
    logoUrl: undefined,
    responsibleUserId: 'user-ana',
    status: 'active',
    creditsEnabled: true,
    contractedCredits: undefined,
    boardIds: [],
    libraryResources: buildDefaultLibraryResources(id),
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export const CLIENTS_DEMO_SEED: ClientRecord[] = [
  makeClient('client-arcadia', {
    name: 'Arcadia',
    sector: 'Tecnologia',
    creditsEnabled: true,
    contractedCredits: 300,
    boardIds: [],
    libraryResources: [
      { id: 'arcadia-drive',  label: 'Banco de imagens',    type: 'drive',  href: 'https://drive.google.com/' },
      { id: 'arcadia-brand',  label: 'Identidade visual',   type: 'brand',  href: 'https://www.figma.com/' },
      { id: 'arcadia-social', label: 'Redes sociais',       type: 'social', href: 'https://www.instagram.com/' },
      { id: 'arcadia-links',  label: 'Links importantes',   type: 'links',  href: 'https://www.notion.so/' },
    ],
  }),
  makeClient('client-weplanner', {
    name: 'WePlanner',
    sector: 'SaaS',
    creditsEnabled: true,
    contractedCredits: 150,
    boardIds: [],
    libraryResources: [
      { id: 'weplanner-drive',  label: 'Banco de imagens',  type: 'drive',  href: 'https://drive.google.com/' },
      { id: 'weplanner-brand',  label: 'Identidade visual', type: 'brand',  href: 'https://www.figma.com/' },
      { id: 'weplanner-social', label: 'Redes sociais',     type: 'social', href: 'https://www.instagram.com/' },
      { id: 'weplanner-links',  label: 'Links importantes', type: 'links',  href: 'https://www.notion.so/' },
    ],
  }),
  makeClient('client-ifood', {
    name: 'iFood',
    sector: 'Delivery',
    creditsEnabled: true,
    contractedCredits: 500,
    boardIds: [],
    libraryResources: [
      { id: 'ifood-drive',  label: 'Banco de imagens',  type: 'drive',  href: 'https://drive.google.com/' },
      { id: 'ifood-brand',  label: 'Identidade visual', type: 'brand',  href: 'https://www.figma.com/' },
      { id: 'ifood-social', label: 'Redes sociais',     type: 'social', href: 'https://www.instagram.com/' },
      { id: 'ifood-links',  label: 'Links importantes', type: 'links',  href: 'https://www.notion.so/' },
    ],
  }),
  makeClient('client-nubank', {
    name: 'Nubank',
    sector: 'Fintech',
    status: 'onboarding',
    creditsEnabled: true,
    contractedCredits: 200,
    boardIds: [],
    libraryResources: [
      { id: 'nubank-drive',  label: 'Banco de imagens',  type: 'drive',  href: '' },
      { id: 'nubank-brand',  label: 'Identidade visual', type: 'brand',  href: '' },
      { id: 'nubank-social', label: 'Redes sociais',     type: 'social', href: '' },
      { id: 'nubank-links',  label: 'Links importantes', type: 'links',  href: '' },
    ],
  }),
  makeClient('client-ambev', {
    name: 'Ambev',
    sector: 'Bebidas',
    creditsEnabled: false,
    boardIds: [],
    libraryResources: [
      { id: 'ambev-drive',  label: 'Banco de imagens',  type: 'drive',  href: 'https://drive.google.com/' },
      { id: 'ambev-brand',  label: 'Identidade visual', type: 'brand',  href: 'https://www.figma.com/' },
      { id: 'ambev-social', label: 'Redes sociais',     type: 'social', href: 'https://www.instagram.com/' },
      { id: 'ambev-links',  label: 'Links importantes', type: 'links',  href: '' },
    ],
  }),
];
