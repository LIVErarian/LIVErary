import { useEffect, useRef, useState } from 'react';
import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';

import { searchBook } from '@/api/book.api';
import { categoryApi } from '@/api/category.api';
import { useDebounce } from '@/hooks/common/useDebounce';
import { useCreateRoom } from '@/hooks/mutations/useRoomMutations';
import { useAuthStore } from '@/store/useAuthStore';
import { useModalStore } from '@/store/useModalStore';

import type { Book } from '@/types/book.types';
import type { AccessType, RECOMMENDED_ROOM, RoomType } from '@/types/room.types';
import { roomApi } from '@/api/room.api';
import { useGameStore } from '@/store/useGameStore';
import { useBookTalkRoomStore } from '@/store/useBookTalkRoomStore';

export const useCreateRoomForm = (closeModal: () => void) => {
  const { openModal } = useModalStore();
  const { mutate: createRoom, isPending } = useCreateRoom();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  
  const setRoomId = useGameStore((state) => state.setRoomId);
  const setRoomCode = useGameStore((state) => state.setRoomCode);
  const setCurrentFloor = useGameStore((state) => state.setCurrentFloor);
  const setSpawnPoint = useGameStore((state) => state.setSpawnPoint);

  const setRoom4Room = useBookTalkRoomStore((state) => state.setRoom4Room);
  const initialRoomType: RoomType = user?.role === 'ADMIN' ? 'CONCERT' : 'TALK';

  const [title, setTitle] = useState('');
  const [roomType] = useState<RoomType>(initialRoomType);
  const [accessType, setAccessType] = useState<AccessType>('PUBLIC');
  const [maxUser, setMaxUser] = useState<number>(4);
  const [categoryId, setCategoryId] = useState('');

  const [isScheduled, setIsScheduled] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('12:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('13:00');

  const [bookSearchKeyword, setBookSearchKeyword] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  const debouncedKeyword = useDebounce(bookSearchKeyword, 300);

  // 데이터 로딩
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategoryList,
  });

  const { data: bookSearchResults, isLoading: isSearchingBooks } = useQuery({
    queryKey: ['bookSearchDropdown', debouncedKeyword],
    queryFn: () => searchBook(debouncedKeyword, 0, 10),
    enabled: !!debouncedKeyword && debouncedKeyword.length >= 2,
    staleTime: 1000 * 60 * 5,
  });

  // 바깥 클릭 시 검색창 닫히게
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setBookSearchKeyword('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 핸들러
  // 예약이면 무조건 private으로 변경
  const handleScheduledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsScheduled(checked);

    if (checked) {
      setAccessType('PRIVATE');
      const today = new Date().toISOString().split('T')[0];
      if (!startDate) setStartDate(today);
      if (!endDate) setEndDate(today);
    } else {
      setAccessType('PUBLIC');
    }
  };

  // 책 검색
  const handleBookSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBookSearchKeyword(e.target.value);
    if (selectedBook) {
      setSelectedBook(null);
      setCategoryId('');
    }
  };

  // 책 선택시 카테고리 자동 선택
  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setBookSearchKeyword('');

    if (categories.length > 0) {
      const matched = categories.find(
        (c) => book.category.includes(c.name) || c.name.includes(book.category),
      );
      if (matched) setCategoryId(matched.categoryId);
    }
  };

  // 책 제거
  const handleRemoveBook = () => {
    setSelectedBook(null);
    setCategoryId('');
    setBookSearchKeyword('');
  };

  // 인원 수 조절 (버튼)
  const handleMaxUserBtn = (delta: number) => {
    const newVal = maxUser + delta;
    if (newVal >= 2 && newVal <= 20) setMaxUser(newVal);
  };

  // 인원 수 직접 입력
  const handleMaxUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) return;
    if (val > 20) setMaxUser(20);
    else setMaxUser(val);
  };

  // 인원 수 입력 범위 보정
  const handleMaxUserBlur = () => {
    if (maxUser < 2) setMaxUser(2);
  };

  // 제출
  const handleSubmit = () => {
    if (!title.trim())
      return openModal('alert', {
        title: '알림',
        message: '방 제목을 입력해주세요.',
      });
    if (!categoryId)
      return openModal('alert', {
        title: '알림',
        message: '카테고리를 선택해주세요.',
      });
    if (!selectedBook && !categoryId)
      return openModal('alert', {
        title: '알림',
        message: '카테고리는 필수입니다.',
      });
    if (maxUser < 2 || maxUser > 20)
      return openModal('alert', {
        title: '알림',
        message: '인원은 2명 이상 20명 이하여야 합니다.',
      });

    let formattedStart = undefined;
    let formattedEnd = undefined;

    if (isScheduled) {
      if (!startDate || !startTime || !endDate || !endTime) {
        return openModal('alert', {
          title: '알림',
          message: '예약 시간을 모두 설정해주세요.',
        });
      }
      const start = new Date(`${startDate}T${startTime}:00`);
      const end = new Date(`${endDate}T${endTime}:00`);
      const now = new Date();

      if (start < now)
        return openModal('alert', {
          title: '알림',
          message: '시작 시간은 현재보다 미래여야 합니다.',
        });
      if (end <= start)
        return openModal('alert', {
          title: '알림',
          message: '종료 시간은 시작 시간보다 뒤여야 합니다.',
        });

      const diffTime = end.getTime() - start.getTime();
      const oneDayInMs = 24 * 60 * 60 * 1000;

      if (diffTime > oneDayInMs) {
        return openModal('alert', {
          title: '알림',
          message: '종료 시간은 시작 시간으로부터 24시간 이내여야 합니다.',
        });
      }

      formattedStart = start.toISOString();
      formattedEnd = end.toISOString();
    }

    createRoom(
      {
        title,
        roomType,
        accessType,
        maxUser,
        status: isScheduled ? 'SCHEDULED' : 'LIVE',
        categoryId,
        isbn: selectedBook?.isbn,
        startAt: formattedStart,
        endAt: formattedEnd,
      },
      {
        onSuccess: (response) => {
          // 성공하자마자 방 생성 모달 닫기
          closeModal();

          // [수정] 방 생성 성공 시, 아직 입장 전이므로 count: 0으로 설정
          // MapManager 등에서 room-4 슬롯에 0명으로 표시되도록 함
          const roomData: RECOMMENDED_ROOM = {
            roomId: response.roomId,
            title,
            roomType,
            accessType,
            status: isScheduled ? 'SCHEDULED' : 'LIVE',
            categoryName: categories.find((c) => c.categoryId === categoryId)?.name || '기타',
            currentCount: 0, // 입장 전 0명
            maxUser,
          };
          setRoom4Room(roomData);

          // 입장 확인 모달
          openModal('entrance', {
            title: '방 생성 완료',
            message: `"${title}" 방이 생성되었습니다.\n바로 입장하시겠습니까?`,
            onConfirm: async () => {
              try {
                closeModal();

                if (response?.roomId) {
                  const joinReqBody = accessType === 'PRIVATE' && response.code 
                      ? { code: response.code } 
                      : {};

                  // [API] 방 입장 요청
                  await roomApi.joinRoom(response.roomId, joinReqBody);
                  setRoom4Room({ ...roomData, currentCount: 1 });

                  // 데이터 즉시 갱신 (방 목록 + 상세 정보)
                  // 'rooms': 방 목록의 인원수 갱신
                  // 'room': 입장 후 우측 패널(InfoPanel)의 인원수 갱신
                  await Promise.all([
                    queryClient.invalidateQueries({ queryKey: ['rooms'] }),
                    queryClient.invalidateQueries({ queryKey: ['room', response.roomId] })
                  ]);
                  
                  setRoomId(response.roomId);
                  setRoomCode(response.code ?? null);
                  setSpawnPoint({ x: 0.88, y: 0.5 });
                  setCurrentFloor('conferenceFloor');
                }
              } catch (error) {
                console.error(error);
                openModal('alert', { 
                  title: '입장 실패', 
                  message: '방 입장에 실패했습니다. 잠시 후 다시 시도해주세요.' 
                });
              }
            },
          });
        },
      },
    );
  };

  return {
    formState: {
      title,
      accessType,
      maxUser,
      categoryId,
      isScheduled,
      startDate,
      startTime,
      endDate,
      endTime,
      selectedBook,
      categories,
      bookSearchKeyword,
      bookSearchResults: bookSearchResults?.content || [],
      isSearchingBooks,
      debouncedKeyword,
    },
    setters: {
      setTitle,
      setAccessType,
      setCategoryId,
      setStartDate,
      setStartTime,
      setEndDate,
      setEndTime,
    },
    handlers: {
      handleScheduledChange,
      handleBookSearchChange,
      handleBookSelect,
      handleRemoveBook,
      handleMaxUserBtn,
      handleMaxUserInputChange, // 추가
      handleMaxUserBlur, // 추가
      handleSubmit,
    },
    searchContainerRef,
    isPending,
  };
};
