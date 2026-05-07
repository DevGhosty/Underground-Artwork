const STORAGE_KEY = 'underground-artwork:saved-toggles';

export type SavedToggleMap = Record<number, boolean>;

function isSavedToggleMap(value: unknown): value is SavedToggleMap {
  if (!value || typeof value !== 'object') return false;
  return Object.entries(value as Record<string, unknown>).every(([key, v]) => {
    const id = Number(key);
    return Number.isInteger(id) && id > 0 && typeof v === 'boolean';
  });
}

export function loadSavedToggles(): SavedToggleMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!isSavedToggleMap(parsed)) return {};
    return parsed;
  } catch {
    return {};
  }
}

export function persistSavedToggles(map: SavedToggleMap): void {
  try {
    const keys = Object.keys(map);
    if (keys.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota / private mode */
  }
}
