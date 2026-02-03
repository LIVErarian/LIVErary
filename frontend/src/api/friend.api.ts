import { api } from './axios';

import type {
  FriendActionResponse,
  FriendListResponse,
  FriendRequest,
  UserSearchRequest,
  UserSearchResponse,
} from '@/types/friend.types';

export const friendApi = {
  searchUser: async (
    req: UserSearchRequest,
  ): Promise<UserSearchResponse['data']> => {
    const { data } = await api.get<UserSearchResponse>('/friend/search', {
      params: req,
    });

    if (!data.data) {
      throw new Error('검색된 유저가 존재하지 않습니다.');
    }

    return data.data;
  },

  requestFriend: async (
    req: FriendRequest,
  ): Promise<FriendActionResponse['data']> => {
    const { data } = await api.post<FriendActionResponse>(
      '/friend/request',
      req,
    );
    return data.data;
  },

  getFriendList: async (
    page = 0,
    size = 10,
  ): Promise<FriendListResponse['data']> => {
    const { data } = await api.get<FriendListResponse>('/friend/accepts', {
      params: { page, size },
    });
    return data.data;
  },

  getPendingFriendList: async (
    page = 0,
    size = 10,
  ): Promise<FriendListResponse['data']> => {
    const { data } = await api.get<FriendListResponse>('/friend/requests', {
      params: { page, size },
    });
    return data.data;
  },

  acceptFriend: async (
    friendId: string,
  ): Promise<FriendActionResponse['data']> => {
    const { data } = await api.patch<FriendActionResponse>(
      `/friend/${friendId}/accept`,
    );
    return data.data;
  },

  rejectFriend: async (
    friendId: string,
  ): Promise<FriendActionResponse['data']> => {
    const { data } = await api.delete<FriendActionResponse>(
      `/friend/${friendId}/reject`,
    );
    return data.data;
  },
};
