import { useState } from 'react';

import { useCreateRoom } from '@/hooks/mutations/useRoomMutations';
import { useModalStore } from '@/store/useModalStore';
import { PixelButton } from '../common/PixelButton';
import { PixelInput } from '../common/PixelInput';

import type { AccessType, RoomType } from '@/types/room.types';

import * as styles from './CreateRoomModal.css';

export const CreateRoomModal = () => {
  const { closeModal } = useModalStore();
  const { mutate: createRoom, isPending } = useCreateRoom();

  const [title, setTitle] = useState('');
  const [roomType, setRoomType] = useState<RoomType>('TALK');
  const [accessType, setAccessType] = useState<AccessType>('PUBLIC');
  const [maxUser, setMaxUser] = useState(4);

  const [isScheduled, setIsScheduled] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 임시 카테고리 ID
  const [categoryId] = useState('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

  // 핸들러
  const handleSubmit = () => {
    if (!title.trim()) return alert('방 제목을 입력해주세요.');

    if (isScheduled) {
      if (!startDate || !endDate) {
        return alert('예약 시작 시간과 종료 시간을 모두 설정해주세요.');
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const now = new Date();

      if (start < now) {
        return alert('시작 시간은 현재 시간보다 미래여야 합니다.');
      }

      if (end <= start) {
        return alert('종료 시간은 시작 시간보다 뒤여야 합니다.');
      }
    }

    // 날짜 포맷팅 (ISO String)
    const formattedStart =
      isScheduled && startDate ? new Date(startDate).toISOString() : undefined;
    const formattedEnd =
      isScheduled && endDate ? new Date(endDate).toISOString() : undefined;

    createRoom(
      {
        title,
        roomType,
        accessType,
        maxUser,
        status: isScheduled ? 'SCHEDULED' : 'LIVE',
        categoryId,
        startAt: formattedStart,
        endAt: formattedEnd,
      },
      {
        onSuccess: () => closeModal(),
      },
    );
  };

  return (
    <div className={styles.container}>
      {/* 방 제목 */}
      <PixelInput
        label="방 제목"
        placeholder="방 제목을 입력하세요"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
        maxLength={20}
      />

      {/* 방 유형 */}
      <div>
        <label className={styles.label}>방 유형</label>
        <select
          className={styles.pixelSelect}
          value={roomType}
          onChange={(e) => setRoomType(e.target.value as RoomType)}
        >
          <option value="TALK">🗣️ 북토크 (Talk)</option>
          <option value="CONCERT">🎸 북콘서트 (Concert)</option>
        </select>
      </div>

      {/* 공개 설정 */}
      <div>
        <label className={styles.label}>공개 설정</label>
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="accessType"
              className={styles.checkbox}
              checked={accessType === 'PUBLIC'}
              onChange={() => setAccessType('PUBLIC')}
            />
            공개
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="accessType"
              className={styles.checkbox}
              checked={accessType === 'PRIVATE'}
              onChange={() => setAccessType('PRIVATE')}
            />
            비공개
          </label>
        </div>
      </div>

      {/* 최대 인원 */}
      <div>
        <label className={styles.label}>최대 인원: {maxUser}명</label>
        <input
          type="range"
          min="2"
          max="20"
          step="1"
          value={maxUser}
          onChange={(e) => setMaxUser(Number(e.target.value))}
          className={styles.rangeInput}
        />
        <span className={styles.helpText}>* 드래그하여 인원을 설정하세요.</span>
      </div>

      {/* 예약 설정 (시작/종료 시간) */}
      <div>
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={isScheduled}
              onChange={(e) => setIsScheduled(e.target.checked)}
            />
            <span style={{ fontWeight: 'bold' }}>예약된 방으로 만들기</span>
          </label>
        </div>

        {isScheduled && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {/* 시작 시간 */}
            <PixelInput
              label="시작 시간"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
            />

            {/* 종료 시간 */}
            <PixelInput
              label="종료 시간"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
            />
          </div>
        )}
      </div>

      {/* 버튼 그룹 */}
      <div className={styles.buttonGroup}>
        <PixelButton onClick={closeModal}>취소</PixelButton>

        <PixelButton
          variant="primary"
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending ? '생성 중...' : isScheduled ? '예약하기' : '방 만들기'}
        </PixelButton>
      </div>
    </div>
  );
};
