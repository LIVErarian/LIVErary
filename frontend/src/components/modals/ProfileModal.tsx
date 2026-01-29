import { useState } from 'react';

import { useGetMyProfile } from '@/hooks/queries/useUser';
import { DUMMY_USER } from '@/mocks/dummyData';
import { BaseModal } from '../common/BaseModal';
import { PixelButton } from '../common/PixelButton';

import * as styles from './ProfileModal.css';
import { theme } from '@/styles/theme.css';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { data: user } = useGetMyProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || 'test');
  const [tempNickname, setTempNickname] = useState(nickname);
  const [errorMessage, setErrorMessage] = useState('');

  const startEdit = () => {
    setTempNickname(nickname);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!tempNickname.trim()) {
      setErrorMessage('닉네임을 입력해주세요!');
      return;
    }

    if (tempNickname.length < 2) {
      setErrorMessage('2글자 이상 입력해주세요!');
      return;
    }

    setNickname(tempNickname);
    setIsEditing(false);
    // TODO: nickname 변경 api 호출 필요
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempNickname(e.target.value);
    if (errorMessage) setErrorMessage('');
  };

  const editModeView = (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '8px',
          width: '100%',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: 1 }}>
          <input
            className={styles.editInput}
            placeholder="닉네임"
            value={tempNickname}
            onChange={handleInputChange}
            autoFocus
            maxLength={10}
          />
        </div>
        <PixelButton size="sm" onClick={saveEdit}>
          저장
        </PixelButton>
      </div>

      {errorMessage && (
        <span
          style={{
            color: theme.colors.red,
            fontSize: '0.8rem',
            fontWeight: 'bold',
            paddingLeft: '4px',
          }}
        >
          * {errorMessage}
        </span>
      )}
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
    <BaseModal isOpen={isOpen} onClose={onClose}>
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
    </BaseModal>
  );
};
