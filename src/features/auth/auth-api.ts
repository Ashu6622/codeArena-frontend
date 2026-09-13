import { useMutation, useQuery } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api-client';
import { clearAccessToken, setAccessToken } from '@/lib/auth-session';
export { ACCESS_TOKEN_STORAGE_KEY, clearAccessToken } from '@/lib/auth-session';

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: AuthUser;
};

export type SignupRequest = {
  email: string;
  password: string;
  name?: string;
};

export type SavedProblem = {
  id: string;
  title: string;
  slug: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  timeLimitMs: number;
  memoryLimitMb: number;
  bookmarkedAt: string;
  progressStatus: 'SOLVED' | 'ATTEMPTED' | 'NOT_STARTED';
  tags: { id: string; name: string; slug: string }[];
};

export type SavedProblemsResponse = {
  items: SavedProblem[];
};

export const authQueryKeys = {
  me: ['auth', 'me'] as const,
  bookmarks: ['auth', 'bookmarks'] as const,
};

export function useLogin() {
  return useMutation({
    mutationFn: (body: LoginRequest) => apiPost<LoginResponse, LoginRequest>('/auth/login', body),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: (body: SignupRequest) => apiPost<AuthUser, SignupRequest>('/auth/signup', body),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => apiPost<void, Record<string, never>>('/auth/logout', {}),
    onSettled: clearAccessToken,
  });
}

export function useMe() {
  return useQuery({
    queryKey: authQueryKeys.me,
    queryFn: () => apiGet<AuthUser>({ path: '/auth/me' }),
  });
}

export function useSavedProblems() {
  return useQuery({
    queryKey: authQueryKeys.bookmarks,
    queryFn: () => apiGet<SavedProblemsResponse>({ path: '/me/bookmarks' }),
  });
}
