import type { Metadata } from 'next';
import { SubmissionDetailPage } from '@/features/submissions/submission-detail-page';

export const metadata: Metadata = {
  title: 'Submission Detail | CodeArena',
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SubmissionDetailPage id={id} />;
}
