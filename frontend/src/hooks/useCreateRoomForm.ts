import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { searchBook } from '@/api/book.api';
import { categoryApi } from '@/api/category.api';
import { roomApi } from '@/api/room.api';
import { useDebounce } from '@/hooks/common/useDebounce';
import {
  useCreateRoom,
  useUpdateScheduledRoom,
} from '@/services/mutations/useRoomMutations';
import { useAuthStore } from '@/store/useAuthStore';
import { useBookTalkRoomStore } from '@/store/useBookTalkRoomStore';
import { useGameStore } from '@/store/useGameStore';
import { useModalStore } from '@/store/useModalStore';
import { getLocalDateString } from '@/utils/date';

import type { Book } from '@/types/entities/book.types';
import type {
  AccessType,
  RECOMMENDED_ROOM,
  RoomType,
} from '@/types/entities/room.types';

export const useCreateRoomForm = (closeModal: () => void) => {
  const { openModal, modalProps } = useModalStore();
  const editRoomData = modalProps?.editRoom?.room;
  const isEditMode = !!editRoomData;

  const { mutate: createRoom, isPending: isCreating } = useCreateRoom();
  const { mutate: updateRoom, isPending: isUpdating } =
    useUpdateScheduledRoom();
  const isPending = isCreating || isUpdating;

  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const setRoomId = useGameStore((state) => state.setRoomId);
  const setRoomCode = useGameStore((state) => state.setRoomCode);
  const setCurrentFloor = useGameStore((state) => state.setCurrentFloor);
  const setSpawnPoint = useGameStore((state) => state.setSpawnPoint);

  const setRoom4Room = useBookTalkRoomStore((state) => state.setRoom4Room);
  const initialRoomType: RoomType = user?.role === 'ADMIN' ? 'CONCERT' : 'TALK';

  // [상태] 초기값 설정
  const [title, setTitle] = useState(editRoomData?.title || '');
  const [roomType] = useState<RoomType>(
    editRoomData?.roomType || initialRoomType,
  );
  const [accessType, setAccessType] = useState<AccessType>(
    editRoomData?.accessType || 'PUBLIC',
  );
  const [maxUser, setMaxUser] = useState<number>(editRoomData?.maxUser || 4);
  const [categoryId, setCategoryId] = useState('');

  // [수정] 예약 방 여부는 status로 판단 (없으면 기본값 false)
  const [isScheduled, setIsScheduled] = useState(() => {
    if (editRoomData) return editRoomData.status === 'SCHEDULED';
    return false;
  });

  // [상태] 날짜/시간 초기화
  const [startDate, setStartDate] = useState(() => {
    if (editRoomData?.startAt) {
      const date = new Date(editRoomData.startAt);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    return '';
  });

  const [startTime, setStartTime] = useState(() => {
    if (editRoomData?.startAt) {
      const date = new Date(editRoomData.startAt);
      const h = String(date.getHours()).padStart(2, '0');
      // 30분 단위 선택지(00, 30)에 맞게 조정
      const m = date.getMinutes() < 30 ? '00' : '30';
      return `${h}:${m}`;
    }
    return '12:00';
  });

  const [endDate, setEndDate] = useState(() => {
    if (editRoomData?.endAt) {
      const date = new Date(editRoomData.endAt);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    return '';
  });

  const [endTime, setEndTime] = useState(() => {
    if (editRoomData?.endAt) {
      const date = new Date(editRoomData.endAt);
      const h = String(date.getHours()).padStart(2, '0');
      const m = date.getMinutes() < 30 ? '00' : '30';
      return `${h}:${m}`;
    }
    return '13:00';
  });

  const [bookSearchKeyword, setBookSearchKeyword] = useState('');

  // 책 정보 초기화
  const [selectedBook, setSelectedBook] = useState<Book | null>(() => {
    if (editRoomData?.bookTitle) {
      return {
        title: editRoomData.bookTitle,
        author: editRoomData.bookAuthor || '',
        isbn: '',
        coverUrl: editRoomData.bookCoverUrl || '',
        category: '',
        publisher: '',
        itemId: 0,
      };
    }
    return null;
  });
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const debouncedKeyword = useDebounce(bookSearchKeyword, 300);

  // 카테고리 로드
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategoryList,
  });

  // 수정 모드일 때 categories에서 매칭되는 ID를 찾음
  const matchedCategory =
    editRoomData && categories.length > 0
      ? categories.find((c) => c.name === editRoomData.categoryName)
      : null;

  // 최종 카테고리 ID: 유저가 선택한 값(categoryId)이 있으면 우선, 없으면 초기값(matchedCategory) 사용
  const finalCategoryId = categoryId || matchedCategory?.categoryId || '';

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
      const today = getLocalDateString();
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

    // 수정 vs 생성 분기 처리
    if (isEditMode && editRoomData) {
      // [수정 요청]
      updateRoom(
        {
          roomId: editRoomData.roomId,
          title,
          maxUser,
          categoryId: finalCategoryId,
          isbn: selectedBook?.isbn,
          startAt: isScheduled ? formattedStart : undefined,
          endAt: isScheduled ? formattedEnd : undefined,
        },
        {
          onSuccess: () => {
            closeModal();
            openModal('alert', {
              title: '성공',
              message: '방 정보가 수정되었습니다.',
            });
          },
        },
      );
    } else {
      // [생성 요청]
      createRoom(
        {
          title,
          roomType,
          accessType,
          maxUser,
          status: isScheduled ? 'SCHEDULED' : 'LIVE',
          categoryId: finalCategoryId,
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
              categoryName:
                categories.find((c) => c.categoryId === finalCategoryId)
                  ?.name || '기타',
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
                    const joinReqBody =
                      accessType === 'PRIVATE' && response.code
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
                      queryClient.invalidateQueries({
                        queryKey: ['room', response.roomId],
                      }),
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
                    message:
                      '방 입장에 실패했습니다. 잠시 후 다시 시도해주세요.',
                  });
                }
              },
            });
          },
        },
      );
    }
  };

  return {
    formState: {
      isEditMode,
      title,
      accessType,
      maxUser,
      categoryId: finalCategoryId,
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
