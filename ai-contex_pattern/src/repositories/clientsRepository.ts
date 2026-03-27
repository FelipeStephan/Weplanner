import type { ClientRecord, ClientCreateInput, ClientUpdateInput } from '../domain/clients/contracts';
import { buildDefaultLibraryResources } from '../domain/clients/contracts';

// ─────────────────────────────────────────────────────────────────────────────
// Persistence helpers
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'weplanner:clients:v1';

function generateId(): string {
  return `client-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function now(): string {
  return new Date().toISOString();
}

function loadClients(seed: ClientRecord[]): ClientRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    return JSON.parse(raw) as ClientRecord[];
  } catch {
    return seed;
  }
}

function saveClients(clients: ClientRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  } catch {
    // ignore storage errors silently
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Repository
// ─────────────────────────────────────────────────────────────────────────────

export const clientsRepository = {
  // ─── Read ──────────────────────────────────────────────────────────────

  listAll(seed: ClientRecord[]): ClientRecord[] {
    return loadClients(seed);
  },

  getById(id: string, seed: ClientRecord[]): ClientRecord | null {
    return loadClients(seed).find((c) => c.id === id) ?? null;
  },

  // ─── Create ─────────────────────────────────────────────────────────────

  create(seed: ClientRecord[], input: ClientCreateInput): ClientRecord {
    const clients = loadClients(seed);
    const id = generateId();
    const timestamp = now();

    const newClient: ClientRecord = {
      id,
      name: input.name,
      sector: input.sector,
      logoUrl: input.logoUrl,
      responsibleUserId: input.responsibleUserId,
      status: input.status ?? 'onboarding',
      creditsEnabled: input.creditsEnabled ?? true,
      contractedCredits: input.contractedCredits,
      boardIds: input.boardIds ?? [],
      // Auto-initialize with 4 default empty library slots
      libraryResources: buildDefaultLibraryResources(id),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    clients.push(newClient);
    saveClients(clients);
    return newClient;
  },

  // ─── Update ─────────────────────────────────────────────────────────────

  update(id: string, patch: ClientUpdateInput, seed: ClientRecord[]): ClientRecord | null {
    const clients = loadClients(seed);
    const index = clients.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const updated: ClientRecord = {
      ...clients[index],
      ...patch,
      id,
      updatedAt: now(),
    };

    clients[index] = updated;
    saveClients(clients);
    return updated;
  },

  // ─── Delete ─────────────────────────────────────────────────────────────

  delete(id: string, seed: ClientRecord[]): void {
    const clients = loadClients(seed).filter((c) => c.id !== id);
    saveClients(clients);
  },

  // ─── Library resources ──────────────────────────────────────────────────

  updateLibrary(
    clientId: string,
    resources: ClientRecord['libraryResources'],
    seed: ClientRecord[],
  ): ClientRecord | null {
    return clientsRepository.update(clientId, { libraryResources: resources }, seed);
  },

  // ─── Board links ────────────────────────────────────────────────────────

  linkBoard(clientId: string, boardId: string, seed: ClientRecord[]): ClientRecord | null {
    const client = clientsRepository.getById(clientId, seed);
    if (!client) return null;
    if (client.boardIds.includes(boardId)) return client;
    return clientsRepository.update(clientId, { boardIds: [...client.boardIds, boardId] }, seed);
  },

  unlinkBoard(clientId: string, boardId: string, seed: ClientRecord[]): ClientRecord | null {
    const client = clientsRepository.getById(clientId, seed);
    if (!client) return null;
    return clientsRepository.update(
      clientId,
      { boardIds: client.boardIds.filter((id) => id !== boardId) },
      seed,
    );
  },

  // ─── Reset ──────────────────────────────────────────────────────────────

  reset(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
