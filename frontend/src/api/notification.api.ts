import { api } from './axios';

import type { CommonResponse } from '@/types/common/api.types';
import type { Notification } from '@/types/entities/notification.types';

// 알림 목록 조회
export const fetchNotifications = async (): Promise<Notification[]> => {
  const { data } =
    await api.get<CommonResponse<Notification[]>>('/notification');

  if (!data.data) {
    return [];
  }

  return data.data;
};

// 알림 읽음 처리
export const readNotification = async (
  notificationId: string,
): Promise<void> => {
  await api.patch(`/notification/${notificationId}/read`);
};
