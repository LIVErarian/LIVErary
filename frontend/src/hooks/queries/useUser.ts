import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { userApi } from '@/api/user.api';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * 유저 정보 받아오기
 * @returns userId, email, nickname, role, totalReadingTime, bookCounts
 */
export const useGetMyProfile = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { data, isSuccess, isError, isLoading } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: userApi.getMyProfile,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isSuccess && data) {
      setUser(data);
    }
  }, [isSuccess, data, setUser]);

  return { data, isSuccess, isError, isLoading };
};

/**
 * 타인 프로필 조회 Hook
 * @param userId - 조회할 사용자 ID (undefined면 쿼리 실행 안 함)
 * @returns 타인 프로필 정보 (관계 상태 포함)
 */
export const useOtherProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user', 'profile', userId],
    queryFn: () => userApi.getOtherProfile(userId!),
    enabled: !!userId, // userId가 있을 때만 실행
  });
};
