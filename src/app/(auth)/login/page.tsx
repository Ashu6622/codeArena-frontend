import type { Metadata } from 'next';
import { LoginPage } from '@/features/auth/login-page';

export const metadata: Metadata = {
  title: 'Login | CodeArena',
};

export default function Page() {
  return <LoginPage />;
}
