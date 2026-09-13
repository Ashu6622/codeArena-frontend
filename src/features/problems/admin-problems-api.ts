import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch, apiPost } from '@/lib/api-client';
import type { ProblemDifficulty, ProblemLanguage, ProblemTag } from './problems-api';

export type AdminProblemLanguageRequest = {
  language: ProblemLanguage;
  starterCode: string;
  functionSignature?: string;
  executionTemplate?: string;
};

export type AdminProblemTestCaseRequest = {
  input: string;
  expectedOutput: string;
  isSample: boolean;
  order?: number;
};

export type CreateProblemTestCaseRequest = AdminProblemTestCaseRequest;

export type CreateProblemRequest = {
  title: string;
  slug: string;
  description: string;
  difficulty: ProblemDifficulty;
  timeLimitMs: number;
  memoryLimitMb: number;
  isPublished: boolean;
  tagSlugs: string[];
  languages: AdminProblemLanguageRequest[];
  testCases: AdminProblemTestCaseRequest[];
};

export type UpdateProblemRequest = Partial<CreateProblemRequest>;

export type AdminProblemMutationResponse = {
  id: string;
  title: string;
  slug: string;
  difficulty: ProblemDifficulty;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
  languages: ProblemLanguage[];
  tags: ProblemTag[];
  testCaseCount: number;
  sampleTestCaseCount: number;
  hiddenTestCaseCount: number;
};

export type CreateProblemResponse = AdminProblemMutationResponse;

export type AdminProblemListItem = {
  id: string;
  title: string;
  slug: string;
  difficulty: ProblemDifficulty;
  timeLimitMs: number;
  memoryLimitMb: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  languages: ProblemLanguage[];
  tags: ProblemTag[];
  testCaseCount: number;
  submissionCount: number;
};

export type AdminProblemsListResponse = {
  items: AdminProblemListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AdminProblemDetail = {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: ProblemDifficulty;
  timeLimitMs: number;
  memoryLimitMb: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  languages: AdminProblemLanguageRequest[];
  tags: ProblemTag[];
  testCases: Array<AdminProblemTestCaseRequest & { id: string }>;
};

export type AdminProblemsQuery = {
  page?: number;
  limit?: number;
  difficulty?: ProblemDifficulty;
  language?: ProblemLanguage;
  tag?: string;
  isPublished?: boolean;
  search?: string;
};

export const adminProblemsQueryKeys = {
  all: ['admin', 'problems'] as const,
  list: (query: AdminProblemsQuery) => [...adminProblemsQueryKeys.all, 'list', query] as const,
  detail: (slug: string) => [...adminProblemsQueryKeys.all, 'detail', slug] as const,
};

export function useAdminProblems(query: AdminProblemsQuery = {}) {
  return useQuery({
    queryKey: adminProblemsQueryKeys.list(query),
    queryFn: () => apiGet<AdminProblemsListResponse>({ path: '/admin/problems', query }),
  });
}

export function useAdminProblem(slug: string) {
  return useQuery({
    queryKey: adminProblemsQueryKeys.detail(slug),
    queryFn: () => apiGet<AdminProblemDetail>({ path: '/admin/problems/' + slug }),
    enabled: slug.length > 0,
  });
}

export function useCreateProblem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateProblemRequest) =>
      apiPost<AdminProblemMutationResponse, CreateProblemRequest>('/admin/problems', body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminProblemsQueryKeys.all });
    },
  });
}

export function useUpdateProblem(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateProblemRequest) =>
      apiPatch<AdminProblemMutationResponse, UpdateProblemRequest>('/admin/problems/' + slug, body),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: adminProblemsQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: adminProblemsQueryKeys.detail(slug) });
      void queryClient.invalidateQueries({ queryKey: adminProblemsQueryKeys.detail(data.slug) });
    },
  });
}

export function useArchiveProblem(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiPatch<AdminProblemMutationResponse, Record<string, never>>(
        '/admin/problems/' + slug + '/archive',
        {},
      ),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: adminProblemsQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: adminProblemsQueryKeys.detail(slug) });
      void queryClient.invalidateQueries({ queryKey: adminProblemsQueryKeys.detail(data.slug) });
    },
  });
}
