import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { roomApi } from '@/api/room.api';
import { useGameStore } from '@/store/useGameStore';
import { roomKeys } from '../queries/useRoomQueries';

import type { CommonResponse } from '@/types/api.types';
import type {
  ApplyScheduledRoomRequest,
  ApplyScheduledRoomResponseData,
  CreateRoomRequest,
  CreateRoomResponseData,
  DeleteApplyScheduledRequest,
  DeleteScheduledRoomRequest,
  JoinRoomRequest,
  JoinRoomResponseData,
  PatchScheduledRoomRequest,
  PatchScheduledRoomResponseData,
} from '@/types/room.types';

/**
 * 방 생성하기
 */
export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  const setCurrentFloor = useGameStore((state) => state.setCurrentFloor);
  const setRoomId = useGameStore((state) => state.setRoomId);
  const setSpawnPoint = useGameStore((state) => state.setSpawnPoint);
  const conferenceEntrySpawn = { x: 0.88, y: 0.5 };

  return useMutation<
    CreateRoomResponseData,
    AxiosError<CommonResponse<null>>,
    CreateRoomRequest
  >({
    mutationFn: roomApi.createRoom,
    onSuccess: (data, variables) => {
      // 라이브면 즉시 방으로 이동
      if (variables.status === 'LIVE') {
        console.log('방 생성 완료:', data.roomId);
        setRoomId(data.roomId);

        // concert인 경우 콘서트 홀로 이동
        if (variables.roomType === 'CONCERT') {
          setCurrentFloor('bookConcert');
          setSpawnPoint(null);
        }
        // booktalk인 경우 분기 필요
        else if (variables.roomType === 'TALK')
          if (variables.accessType === 'PRIVATE') {
            // Private인 경우 회의실로 이동
            setCurrentFloor('conferenceFloor');
            setSpawnPoint(conferenceEntrySpawn);
          } else {
            // Public인 경우 bookTalkFloor로 보내고 네번째 방으로
            setSpawnPoint({ x: 0.82, y: 0.78 }); // room4 spawnpoint
            setCurrentFloor('bookTalkFloor');
          }
      }
      // Scheduled인 경우 방 예약
      else {
        queryClient.invalidateQueries({ queryKey: roomKeys.myScheduled() });
        queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
        alert('예약이 완료되었습니다.');
      }

      // 방 목록 강제 갱신
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
    },
    onError: (error) => {
      console.error('방 생성 실패:', error.message);
      alert('방 생성을 실패했습니다. 다시 시도해주세요.');
    },
  });
};

/**
 * 방 참여하기
 */
export const useJoinRoom = () => {
  const queryClient = useQueryClient();
  const setRoomId = useGameStore((state) => state.setRoomId);
  const setCurrentFloor = useGameStore((state) => state.setCurrentFloor);
  const setSpawnPoint = useGameStore((state) => state.setSpawnPoint);
  const conferenceEntrySpawn = { x: 0.88, y: 0.5 };

  return useMutation<
    JoinRoomResponseData,
    AxiosError<CommonResponse<null>>,
    JoinRoomRequest
  >({
    mutationFn: roomApi.joinRoom,
    onSuccess: (data) => {
      // 참여자수 갱신을 위해 방 상세 정보 갱신
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(data.roomId) });

      alert('방에 참여하였습니다.');
      setRoomId(data.roomId);
      setSpawnPoint(conferenceEntrySpawn);
      setCurrentFloor('conferenceFloor');
    },
    onError: (error) => {
      // 리스트 강제 갱신
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
      console.error('방 참여 실패:', error);
      alert(error.response?.data?.message || '방에 참여하지 못했습니다.');
    },
  });
};

/**
 * 방 떠나기
 */
export const useLeaveRoom = () => {
  const queryClient = useQueryClient();
  const setRoomId = useGameStore((state) => state.setRoomId);

  return useMutation<string, AxiosError, { roomId: string }>({
    mutationFn: roomApi.leaveRoom,
    onSuccess: (_, variables) => {
      // 방 목록과 방 상세 정보 갱신
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: roomKeys.detail(variables.roomId),
      });

      // TODO: 해당 층의 로비/복도 채널로 복귀
      setRoomId(null);
    },
  });
};

/**
 * 예약한 방에 참여 신청하기
 */
export const useApplyScheduledRoom = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApplyScheduledRoomResponseData,
    AxiosError<CommonResponse<null>>,
    ApplyScheduledRoomRequest
  >({
    mutationFn: roomApi.applyScheduledRoom,
    onSuccess: () => {
      alert('방 참여 신청이 완료되었습니다!');
      queryClient.invalidateQueries({ queryKey: roomKeys.myScheduled() });
    },
    onError: (error: AxiosError) => {
      alert('참여 신청 중 오류가 발생했습니다.');
      console.log('예약 방 참여 신청 오류:', error);
    },
  });
};

/**
 * 방 정보 수정
 */
export const useUpdateScheduledRoom = () => {
  const queryClient = useQueryClient();

  return useMutation<
    PatchScheduledRoomResponseData,
    AxiosError,
    PatchScheduledRoomRequest
  >({
    mutationFn: roomApi.patchScheduledRoom,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(data.roomId) });
      queryClient.invalidateQueries({ queryKey: roomKeys.myScheduled() });
      alert('방 정보가 수정되었습니다.');
    },
  });
};

/**
 * [방장용] 예약된 방 삭제
 */
export const useDeleteScheduledRoom = () => {
  const queryClient = useQueryClient();

  return useMutation<string, AxiosError, DeleteScheduledRoomRequest>({
    mutationFn: roomApi.deleteScheduledRoom,
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.myScheduled() });
      alert(message || '예약된 방이 취소되었습니다.');
    },
    onError: (error) => {
      console.error('방 취소 실패:', error);
      alert('방 취소 중 오류가 발생했습니다.');
    },
  });
};

/**
 * [참여자용] 예약된 방 참여 신청 취소
 */
export const useDeleteApplyScheduledRoom = () => {
  const queryClient = useQueryClient();

  return useMutation<string, AxiosError, DeleteApplyScheduledRequest>({
    mutationFn: roomApi.deleteApplyScheduledRoom,
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.myScheduled() });
      alert(message || '참여 신청이 취소되었습니다.');
    },
    onError: (error) => {
      console.error('참여 취소 실패:', error);
      alert('참여 취소 중 오류가 발생했습니다.');
    },
  });
};
