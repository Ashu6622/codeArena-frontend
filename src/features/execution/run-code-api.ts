import { useMutation } from '@tanstack/react-query';
import { apiPost } from '@/lib/api-client';
import type { ProblemLanguage } from '@/features/problems/problems-api';

export type RunVerdict =
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'TIME_LIMIT_EXCEEDED'
  | 'RUNTIME_ERROR'
  | 'COMPILE_ERROR'
  | 'INTERNAL_ERROR';

export type RunCodeRequest = {
  problemSlug: string;
  language: ProblemLanguage;
  code: string;
};

export type RunCodeResult = {
  testCaseId: string;
  order: number;
  passed: boolean;
  verdict: RunVerdict;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  error?: string;
  runtimeMs: number;
};

export type RunCodeResponse = {
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
  runtimeMs: number;
  results: RunCodeResult[];
};

export function useRunCode() {
  return useMutation({
    mutationFn: (body: RunCodeRequest) => apiPost<RunCodeResponse, RunCodeRequest>('/run', body),
  });
}
