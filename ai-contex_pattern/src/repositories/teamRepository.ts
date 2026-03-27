import type { TeamMember, TeamInvite, MemberPermissions } from '../domain/team/contracts';

const MEMBERS_KEY = 'weplanner:team-members';
const INVITES_KEY = 'weplanner:team-invites';

function loadMembers(seed: TeamMember[]): TeamMember[] {
  try {
    const raw = localStorage.getItem(MEMBERS_KEY);
    if (!raw) return seed;
    return JSON.parse(raw) as TeamMember[];
  } catch {
    return seed;
  }
}

function saveMembers(members: TeamMember[]): void {
  try {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
  } catch {}
}

function loadInvites(seed: TeamInvite[]): TeamInvite[] {
  try {
    const raw = localStorage.getItem(INVITES_KEY);
    if (!raw) return seed;
    return JSON.parse(raw) as TeamInvite[];
  } catch {
    return seed;
  }
}

function saveInvites(invites: TeamInvite[]): void {
  try {
    localStorage.setItem(INVITES_KEY, JSON.stringify(invites));
  } catch {}
}

function generateId(): string {
  return `member-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function generateToken(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
}

export const teamRepository = {
  // ─── Members ───────────────────────────────────────────────────────────

  listMembers(seed: TeamMember[]): TeamMember[] {
    return loadMembers(seed);
  },

  getMember(id: string, seed: TeamMember[]): TeamMember | null {
    return loadMembers(seed).find((m) => m.id === id) ?? null;
  },

  updateMember(
    id: string,
    patch: Partial<Omit<TeamMember, 'id'>>,
    seed: TeamMember[],
  ): TeamMember | null {
    const members = loadMembers(seed);
    const index = members.findIndex((m) => m.id === id);
    if (index === -1) return null;
    const updated = { ...members[index], ...patch };
    members[index] = updated;
    saveMembers(members);
    return updated;
  },

  updatePermissions(
    id: string,
    permissions: Partial<MemberPermissions>,
    seed: TeamMember[],
  ): TeamMember | null {
    return teamRepository.updateMember(id, { permissions }, seed);
  },

  deactivateMember(id: string, seed: TeamMember[]): void {
    teamRepository.updateMember(id, { status: 'inactive' }, seed);
  },

  deleteMember(id: string, seed: TeamMember[]): void {
    const members = loadMembers(seed).filter((m) => m.id !== id);
    saveMembers(members);
  },

  // ─── Invites ────────────────────────────────────────────────────────────

  listInvites(seed: TeamInvite[]): TeamInvite[] {
    return loadInvites(seed);
  },

  createInvite(
    data: Pick<TeamInvite, 'email' | 'role' | 'invitedBy' | 'boardIds' | 'clientId'>,
    seed: TeamInvite[],
  ): TeamInvite {
    const invites = loadInvites(seed);
    // Cancel any existing pending invite for this email
    const updated = invites.map((inv) =>
      inv.email === data.email && inv.status === 'pending'
        ? { ...inv, status: 'cancelled' as const }
        : inv,
    );

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const newInvite: TeamInvite = {
      id: generateId(),
      email: data.email,
      role: data.role,
      invitedBy: data.invitedBy,
      token: generateToken(),
      status: 'pending',
      expiresAt,
      createdAt: new Date().toISOString(),
      boardIds: data.boardIds ?? [],
      clientId: data.clientId ?? null,
    };

    updated.push(newInvite);
    saveInvites(updated);

    // Add member with status 'invited'
    const members = loadMembers(seed);
    const newMember: TeamMember = {
      id: generateId(),
      name: data.email.split('@')[0],
      email: data.email,
      role: data.role,
      status: 'invited',
      boardIds: data.boardIds ?? [],
      clientId: data.clientId ?? null,
      invitedAt: new Date().toISOString(),
      invitedBy: data.invitedBy,
    };
    members.push(newMember);
    saveMembers(members);

    return newInvite;
  },

  cancelInvite(inviteId: string, seed: TeamInvite[]): void {
    const invites = loadInvites(seed);
    const updated = invites.map((inv) =>
      inv.id === inviteId ? { ...inv, status: 'cancelled' as const } : inv,
    );
    saveInvites(updated);
  },

  resendInvite(inviteId: string, seed: TeamInvite[]): TeamInvite | null {
    const invites = loadInvites(seed);
    const index = invites.findIndex((inv) => inv.id === inviteId);
    if (index === -1) return null;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    invites[index] = {
      ...invites[index],
      token: generateToken(),
      status: 'pending',
      expiresAt,
      createdAt: new Date().toISOString(),
    };
    saveInvites(invites);
    return invites[index];
  },

  reset(): void {
    localStorage.removeItem(MEMBERS_KEY);
    localStorage.removeItem(INVITES_KEY);
  },
};
