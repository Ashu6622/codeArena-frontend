import type { Metadata } from 'next';
import { ProblemNotePage } from '@/features/problems/problem-note-page';

export const metadata: Metadata = {
  title: 'Private Problem Note | CodeArena',
};

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProblemNotePage slug={slug} />;
}
