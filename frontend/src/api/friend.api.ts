import { api } from './axios';

import type {
    FriendRequest,
    FriendRequestResponse,
    UserSearchRequest,
    UserSearchResponse,
} from '@/types/friend.types';

export const friendApi = {
    /**
     * 유저 검색
     * @param req 검색할 유저 이메일 (UserSearchRequest)
     * @returns 유저 정보 (userId, email, nickname, relationStatus)
     */
    searchUser: async (req: UserSearchRequest): Promise<UserSearchResponse['data']> => {
        const { data } = await api.get<UserSearchResponse>('/friend/search', {
            params: req,
        });

        if (!data.data) {
            throw new Error('검색된 유저가 존재하지 않습니다.');
        }

        return data.data;
    },

    /**
     * 친구 요청 전송
     * @param req 받는 사람 이메일
     */
    requestFriend: async (req: FriendRequest): Promise<FriendRequestResponse['data']> => {
        const { data } = await api.post<FriendRequestResponse>('/friend/request', req);
        return data.data;
    },
};
