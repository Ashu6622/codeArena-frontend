import type { Metadata } from 'next';
import { SubmissionsPage } from '@/features/submissions/submissions-page';

export const metadata: Metadata = {
  title: 'Submissions | CodeArena',
};

export default function Page() {
  return <SubmissionsPage />;
}
