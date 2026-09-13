import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-client';

export type LeaderboardEntry = {
  rank: number;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  solvedCount: number;
  acceptedSubmissionCount: number;
  latestAcceptedAt: string;
};

export type LeaderboardResponse = {
  items: LeaderboardEntry[];
  totalRankedUsers: number;
  generatedAt: string;
};

export const leaderboardQueryKeys = {
  all: ['leaderboard'] as const,
  list: (limit: number) => [...leaderboardQueryKeys.all, { limit }] as const,
};

export function useLeaderboard(limit = 50) {
  return useQuery({
    queryKey: leaderboardQueryKeys.list(limit),
    queryFn: () => apiGet<LeaderboardResponse>({ path: '/leaderboard', query: { limit } }),
  });
}
