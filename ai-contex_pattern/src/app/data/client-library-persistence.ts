import type { ClientLibraryResource } from '../../demo/clientLibraryCatalog';

const STORAGE_KEY = 'weplanner:client-library:v1';

const isBrowser = () => typeof window !== 'undefined' && !!window.localStorage;

export type PersistedClientLibraryMap = Record<string, ClientLibraryResource[]>;

const normalizeLibraryMap = (value: unknown): PersistedClientLibraryMap => {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([clientId, resources]) => [
      clientId,
      Array.isArray(resources)
        ? resources
            .map((resource) => {
              if (!resource || typeof resource !== 'object') {
                return null;
              }

              const typedResource = resource as Partial<ClientLibraryResource>;
              return {
                id: typedResource.id ?? `${clientId}-${Math.random().toString(36).slice(2, 9)}`,
                label: typedResource.label ?? 'Novo link',
                href: typedResource.href,
                type:
                  typedResource.type === 'drive' ||
                  typedResource.type === 'brand' ||
                  typedResource.type === 'social' ||
                  typedResource.type === 'links'
                    ? typedResource.type
                    : 'links',
              } satisfies ClientLibraryResource;
            })
            .filter(Boolean) as ClientLibraryResource[]
        : [],
    ]),
  );
};

export const loadPersistedClientLibraryMap = (
  seedMap: PersistedClientLibraryMap,
): PersistedClientLibraryMap => {
  if (!isBrowser()) {
    return seedMap;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedMap));
      return seedMap;
    }

    const parsed = JSON.parse(raw);
    return {
      ...seedMap,
      ...normalizeLibraryMap(parsed),
    };
  } catch {
    return seedMap;
  }
};

export const savePersistedClientLibraryMap = (libraryMap: PersistedClientLibraryMap) => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeLibraryMap(libraryMap)));
};
