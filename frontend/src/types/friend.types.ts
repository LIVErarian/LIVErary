
import type { CommonResponse } from './api.types';

export type FriendRelationStatus =
    | 'NONE'
    | 'FRIEND'
    | 'PENDING_SENT'
    | 'PENDING_RECEIVED'
    | 'BLOCKED_BY_ME'
    | 'MYSELF';

export type FriendStatus = 'PENDING' | 'ACCEPTED' | 'BLOCKED';

export interface UserSearchRequest {
    email: string;
}

export interface UserSearchResponse {
    userId: string;
    email: string;
    nickname: string;
    relationStatus: FriendRelationStatus;
}

export interface FriendResponse {
    friendId: string;
    email: string;
    nickname: string;
    status: FriendStatus;
}

export interface FriendRequest {
    receiverEmail: string;
}
