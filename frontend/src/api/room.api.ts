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
  GetRecommendedRoomResponse,
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
  RECOMMENDED_ROOM,
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
    const { data } = await api.get<GetRoomListResponse>('/room', {
      params: req,
    });

    if (!data.data) throw new Error('방 목록 데이터를 불러오지 못했습니다.');

    return data.data;
  },

  /**
   * [GET] 방 상세 정보 조회
   * @param req
   * @returns
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
   * [POST] 방 만들기
   * @param req
   * @returns
   */
  createRoom: async (
    req: CreateRoomRequest,
  ): Promise<CreateRoomResponseData> => {
    const { data } = await api.post<CreateRoomResponse>('/room', req);

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

    /**
     * 공개방은 code 없이 입장 가능하므로 빈 객체를 전송한다.
     * 비공개방은 code가 있을 때만 body에 포함한다.
     * (undefined를 그대로 보내지 않아 서버 DTO 검증 충돌을 줄임)
     */
    const payload = code ? { code } : {};
    const { data } = await api.post<JoinRoomResponse>(
      `/room/${roomId}/join`,
      payload,
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
      `/room/${req.roomId}/leave`,
    );
    return data.message;
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
      `/room/reservation/${req.roomId}/apply`,
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
      `/room/reservation/${req.roomId}/apply`,
    );
    return data.message;
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
      `/room/reservation/${roomId}`,
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
      `/room/reservation/${req.roomId}`,
    );
    return data.message;
  },

  /**
   * [GET] 내 예약 목록 조회
   * @returns
   */
  getMyScheduledRooms: async (): Promise<GetScheduledRoomResponseData[]> => {
    const { data } = await api.get<GetScheduledRoomResponse>(
      '/room/reservation/my',
    );

    // 빈 배열이라도 올 수 있으니 null 체크만
    if (!data.data) return [];

    return data.data;
  },

  /**
   * [GET] 추천 방 목록 조회
   * @param categoryId (optional)
   * @returns
   */
  getRecommendedRooms: async (
    categoryId?: string,
  ): Promise<RECOMMENDED_ROOM[]> => {
    const params = categoryId ? { categoryId } : undefined;
    const { data } = await api.get<GetRecommendedRoomResponse>(
      '/ai/recommend',
      { params },
    );

    if (!data.data) return [];

    return data.data;
  },
};
