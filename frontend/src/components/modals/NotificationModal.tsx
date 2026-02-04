import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

import { PixelModal } from '@/components/common/PixelModal';
import { PixelPagination } from '@/components/common/PixelPagination'; // Import
import { useNotification } from '@/hooks/queries/useNotification';
import { useModalStore } from '@/store/useModalStore';

import * as notiStyles from './NotificationModal.css.ts';

const ITEMS_PER_PAGE = 5;

export const NotificationModal = () => {
  const { closeModal, openModal } = useModalStore();
  const { notifications, markAsRead } = useNotification();
  const navigate = useNavigate();

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
      closeModal();
      openModal('friendList', { initialTab: 'REQUESTS' });
      return;
    }

    if (noti.relatedUrl) {
      if (noti.relatedUrl.startsWith('http')) {
        window.open(noti.relatedUrl, '_blank');
      } else {
        navigate(noti.relatedUrl);
      }
      closeModal();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'FRIEND_REQUEST':
        return '👥';
      case 'SYSTEM':
        return '📢';
      default:
        return '🔔';
    }
  };

  return (
    <PixelModal title="알림" isOpen={true} onClose={closeModal} width="400px">
      <div className={notiStyles.container}>
        {notifications.length === 0 ? (
          <div className={notiStyles.emptyState}>
            <span>새로운 알림이 없습니다.</span>
          </div>
        ) : (
          <>
            <ul className={notiStyles.list}>
              {currentNotifications.map((noti) => (
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
              ))}
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
