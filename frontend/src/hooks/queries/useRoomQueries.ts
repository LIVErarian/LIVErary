import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { roomApi } from '@/api/room.api';

import type {
  GetLiveRoomListRequest,
  GetReservationRoomListRequest,
  GetRoomSearchRequest,
} from '@/types/room.types';

// Query Keys
export const roomKeys = {
  all: ['rooms'] as const,

  // 라이브 목록 키
  lives: () => [...roomKeys.all, 'live'] as const,
  live: (filters: GetLiveRoomListRequest) =>
    [...roomKeys.lives(), { ...filters }] as const,

  // 예약 목록 키
  reservations: () => [...roomKeys.all, 'reservation'] as const,
  reservation: (filters: GetReservationRoomListRequest) =>
    [...roomKeys.reservations(), { ...filters }] as const,

  // 검색 키
  searches: () => [...roomKeys.all, 'search'] as const,
  search: (filters: GetRoomSearchRequest) =>
    [...roomKeys.searches(), { ...filters }] as const,

  // 상세 정보 키
  details: () => [...roomKeys.all, 'detail'] as const,
  detail: (roomId: string) => [...roomKeys.details(), roomId] as const,

  // 내 예약 키
  myScheduled: () => [...roomKeys.all, 'my-scheduled'] as const,

  // 추천 키
  recommended: (categoryId?: string) =>
    [...roomKeys.all, 'recommend', categoryId ?? 'all'] as const,
};

/**
 * 라이브 방 리스트 받아오기
 */
export const useLiveRoomList = (params: GetLiveRoomListRequest) => {
  return useQuery({
    queryKey: roomKeys.live(params),
    queryFn: () => roomApi.getLiveRoomList(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });
};

/**
 * 예약된 방 리스트 받아오기
 */
export const useReservationRoomList = (
  params: GetReservationRoomListRequest,
) => {
  return useQuery({
    queryKey: roomKeys.reservation(params),
    queryFn: () => roomApi.getReservationRoomList(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
  });
};

/**
 * 방 코드로 검색하기
 */
export const useSearchRoom = (
  params: GetRoomSearchRequest,
  enabled: boolean,
) => {
  return useQuery({
    queryKey: roomKeys.search(params),
    queryFn: () => roomApi.searchRoom(params),
    enabled: enabled && !!params.code,
    retry: false,
  });
};

/**
 * 방 상세 정보 받아오기
 */
export const useRoomDetail = (roomId: string | undefined) => {
  return useQuery({
    queryKey: roomKeys.detail(roomId!),
    queryFn: () => roomApi.getRoomDetail({ roomId: roomId! }),
    enabled: !!roomId,
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
    refetchInterval: 1000 * 10, // 10초 간격으로 refetch
  });
};
