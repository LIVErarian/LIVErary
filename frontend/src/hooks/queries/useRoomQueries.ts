import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { roomApi } from '@/api/room.api';

import type { GetRoomListRequest } from '@/types/room.types';

// Query Keys (읽기 전용)
export const roomKeys = {
  all: ['rooms'] as const,
  lists: () => [...roomKeys.all, 'list'] as const,
  list: (filters: GetRoomListRequest) =>
    [...roomKeys.lists(), { ...filters }] as const,
  details: () => [...roomKeys.all, 'detail'] as const,
  detail: (roomId: string) => [...roomKeys.details(), roomId] as const,
  myScheduled: () => [...roomKeys.all, 'my-scheduled'] as const,
  recommended: (categoryId?: string) =>
    [...roomKeys.all, 'recommend', categoryId ?? 'all'] as const,
};

/**
 * 방 리스트 받아오기
 */
export const useRoomList = (params: GetRoomListRequest) => {
  return useQuery({
    queryKey: roomKeys.list(params),
    queryFn: () => roomApi.getRoomList(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30, // 30초 (방 생성 삭제시 강제로 업데이트)
    refetchOnWindowFocus: true,
  });
};

/**
 * 방 상세 정보 받아오기
 */
export const useRoomDetail = (roomId: string | undefined) => {
  return useQuery({
    queryKey: roomKeys.detail(roomId!),
    queryFn: () => roomApi.getRoomDetail({ roomId: roomId! }),
    enabled: !!roomId, // roomId 있을 때만 실행
  });
};

/**
 * 내 예약 정보 받아오기
 */
export const useMyScheduledRooms = () => {
  return useQuery({
    queryKey: roomKeys.myScheduled(),
    queryFn: roomApi.getMyScheduledRooms,
  });
};

/**
 * 추천 방 목록 받아오기
 */
export const useRecommendedRooms = (
  categoryId: string | undefined,
  enabled = true,
) => {
  return useQuery({
    queryKey: roomKeys.recommended(categoryId),
    queryFn: () => roomApi.getRecommendedRooms(categoryId),
    enabled,
  });
};
