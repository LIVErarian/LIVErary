import { useState } from 'react';

import { useModalEffect } from '@/hooks/common/useModalEffect';
import { DUMMY_USER } from '@/mocks/dummyData';
import { useModalStore } from '@/store/useModalStore';
import { PixelButton } from '../common/PixelButton';
import { PixelInput } from '../common/PixelInput';

import * as styles from './ProfileModal.css';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(DUMMY_USER.nickname);
  const [tempNickname, setTempNickname] = useState(nickname);

  const { openModal } = useModalStore();

  // ESC로 닫기
  useModalEffect(isOpen, onClose);

  const startEdit = () => {
    setTempNickname(nickname);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!tempNickname.trim()) {
      openModal('error', {
        title: '닉네임 변경 실패',
        message: '닉네임을 입력하세요.',
      });
    }
    setNickname(tempNickname);
    setIsEditing(false);
    // TODO: nickname 변경 api 호출 필요
  };

  const editModeView = (
    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
      <div style={{ flex: 1 }}>
        <PixelInput
          placeholder="닉네임"
          value={tempNickname}
          onChange={(e) => setTempNickname(e.target.value)}
          autoFocus
        />
      </div>
      <PixelButton size="sm" onClick={saveEdit}>
        저장
      </PixelButton>
    </div>
  );

  const viewModeView = (
    <>
      <span className={styles.nicknameText}>{nickname}</span>
      <PixelButton size="sm" variant="beige" onClick={startEdit}>
        수정
      </PixelButton>
    </>
  );

  return (
    <div className={styles.cardContainer}>
      <div className={styles.contentContainer}>
        {/* 좌측 사진 영역 */}
        <div className={styles.photoArea}>
          <span>Placeholder</span>
        </div>

        {/* 우측 프로필 영역 */}
        <div className={styles.infoArea}>
          {/* 닉네임 */}
          <div className={styles.nicknameRow}>
            {isEditing ? editModeView : viewModeView}
          </div>

          <div className={styles.categoryRow}>#판타지</div>

          {/* 총 독서 시간 */}
          <div className={styles.timeSection}>
            총 독서시간: {DUMMY_USER.totalReadingTime} 분
          </div>

          {/* 책 통계 */}
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>읽는 중인 책</span>
              <span className={styles.statValue}>
                {DUMMY_USER.bookCounts.reading}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>읽은 책</span>
              <span className={styles.statValue}>
                {DUMMY_USER.bookCounts.completed}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>읽고 싶은 책</span>
              <span className={styles.statValue}>
                {DUMMY_USER.bookCounts.wish}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* 하단 바코드 */}
      <div className={styles.barcode}>║▌║█║▌│║▌║▌█║▌║█║▌│║▌║▌█</div>
    </div>
  );
};
