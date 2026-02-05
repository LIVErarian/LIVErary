import { api } from './axios';

import type {
  ApplyScheduledRoomRequest,
  ApplyScheduledRoomResponse,
  ApplyScheduledRoomResponseData,
  CreateRoomRequest,
  CreateRoomResponse,
  CreateRoomResponseData,
  DeleteApplyScheduledRequest,
  DeleteApplyScheduledResponse,
  DeleteScheduledRoomRequest,
  DeleteScheduledRoomResponse,
  GetLiveRoomListRequest,
  GetRecommendedRoomResponse,
  GetReservationRoomListRequest,
  GetRoomDetailRequest,
  GetRoomDetailResponse,
  GetRoomDetailResponseData,
  GetRoomListResponse,
  GetRoomSearchRequest,
  GetRoomSearchResponse,
  JoinRoomRequest,
  JoinRoomResponse,
  JoinRoomResponseData,
  LeaveRoomRequest,
  LeaveRoomResponse,
  MyScheduledRoomResponse,
  MyScheduledRoomResponseData,
  PatchScheduledRoomRequest,
  PatchScheduledRoomResponse,
  PatchScheduledRoomResponseData,
  RECOMMENDED_ROOM,
  ROOM_DETAIL,
} from '@/types/room.types';

export const roomApi = {
  /**
   * [GET] 라이브 방 목록 조회
   */
  getLiveRoomList: async (
    req: GetLiveRoomListRequest,
  ): Promise<GetRoomListResponse['data']> => {
    const { data } = await api.get<GetRoomListResponse>('/room/live', {
      params: req,
    });
    if (!data.data) throw new Error('라이브 방 목록을 불러오지 못했습니다.');
    return data.data;
  },

  /**
   * [GET] 예약된 방 목록 조회
   */
  getReservationRoomList: async (
    req: GetReservationRoomListRequest,
  ): Promise<GetRoomListResponse['data']> => {
    const { data } = await api.get<GetRoomListResponse>('/room/reservation', {
      params: req,
    });
    if (!data.data) throw new Error('예약 방 목록을 불러오지 못했습니다.');
    return data.data;
  },

  /**
   * [GET] 방 코드로 검색 (추가됨)
   */
  searchRoom: async (req: GetRoomSearchRequest): Promise<ROOM_DETAIL> => {
    const { data } = await api.get<GetRoomSearchResponse>('/room/search', {
      params: req, // ?code=...
    });
    if (!data.data) throw new Error('해당 코드로 방을 찾을 수 없습니다.');
    return data.data;
  },

  /**
   * [GET] 내 예약 목록 조회
   */
  getMyScheduledRooms: async (): Promise<MyScheduledRoomResponseData[]> => {
    const { data } = await api.get<MyScheduledRoomResponse>(
      '/room/reservation/my',
    );
    if (!data.data) return [];
    return data.data;
  },

  /**
   * [GET] 추천 방 목록 조회
   */
  getRecommendedRooms: async (
    categoryId?: string,
  ): Promise<RECOMMENDED_ROOM[]> => {
    const { data } = await api.get<GetRecommendedRoomResponse>(
      '/room/recommend',
      {
        params: { categoryId },
      },
    );
    if (!data.data) return [];
    return data.data;
  },

  /**
   * [GET] 방 상세 정보 조회
   */
  getRoomDetail: async (
    req: GetRoomDetailRequest,
  ): Promise<GetRoomDetailResponseData> => {
    const { data } = await api.get<GetRoomDetailResponse>(
      `/room/${req.roomId}`,
    );
    if (!data.data) throw new Error('방 상세 정보를 불러오지 못했습니다.');
    return data.data;
  },

  /**
   * [POST] 방 생성
   */
  createRoom: async (
    req: CreateRoomRequest,
  ): Promise<CreateRoomResponseData> => {
    const { data } = await api.post<CreateRoomResponse>('/room', req);
    if (!data.data) throw new Error('방 생성에 실패했습니다.');
    return data.data;
  },

  /**
   * [POST] 방 참여
   */
  joinRoom: async (
    roomId: string,
    req: JoinRoomRequest,
  ): Promise<JoinRoomResponseData> => {
    const { data } = await api.post<JoinRoomResponse>(
      `/room/${roomId}/join`,
      req,
    );
    if (!data.data) throw new Error('방 참여에 실패했습니다.');
    return data.data;
  },

  /**
   * [POST] 방 퇴장
   */
  leaveRoom: async (req: LeaveRoomRequest): Promise<string> => {
    const { data } = await api.post<LeaveRoomResponse>(
      `/room/${req.roomId}/leave`,
    );
    return data.message;
  },

  /**
   * [POST] 예약된 방 참여 신청
   */
  applyScheduledRoom: async (
    req: ApplyScheduledRoomRequest,
  ): Promise<ApplyScheduledRoomResponseData> => {
    const { data } = await api.post<ApplyScheduledRoomResponse>(
      `/room/reservation/${req.roomId}/apply`,
    );
    if (!data.data) throw new Error('방 참여 신청에 실패했습니다.');
    return data.data;
  },

  /**
   * [DELETE] 예약된 방 참여 취소
   */
  deleteApplyScheduledRoom: async (
    req: DeleteApplyScheduledRequest,
  ): Promise<string> => {
    const { data } = await api.delete<DeleteApplyScheduledResponse>(
      `/room/reservation/${req.roomId}/apply`,
    );
    return data.message;
  },

  /**
   * [PATCH] 방 예약 정보 수정
   */
  patchScheduledRoom: async (
    req: PatchScheduledRoomRequest,
  ): Promise<PatchScheduledRoomResponseData> => {
    const { roomId, ...body } = req;
    const { data } = await api.patch<PatchScheduledRoomResponse>(
      `/room/reservation/${roomId}`,
      body,
    );
    if (!data.data) throw new Error('방 정보 수정에 실패했습니다.');
    return data.data;
  },

  /**
   * [DELETE] 예약된 방 삭제 (취소)
   */
  deleteScheduledRoom: async (
    req: DeleteScheduledRoomRequest,
  ): Promise<string> => {
    const { data } = await api.delete<DeleteScheduledRoomResponse>(
      `/room/reservation/${req.roomId}`,
    );
    return data.message;
  },
};
