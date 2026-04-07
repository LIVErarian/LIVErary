import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { PixelButton } from '@/components/common/PixelButton';
import { PixelInput } from '@/components/common/PixelInput';
import { roomKeys } from '@/services/queries/useRoomQueries';
import {
  useLiveRoomList,
  useMyScheduledRooms,
  useReservationRoomList,
} from '@/services/queries/useRoomQueries';
import { useModalStore } from '@/store/useModalStore';
import { LiveRoomDetailModal } from './LiveRoomDetailModal';
import { ScheduledRoomDetailModal } from './ScheduledRoomDetailModal';

import type {
  MyScheduledRoomResponseData,
  PageResponse,
  ROOM_DETAIL,
} from '@/types/entities/room.types';

import * as styles from './RoomListModal.css';

type TabType = 'LIVE' | 'SCHEDULED' | 'MY';

export const RoomListModal = () => {
  const { openModal } = useModalStore();
  const queryClient = useQueryClient();

  const [currentTab, setCurrentTab] = useState<TabType>('LIVE');
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLiveRoomId, setSelectedLiveRoomId] = useState<string | null>(
    null,
  );

  // 상세 모달 제어를 위한 지역 상태 (roomId 저장)
  const [selectedScheduledRoomId, setSelectedScheduledRoomId] = useState<
    string | null
  >(null);

  // 1. [라이브] 방 목록 조회 (API: /rooms/live)
  const { data: liveData, isLoading: isLiveLoading } = useLiveRoomList({
    page,
    size: 8,
    keyword: searchQuery,
  });

  // 2. [예약] 방 목록 조회 (API: /rooms/reservation)
  const { data: scheduledData, isLoading: isScheduledLoading } =
    useReservationRoomList({
      page,
      size: 8,
      keyword: searchQuery, // 예약 방 검색어 (여기로 들어가야 함!)
    });

  // 3. [내 예약] 목록 조회 (API: /rooms/reservation/my)
  const { data: myData, isLoading: isMyLoading } = useMyScheduledRooms();

  // 탭 변경 핸들러
  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab);
    setPage(0);
    setKeyword('');
    setSearchQuery(''); // 탭 바꿀 때 검색어 초기화
  };

  // 검색 핸들러
  const handleSearch = () => {
    setSearchQuery(keyword); // 검색어 상태 업데이트 -> 훅이 재실행됨
    setPage(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleCreateRoom = () => {
    openModal('createRoom');
  };

  const handleJoinRoom = (roomId: string) => {
    if (currentTab === 'SCHEDULED' || currentTab === 'MY') {
      // 예약/내 예약 탭에서는 상세 정보 모달 띄우기 (useState 이용)
      setSelectedScheduledRoomId(roomId);
    } else {
      // 라이브 탭에서는 바로 입장 모달
      setSelectedLiveRoomId(roomId);
      console.log('라이브 방 입장 시도:', roomId);
    }
  };

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
    // 예약 방 데이터 불러오기
    currentList =
      scheduledData?.content.filter((room) => room.roomType !== 'STABLE') || [];
    paginationData = scheduledData;
  } else if (currentTab === 'MY') {
    isLoading = isMyLoading;
    currentList = myData || [];
    paginationData = undefined;
  }

  return (
    <>
      <div className={styles.container}>
        {/* 1. 상단 툴바 */}
        <div className={styles.toolbar}>
          <div className={styles.searchGroup}>
            <div className={styles.searchInputWrapper}>
              <PixelInput
                placeholder={
                  currentTab === 'LIVE' ? '라이브 방 검색' : '예약 방 검색'
                }
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                fullWidth
                disabled={currentTab === 'MY'} // 내 예약은 검색 끔
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

        {/* 탭 버튼 */}
        <div className={styles.header}>
          {(['LIVE', 'SCHEDULED', 'MY'] as const).map((tab) => (
            <PixelButton
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`${styles.tabButton} ${
                currentTab === tab ? styles.activeTab : ''
              }`}
            >
              {tab === 'LIVE'
                ? '진행 중'
                : tab === 'SCHEDULED'
                  ? '진행 예정'
                  : '내 예약'}
            </PixelButton>
          ))}
        </div>

        {/* 리스트 영역 */}
        <div className={styles.tableContainer}>
          <div className={styles.listHeader}>
            <span>상태</span>
            <span>방 제목</span>
            <span>카테고리</span>
            <span>인원</span>
          </div>

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
                let detailRoom = !isMyRoom ? (item as ROOM_DETAIL) : undefined;

                if (!isMyRoom) {
                  detailRoom = item as ROOM_DETAIL;
                } else {
                  const allReservations = queryClient.getQueriesData<
                    PageResponse<ROOM_DETAIL>
                  >({
                    queryKey: roomKeys.reservations(),
                  });

                  // 모든 페이지/검색어 조건의 캐시된 예약 방 목록을 평탄화해서 검색
                  const found = allReservations
                    .flatMap(([, data]) => data?.content || [])
                    .find((r) => r.roomId === item.roomId);

                  if (found) {
                    detailRoom = found;
                  } else {
                    // 캐시에도 없다면 최소한의 정보 표시
                    detailRoom = {
                      roomId: item.roomId,
                      title: item.title,
                      categoryName: '-', // 또는 '-',
                      currentCount: 0,
                      maxUser: 0,
                      roomType: 'TALK', // 기본값
                      accessType: 'PUBLIC', // 기본값
                      status: 'SCHEDULED', // 기본값
                    } as ROOM_DETAIL;
                  }
                }

                const isPrivate = detailRoom?.accessType === 'PRIVATE';

                const isFull = detailRoom
                  ? detailRoom.currentCount >= detailRoom.maxUser
                  : false;

                let statusText = '[입장가능]';
                let statusStyle = styles.statusLive;

                if (isMyRoom) {
                  statusText = '[내 예약]';
                  statusStyle = styles.statusScheduled;
                } else if (currentTab === 'SCHEDULED') {
                  statusText = '[모집 중]';
                  statusStyle = styles.statusScheduled;
                } else if (isFull) {
                  statusText = '[마감]';
                  statusStyle = styles.statusFull;
                }

                return (
                  <div
                    key={item.roomId}
                    className={styles.tableRow}
                    onClick={() => handleJoinRoom(item.roomId)}
                  >
                    {/* 상태 */}
                    <span className={`${styles.textStatus} ${statusStyle}`}>
                      {statusText}
                    </span>

                    {/* 제목 */}
                    <span className={styles.textTitle} title={item.title}>
                      {isPrivate && '🔒 '} {item.title}
                    </span>

                    {/* 카테고리 */}
                    <span className={styles.textInfo}>
                      {detailRoom?.categoryName}
                    </span>

                    {/* 인원 */}
                    <span className={styles.textMembers}>
                      {detailRoom?.currentCount} / {detailRoom?.maxUser}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 페이지네이션 (내 예약 탭 아닐 때만) */}
        {currentTab !== 'MY' && paginationData && (
          <div className={styles.pagination}>
            <PixelButton
              disabled={paginationData.first}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              ◀
            </PixelButton>
            <span className={styles.pageNumber}>
              {paginationData.number + 1}
            </span>
            <PixelButton
              disabled={paginationData.last}
              onClick={() => setPage((p) => p + 1)}
            >
              ▶
            </PixelButton>
          </div>
        )}
      </div>

      {/* 라이브 방 상세 모달 */}
      <LiveRoomDetailModal
        roomId={selectedLiveRoomId}
        onClose={() => setSelectedLiveRoomId(null)}
      />
      {/* 예약 방 상세 모달 */}
      <ScheduledRoomDetailModal
        roomId={selectedScheduledRoomId}
        onClose={() => setSelectedScheduledRoomId(null)}
      />
    </>
  );
};
