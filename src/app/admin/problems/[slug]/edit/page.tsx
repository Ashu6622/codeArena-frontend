import type { Metadata } from 'next';
import { AdminProblemEditPage } from '@/features/problems/admin-problem-edit-page';

export const metadata: Metadata = {
  title: 'Edit Problem | CodeArena',
};

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <AdminProblemEditPage slug={slug} />;
}
