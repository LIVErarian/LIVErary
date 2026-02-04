import { useState } from 'react';

import {
  useBlockUser,
  useRequestFriend,
  useUnblockUser,
} from '@/hooks/queries/useFriend';
import { useGetMyProfile, useOtherProfile } from '@/hooks/queries/useUser';
import { BaseModal } from '../common/BaseModal';
import { PixelButton } from '../common/PixelButton';

import type { FriendRelationStatus } from '@/types/friend.types';

import * as styles from './ProfileModal.css';
import { theme } from '@/styles/theme.css';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string; // 타인 프로필 조회용 (없으면 내 프로필)
}

export const ProfileModal = ({
  isOpen,
  onClose,
  userId,
}: ProfileModalProps) => {
  // 내 프로필 또는 타인 프로필 조회
  const { data: myProfile } = useGetMyProfile();
  const { data: otherProfile, isLoading } = useOtherProfile(userId);

  // 타인 프로필 여부 확인
  const isOtherProfile = !!userId;
  const profile = isOtherProfile ? otherProfile : myProfile;

  // 디버깅 - 명확하게 표시
  if (isOpen) {
    console.log('='.repeat(50));
    console.log('📋 ProfileModal 열림!');
    console.log('userId:', userId);
    console.log('isOtherProfile:', isOtherProfile);
    console.log('myProfile:', myProfile);
    console.log('otherProfile:', otherProfile);
    console.log('최종 profile:', profile);
    console.log('='.repeat(50));
  }

  // 친구 관련 mutation
  const { mutate: requestFriend } = useRequestFriend();
  const { mutate: blockUser } = useBlockUser();
  const { mutate: unblockUser } = useUnblockUser();

  // 닉네임 수정 (내 프로필만)
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(myProfile?.nickname || '');
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

  /**
   * 친구 신청 핸들러
   */
  const handleRequestFriend = () => {
    if (!profile?.email) return;
    requestFriend({ receiverEmail: profile.email });
    onClose();
  };

  /**
   * 친구 수락 핸들러
   */
  const handleAcceptFriend = () => {
    // friendId 필요 - 현재 구조에서는 직접 전달 필요
    // TODO: friendId를 modalProps로 전달받도록 수정 필요
    alert('친구 수락 기능은 친구 목록에서 사용해주세요.');
  };

  /**
   * 친구 거절 핸들러
   */
  const handleRejectFriend = () => {
    // friendId 필요
    alert('친구 거절 기능은 친구 목록에서 사용해주세요.');
  };

  /**
   * 차단 핸들러
   */
  const handleBlock = () => {
    if (!profile?.email) return;
    if (confirm('정말 차단하시겠습니까?')) {
      blockUser(profile.email);
      onClose();
    }
  };

  /**
   * 차단 해제 핸들러
   */
  const handleUnblock = () => {
    if (!profile?.email) return;
    if (confirm('차단을 해제하시겠습니까?')) {
      unblockUser(profile.email);
      onClose();
    }
  };

  /**
   * 관계 상태에 따른 액션 버튼 렌더링
   */
  const renderActionButtons = (relationStatus: FriendRelationStatus) => {
    switch (relationStatus) {
      case 'NONE':
        return (
          <div style={{ display: 'flex', gap: '8px' }}>
            <PixelButton
              size="sm"
              variant="primary"
              onClick={handleRequestFriend}
            >
              친구 신청
            </PixelButton>
            <PixelButton size="sm" variant="danger" onClick={handleBlock}>
              차단
            </PixelButton>
          </div>
        );

      case 'FRIEND':
        return (
          <div style={{ display: 'flex', gap: '8px' }}>
            <PixelButton size="sm" variant="danger" onClick={handleBlock}>
              차단
            </PixelButton>
          </div>
        );

      case 'PENDING_SENT':
        return (
          <div>
            <span
              style={{
                color: theme.colors.beigeText,
                fontSize: '0.9rem',
              }}
            >
              친구 요청을 보냈습니다
            </span>
          </div>
        );

      case 'PENDING_RECEIVED':
        return (
          <div style={{ display: 'flex', gap: '8px' }}>
            <PixelButton
              size="sm"
              variant="primary"
              onClick={handleAcceptFriend}
            >
              수락
            </PixelButton>
            <PixelButton
              size="sm"
              variant="danger"
              onClick={handleRejectFriend}
            >
              거절
            </PixelButton>
          </div>
        );

      case 'BLOCKED_BY_ME':
        return (
          <div style={{ display: 'flex', gap: '8px' }}>
            <PixelButton size="sm" variant="beige" onClick={handleUnblock}>
              차단 해제
            </PixelButton>
          </div>
        );

      case 'MYSELF':
        return null;

      default:
        return null;
    }
  };

  // 닉네임 편집 모드 뷰
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

  // 닉네임 뷰 모드 뷰
  const viewModeView = (
    <>
      <span className={styles.nicknameText}>{profile?.nickname}</span>
      {!isOtherProfile && (
        <PixelButton size="sm" variant="beige" onClick={startEdit}>
          수정
        </PixelButton>
      )}
    </>
  );

  if (isLoading) {
    return (
      <BaseModal isOpen={isOpen} onClose={onClose}>
        <div className={styles.cardContainer}>
          <div style={{ padding: '2rem', textAlign: 'center' }}>로딩 중...</div>
        </div>
      </BaseModal>
    );
  }

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
              {isEditing && !isOtherProfile ? editModeView : viewModeView}
              {/* 타인 프로필: 관계 상태별 액션 버튼 (닉네임 오른쪽) */}
              {isOtherProfile &&
                otherProfile?.relationStatus &&
                renderActionButtons(otherProfile.relationStatus)}
            </div>

            <div className={styles.categoryRow}>#판타지</div>

            {/* 총 독서 시간 */}
            <div className={styles.timeSection}>
              총 독서시간: {profile?.totalReadingTime || 0} 분
            </div>

            {/* 책 통계 */}
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>읽는 중인 책</span>
                <span className={styles.statValue}>
                  {profile?.bookCounts.reading || 0}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>읽은 책</span>
                <span className={styles.statValue}>
                  {profile?.bookCounts.completed || 0}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>읽고 싶은 책</span>
                <span className={styles.statValue}>
                  {profile?.bookCounts.wish || 0}
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
