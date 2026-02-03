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
