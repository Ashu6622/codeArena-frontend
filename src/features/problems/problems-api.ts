import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api-client';

export type ProblemDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type ProblemLanguage = 'JAVASCRIPT' | 'PYTHON';
export type ProblemProgressStatus = 'SOLVED' | 'ATTEMPTED' | 'NOT_STARTED';

export type ProblemTag = {
  id: string;
  name: string;
  slug: string;
};

export type ProblemListItem = {
  id: string;
  title: string;
  slug: string;
  difficulty: ProblemDifficulty;
  timeLimitMs: number;
  memoryLimitMb: number;
  languages: ProblemLanguage[];
  tags: ProblemTag[];
  progressStatus?: ProblemProgressStatus;
  isBookmarked?: boolean;
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
  tags: ProblemTag[];
  progressStatus?: ProblemProgressStatus;
  testCases: ProblemSampleTestCase[];
  isBookmarked?: boolean;
};

export type ProblemComment = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string | null };
};

export type ProblemCommentsResponse = {
  problem: { id: string; title: string; slug: string };
  items: ProblemComment[];
};

export type CreateProblemCommentRequest = {
  content: string;
};

export type CreateProblemCommentResponse = {
  problem: { id: string; title: string; slug: string };
  comment: ProblemComment;
};

export type ProblemBookmarkResponse = {
  problem: { id: string; title: string; slug: string };
  isBookmarked: boolean;
  bookmark?: { id: string; createdAt: string };
};

export type ProblemNote = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type ProblemNoteResponse = {
  problem: { id: string; title: string; slug: string };
  note: ProblemNote | null;
};

export type UpsertProblemNoteRequest = {
  content: string;
};

export type ProblemsQuery = {
  page?: number;
  limit?: number;
  difficulty?: ProblemDifficulty;
  language?: ProblemLanguage;
  tag?: string;
  progressStatus?: ProblemProgressStatus;
  bookmarked?: boolean;
  search?: string;
};

export const problemsQueryKeys = {
  all: ['problems'] as const,
  list: (query: ProblemsQuery) => [...problemsQueryKeys.all, 'list', query] as const,
  detail: (slug: string) => [...problemsQueryKeys.all, 'detail', slug] as const,
  note: (slug: string) => [...problemsQueryKeys.all, 'note', slug] as const,
  comments: (slug: string) => [...problemsQueryKeys.all, 'comments', slug] as const,
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

export function useProblemNote(slug: string) {
  return useQuery({
    queryKey: problemsQueryKeys.note(slug),
    queryFn: () => apiGet<ProblemNoteResponse>({ path: '/problems/' + slug + '/note' }),
    enabled: slug.length > 0,
    retry: false,
  });
}

export function useUpsertProblemNote(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpsertProblemNoteRequest) =>
      apiPut<ProblemNoteResponse, UpsertProblemNoteRequest>('/problems/' + slug + '/note', body),
    onSuccess: (data) => {
      queryClient.setQueryData(problemsQueryKeys.note(slug), data);
    },
  });
}

export function useBookmarkProblem(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiPut<ProblemBookmarkResponse, Record<string, never>>('/problems/' + slug + '/bookmark', {}),
    onSuccess: (data) => {
      queryClient.setQueryData<ProblemDetail | undefined>(
        problemsQueryKeys.detail(slug),
        (problem) => (problem ? { ...problem, isBookmarked: data.isBookmarked } : problem),
      );
      queryClient.invalidateQueries({ queryKey: [...problemsQueryKeys.all, 'list'] });
    },
  });
}

export function useUnbookmarkProblem(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiDelete<ProblemBookmarkResponse>('/problems/' + slug + '/bookmark'),
    onSuccess: (data) => {
      queryClient.setQueryData<ProblemDetail | undefined>(
        problemsQueryKeys.detail(slug),
        (problem) => (problem ? { ...problem, isBookmarked: data.isBookmarked } : problem),
      );
      queryClient.invalidateQueries({ queryKey: [...problemsQueryKeys.all, 'list'] });
    },
  });
}

export function useProblemComments(slug: string) {
  return useQuery({
    queryKey: problemsQueryKeys.comments(slug),
    queryFn: () => apiGet<ProblemCommentsResponse>({ path: '/problems/' + slug + '/comments' }),
    enabled: slug.length > 0,
  });
}

export function useCreateProblemComment(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateProblemCommentRequest) =>
      apiPost<CreateProblemCommentResponse, CreateProblemCommentRequest>(
        '/problems/' + slug + '/comments',
        body,
      ),
    onSuccess: (data) => {
      queryClient.setQueryData<ProblemCommentsResponse | undefined>(
        problemsQueryKeys.comments(slug),
        (current) =>
          current
            ? { ...current, items: [data.comment, ...current.items] }
            : { problem: data.problem, items: [data.comment] },
      );
    },
  });
}
