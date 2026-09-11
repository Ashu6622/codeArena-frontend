import { useMutation, useQuery } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api-client';
import type { ProblemDifficulty, ProblemLanguage } from '@/features/problems/problems-api';
import type { RunCodeResult, RunVerdict } from '@/features/execution/run-code-api';

export type SubmitCodeRequest = {
  problemSlug: string;
  language: ProblemLanguage;
  code: string;
};

export type SubmissionStatus = 'RUNNING' | 'COMPLETED' | 'FAILED';

export type SubmissionProblem = {
  id: string;
  title: string;
  slug: string;
  difficulty: ProblemDifficulty;
  timeLimitMs?: number;
  memoryLimitMb?: number;
};

export type SubmissionListItem = {
  id: string;
  language: ProblemLanguage;
  status: SubmissionStatus;
  verdict: RunVerdict | null;
  runtimeMs: number | null;
  memoryKb: number | null;
  createdAt: string;
  completedAt: string | null;
  problem: SubmissionProblem;
};

export type SubmissionsListResponse = {
  items: SubmissionListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type SubmissionDetail = SubmissionListItem & {
  sourceCode: string;
  compileOutput: string | null;
  runtimeError: string | null;
  problem: Required<SubmissionProblem>;
};

export type SubmitCodeResponse = {
  submission: {
    id: string;
    status: SubmissionStatus;
    verdict: RunVerdict | null;
    runtimeMs: number | null;
    memoryKb: number | null;
    runtimeError: string | null;
    createdAt: string;
    completedAt: string | null;
  };
  problem: {
    id: string;
    title: string;
    slug: string;
    language: ProblemLanguage;
  };
  verdict: RunVerdict;
  passed: boolean;
  passedCount: number;
  totalCount: number;
  sampleResults: RunCodeResult[];
  hiddenResults: {
    passedCount: number;
    totalCount: number;
  };
};

export const submissionsQueryKeys = {
  all: ['submissions'] as const,
  list: (problemSlug?: string) =>
    [...submissionsQueryKeys.all, 'list', problemSlug ?? 'all'] as const,
  detail: (id: string) => [...submissionsQueryKeys.all, 'detail', id] as const,
};

export function useSubmitCode() {
  return useMutation({
    mutationFn: (body: SubmitCodeRequest) =>
      apiPost<SubmitCodeResponse, SubmitCodeRequest>('/submissions', body),
  });
}

export function useSubmissions(problemSlug?: string) {
  return useQuery({
    queryKey: submissionsQueryKeys.list(problemSlug),
    queryFn: () =>
      apiGet<SubmissionsListResponse>({
        path: '/submissions',
        query: { limit: 20, problemSlug },
      }),
  });
}

export function useSubmission(id: string) {
  return useQuery({
    queryKey: submissionsQueryKeys.detail(id),
    queryFn: () => apiGet<SubmissionDetail>({ path: '/submissions/' + id }),
    enabled: id.length > 0,
  });
}
