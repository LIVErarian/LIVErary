import { useQuery } from '@tanstack/react-query';

import { categoryApi } from '@/api/category.api';

// Query Keys (읽기 전용)
export const categoryKeys = {
  all: ['categories'] as const,
  list: () => [...categoryKeys.all, 'list'] as const,
};

/**
 * 카테고리 목록 받아오기
 */
export const useCategoryList = (enabled = true) => {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: categoryApi.getCategoryList,
    enabled,
    staleTime: 1000 * 60 * 60 * 24, // 24시간
  });
};
