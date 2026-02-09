import { useState } from 'react';

import { useGetBoardDetail, useUpdateBoard } from '@/services/queries/useBoard';
import { useMyScheduledRooms } from '@/services/queries/useRoomQueries';
import { useModalStore } from '@/store/useModalStore';
import { PixelButton } from '../common/PixelButton';

import type { BoardDetail as BoardDetailData } from '@/types/board.types';

import * as styles from './BoardCreate.css';
import { theme } from '@/styles/theme.css';

interface BoardUpdateProps {
  boardId: string;
}

// 실제 폼을 담당하는 내부 컴포넌트 (데이터가 확실히 있을 때만 렌더링됨)
const BoardUpdateForm = ({
  post,
  boardId,
}: {
  post: BoardDetailData;
  boardId: string;
}) => {
  const { openModal } = useModalStore();
  const { mutate: updateBoard, isPending } = useUpdateBoard();
  const { data: myRooms } = useMyScheduledRooms();

  // useEffect 없이 props로 받은 post 데이터를 바로 초기값으로 사용
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);

  // 홍보 게시글인 경우 방 ID 초기화
  const [roomId, setRoomId] = useState(
    post.type === 'PROMOTION' && post.roomDetail ? post.roomDetail.roomId : '',
  );

  const handleSubmit = () => {
    if (!title.trim() || !content.trim())
      return openModal('alert', {
        title: '알림',
        message: '제목과 내용을 입력해주세요.',
      });
    if (post.type === 'PROMOTION' && !roomId)
      return openModal('alert', {
        title: '알림',
        message: '홍보할 방을 선택해주세요.',
      });

    updateBoard({
      boardId,
      title,
      content,
      roomId: post.type === 'PROMOTION' ? roomId : undefined,
    });
  };

  const stopPropagation = (e: React.KeyboardEvent) => e.stopPropagation();

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        {/* 상단 옵션 */}
        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>게시판 종류</label>
            <select
              className={styles.select}
              value={post.type}
              disabled
              style={{
                opacity: 0.7,
                backgroundColor: '#eee',
                cursor: 'not-allowed',
              }}
            >
              <option value="INQUIRY">❓ 문의하기</option>
              <option value="PROMOTION">📣 홍보하기</option>
              <option value="NOTICE">📢 공지사항</option>
            </select>
          </div>

          {post.type === 'PROMOTION' && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>홍보할 방 선택</label>
              <select
                className={styles.select}
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                style={{ backgroundColor: '#e3f2fd' }}
              >
                <option value="">-- 홍보할 나의 방 선택 --</option>
                {myRooms?.map((room) => (
                  <option key={room.roomId} value={room.roomId}>
                    {room.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 제목 입력 */}
        <div>
          <label className={styles.label}>제목</label>
          <input
            className={styles.titleInput}
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={stopPropagation}
          />
        </div>

        {/* 내용 입력 */}
        <div className={styles.contentArea}>
          <label className={styles.label}>내용</label>
          <textarea
            className={styles.textArea}
            placeholder="내용을 자유롭게 작성해주세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={stopPropagation}
          />
        </div>
      </div>

      <footer className={styles.footer}>
        <PixelButton
          onClick={() => openModal('boardDetail', { boardId })}
          style={{
            backgroundColor: theme.colors.disabledBg,
            color: theme.colors.disabledText,
          }}
        >
          취소
        </PixelButton>
        <PixelButton onClick={handleSubmit} disabled={isPending}>
          {isPending ? '수정 중...' : '수정 완료'}
        </PixelButton>
      </footer>
    </div>
  );
};

// 데이터를 불러오는 컨테이너 컴포넌트 (메인)
export const BoardUpdate = ({ boardId }: BoardUpdateProps) => {
  const { data: post, isLoading } = useGetBoardDetail(boardId);

  // 로딩 중이거나 데이터가 없으면 로딩 UI 표시
  if (isLoading || !post) {
    return (
      <div
        className={styles.container}
        style={{ justifyContent: 'center', alignItems: 'center' }}
      >
        <div style={{ fontSize: '1.2rem', color: theme.colors.woodDeep }}>
          데이터 불러오는 중...
        </div>
      </div>
    );
  }

  // 데이터가 준비되면 폼 컴포넌트 렌더링 (post가 확실히 존재함)
  return <BoardUpdateForm post={post} boardId={boardId} />;
};
