import type { CommonResponse } from '../common/api.types';

export interface Category {
  categoryId: string;
  name: string;
}

export type GetCategoryResponse = CommonResponse<Category[]>;
