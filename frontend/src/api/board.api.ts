import { api } from './axios';

import type {
  CreateBoardRequest,
  CreateBoardResponse,
  DeleteBoardResponse,
  GetBoardDetailResponse,
  GetBoardListRequest,
  GetBoardListResponse,
  UpdateBoardRequest,
  UpdateBoardResponse,
} from '@/types/entities/board.types';

export const boardApi = {
  /**
   * 게시글 목록 조회 API
   * @param params type, keyword, page, size, sort
   * @returns List<BoardResponse>(boardId, nickname, type, title, status, createdAt)
   */
  getBoardList: async (
    params: GetBoardListRequest,
  ): Promise<GetBoardListResponse['data']> => {
    const { data } = await api.get<GetBoardListResponse>('/board', {
      params: {
        type: params.type,
        keyword: params.keyword,
        page: params.page || 0,
        size: params.size || 10,
        sort: params.sort || 'createdAt,desc',
      },
    });

    if (!data.data) {
      throw new Error('게시글이 존재하지 않습니다.');
    }

    return data.data;
  },

  /**
   * 게시글 상세 조회 API
   * @param boardId 게시글 ID
   * @returns boardId, nickname, type, title, content, imageUrl, status, createdAt, targetRoomId, categoryName, bookTitle, bookAuthor, bookCoverUrl
   */
  getBoardDetail: async (
    boardId: string,
  ): Promise<GetBoardDetailResponse['data']> => {
    const { data } = await api.get<GetBoardDetailResponse>(`/board/${boardId}`);

    if (!data.data) {
      throw new Error('존재하지 않는 게시글입니다.');
    }

    return data.data;
  },

  /**
   * 게시글 작성 API
   * @param req title, content, type, imageUrl, roomId, categoryName, bookTitle, bookAuthor, bookCoverUrl
   * @returns boardId
   */
  createBoard: async (
    req: CreateBoardRequest,
  ): Promise<CreateBoardResponse['data']> => {
    const { data } = await api.post<CreateBoardResponse>('/board', req);
    return data.data;
  },

  /**
   * 게시글 수정 API
   * @param req boardId, title, content, imageUrl, roomId, categoryName, bookTitle, bookAuthor, bookCoverUrl
   * @returns boardId
   */
  updateBoard: async (
    req: UpdateBoardRequest,
  ): Promise<UpdateBoardResponse['data']> => {
    const { boardId, ...body } = req;
    const { data } = await api.patch<UpdateBoardResponse>(
      `/board/${boardId}`,
      body,
    );
    return data.data;
  },

  /**
   * 게시글 삭제 API
   * @param boardId 게시글 ID
   */
  deleteBoard: async (boardId: string): Promise<void> => {
    await api.delete<DeleteBoardResponse>(`/board/${boardId}`);
  },
};
