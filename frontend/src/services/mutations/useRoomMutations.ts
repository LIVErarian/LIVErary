import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { roomApi } from '@/api/room.api';
import { useBookTalkRoomStore } from '@/store/useBookTalkRoomStore';
import { useGameStore } from '@/store/useGameStore';
import { useModalStore } from '@/store/useModalStore';
import { categoryKeys } from '../queries/useCategory';
import { roomKeys } from '../queries/useRoomQueries';

import type { CommonResponse } from '@/types/api.types';
import type { GetCategoryResponse } from '@/types/category.types';
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
  const { openModal } = useModalStore();

  const setCurrentFloor = useGameStore((state) => state.setCurrentFloor);
  const setRoomId = useGameStore((state) => state.setRoomId);
  const setSpawnPoint = useGameStore((state) => state.setSpawnPoint);
  const setRoom4Room = useBookTalkRoomStore((state) => state.setRoom4Room);
  const setRoomCode = useGameStore((state) => state.setRoomCode);

  return useMutation<
    CreateRoomResponseData, // API가 이미 data.data를 반환하므로 내부 타입 사용
    AxiosError<CommonResponse<null>>,
    CreateRoomRequest
  >({
    mutationFn: roomApi.createRoom,
    onSuccess: (data, variables) => {
      // ✅ API가 이미 data를 벗겨서 주므로 바로 접근
      const newRoomId = data.roomId;
      const newRoomCode = data.code || '';

      // 캐시된 카테고리 응답 가져오기
      const cachedResponse = queryClient.getQueryData<GetCategoryResponse>(
        categoryKeys.list(),
      );

      const categories = cachedResponse?.data || [];
      const matchedCategory = categories.find(
        (c) => c.categoryId === variables.categoryId,
      );
      const categoryName = matchedCategory ? matchedCategory.name : '기타';

      // 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: roomKeys.lives() });
      queryClient.invalidateQueries({ queryKey: roomKeys.reservations() });

      // 예약 방인 경우
      if (variables.status === 'SCHEDULED') {
        queryClient.invalidateQueries({ queryKey: roomKeys.myScheduled() });
        openModal('alert', {
          title: '예약 성공',
          message: '예약이 완료되었습니다.',
        });
        return;
      }

      // 라이브 방(TALK)인 경우: 시퀀스 실행
      if (variables.roomType === 'TALK') {
        setRoom4Room({
          roomId: newRoomId || '',
          title: variables.title,
          roomType: variables.roomType,
          accessType: variables.accessType,
          status: variables.status,
          categoryName: categoryName,
          currentCount: 1,
          maxUser: variables.maxUser,
        });

        // 비밀방인 경우 생성된 코드 저장
        if (variables.accessType === 'PRIVATE') {
          setRoomCode(newRoomCode);
        } else {
          setRoomCode(null);
        }

        // 문 앞으로 이동
        setSpawnPoint({ x: 0.83, y: 0.65 });
        setCurrentFloor('bookTalkFloor');

        // 입장 확인 모달 띄우기
        openModal('entrance', {
          title: '방 생성 완료',
          message: `'${variables.title}' 방에 지금 바로 입장하시겠습니까?`,
          onConfirm: async () => {
            try {
              if (!newRoomId) throw new Error('방 ID를 찾을 수 없습니다.');

              await roomApi.joinRoom(newRoomId, { code: newRoomCode });

              setRoomId(newRoomId);
              setCurrentFloor('conferenceFloor');
              setSpawnPoint({ x: 0.88, y: 0.5 });
            } catch (error) {
              const axiosError = error as AxiosError<CommonResponse<null>>;
              const msg =
                axiosError.response?.data?.message || '입장에 실패했습니다.';
              openModal('alert', { title: '입장 실패', message: msg });
            }
          },
        });
      }
      // CONCERT 등 기타 타입
      else if (variables.roomType === 'CONCERT') {
        if (newRoomId) {
          setRoomId(newRoomId);
          setCurrentFloor('bookConcert');
          setSpawnPoint(null);
        }
      }
    },
    onError: (error) => {
      const msg = error.response?.data?.message || '방 생성을 실패했습니다.';
      openModal('alert', {
        title: '입장 실패',
        message: msg,
      });
    },
  });
};

/**
 * 방 참여하기
 */
export const useJoinRoom = () => {
  const queryClient = useQueryClient();
  const setRoomId = useGameStore((state) => state.setRoomId);
  const setRoomCode = useGameStore((state) => state.setRoomCode);
  const setCurrentFloor = useGameStore((state) => state.setCurrentFloor);
  const setSpawnPoint = useGameStore((state) => state.setSpawnPoint);

  return useMutation<
    JoinRoomResponseData,
    AxiosError<CommonResponse<null>>,
    { roomId: string; req: JoinRoomRequest }
  >({
    mutationFn: ({ roomId, req }) => roomApi.joinRoom(roomId, req),
    onSuccess: (data, variables) => {
      const roomId = data.roomId;
      console.log('저예요!!!', roomId);

      if (roomId) {
        queryClient.invalidateQueries({ queryKey: roomKeys.detail(roomId) });
        setRoomId(roomId);

        // 코드가 있으면 넣고, 없으면 null로 초기화
        setRoomCode(variables.req.code || null);

        setSpawnPoint({ x: 0.88, y: 0.5 });
        setCurrentFloor('conferenceFloor');
      }
    },
    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.lives() });
      const msg = error.response?.data?.message || '방 참여에 실패했습니다.';
      useModalStore.getState().openModal('alert', {
        title: '빠른 입장 실패',
        message: msg,
      });
    },
  });
};

/**
 * 방 떠나기
 */
export const useLeaveRoom = () => {
  const queryClient = useQueryClient();
  const setRoomId = useGameStore((state) => state.setRoomId);
  const setRoomCode = useGameStore((state) => state.setRoomCode);

  return useMutation<
    string,
    AxiosError<CommonResponse<null>>,
    { roomId: string }
  >({
    mutationFn: roomApi.leaveRoom,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.lives() });
      queryClient.invalidateQueries({
        queryKey: roomKeys.detail(variables.roomId),
      });

      setRoomId(null);
      setRoomCode(null);
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
      useModalStore.getState().openModal('alert', {
        title: '신청 완료',
        message: '방 참여 신청이 완료되었습니다!',
      });
      queryClient.invalidateQueries({ queryKey: roomKeys.myScheduled() });
    },
    onError: (error) => {
      useModalStore.getState().openModal('alert', {
        title: '오류',
        message: '참여 신청 중 오류가 발생했습니다.',
      });
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
    AxiosError<CommonResponse<null>>,
    PatchScheduledRoomRequest
  >({
    mutationFn: roomApi.patchScheduledRoom,
    onSuccess: (data) => {
      const roomId = data.roomId;
      if (roomId) {
        queryClient.invalidateQueries({ queryKey: roomKeys.detail(roomId) });
      }
      queryClient.invalidateQueries({ queryKey: roomKeys.myScheduled() });
      useModalStore
        .getState()
        .openModal('alert', { message: '방 정보가 수정되었습니다.' });
    },
  });
};

/**
 * [방장용] 예약된 방 삭제
 */
export const useDeleteScheduledRoom = () => {
  const queryClient = useQueryClient();

  return useMutation<
    string,
    AxiosError<CommonResponse<null>>,
    DeleteScheduledRoomRequest
  >({
    mutationFn: roomApi.deleteScheduledRoom,
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.myScheduled() });
      useModalStore.getState().openModal('alert', {
        message: message || '예약된 방이 취소되었습니다.',
      });
    },
    onError: (error) => {
      console.error('방 취소 실패:', error);
      useModalStore.getState().openModal('alert', {
        title: '오류',
        message: '방 취소 중 오류가 발생했습니다.',
      });
    },
  });
};

/**
 * [참여자용] 예약된 방 참여 신청 취소
 */
export const useDeleteApplyScheduledRoom = () => {
  const queryClient = useQueryClient();

  return useMutation<
    string,
    AxiosError<CommonResponse<null>>,
    DeleteApplyScheduledRequest
  >({
    mutationFn: roomApi.deleteApplyScheduledRoom,
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.myScheduled() });
      useModalStore.getState().openModal('alert', {
        message: message || '참여 신청이 취소되었습니다.',
      });
    },
    onError: (error) => {
      console.error('참여 취소 실패:', error);
      useModalStore.getState().openModal('alert', {
        title: '오류',
        message: '참여 취소 중 오류가 발생했습니다.',
      });
    },
  });
};
