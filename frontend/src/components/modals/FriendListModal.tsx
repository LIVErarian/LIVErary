import { useState } from 'react';

import { PixelButton } from '@/components/common/PixelButton';
import { PixelInput } from '@/components/common/PixelInput';
import {
  useAcceptFriend,
  useBlockedList,
  useFriendList,
  usePendingFriendList,
  useRejectFriend,
  useSearchUser,
  useUnblockUser,
} from '@/hooks/queries/useFriend';
import { useModalStore } from '@/store/useModalStore';

import type { FriendListTabType } from '@/types/friend.types';

import * as styles from './FriendListModal.css';

export const FriendListModal = () => {
  const { modalProps } = useModalStore();
  const [activeTab, setActiveTab] = useState<FriendListTabType>(
    (modalProps.initialTab as FriendListTabType) || 'FRIENDS',
  );
  const [searchEmail, setSearchEmail] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);

  const { data: friendList, isLoading: isLoadingFriends } = useFriendList(
    0,
    50,
  );
  const { data: requestList, isLoading: isLoadingRequests } =
    usePendingFriendList(0, 50);
  const { data: blockedList, isLoading: isLoadingBlocked } = useBlockedList(
    0,
    50,
  );

  const { mutate: acceptFriend } = useAcceptFriend();
  const { mutate: rejectFriend } = useRejectFriend();
  const { mutate: unblockUser, isPending: isUnblocking } = useUnblockUser();

  // 검색 관련 훅
  const {
    mutate: searchUser,
    data: searchResult,
    isPending: isSearching,
    reset: resetSearch,
  } = useSearchUser();

  /**
   * 친구 요청 수락
   * @param friendId - 수락할 친구 요청 ID
   */
  const handleAccept = (friendId: string) => {
    acceptFriend(friendId);
  };

  /**
   * 친구 요청 거절
   * @param friendId - 거절할 친구 요청 ID
   */
  const handleReject = (friendId: string) => {
    useModalStore.getState().openModal('confirm', {
      title: '친구 요청 거절',
      message: '정말 거절하시겠습니까?',
      onConfirm: () => {
        rejectFriend(friendId);
      },
    });
  };

  /**
   * 사용자 차단 해제
   * @param email - 차단 해제할 사용자 이메일
   */
  const handleUnblock = (email: string) => {
    useModalStore.getState().openModal('confirm', {
      title: '차단 해제',
      message: '차단을 해제하시겠습니까?',
      onConfirm: () => {
        unblockUser(email, {
          onSuccess: () => {
            useModalStore
              .getState()
              .openModal('alert', { message: '차단을 해제했습니다.' });
          },
        });
      },
    });
  };

  /**
   * 프로필 보기
   * @param userId - 조회할 사용자 ID
   * @param friendId - 친구 요청 ID (선택적, 수락/거절용)
   */
  const handleViewProfile = (userId: string, friendId?: string) => {
    useModalStore.getState().openUserProfile(userId, friendId);
  };

  /**
   * 사용자 검색 실행
   * 입력된 이메일로 사용자를 검색하고 검색 모드로 전환
   */
  const handleSearch = () => {
    if (!searchEmail.trim()) return;
    setIsSearchMode(true);
    searchUser({ email: searchEmail });
  };

  /**
   * Enter 키 입력 시 검색 실행
   * @param e - 키보드 이벤트
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  /**
   * 검색 상태 초기화
   * 검색어, 검색 모드, 검색 결과를 모두 초기화
   */
  const handleClearSearch = () => {
    setSearchEmail('');
    setIsSearchMode(false);
    resetSearch();
  };

  /**
   * 탭 전환 처리
   * @param tab - 전환할 탭 타입
   */
  const handleTabClick = (tab: FriendListTabType) => {
    setIsSearchMode(false);
    setActiveTab(tab);
    setSearchEmail('');
    resetSearch();
  };

  /**
   * 검색 버튼 렌더링
   * 검색 모드에 따라 '검색' 또는 '취소' 버튼 표시
   * @returns 검색 또는 취소 버튼 컴포넌트
   */
  const renderSearchButton = () => {
    if (isSearchMode) {
      return (
        <PixelButton
          variant="beige"
          onClick={handleClearSearch}
          className={styles.searchButton}
        >
          취소
        </PixelButton>
      );
    }

    return (
      <PixelButton
        variant="primary"
        onClick={handleSearch}
        disabled={isSearching || !searchEmail.trim()}
        className={styles.searchButton}
      >
        {isSearching ? '...' : '검색'}
      </PixelButton>
    );
  };

  /**
   * 검색 결과의 액션 버튼 렌더링
   * 모든 관계 상태에서 프로필 보기 버튼 표시
   * @returns 프로필 보기 버튼
   */
  const renderSearchResultActions = () => {
    if (!searchResult) return null;

    return (
      <PixelButton
        variant="primary"
        onClick={() => handleViewProfile(searchResult.userId)}
      >
        프로필 보기
      </PixelButton>
    );
  };

  /**
   * 검색 결과 영역 렌더링
   * 검색 중, 결과 있음, 결과 없음 상태에 따라 적절한 UI 표시
   * @returns 검색 결과 UI
   */
  const renderSearchResult = () => {
    if (isSearching) {
      return <div className={styles.loading}>검색 중...</div>;
    }

    if (searchResult) {
      return (
        <div className={styles.searchResultCard}>
          <div className={styles.nickname}>{searchResult.nickname}</div>
          <div className={styles.email}>{searchResult.email}</div>
          <div className={styles.actionButtons}>
            {renderSearchResultActions()}
          </div>
        </div>
      );
    }

    return <div className={styles.emptyState}>검색 결과가 없습니다</div>;
  };

  /**
   * 친구 목록(ACCEPTED 상태) 렌더링
   * @returns 친구 목록 아이템 또는 로딩/빈 상태 UI
   */
  const renderFriendList = () => {
    if (isLoadingFriends) {
      return <div className={styles.loading}>로딩 중...</div>;
    }

    if (friendList?.content.length === 0) {
      return (
        <div className={styles.emptyState}>
          아직 친구가 없어요. 검색해서 친구를 추가해보세요!
        </div>
      );
    }

    return friendList?.content.map((friend) => {
      console.log('👥 Friend item:', friend); // 디버깅: friend 객체 확인
      return (
        <div key={friend.friendId} className={styles.listItem}>
          <div className={styles.nickname}>{friend.nickname}</div>
          <div className={styles.email}>{friend.email}</div>
          <div className={styles.actionButtons}>
            <PixelButton
              size="sm"
              variant="primary"
              onClick={() => handleViewProfile(friend.userId)}
            >
              프로필 보기
            </PixelButton>
          </div>
        </div>
      );
    });
  };

  /**
   * 받은 친구 요청 목록(PENDING 상태) 렌더링
   * @returns 요청 목록 아이템 또는 로딩/빈 상태 UI
   */
  const renderRequestList = () => {
    if (isLoadingRequests) {
      return <div className={styles.loading}>로딩 중...</div>;
    }

    if (requestList?.content.length === 0) {
      return <div className={styles.emptyState}>받은 요청이 없습니다.</div>;
    }

    return requestList?.content.map((request) => (
      <div key={request.friendId} className={styles.listItem}>
        <div className={styles.nickname}>{request.nickname}</div>
        <div className={styles.email}>{request.email}</div>
        <div className={styles.actionButtons}>
          <PixelButton
            size="sm"
            variant="beige"
            onClick={() => handleViewProfile(request.userId, request.friendId)}
          >
            프로필 보기
          </PixelButton>
          <PixelButton
            size="sm"
            variant="primary"
            onClick={() => handleAccept(request.friendId)}
          >
            수락
          </PixelButton>
          <PixelButton
            size="sm"
            variant="danger"
            onClick={() => handleReject(request.friendId)}
          >
            거절
          </PixelButton>
        </div>
      </div>
    ));
  };

  /**
   * 차단한 사용자 목록(BLOCKED 상태) 렌더링
   * @returns 차단 목록 아이템 또는 로딩/빈 상태 UI
   */
  const renderBlockedList = () => {
    if (isLoadingBlocked) {
      return <div className={styles.loading}>로딩 중...</div>;
    }

    if (blockedList?.content.length === 0) {
      return <div className={styles.emptyState}>차단한 사용자가 없습니다.</div>;
    }

    return blockedList?.content.map((blocked) => (
      <div key={blocked.friendId} className={styles.listItem}>
        <div className={styles.nickname}>{blocked.nickname}</div>
        <div className={styles.email}>{blocked.email}</div>
        <div className={styles.actionButtons}>
          <PixelButton
            size="sm"
            variant="beige"
            onClick={() => handleUnblock(blocked.email)}
            disabled={isUnblocking}
          >
            차단 해제
          </PixelButton>
        </div>
      </div>
    ));
  };

  /**
   * 메인 콘텐츠 영역 렌더링
   * 검색 모드 또는 활성 탭에 따라 적절한 콘텐츠 표시
   * @returns 검색 결과, 친구 목록, 요청 목록, 차단 목록 중 하나
   */
  const renderContent = () => {
    if (isSearchMode) {
      return renderSearchResult();
    }

    if (activeTab === 'FRIENDS') {
      return renderFriendList();
    }

    if (activeTab === 'REQUESTS') {
      return renderRequestList();
    }

    return renderBlockedList();
  };

  return (
    <div className={styles.container}>
      {/* 검색창 */}
      <div className={styles.searchContainer}>
        <PixelInput
          type="email"
          placeholder="이메일로 친구 검색..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          className={styles.searchInput}
        />
        {renderSearchButton()}
      </div>

      {/* 탭 */}
      <div className={styles.tabContainer}>
        <PixelButton
          className={`${styles.tabButton} ${!isSearchMode && activeTab === 'FRIENDS' ? styles.activeTab : ''}`}
          onClick={() => handleTabClick('FRIENDS')}
        >
          내 친구
        </PixelButton>
        <PixelButton
          className={`${styles.tabButton} ${!isSearchMode && activeTab === 'REQUESTS' ? styles.activeTab : ''}`}
          onClick={() => handleTabClick('REQUESTS')}
        >
          받은 요청
          {requestList && requestList.content.length > 0 && (
            <span className={styles.badge}>({requestList.content.length})</span>
          )}
        </PixelButton>
        <PixelButton
          className={`${styles.tabButton} ${!isSearchMode && activeTab === 'BLOCKED' ? styles.activeTab : ''}`}
          onClick={() => handleTabClick('BLOCKED')}
        >
          차단 목록
        </PixelButton>
      </div>

      {/* 콘텐츠 영역 */}
      <div className={styles.listContainer}>{renderContent()}</div>
    </div>
  );
};
