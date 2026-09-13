import type { Metadata } from 'next';
import { NoteDetailPage } from '@/features/auth/note-detail-page';

export const metadata: Metadata = {
  title: 'Saved Note | CodeArena',
};

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <NoteDetailPage slug={slug} />;
}
