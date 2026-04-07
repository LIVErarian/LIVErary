import { useState } from 'react';
import clsx from 'clsx';

import { PixelModal } from '@/components/common/PixelModal';
import { PixelPagination } from '@/components/common/PixelPagination'; // Import
import { useNotification } from '@/services/queries/useNotification.ts';
import { useModalStore } from '@/store/useModalStore';

import type { Notification } from '@/types/entities/notification.types.ts';

import * as notiStyles from './NotificationModal.css.ts';

const ITEMS_PER_PAGE = 5;

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
}

export const NotificationModal = ({
  isOpen,
  onClose,
  zIndex,
}: NotificationModalProps) => {
  const { openModal } = useModalStore();
  const { notifications, markAsRead } = useNotification();
  console.log('[NotificationModal] Rendering notifications:', notifications);

  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE);

  // 현재 페이지 데이터 슬라이싱
  const currentNotifications = notifications.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE,
  );

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage((prev) => prev + 1);
  };

  const handleNotificationClick = (noti: (typeof notifications)[0]) => {
    // 읽지 않은 알림이면 읽음 처리
    if (!noti.read) {
      markAsRead(noti.notificationId);
    }

    // 친구 요청 알림인 경우 친구 목록 모달(받은 요청 탭) 열기
    if (noti.type === 'FRIEND_REQUEST') {
      onClose();
      openModal('friendList', { initialTab: 'REQUESTS' });
      return;
    }

    // 게시글 (홍보 / 문의) 댓글 알림인 경우 게시글 상세 모달 열기
    if (
      (noti.type === 'BOARD_REVIEW' || noti.type === 'INQUIRY_REVIEW') &&
      noti.targetId
    ) {
      onClose();
      openModal('boardDetail', { boardId: noti.targetId });
      return;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    // 나노초 등으로 인해 Date 파싱 실패 시 예외 처리
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return (
        date.toLocaleDateString() +
        ' ' +
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    } catch (e) {
      console.error('Date parsing error:', e);
      return dateString;
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'FRIEND_REQUEST':
        return '👥';
      case 'INQUIRY_REVIEW':
        return '❓';
      case 'BOARD_REVIEW':
        return '🗨️';
      default:
        return '🔔';
    }
  };

  return (
    <PixelModal
      title="알림"
      isOpen={isOpen}
      onClose={onClose}
      width="400px"
      zIndex={zIndex}
    >
      <div className={notiStyles.container}>
        {notifications.length === 0 ? (
          <div className={notiStyles.emptyState}>
            <span>새로운 알림이 없습니다.</span>
          </div>
        ) : (
          <>
            <ul className={notiStyles.list}>
              {currentNotifications.map((noti) => {
                console.log(
                  '[NotificationModal] Rendering item:',
                  noti.notificationId,
                  'read:',
                  noti.read,
                  typeof noti.read,
                );
                return (
                  <li
                    key={noti.notificationId}
                    className={clsx(
                      notiStyles.item,
                      !noti.read && notiStyles.unread,
                    )}
                    onClick={() => handleNotificationClick(noti)}
                  >
                    <div className={notiStyles.icon}>{getIcon(noti.type)}</div>
                    <div className={notiStyles.content}>
                      <p className={notiStyles.message}>{noti.content}</p>
                      <span className={notiStyles.date}>
                        {formatDate(noti.createdAt)}
                      </span>
                    </div>
                    {!noti.read && <div className={notiStyles.dot} />}
                  </li>
                );
              })}
            </ul>
            <PixelPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
            />
          </>
        )}
      </div>
    </PixelModal>
  );
};
