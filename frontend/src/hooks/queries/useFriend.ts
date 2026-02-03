import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { friendApi } from '@/api/friend.api';
import { useModalStore } from '@/store/useModalStore';

import type { CommonResponse } from '@/types/api.types';
import type {
    FriendRequest,
    UserSearchRequest,
} from '@/types/friend.types';

// Query Keys
export const FRIEND_KEYS = {
    all: ['friends'] as const,
    accepted: () => [...FRIEND_KEYS.all, 'accepted'] as const,
    requests: () => [...FRIEND_KEYS.all, 'requests'] as const,
    blocked: () => [...FRIEND_KEYS.all, 'blocked'] as const,
};

/**
 * 유저 검색 Hook
 */
export const useSearchUser = () => {
    const { openModal } = useModalStore();

    return useMutation({
        mutationFn: (req: UserSearchRequest) => friendApi.searchUser(req),
        onError: (error: AxiosError<CommonResponse<null>>) => {
            console.error('유저 검색 실패:', error);
            openModal('error', {
                message:
                    error.response?.data?.message || '사용자를 찾는 데 실패했습니다.',
            });
        },
    });
};

/**
 * 친구 요청 Hook
 */
export const useRequestFriend = () => {
    const { openModal } = useModalStore();

    return useMutation({
        mutationFn: (req: FriendRequest) => friendApi.requestFriend(req),
        onSuccess: () => {
            alert('친구 요청을 보냈습니다.');
        },
        onError: (error: AxiosError<CommonResponse<null>>) => {
            console.error('친구 요청 전송 실패:', error);
            openModal('error', {
                message:
                    error.response?.data?.message || '친구 요청 전송에 실패했습니다.',
            });
        },
    });
};
