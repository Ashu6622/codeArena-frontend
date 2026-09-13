import type { Metadata } from 'next';
import { PublicUserProfilePage } from '@/features/users/public-user-profile-page';

export const metadata: Metadata = {
  title: 'User Profile | CodeArena',
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PublicUserProfilePage id={id} />;
}
