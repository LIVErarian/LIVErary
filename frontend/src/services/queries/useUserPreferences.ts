import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { userApi } from '@/api/user.api';
import { useModalStore } from '@/store/useModalStore';

import type { CommonResponse } from '@/types/api.types';
import type { UserPreferencesRequest } from '@/types/user.types';

export const useSavePreferences = () => {
  const queryClient = useQueryClient();
  const { openModal } = useModalStore();

  return useMutation<
    void,
    AxiosError<CommonResponse<null>>,
    UserPreferencesRequest
  >({
    // 최초 로그인 온보딩에서 선택한 선호 카테고리를 저장한다.
    mutationFn: (req) => userApi.savePreferences(req),
    onSuccess: () => {
      // 내 프로필 정보 갱신 (선호 카테고리 업데이트 반영)
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
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
