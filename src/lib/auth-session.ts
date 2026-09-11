export const ACCESS_TOKEN_STORAGE_KEY = 'codearena_access_token';

const AUTH_SESSION_EVENT = 'codearena-auth-session-change';

function notifyAuthSessionChange() {
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function setAccessToken(token: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  notifyAuthSessionChange();
}

export function clearAccessToken() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  notifyAuthSessionChange();
}

export function hasAccessToken() {
  return Boolean(getAccessToken());
}

export function subscribeToAuthSession(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener(AUTH_SESSION_EVENT, onStoreChange);
  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(AUTH_SESSION_EVENT, onStoreChange);
  };
}

export function getServerAuthSnapshot() {
  return false;
}
