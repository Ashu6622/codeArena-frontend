import type { Metadata } from 'next';
import { ProblemDiscussionsPage } from '@/features/problems/problem-discussions-page';

export const metadata: Metadata = {
  title: 'Problem Discussion | CodeArena',
};

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProblemDiscussionsPage slug={slug} />;
}
