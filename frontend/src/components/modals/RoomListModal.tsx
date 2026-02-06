import { useState } from 'react';

import { PixelButton } from '@/components/common/PixelButton';
import { PixelInput } from '@/components/common/PixelInput';
import {
  useLiveRoomList,
  useMyScheduledRooms,
  useReservationRoomList,
} from '@/hooks/queries/useRoomQueries';
import { useModalStore } from '@/store/useModalStore';

import type {
  MyScheduledRoomResponseData,
  PageResponse,
  ROOM_DETAIL,
} from '@/types/room.types';

import * as styles from './RoomListModal.css';

type TabType = 'LIVE' | 'SCHEDULED' | 'MY';

export const RoomListModal = () => {
  const { openModal } = useModalStore();

  const [currentTab, setCurrentTab] = useState<TabType>('LIVE');
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // 라이브 방 목록 조회
  const { data: liveData, isLoading: isLiveLoading } = useLiveRoomList({
    page,
    size: 8,
    keyword: searchQuery,
    accessType: 'PUBLIC',
  });

  // 예약 방 목록 조회
  const { data: scheduledData, isLoading: isScheduledLoading } =
    useReservationRoomList({
      page,
      size: 8,
      keyword: searchQuery,
    });

  // 내 예약 방 목록 조회
  const { data: myData, isLoading: isMyLoading } = useMyScheduledRooms();

  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab);
    setPage(0);
    setKeyword('');
    setSearchQuery('');
  };

  const handleSearch = () => {
    setSearchQuery(keyword);
    setPage(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleCreateRoom = () => {
    openModal('createRoom');
  };

  const handleJoinRoom = (roomId: string) => {
    console.log('방 입장 시도:', roomId);
    // openModal('entrance', { roomId });
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  };

  // 탭에 따른 데이터 선택
  let currentList: (ROOM_DETAIL | MyScheduledRoomResponseData)[] = [];
  let isLoading = false;
  let paginationData: PageResponse<ROOM_DETAIL> | null | undefined;

  if (currentTab === 'LIVE') {
    isLoading = isLiveLoading;
    currentList =
      liveData?.content.filter((room) => room.roomType !== 'STABLE') || [];
    paginationData = liveData;
  } else if (currentTab === 'SCHEDULED') {
    isLoading = isScheduledLoading;
    currentList =
      scheduledData?.content.filter((room) => room.roomType !== 'STABLE') || [];
    paginationData = scheduledData;
  } else if (currentTab === 'MY') {
    isLoading = isMyLoading;
    currentList = myData || [];
    paginationData = undefined;
  }

  return (
    <div className={styles.container}>
      {/* 1. 상단 툴바 */}
      <div className={styles.toolbar}>
        <div className={styles.searchGroup}>
          <div className={styles.searchInputWrapper}>
            <PixelInput
              placeholder="방 제목을 검색하세요"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              fullWidth
              disabled={currentTab === 'MY'}
            />
          </div>
          <PixelButton onClick={handleSearch} disabled={currentTab === 'MY'}>
            검색
          </PixelButton>
        </div>

        <PixelButton variant="primary" onClick={handleCreateRoom}>
          + 방 만들기
        </PixelButton>
      </div>

      {/* 2. 탭 버튼 영역 */}
      <div className={styles.header}>
        <button
          className={`${styles.tabButton} ${
            currentTab === 'LIVE' ? styles.activeTab : ''
          }`}
          onClick={() => handleTabChange('LIVE')}
        >
          진행 중
        </button>
        <button
          className={`${styles.tabButton} ${
            currentTab === 'SCHEDULED' ? styles.activeTab : ''
          }`}
          onClick={() => handleTabChange('SCHEDULED')}
        >
          예약됨
        </button>
        <button
          className={`${styles.tabButton} ${
            currentTab === 'MY' ? styles.activeTab : ''
          }`}
          onClick={() => handleTabChange('MY')}
        >
          내 예약
        </button>
      </div>

      {/* 3. 테이블 컨테이너 (BoardList의 스타일 적용) */}
      <div className={styles.tableContainer}>
        {/* 리스트 헤더 (그리드 정렬 유지) */}
        <div className={styles.listHeader}>
          <span>상태</span>
          <span>방 제목</span>
          <span>{currentTab === 'LIVE' ? '카테고리' : '시작 시간'}</span>
          <span>인원</span>
        </div>

        {/* 리스트 바디 */}
        <div className={styles.listBody}>
          {isLoading ? (
            <div className={styles.emptyState}>로딩 중...</div>
          ) : currentList.length === 0 ? (
            <div className={styles.emptyState}>
              {currentTab === 'MY'
                ? '예약한 방이 없습니다.'
                : '조건에 맞는 방이 없습니다.'}
            </div>
          ) : (
            currentList.map((item) => {
              const isMyRoom = currentTab === 'MY';
              const detailRoom = !isMyRoom ? (item as ROOM_DETAIL) : undefined;

              const isFull = detailRoom
                ? detailRoom.currentCount >= detailRoom.maxUser
                : false;

              let statusText = '[입장가능]';
              let statusStyle = styles.statusLive;

              if (isMyRoom) {
                statusText = '[내 예약]';
                statusStyle = styles.statusScheduled;
              } else if (currentTab === 'SCHEDULED') {
                statusText = '[예약됨]';
                statusStyle = styles.statusScheduled;
              } else if (isFull) {
                statusText = '[만원]';
                statusStyle = styles.statusFull;
              }

              return (
                <div
                  key={item.roomId}
                  className={styles.tableRow}
                  onClick={() => handleJoinRoom(item.roomId)}
                >
                  {/* 상태 (1.5fr) */}
                  <span className={`${styles.textStatus} ${statusStyle}`}>
                    {statusText}
                  </span>

                  {/* 제목 (7fr) */}
                  <span className={styles.textTitle} title={item.title}>
                    {item.title}
                  </span>

                  {/* 정보 (2fr) */}
                  <span className={styles.textInfo}>
                    {currentTab === 'LIVE'
                      ? detailRoom?.categoryName || '기타'
                      : isMyRoom
                        ? '-'
                        : formatTime(detailRoom?.startAt)}
                  </span>

                  {/* 인원 (2fr) */}
                  <span className={styles.textMembers}>
                    {isMyRoom
                      ? '-'
                      : `${detailRoom?.currentCount} / ${detailRoom?.maxUser}`}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. 페이지네이션 (BoardList와 동일한 위치/스타일) */}
      {currentTab !== 'MY' && paginationData && (
        <div className={styles.pagination}>
          <PixelButton
            disabled={paginationData.first}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            ◀
          </PixelButton>
          <span className={styles.pageNumber}>{paginationData.number + 1}</span>
          <PixelButton
            disabled={paginationData.last}
            onClick={() => setPage((p) => p + 1)}
          >
            ▶
          </PixelButton>
        </div>
      )}
    </div>
  );
};
