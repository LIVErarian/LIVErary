import { useState } from 'react';

import { PixelButton } from '@/components/common/PixelButton';
import { PixelInput } from '@/components/common/PixelInput';
import {
  useAcceptFriend,
  useFriendList,
  usePendingFriendList,
  useRejectFriend,
  useRequestFriend,
  useSearchUser,
} from '@/hooks/queries/useFriend';

import * as styles from './FriendListModal.css';

type TabType = 'FRIENDS' | 'REQUESTS';

export const FriendListModal = () => {
  const [activeTab, setActiveTab] = useState<TabType>('FRIENDS');
  const [searchEmail, setSearchEmail] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);

  const { data: friendList, isLoading: isLoadingFriends } = useFriendList(
    0,
    50,
  );
  const { data: requestList, isLoading: isLoadingRequests } =
    usePendingFriendList(0, 50);

  const { mutate: acceptFriend } = useAcceptFriend();
  const { mutate: rejectFriend } = useRejectFriend();

  const {
    mutate: searchUser,
    data: searchResult,
    isPending: isSearching,
    reset: resetSearch,
  } = useSearchUser();
  const { mutate: requestFriend, isPending: isRequesting } = useRequestFriend();

  const handleAccept = (friendId: string) => {
    acceptFriend(friendId);
  };

  const handleReject = (friendId: string) => {
    if (confirm('정말 거절하시겠습니까?')) {
      rejectFriend(friendId);
    }
  };

  const handleSearch = () => {
    if (!searchEmail.trim()) return;
    setIsSearchMode(true);
    searchUser({ email: searchEmail });
  };

  const handleRequest = () => {
    if (!searchResult) return;
    requestFriend({ receiverEmail: searchResult.email });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchEmail('');
    setIsSearchMode(false);
    resetSearch();
  };

  const handleTabClick = (tab: TabType) => {
    setIsSearchMode(false);
    setActiveTab(tab);
    setSearchEmail('');
    resetSearch();
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
        {isSearchMode ? (
          <PixelButton
            variant="beige"
            onClick={handleClearSearch}
            className={styles.searchButton}
          >
            취소
          </PixelButton>
        ) : (
          <PixelButton
            variant="primary"
            onClick={handleSearch}
            disabled={isSearching || !searchEmail.trim()}
            className={styles.searchButton}
          >
            {isSearching ? '...' : '검색'}
          </PixelButton>
        )}
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
      </div>

      {/* 콘텐츠 영역 */}
      <div className={styles.listContainer}>
        {isSearchMode ? (
          <>
            {isSearching ? (
              <div className={styles.loading}>검색 중...</div>
            ) : searchResult ? (
              <div className={styles.searchResultCard}>
                <div className={styles.nickname}>{searchResult.nickname}</div>
                <div className={styles.email}>{searchResult.email}</div>
                <div className={styles.actionButtons}>
                  {searchResult.relationStatus === 'NONE' && (
                    <PixelButton
                      variant="primary"
                      onClick={handleRequest}
                      disabled={isRequesting}
                    >
                      친구 요청
                    </PixelButton>
                  )}
                  {searchResult.relationStatus === 'FRIEND' && (
                    <span className={styles.statusTag}>이미 친구</span>
                  )}
                  {searchResult.relationStatus === 'PENDING_SENT' && (
                    <span className={styles.statusTag}>요청 보냄</span>
                  )}
                  {searchResult.relationStatus === 'PENDING_RECEIVED' && (
                    <span className={styles.statusTag}>요청 받음</span>
                  )}
                  {searchResult.relationStatus === 'MYSELF' && (
                    <span className={styles.statusTag}>나 자신</span>
                  )}
                  {searchResult.relationStatus === 'BLOCKED_BY_ME' && (
                    <span className={styles.statusTag}>차단됨</span>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>검색 결과가 없습니다</div>
            )}
          </>
        ) : (
          <>
            {activeTab === 'FRIENDS' && (
              <>
                {isLoadingFriends && (
                  <div className={styles.loading}>로딩 중...</div>
                )}
                {!isLoadingFriends && friendList?.content.length === 0 && (
                  <div className={styles.emptyState}>
                    아직 친구가 없어요. 검색해서 친구를 추가해보세요!
                  </div>
                )}
                {friendList?.content.map((friend) => (
                  <div key={friend.friendId} className={styles.listItem}>
                    <div className={styles.nickname}>{friend.nickname}</div>
                    <div className={styles.email}>{friend.email}</div>
                    <div className={styles.actionButtons} />
                  </div>
                ))}
              </>
            )}

            {activeTab === 'REQUESTS' && (
              <>
                {isLoadingRequests && (
                  <div className={styles.loading}>로딩 중...</div>
                )}
                {!isLoadingRequests && requestList?.content.length === 0 && (
                  <div className={styles.emptyState}>받은 요청이 없습니다.</div>
                )}
                {requestList?.content.map((request) => (
                  <div key={request.friendId} className={styles.listItem}>
                    <div className={styles.nickname}>{request.nickname}</div>
                    <div className={styles.email}>{request.email}</div>
                    <div className={styles.actionButtons}>
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
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
