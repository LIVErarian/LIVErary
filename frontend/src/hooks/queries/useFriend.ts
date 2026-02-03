import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { friendApi } from '@/api/friend.api';
import { useModalStore } from '@/store/useModalStore';

import type { CommonResponse } from '@/types/api.types';
import type { FriendRequest, UserSearchRequest } from '@/types/friend.types';

export const FRIEND_KEYS = {
  all: ['friends'] as const,
  accepted: (page: number, size: number) =>
    [...FRIEND_KEYS.all, 'accepted', { page, size }] as const,
  requests: (page: number, size: number) =>
    [...FRIEND_KEYS.all, 'requests', { page, size }] as const,
  blocked: (page: number, size: number) =>
    [...FRIEND_KEYS.all, 'blocked', { page, size }] as const,
};

/**
 * 사용자 검색 Hook
 * 이메일로 사용자를 검색하고 관계 상태를 확인
 * @returns 검색 mutation
 */
export const useSearchUser = () => {
  const { openError } = useModalStore();

  return useMutation({
    mutationFn: (req: UserSearchRequest) => friendApi.searchUser(req),
    onError: (error: AxiosError<CommonResponse<null>>) => {
      console.error('유저 검색 실패:', error);
      openError({
        message:
          error.response?.data?.message || '사용자를 찾는 데 실패했습니다.',
      });
    },
  });
};

/**
 * 친구 요청 전송 Hook
 * 특정 사용자에게 친구 요청을 전송
 * @returns 친구 요청 mutation
 */
export const useRequestFriend = () => {
  const { openError } = useModalStore();

  return useMutation({
    mutationFn: (req: FriendRequest) => friendApi.requestFriend(req),
    onSuccess: () => {
      alert('친구 요청을 보냈습니다.');
    },
    onError: (error: AxiosError<CommonResponse<null>>) => {
      console.error('친구 요청 전송 실패:', error);
      openError({
        message:
          error.response?.data?.message || '친구 요청 전송에 실패했습니다.',
      });
    },
  });
};

/**
 * 친구 목록 조회 Hook (ACCEPTED 상태)
 * @param page - 페이지 번호 (default: 0)
 * @param size - 페이지 크기 (default: 10)
 * @returns 친구 목록 query
 */
export const useFriendList = (page = 0, size = 10) => {
  return useQuery({
    queryKey: FRIEND_KEYS.accepted(page, size),
    queryFn: () => friendApi.getFriendList(page, size),
    placeholderData: keepPreviousData,
  });
};

/**
 * 받은 친구 요청 목록 조회 Hook (PENDING 상태)
 * @param page - 페이지 번호 (default: 0)
 * @param size - 페이지 크기 (default: 10)
 * @returns 친구 요청 목록 query
 */
export const usePendingFriendList = (page = 0, size = 10) => {
  return useQuery({
    queryKey: FRIEND_KEYS.requests(page, size),
    queryFn: () => friendApi.getPendingFriendList(page, size),
    placeholderData: keepPreviousData,
  });
};

/**
 * 차단한 사용자 목록 조회 Hook (BLOCKED 상태)
 * @param page - 페이지 번호 (default: 0)
 * @param size - 페이지 크기 (default: 10)
 * @returns 차단 목록 query
 */
export const useBlockedList = (page = 0, size = 10) => {
  return useQuery({
    queryKey: FRIEND_KEYS.blocked(page, size),
    queryFn: () => friendApi.getBlockedList(page, size),
    placeholderData: keepPreviousData,
  });
};

/**
 * 친구 요청 수락 Hook
 * 받은 친구 요청을 수락하고 친구 목록 갱신
 * @returns 친구 수락 mutation
 */
export const useAcceptFriend = () => {
  const queryClient = useQueryClient();
  const { openError } = useModalStore();

  return useMutation({
    mutationFn: (friendId: string) => friendApi.acceptFriend(friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FRIEND_KEYS.all });
    },
    onError: (error: AxiosError<CommonResponse<null>>) => {
      console.error('친구 수락 실패:', error);
      openError({
        message: error.response?.data?.message || '친구 수락에 실패했습니다.',
      });
    },
  });
};

/**
 * 친구 요청 거절 Hook
 * 받은 친구 요청을 거절하고 목록에서 제거
 * @returns 친구 거절 mutation
 */
export const useRejectFriend = () => {
  const queryClient = useQueryClient();
  const { openError } = useModalStore();

  return useMutation({
    mutationFn: (friendId: string) => friendApi.rejectFriend(friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FRIEND_KEYS.all });
    },
    onError: (error: AxiosError<CommonResponse<null>>) => {
      console.error('친구 거절 실패:', error);
      openError({
        message: error.response?.data?.message || '친구 거절에 실패했습니다.',
      });
    },
  });
};

/**
 * 사용자 차단 Hook
 * 특정 사용자를 차단하고 모든 친구 목록 갱신
 * @returns 사용자 차단 mutation
 */
export const useBlockUser = () => {
  const queryClient = useQueryClient();
  const { openError } = useModalStore();

  return useMutation({
    mutationFn: (email: string) => friendApi.blockUser(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FRIEND_KEYS.all });
      alert('사용자를 차단했습니다.');
    },
    onError: (error: AxiosError<CommonResponse<null>>) => {
      console.error('사용자 차단 실패:', error);
      openError({
        message: error.response?.data?.message || '사용자 차단에 실패했습니다.',
      });
    },
  });
};

/**
 * 사용자 차단 해제 Hook
 * 차단한 사용자를 해제하고 모든 친구 목록 갱신
 * @returns 사용자 차단 해제 mutation
 */
export const useUnblockUser = () => {
  const queryClient = useQueryClient();
  const { openError } = useModalStore();

  return useMutation({
    mutationFn: (email: string) => friendApi.unblockUser(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FRIEND_KEYS.all });
      alert('차단을 해제했습니다.');
    },
    onError: (error: AxiosError<CommonResponse<null>>) => {
      console.error('차단 해제 실패:', error);
      openError({
        message: error.response?.data?.message || '차단 해제에 실패했습니다.',
      });
    },
  });
};
