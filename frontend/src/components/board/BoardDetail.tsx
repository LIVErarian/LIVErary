import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import {
  useApplyScheduledRoom,
  useDeleteApplyScheduledRoom,
} from '@/services/mutations/useRoomMutations';
import { useDeleteBoard, useGetBoardDetail } from '@/services/queries/useBoard';
import { useAuthStore } from '@/store/useAuthStore';
import { useModalStore } from '@/store/useModalStore';
import { PixelButton } from '../common/PixelButton';
import { ReviewList } from './ReviewList';

import type { CommonResponse } from '@/types/common/api.types';
import type { BoardDetail as BoardDetailData } from '@/types/entities/board.types';

import * as styles from './BoardDetail.css';
import { theme } from '@/styles/theme.css';

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleString();

const PromotionDetails = ({ post }: { post: BoardDetailData }) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { openModal } = useModalStore();

  const { mutate: applyRoom, isPending: isApplying } = useApplyScheduledRoom();
  const { mutate: cancelApply, isPending: isCanceling } =
    useDeleteApplyScheduledRoom();

  const [reservationCode, setReservationCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // localJoined: 유저의 수동 조작 상태 (null이면 서버 데이터 사용)
  const [localJoined, setLocalJoined] = useState<boolean | null>(null);

  const room = post.roomDetail;
  // 방 정보가 없을 경우 (삭제된 방 등) 처리
  if (!room) {
    return (
      <div
        className={styles.roomInfoCard}
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '150px',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <p style={{ color: '#888', fontWeight: 'bold' }}>
          존재하지 않거나 삭제된 방입니다.
        </p>
      </div>
    );
  }

  // 본인 글(방장) 여부 확인
  const isHost = user?.userId === room.hostId;

  // 렌더링 시 사용할 최종 참여 상태 계산 (Local State 우선, 없으면 Server Data)
  const isJoined = localJoined ?? room.joined ?? false;

  // 책 정보가 있는지 확인
  const hasBook = !!room.bookTitle && room.bookTitle.trim() !== '';

  const handleJoin = () => {
    openModal('confirm', {
      title: '참여 신청',
      message: `'${room.title}' 방에 참여 신청하시겠습니까?`,
      onConfirm: () => {
        applyRoom(
          { roomId: room.roomId },
          {
            onSuccess: (data) => {
              setReservationCode(data.code);
              setLocalJoined(true);
              // 서버에서 최신 게시글(방) 상세를 다시 조회하여 방 정보를 갱신
              queryClient.invalidateQueries({
                queryKey: ['boards', 'detail', post.boardId],
              });
              setError(null);
            },
            onError: (e: AxiosError<CommonResponse<null>>) => {
              setError(
                e.response?.data?.message ||
                  '참여 신청 중 오류가 발생했습니다.',
              );
            },
          },
        );
      },
    });
  };

  const handleCancel = () => {
    openModal('confirm', {
      title: '참여 취소',
      message: '참여 신청을 취소하시겠습니까?',
      isDanger: true,
      onConfirm: () => {
        cancelApply(
          { roomId: room.roomId },
          {
            onSuccess: () => {
              setLocalJoined(false);
              setReservationCode(null);
              // 서버에서 최신 게시글(방) 상세를 다시 조회하여 방 정보를 갱신
              queryClient.invalidateQueries({
                queryKey: ['boards', 'detail', post.boardId],
              });
            },
          },
        );
      },
    });
  };

  return (
    <>
      {/* 책 정보 유무에 따라 스타일 클래스 변경 */}
      <div
        className={hasBook ? styles.roomInfoCard : styles.roomInfoCardNoBook}
      >
        {/* 1. 책 커버 (책 정보가 있을 때만 렌더링) */}
        {hasBook && (
          <div className={styles.bookCoverSection}>
            <img
              src={room.bookCoverUrl || '/path/to/default/cover.png'}
              alt={`${room.bookTitle} 표지`}
              className={styles.bookCover}
            />
          </div>
        )}

        {/* 2. 방 상세 정보 (필수 정보 + 조건부 책 정보) */}
        <div className={styles.roomDetailsSection}>
          <h2 className={styles.roomTitle}>{room.title}</h2>

          <div className={styles.roomMeta}>
            <span className={styles.tag}>{room.category}</span>
            <span>
              👤 {room.currentMembers} / {room.maxMembers}명
            </span>
          </div>

          {/* [조건부] 책 제목 및 저자 */}
          {hasBook && (
            <div className={styles.bookInfo}>
              <p>
                📖 <strong>{room.bookTitle}</strong>
              </p>
              <p>✍️ {room.bookAuthor}</p>
            </div>
          )}

          <div
            className={styles.bookInfo}
            style={{ marginTop: hasBook ? '0' : '0.5rem' }}
          >
            <p>
              ⏰ {formatDate(room.startTime)} ~{' '}
              {new Date(room.endTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          {/* 버튼 영역 (항상 하단에 위치) */}
          {!isHost &&
            (!isJoined ? (
              <PixelButton
                onClick={handleJoin}
                disabled={isApplying}
                style={{
                  backgroundColor: theme.colors.primary,
                  color: 'white',
                  marginTop: 'auto',
                }}
              >
                {isApplying ? '처리 중...' : '참여하기'}
              </PixelButton>
            ) : (
              <PixelButton
                onClick={handleCancel}
                disabled={isCanceling}
                style={{
                  marginTop: 'auto',
                  backgroundColor: theme.colors.disabledBg,
                }}
              >
                {isCanceling ? '처리 중...' : '참여 취소'}
              </PixelButton>
            ))}
        </div>
      </div>

      {reservationCode && (
        <div className={styles.reservationCodeBox}>
          <p>✅ 참여 신청 완료! 모임 시간에 맞춰 입장해주세요.</p>
          <p className={styles.reservationCodeText}>
            입장 코드: {reservationCode}
          </p>
        </div>
      )}
      {error && <div className={styles.errorText}>{error}</div>}
    </>
  );
};

export const BoardDetail = ({ boardId }: { boardId: string }) => {
  const { openModal, closeModal } = useModalStore();
  const { user } = useAuthStore();

  const { data: post, isLoading, isError } = useGetBoardDetail(boardId);
  const { mutate: deleteBoard } = useDeleteBoard();
  const handleDelete = () => {
    openModal('confirm', {
      title: '삭제 확인',
      message: '정말 삭제하시겠습니까?',
      isDanger: true,
      onConfirm: () => {
        deleteBoard(boardId, {
          onSuccess: () => {
            closeModal();
          },
        });
      },
    });
  };

  if (isLoading) {
    return <div className={styles.loadingContainer}>로딩 중...</div>;
  }

  if (isError || !post) {
    return (
      <div className={styles.container}>
        <div
          className={styles.loadingContainer}
          style={{ flexDirection: 'column', gap: '1rem' }}
        >
          <p>게시글을 불러올 수 없습니다.</p>
          <PixelButton onClick={() => openModal('boardList')} variant="danger">
            목록으로 돌아가기
          </PixelButton>
        </div>
      </div>
    );
  }

  const isMyPost = user?.nickname === post.nickname;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{post.title}</h1>
        <div className={styles.meta}>
          <span>작성자: {post.nickname}</span>
          <span>작성일: {formatDate(post.createdAt)}</span>
          {post.type === 'INQUIRY' && (
            <span
              className={`${styles.statusTag} ${post.status === 'DONE' ? styles.statusDone : styles.statusPending}`}
            >
              {post.status === 'DONE' ? '[답변완료]' : '[답변대기]'}
            </span>
          )}
        </div>
      </header>

      <main className={styles.content}>
        <p>{post.content}</p>
        {post.type === 'PROMOTION' && <PromotionDetails post={post} />}
        <ReviewList boardId={boardId} boardType={post.type} />
      </main>

      <footer className={styles.footer}>
        <PixelButton
          onClick={() => {
            closeModal();
          }}
        >
          목록으로
        </PixelButton>
        {isMyPost && (
          <div className={styles.actionButtons}>
            <PixelButton onClick={() => openModal('boardUpdate', { boardId })}>
              수정
            </PixelButton>
            <PixelButton
              onClick={handleDelete}
              style={{ backgroundColor: theme.colors.red, color: 'white' }}
            >
              삭제
            </PixelButton>
          </div>
        )}
      </footer>
    </div>
  );
};
