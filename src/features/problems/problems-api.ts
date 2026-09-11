import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-client';

export type ProblemDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type ProblemLanguage = 'JAVASCRIPT' | 'PYTHON';

export type ProblemListItem = {
  id: string;
  title: string;
  slug: string;
  difficulty: ProblemDifficulty;
  timeLimitMs: number;
  memoryLimitMb: number;
  languages: ProblemLanguage[];
};

export type ProblemsListResponse = {
  items: ProblemListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ProblemLanguageConfig = {
  language: ProblemLanguage;
  starterCode: string;
  functionSignature: string;
};

export type ProblemSampleTestCase = {
  id: string;
  input: string;
  expectedOutput: string;
  order: number;
};

export type ProblemDetail = {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: ProblemDifficulty;
  timeLimitMs: number;
  memoryLimitMb: number;
  languages: ProblemLanguageConfig[];
  testCases: ProblemSampleTestCase[];
};

export type ProblemsQuery = {
  page?: number;
  limit?: number;
  difficulty?: ProblemDifficulty;
  language?: ProblemLanguage;
  search?: string;
};

export const problemsQueryKeys = {
  all: ['problems'] as const,
  list: (query: ProblemsQuery) => [...problemsQueryKeys.all, 'list', query] as const,
  detail: (slug: string) => [...problemsQueryKeys.all, 'detail', slug] as const,
};

export function useProblems(query: ProblemsQuery = {}) {
  return useQuery({
    queryKey: problemsQueryKeys.list(query),
    queryFn: () => apiGet<ProblemsListResponse>({ path: '/problems', query }),
  });
}

export function useProblem(slug: string) {
  return useQuery({
    queryKey: problemsQueryKeys.detail(slug),
    queryFn: () => apiGet<ProblemDetail>({ path: '/problems/' + slug }),
    enabled: slug.length > 0,
  });
}
