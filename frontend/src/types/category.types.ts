import type { CommonResponse } from './api.types';

export interface Category {
  categoryId: string;
  name: string;
}

export type GetCategoryResponse = CommonResponse<Category[]>;
