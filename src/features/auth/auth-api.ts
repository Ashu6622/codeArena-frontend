import { useMutation } from '@tanstack/react-query';
import { apiPost } from '@/lib/api-client';
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
