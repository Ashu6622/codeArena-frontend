import type { Metadata } from 'next';
import { AdminProblemsPage } from '@/features/problems/admin-problems-page';

export const metadata: Metadata = {
  title: 'Admin Problems | CodeArena',
};

export default function Page() {
  return <AdminProblemsPage />;
}
