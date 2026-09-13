import type { Metadata } from 'next';
import { NotesPage } from '@/features/auth/notes-page';

export const metadata: Metadata = {
  title: 'Saved Notes | CodeArena',
};

export default function Page() {
  return <NotesPage />;
}
