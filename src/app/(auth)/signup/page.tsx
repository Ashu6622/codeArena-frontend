import type { Metadata } from 'next';
import { SignupPage } from '@/features/auth/signup-page';

export const metadata: Metadata = {
  title: 'Signup | CodeArena',
};

export default function Page() {
  return <SignupPage />;
}
