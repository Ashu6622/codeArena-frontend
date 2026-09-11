import type { Metadata } from 'next';
import { LogoutPage } from '@/features/auth/logout-page';

export const metadata: Metadata = {
  title: 'Logout | CodeArena',
};

export default function Page() {
  return <LogoutPage />;
}
