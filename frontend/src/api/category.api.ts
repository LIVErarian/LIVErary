import { api } from './axios';

import type {
  Category,
  GetCategoryResponse,
} from '@/types/entities/category.types';

export const categoryApi = {
  /**
   * [GET] 카테고리 목록 조회
   * @returns
   */
  getCategoryList: async (): Promise<Category[]> => {
    const { data } = await api.get<GetCategoryResponse>('/category');

    if (!data.data) return [];

    return data.data;
  },
};
