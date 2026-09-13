import type { Metadata } from 'next';
import { AdminProblemFormPage } from '@/features/problems/admin-problem-form-page';

export const metadata: Metadata = {
  title: 'Create Problem | CodeArena',
};

export default function Page() {
  return <AdminProblemFormPage />;
}
