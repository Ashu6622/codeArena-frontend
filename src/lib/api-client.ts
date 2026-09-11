import { env } from '@/config/env';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/auth-session';

type ApiRequestOptions = {
  path: string;
  query?: Record<string, string | number | undefined>;
  init?: RequestInit;
};

type RefreshResponse = {
  accessToken: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function createUrl(path: string, query?: ApiRequestOptions['query']) {
  const url = new URL(path, env.apiBaseUrl);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  });
  return url;
}

async function readErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) return body.message.join(', ');
    if (body.message) return body.message;
  } catch {
    return 'Request failed with status ' + response.status;
  }
  return 'Request failed with status ' + response.status;
}

function authHeaders(init: RequestInit, accessToken = getAccessToken()) {
  const headers = new Headers(init.headers);
  headers.set('Accept', headers.get('Accept') ?? 'application/json');
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', 'Bearer ' + accessToken);
  }
  return headers;
}

function canRetryWithRefresh(url: URL) {
  return !['/auth/login', '/auth/logout', '/auth/refresh'].some((path) =>
    url.pathname.endsWith(path),
  );
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken() {
  const response = await fetch(createUrl('/auth/refresh'), {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    clearAccessToken();
    return null;
  }

  const body = (await response.json()) as RefreshResponse;
  if (!body.accessToken) {
    clearAccessToken();
    return null;
  }

  setAccessToken(body.accessToken);
  return body.accessToken;
}

async function getFreshAccessToken() {
  refreshPromise ??= refreshAccessToken().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

async function sendRequest(url: URL, init: RequestInit, accessToken?: string | null) {
  return fetch(url, {
    credentials: 'include',
    ...init,
    headers: authHeaders(init, accessToken),
  });
}

async function apiRequest<TResponse>(url: URL, init: RequestInit) {
  let response = await sendRequest(url, init);

  if (response.status === 401 && canRetryWithRefresh(url)) {
    const freshAccessToken = await getFreshAccessToken();
    if (freshAccessToken) response = await sendRequest(url, init, freshAccessToken);
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  if (response.status === 204) return undefined as TResponse;
  return (await response.json()) as TResponse;
}

export async function apiGet<TResponse>({ path, query, init }: ApiRequestOptions) {
  return apiRequest<TResponse>(createUrl(path, query), {
    ...init,
    method: 'GET',
  });
}

export async function apiPost<TResponse, TBody>(path: string, body: TBody, init?: RequestInit) {
  return apiRequest<TResponse>(createUrl(path), {
    ...init,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    body: JSON.stringify(body),
  });
}
