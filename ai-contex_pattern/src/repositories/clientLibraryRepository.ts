import { BOARD_DIRECTORY_CLIENTS } from '../demo/boardDirectory';
import { CLIENT_LIBRARY_CATALOG } from '../demo/clientLibraryCatalog';
import {
  loadPersistedClientLibraryMap,
  savePersistedClientLibraryMap,
} from '../app/data/client-library-persistence';

export interface ClientLibraryItem {
  id: string;
  name: string;
  sector?: string;
  image?: string;
  resources: Array<{
    id: string;
    label: string;
    href?: string;
    type: 'drive' | 'brand' | 'social' | 'links';
  }>;
}

const loadClientLibraryCatalog = () => loadPersistedClientLibraryMap(CLIENT_LIBRARY_CATALOG);

const buildClientLibraryItem = (clientId: string): ClientLibraryItem | null => {
  const client = BOARD_DIRECTORY_CLIENTS.find((entry) => entry.id === clientId);
  if (!client) return null;

  const libraryCatalog = loadClientLibraryCatalog();

  return {
    id: clientId,
    name: client.name,
    sector: client.sector,
    image: undefined,
    resources: libraryCatalog[clientId] ?? [],
  };
};

export const clientLibraryRepository = {
  listByClientIds(clientIds: string[]): ClientLibraryItem[] {
    return Array.from(new Set(clientIds))
      .map((clientId) => buildClientLibraryItem(clientId))
      .filter(Boolean) as ClientLibraryItem[];
  },
  getByClientId(clientId: string) {
    return buildClientLibraryItem(clientId);
  },
  getByClientName(clientName: string) {
    const normalizedClientName = clientName.trim().toLowerCase();
    const matchedClient = BOARD_DIRECTORY_CLIENTS.find(
      (entry) => entry.name.trim().toLowerCase() === normalizedClientName,
    );

    return matchedClient ? buildClientLibraryItem(matchedClient.id) : null;
  },
  listAll() {
    return BOARD_DIRECTORY_CLIENTS.map((client) => buildClientLibraryItem(client.id)).filter(Boolean) as ClientLibraryItem[];
  },
  saveByClientId(
    clientId: string,
    resources: Array<{
      id: string;
      label: string;
      href?: string;
      type: 'drive' | 'brand' | 'social' | 'links';
    }>,
  ) {
    const nextCatalog = {
      ...loadClientLibraryCatalog(),
      [clientId]: resources,
    };

    savePersistedClientLibraryMap(nextCatalog);
    return buildClientLibraryItem(clientId);
  },
};
