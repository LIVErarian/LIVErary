import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { boardApi } from '@/api/board.api';
import { useModalStore } from '@/store/useModalStore';

import type { CommonResponse } from '@/types/api.types';
import type {
  BoardCreateResponseData,
  BoardDetail,
  BoardUpdateResponseData,
  CreateBoardRequest,
  GetBoardListRequest,
  UpdateBoardRequest,
} from '@/types/board.types';

// Query Keys
export const BOARD_KEYS = {
  all: ['boards'] as const,
  list: (params: GetBoardListRequest) =>
    [...BOARD_KEYS.all, 'list', params] as const,
  detail: (boardId: string) => [...BOARD_KEYS.all, 'detail', boardId] as const,
};

// 게시글 전체 조회 Hook (검색어 포함)
export const useGetBoardList = (
  params: GetBoardListRequest & { keyword?: string },
) => {
  return useQuery({
    queryKey: [...BOARD_KEYS.all, 'list', params],
    queryFn: () => boardApi.getBoardList(params),
  });
};

/**
 * 게시글 상세 조회 Hook
 */
export const useGetBoardDetail = (boardId: string) => {
  return useQuery<BoardDetail | null, AxiosError>({
    queryKey: BOARD_KEYS.detail(boardId),
    queryFn: () => boardApi.getBoardDetail(boardId),
    enabled: !!boardId,
  });
};

/**
 * 게시글 작성 Hook
 * 성공 시 -> 상세 페이지 모달로 이동
 */
export const useCreateBoard = () => {
  const queryClient = useQueryClient();
  const { openModal } = useModalStore();

  return useMutation<
    BoardCreateResponseData | null,
    AxiosError<CommonResponse>,
    CreateBoardRequest
  >({
    mutationFn: (req) => boardApi.createBoard(req),
    onSuccess: (data) => {
      // 목록 데이터 갱신
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.all });

      // 작성된 글의 상세 모달로 즉시 전환
      if (data?.boardId) {
        openModal('boardDetail', { boardId: data.boardId });
      }
    },
    onError: (error) => {
      console.error(
        '게시글 작성 실패:',
        error.response?.data?.message || error.message,
      );
      openModal('error', {
        message: error.response?.data?.message || '작성에 실패했습니다.',
      });
    },
  });
};

/**
 * 게시글 수정 Hook
 * 성공 시 -> 상세 페이지 모달로 이동 (Refetch 유도)
 */
export const useUpdateBoard = () => {
  const queryClient = useQueryClient();
  const { openModal } = useModalStore();

  return useMutation<
    BoardUpdateResponseData | null,
    AxiosError<CommonResponse>,
    UpdateBoardRequest
  >({
    mutationFn: (req) => boardApi.updateBoard(req),
    onSuccess: (data, variables) => {
      // 상세 데이터 캐시 무효화 -> 상세 모달이 열릴 때 최신 데이터(수정본)를 다시 가져옴
      queryClient.invalidateQueries({
        queryKey: BOARD_KEYS.detail(variables.boardId),
      });

      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.all });

      // 상세 모달로 전환
      // 백엔드가 boardId를 줬다면 그걸 쓰고, 아니면 요청 변수의 id 사용
      const targetId = data?.boardId || variables.boardId;

      // 수정된 글의 상세 모달로 전환
      openModal('boardDetail', { boardId: targetId });
    },
    onError: (error) => {
      console.error(
        '게시글 수정 실패:',
        error.response?.data?.message || error.message,
      );
      openModal('error', { message: '수정에 실패했습니다.' });
    },
  });
};

/**
 * 게시글 삭제 Hook
 * 성공 시 -> 목록 페이지 모달로 이동
 */
export const useDeleteBoard = () => {
  const queryClient = useQueryClient();
  const { openModal } = useModalStore();

  return useMutation<void, AxiosError<CommonResponse>, string>({
    mutationFn: (boardId) => boardApi.deleteBoard(boardId),
    onSuccess: () => {
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.all });

      // 목록 모달로 전환
      openModal('boardList');
    },
    onError: (error) => {
      console.error(
        '게시글 삭제 실패:',
        error.response?.data?.message || error.message,
      );
      openModal('error', { message: '삭제에 실패했습니다.' });
    },
  });
};
