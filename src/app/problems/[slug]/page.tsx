import type { Metadata } from 'next';
import { ProblemWorkspace } from '@/features/problems/problem-workspace';

export const metadata: Metadata = {
  title: 'Problem Workspace | CodeArena',
};

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProblemWorkspace slug={slug} />;
}
