import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-client';

export type PublicUserProblem = {
  id: string;
  title: string;
  slug: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  solvedAt: string;
  tags: { id: string; name: string; slug: string }[];
};

export type PublicUserProfile = {
  user: {
    id: string;
    name: string | null;
    joinedAt: string;
  };
  stats: {
    solvedCount: number;
    attemptedCount: number;
    acceptedSubmissionCount: number;
  };
  recentSolved: PublicUserProblem[];
};

export const publicUserQueryKeys = {
  all: ['public-users'] as const,
  profile: (id: string) => [...publicUserQueryKeys.all, 'profile', id] as const,
};

export function usePublicUserProfile(id: string) {
  return useQuery({
    queryKey: publicUserQueryKeys.profile(id),
    queryFn: () => apiGet<PublicUserProfile>({ path: '/users/' + id + '/public-profile' }),
    enabled: id.length > 0,
  });
}
