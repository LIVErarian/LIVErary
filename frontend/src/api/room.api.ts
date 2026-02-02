// src/api/room.api.ts
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
  GetRoomDetailRequest,
  GetRoomDetailResponse,
  GetRoomDetailResponseData,
  GetRoomListRequest,
  GetRoomListResponse,
  GetScheduledRoomResponse,
  GetScheduledRoomResponseData,
  JoinRoomRequest,
  JoinRoomResponse,
  JoinRoomResponseData,
  LeaveRoomRequest,
  LeaveRoomResponse,
  PatchScheduledRoomRequest,
  PatchScheduledRoomResponse,
  PatchScheduledRoomResponseData,
} from '@/types/room.types';

export const roomApi = {
  /**
   * [GET] 방 검색
   * @param req roomType, keyword, page, size, sort
   * @returns
   */
  getRoomList: async (
    req: GetRoomListRequest,
  ): Promise<GetRoomListResponse['data']> => {
    const { data } = await api.get<GetRoomListResponse>('/api/room', {
      params: req,
    });

    if (!data.data) throw new Error('방 목록 데이터를 불러오지 못했습니다.');

    return data.data;
  },

  /**
   * [POST] 방 상세 정보 조회
   * @param req
   * @returns
   */
  getRoomDetail: async (
    req: GetRoomDetailRequest,
  ): Promise<GetRoomDetailResponseData> => {
    const { data } = await api.get<GetRoomDetailResponse>(
      `/api/room/${req.roomId}`,
    );

    if (!data.data) throw new Error('방 상세 정보를 불러오지 못했습니다.');

    return data.data;
  },

  /**
   * [POST] 방 만들기
   * @param req
   * @returns
   */
  createRoom: async (
    req: CreateRoomRequest,
  ): Promise<CreateRoomResponseData> => {
    const { data } = await api.post<CreateRoomResponse>('/api/room', req);

    if (!data.data) throw new Error('방 생성에 실패했습니다.');

    return data.data;
  },

  /**
   * [POST] 방 들어가기
   * @param req
   * @returns
   */
  joinRoom: async (req: JoinRoomRequest): Promise<JoinRoomResponseData> => {
    const { roomId, code } = req;
    const { data } = await api.post<JoinRoomResponse>(
      `/api/room/${roomId}/join`,
      {
        code,
      },
    );

    if (!data.data) throw new Error('방 입장에 실패했습니다.');

    return data.data;
  },

  /**
   * [POST] 방 떠나기
   * @param req
   * @returns
   */
  leaveRoom: async (req: LeaveRoomRequest): Promise<string> => {
    const { data } = await api.post<LeaveRoomResponse>(
      `/api/room/${req.roomId}/leave`,
    );
    // 응답 데이터가 없으면 빈 문자열 반환 (혹은 에러 처리)
    return data.data || '';
  },

  /**
   * [POST] 예약된 방 참여하기
   * @param req
   * @returns
   */
  applyScheduledRoom: async (
    req: ApplyScheduledRoomRequest,
  ): Promise<ApplyScheduledRoomResponseData> => {
    const { data } = await api.post<ApplyScheduledRoomResponse>(
      `/api/room/reservation/${req.roomId}/apply`,
    );

    if (!data.data) throw new Error('예약 참여 신청에 실패했습니다.');

    return data.data;
  },

  /**
   * [DELETE] 예약된 방 참여 취소
   * @param req
   * @returns
   */
  deleteApplyScheduledRoom: async (
    req: DeleteApplyScheduledRequest,
  ): Promise<string> => {
    const { data } = await api.delete<DeleteApplyScheduledResponse>(
      `/api/room/reservation/${req.roomId}/apply`,
    );
    return data.data || '';
  },

  /**
   * [PATCH] 방 예약 정보 수정
   * @param req
   * @returns
   */
  patchScheduledRoom: async (
    req: PatchScheduledRoomRequest,
  ): Promise<PatchScheduledRoomResponseData> => {
    const { roomId, ...body } = req;
    const { data } = await api.patch<PatchScheduledRoomResponse>(
      `/api/room/reservation/${roomId}`,
      body,
    );

    if (!data.data) throw new Error('방 정보 수정에 실패했습니다.');

    return data.data;
  },

  /**
   * [DELETE] 예약된 방 삭제 (취소)
   * @param req
   * @returns
   */
  deleteScheduledRoom: async (
    req: DeleteScheduledRoomRequest,
  ): Promise<string> => {
    const { data } = await api.delete<DeleteScheduledRoomResponse>(
      `/api/room/reservation/${req.roomId}`,
    );
    return data.data || '';
  },

  /**
   * [GET] 내 예약 목록 조회
   * @returns
   */
  getMyScheduledRooms: async (): Promise<GetScheduledRoomResponseData[]> => {
    const { data } = await api.get<GetScheduledRoomResponse>(
      '/api/room/reservation/my',
    );

    // 빈 배열이라도 올 수 있으니 null 체크만
    if (!data.data) return [];

    return data.data;
  },
};
