import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch, apiPost } from '@/lib/api-client';

export type AdminTag = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  problemCount: number;
};

export type AdminTagsResponse = {
  items: AdminTag[];
};

export type CreateTagRequest = {
  name: string;
  slug?: string;
};

export type UpdateTagRequest = Partial<CreateTagRequest>;

export const adminTagsQueryKeys = {
  all: ['admin', 'tags'] as const,
  list: () => [...adminTagsQueryKeys.all, 'list'] as const,
};

export function useAdminTags() {
  return useQuery({
    queryKey: adminTagsQueryKeys.list(),
    queryFn: () => apiGet<AdminTagsResponse>({ path: '/admin/tags' }),
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTagRequest) =>
      apiPost<AdminTag, CreateTagRequest>('/admin/tags', body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminTagsQueryKeys.all });
    },
  });
}

export function useUpdateTag(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateTagRequest) =>
      apiPatch<AdminTag, UpdateTagRequest>('/admin/tags/' + slug, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminTagsQueryKeys.all });
    },
  });
}
