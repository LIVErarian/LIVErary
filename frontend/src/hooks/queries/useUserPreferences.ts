import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { userApi } from '@/api/user.api';
import { useModalStore } from '@/store/useModalStore';

import type { CommonResponse } from '@/types/api.types';
import type { UserPreferencesRequest } from '@/types/user.types';

export const useSavePreferences = () => {
  const { openModal } = useModalStore();

  return useMutation<
    void,
    AxiosError<CommonResponse<null>>,
    UserPreferencesRequest
  >({
    // 최초 로그인 온보딩에서 선택한 선호 카테고리를 저장한다.
    mutationFn: (req) => userApi.savePreferences(req),
    onError: (error) => {
      console.error(
        '선호 카테고리 저장 실패:',
        error.response?.data?.message || error.message,
      );
      openModal('error', {
        message:
          error.response?.data?.message || '선호 카테고리 저장에 실패했습니다.',
      });
    },
  });
};
