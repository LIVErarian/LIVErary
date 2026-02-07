export interface Notification {
  notificationId: string;
  content: string;
  type: 'FRIEND_REQUEST' | 'INQUIRY_REVIEW' | 'BOARD_REVIEW';
  isRead: boolean;
  createdAt: string;
  targetId?: string;
}

export interface NotificationResponse {
  status: string;
  code: string;
  message: string;
  data: Notification[];
}
