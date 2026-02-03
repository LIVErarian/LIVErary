import { useState } from 'react';

import { useCreateBoard } from '@/hooks/queries/useBoard';
import { useMyScheduledRooms } from '@/hooks/queries/useRoomQueries';
import { useAuthStore } from '@/store/useAuthStore';
import { useModalStore } from '@/store/useModalStore';
import { PixelButton } from '../common/PixelButton';

import type { BoardType } from '@/types/board.types';

import * as styles from './BoardCreate.css';
import { theme } from '@/styles/theme.css';

export const BoardCreate = () => {
  const { openModal } = useModalStore();
  const { user } = useAuthStore();
  const { mutate: createBoard, isPending } = useCreateBoard();

  // 내 예약 방 목록 조회
  const { data: myRooms } = useMyScheduledRooms();

  const [type, setType] = useState<BoardType>('INQUIRY');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [roomId, setRoomId] = useState('');

  // 관리자 여부
  const isAdmin = user?.role === 'ADMIN';

  const handleSubmit = () => {
    if (!title.trim() || !content.trim())
      return alert('제목과 내용을 입력해주세요.');
    if (type === 'PROMOTION' && !roomId)
      return alert('홍보할 방을 선택해주세요.');

    if (type === 'NOTICE' && !isAdmin) {
      return alert('관리자만 공지사항을 작성할 수 있습니다.');
    }

    createBoard({
      title,
      content,
      type,
      roomId: type === 'PROMOTION' ? roomId : undefined,
    });
  };

  // 키보드 이벤트 전파 중단 (게임 조작 간섭 방지 및 띄어쓰기 허용)
  const stopPropagation = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        {/* 게시판 선택 & 방 선택 */}
        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>구분</label>
            <select
              className={styles.select}
              value={type}
              onChange={(e) => setType(e.target.value as BoardType)}
            >
              <option value="INQUIRY">❓ 문의하기</option>
              <option value="PROMOTION">📣 홍보하기</option>
              {isAdmin && <option value="NOTICE">📢 공지사항</option>}
            </select>
          </div>

          {/* 홍보 선택 시에만 노출되는 방 선택 드롭다운 */}
          {type === 'PROMOTION' && (
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
                {myRooms?.length === 0 && (
                  <option disabled>예약한 방이 없습니다.</option>
                )}
              </select>
            </div>
          )}
        </div>

        {/* 2. 제목 입력 */}
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

        {/* 3. 내용 입력 */}
        <div className={styles.contentArea}>
          <label className={styles.label}>내용</label>
          <textarea
            className={styles.textArea}
            placeholder="내용을 작성해주세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={stopPropagation}
          />
        </div>
      </div>

      {/* 하단 버튼 */}
      <footer className={styles.footer}>
        <PixelButton
          onClick={() => openModal('boardList')}
          style={{
            backgroundColor: theme.colors.disabledBg,
            color: theme.colors.disabledText,
          }}
        >
          취소
        </PixelButton>
        <PixelButton onClick={handleSubmit} disabled={isPending}>
          {isPending ? '등록 중...' : '등록하기'}
        </PixelButton>
      </footer>
    </div>
  );
};
