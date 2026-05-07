import { sessionResponseSchema } from '@underground-artwork/shared';
import type { SessionUser } from '@underground-artwork/shared';

const sessionStorageKey = 'underground-artwork-demo-session';

export const demoUsers: SessionUser[] = [
  {
    id: 'demo-buyer',
    displayName: 'Maya Chen',
    role: 'buyer',
  },
  {
    id: 'demo-seller',
    displayName: 'Ink Stations',
    role: 'seller',
    artistHandle: '@inkstations',
  },
  {
    id: 'demo-admin',
    displayName: 'Underground Admin',
    role: 'admin',
  },
];

export function readStoredSession(): SessionUser | null {
  const storage = getSessionStorage();
  const raw = storage?.getItem(sessionStorageKey);
  if (!raw) return null;

  try {
    const parsedJson: unknown = JSON.parse(raw);
    const parsedSession = sessionResponseSchema.safeParse(parsedJson);
    return parsedSession.success ? parsedSession.data.user : null;
  } catch {
    return null;
  }
}

export function storeSession(user: SessionUser) {
  getSessionStorage()?.setItem(sessionStorageKey, JSON.stringify({ user }));
}

export function clearStoredSession() {
  getSessionStorage()?.removeItem(sessionStorageKey);
}

function getSessionStorage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}
